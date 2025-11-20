
'use client';
import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CumulativePnlChart } from '@/components/dashboard/cumulative-pnl-chart';
import { DailyPnlChart } from '@/components/dashboard/daily-pnl-chart';
import { QuantumScore } from '@/components/dashboard/quantum-score';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { TradingCalendar } from '@/components/dashboard/trading-calendar';
import type { JournalEntry } from '../journal/page';
import { EmotionAnalysisChart } from '@/components/dashboard/emotion-analysis-chart';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { WinRateRRCard } from '@/components/dashboard/win-rate-rr-card';

export type StatCardData = {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
};

type DashboardStats = {
    pnl: StatCardData;
    bestDay: StatCardData;
    worstDay: StatCardData;
    winRate: number;
    avgRR: number;
}

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
  
  const { data: journalEntries = [], isLoading } = useCollection<Omit<JournalEntry, 'id'>>(entriesRef);

  const [statsData, setStatsData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (journalEntries && journalEntries.length > 0) {
      const closedTrades = journalEntries.filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
      
      const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
      
      const wins = closedTrades.filter(trade => trade.result === 'Win').length;
      const tradesWithOutcome = closedTrades.filter(trade => trade.result === 'Win' || trade.result === 'Loss' || trade.result === 'Breakeven').length;
      const winRate = tradesWithOutcome > 0 ? (wins / tradesWithOutcome) * 100 : 0;
      
      const rrRatios = journalEntries
        .map(trade => {
            const risk = Math.abs(trade.entryPrice - trade.stopLoss);
            const reward = Math.abs(trade.takeProfit - trade.entryPrice);
            return risk > 0 ? reward / risk : 0;
        })
        .filter(ratio => ratio > 0);

      const avgRR = rrRatios.length > 0 ? rrRatios.reduce((acc, ratio) => acc + ratio, 0) / rrRatios.length : 0;

      setStatsData({
        pnl: {
          title: 'Net P&L',
          value: totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
          change: '',
          changeType: totalPnl >= 0 ? 'positive' : 'negative',
        },
        winRate: winRate,
        avgRR: avgRR,
        bestDay: getDayWithMostPnl(journalEntries as JournalEntry[], 'win'),
        worstDay: getDayWithMostPnl(journalEntries as JournalEntry[], 'loss'),
      });
    } else if (journalEntries?.length === 0) {
        setStatsData({
            pnl: { title: 'Net P&L', value: '$0.00', change: '', changeType: 'positive' },
            winRate: 0,
            avgRR: 0,
            bestDay: { title: 'Best Day', value: 'N/A', change: '', changeType: 'positive' },
            worstDay: { title: 'Worst Day', value: 'N/A', change: '', changeType: 'positive' },
        });
    }
  }, [journalEntries]);

  if (isLoading || !statsData) {
      return null;
  }

  const allCards = [
    <div key="pnl" className="col-span-4 sm:col-span-2 lg:col-span-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
      <StatCard {...statsData.pnl} />
    </div>,
    <div key="winrate" className="col-span-4 sm:col-span-2 lg:col-span-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
      <WinRateRRCard winRate={statsData.winRate} avgRR={statsData.avgRR} />
    </div>,
    <div key="bestday" className="col-span-4 sm:col-span-2 lg:col-span-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
      <StatCard {...statsData.bestDay} />
    </div>,
    <div key="worstday" className="col-span-4 sm:col-span-2 lg:col-span-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
      <StatCard {...statsData.worstDay} />
    </div>,
    <div key="cumpnl" className="col-span-4 lg:col-span-3 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '500ms' }}>
      <CumulativePnlChart entries={journalEntries as JournalEntry[]} />
    </div>,
    <div key="qscore" className="col-span-4 lg:col-span-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '600ms' }}>
      <QuantumScore entries={journalEntries as JournalEntry[]} />
    </div>,
    <div key="recent" className="col-span-4 lg:col-span-2 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '700ms' }}>
      <RecentTrades entries={journalEntries as JournalEntry[]} />
    </div>,
    <div key="dailypnl" className="col-span-4 lg:col-span-2 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '800ms' }}>
      <DailyPnlChart entries={journalEntries as JournalEntry[]} />
    </div>,
    <div key="emotion" className="col-span-4 lg:col-span-2 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '900ms' }}>
      <EmotionAnalysisChart entries={journalEntries as JournalEntry[]} />
    </div>,
    <div key="calendar" className="col-span-4 lg:col-span-2 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '1000ms' }}>
      <TradingCalendar entries={journalEntries as JournalEntry[]} />
    </div>
  ];

  return (
    <div className="grid grid-cols-4 gap-6 animate-in fade-in-0 duration-500">
      {allCards}
    </div>
  );
}
