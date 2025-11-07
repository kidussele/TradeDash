
'use client';
import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CumulativePnlChart } from '@/components/dashboard/cumulative-pnl-chart';
import { DailyPnlChart } from '@/components/dashboard/daily-pnl-chart';
import { TradeDashScore } from '@/components/dashboard/tradedash-score';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { TradingCalendar } from '@/components/dashboard/trading-calendar';
import type { JournalEntry } from '../journal/page';
import { EmotionAnalysisChart } from '@/components/dashboard/emotion-analysis-chart';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export type StatCardData = {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
};

function getDayWithMostPnl(entries: JournalEntry[], type: 'win' | 'loss'): StatCardData {
    const dailyPnl: Record<string, number> = {};
    entries.forEach(entry => {
        if (entry.result !== 'Ongoing' && entry.pnl !== undefined && entry.date) {
            const dateStr = entry.date.split('T')[0];
            dailyPnl[dateStr] = (dailyPnl[dateStr] || 0) + entry.pnl;
        }
    });

    const sortedDays = Object.entries(dailyPnl).sort(([, pnlA], [, pnlB]) => {
        if (type === 'win') {
            return pnlB - pnlA; // Sort descending for best day
        } else {
            return pnlA - pnlB; // Sort ascending for worst day
        }
    });

    if (sortedDays.length === 0) {
        return {
            title: type === 'win' ? 'Best Day' : 'Worst Day',
            value: 'N/A',
            change: '',
            changeType: 'positive',
        };
    }
    
    if (type === 'loss' && sortedDays[0][1] >= 0) {
      return {
          title: 'Worst Day',
          value: 'N/A',
          change: 'No losing days',
          changeType: 'positive',
      };
    }

    const [date, pnl] = sortedDays[0];
    return {
        title: type === 'win' ? 'Best Day' : 'Worst Day',
        value: pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        change: new Date(date.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        changeType: pnl >= 0 ? 'positive' : 'negative',
    };
}

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const entriesRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'journalEntries') : null
  , [user, firestore]);
  
  const { data: journalEntries, isLoading } = useCollection<Omit<JournalEntry, 'id'>>(entriesRef);

  const [statsData, setStatsData] = useState<StatCardData[]>([]);

  useEffect(() => {
    if (journalEntries && journalEntries.length > 0) {
      const closedTrades = journalEntries.filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
      
      const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
      
      const wins = closedTrades.filter(trade => trade.result === 'Win').length;
      const tradesWithOutcome = closedTrades.filter(trade => trade.result === 'Win' || trade.result === 'Loss' || trade.result === 'Breakeven').length;
      const winRate = tradesWithOutcome > 0 ? (wins / tradesWithOutcome) * 100 : 0;
      
      const bestDay = getDayWithMostPnl(journalEntries as JournalEntry[], 'win');
      const worstDay = getDayWithMostPnl(journalEntries as JournalEntry[], 'loss');

      setStatsData([
        {
          title: 'Net P&L',
          value: totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
          change: '',
          changeType: totalPnl >= 0 ? 'positive' : 'negative',
        },
        {
          title: 'Win Rate',
          value: `${winRate.toFixed(1)}%`,
          change: '',
          changeType: winRate > 50 ? 'positive' : 'negative',
        },
        bestDay,
        worstDay,
      ]);
    } else if (journalEntries?.length === 0) {
        setStatsData([
            { title: 'Net P&L', value: '$0.00', change: '', changeType: 'positive' },
            { title: 'Win Rate', value: '0.0%', change: '', changeType: 'negative' },
            { title: 'Best Day', value: 'N/A', change: '', changeType: 'positive' },
            { title: 'Worst Day', value: 'N/A', change: '', changeType: 'positive' },
        ]);
    }
  }, [journalEntries]);

  // Render a loading state or nothing until the journal entries are loaded
  if (isLoading || !journalEntries) {
      return null;
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <div key={stat.title} className="col-span-4 sm:col-span-2 lg:col-span-1">
           <StatCard {...stat} />
        </div>
      ))}
      <div className="col-span-4 lg:col-span-2">
        <CumulativePnlChart entries={journalEntries as JournalEntry[]} />
      </div>
      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
        <TradeDashScore entries={journalEntries as JournalEntry[]} />
      </div>
      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
        <DailyPnlChart entries={journalEntries as JournalEntry[]} />
      </div>
      <div className="col-span-4 lg:col-span-2">
        <RecentTrades entries={journalEntries as JournalEntry[]} />
      </div>
      <div className="col-span-4 lg:col-span-2">
        <EmotionAnalysisChart entries={journalEntries as JournalEntry[]} />
      </div>
      <div className="col-span-4 lg:col-span-2">
        <TradingCalendar entries={journalEntries as JournalEntry[]} />
      </div>
    </div>
  );
}

    