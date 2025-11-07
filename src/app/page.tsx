'use client';
import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CumulativePnlChart } from '@/components/dashboard/cumulative-pnl-chart';
import { DailyPnlChart } from '@/components/dashboard/daily-pnl-chart';
import { TradeDashScore } from '@/components/dashboard/tradedash-score';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { TradingCalendar } from '@/components/dashboard/trading-calendar';
import type { JournalEntry } from '@/app/journal/page';

export type StatCardData = {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
};

export default function DashboardPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [statsData, setStatsData] = useState<StatCardData[]>([]);

  useEffect(() => {
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
      const parsedEntries: JournalEntry[] = JSON.parse(storedEntries).map((entry: any) => ({
        ...entry,
        entryTime: entry.entryTime ? new Date(entry.entryTime) : undefined,
        exitTime: entry.exitTime ? new Date(entry.exitTime) : undefined,
      }));
      setJournalEntries(parsedEntries);
    }
  }, []);

  useEffect(() => {
    if (journalEntries.length > 0) {
      const closedTrades = journalEntries.filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
      
      const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
      
      const wins = closedTrades.filter(trade => (trade.pnl || 0) > 0).length;
      const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
      
      const totalReturn = closedTrades.reduce((acc, trade) => {
        const entry = trade.entryPrice;
        const pnl = trade.pnl || 0;
        if (entry > 0 && trade.positionSize > 0) {
          return acc + (pnl / (trade.positionSize * entry));
        }
        return acc;
      }, 0);
      const avgReturn = closedTrades.length > 0 ? (totalReturn / closedTrades.length) * 100 : 0;

      const pnlValues = closedTrades.map(t => t.pnl || 0).filter(pnl => pnl !== 0);
      const meanPnl = pnlValues.length > 0 ? pnlValues.reduce((a,b) => a + b, 0) / pnlValues.length : 0;
      const stdDev = pnlValues.length > 0 ? Math.sqrt(pnlValues.map(x => Math.pow(x - meanPnl, 2)).reduce((a, b) => a + b) / pnlValues.length) : 0;
      const sharpeRatio = stdDev > 0 ? meanPnl / stdDev : 0;


      setStatsData([
        {
          title: 'Net P&L',
          value: totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
          change: '+0.0%', // Placeholder
          changeType: 'positive',
        },
        {
          title: 'Win Rate',
          value: `${winRate.toFixed(1)}%`,
          change: '+0.0%', // Placeholder
          changeType: winRate > 50 ? 'positive' : 'negative',
        },
        {
          title: 'Avg. Return',
          value: `${avgReturn.toFixed(2)}%`,
          change: '+0.0%', // Placeholder
          changeType: avgReturn >= 0 ? 'positive' : 'negative',
        },
        {
          title: 'Sharpe Ratio',
          value: sharpeRatio.toFixed(2),
          change: '+0.0', // Placeholder
          changeType: sharpeRatio >= 0 ? 'positive' : 'negative',
        },
      ]);
    } else {
        setStatsData([
            { title: 'Net P&L', value: '$0.00', change: '0%', changeType: 'positive' },
            { title: 'Win Rate', value: '0.0%', change: '0%', changeType: 'negative' },
            { title: 'Avg. Return', value: '0.00%', change: '0%', changeType: 'positive' },
            { title: 'Sharpe Ratio', value: '0.00', change: '0.0', changeType: 'positive' },
        ]);
    }
  }, [journalEntries]);


  return (
    <div className="grid grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <div key={stat.title} className="col-span-4 sm:col-span-2 lg:col-span-1">
           <StatCard {...stat} />
        </div>
      ))}
      <div className="col-span-4 lg:col-span-2">
        <CumulativePnlChart entries={journalEntries} />
      </div>
      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
        <TradeDashScore entries={journalEntries} />
      </div>
      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
        <DailyPnlChart entries={journalEntries} />
      </div>
      <div className="col-span-4 lg:col-span-2">
        <RecentTrades entries={journalEntries} />
      </div>
      <div className="col-span-4 lg:col-span-2">
        <TradingCalendar entries={journalEntries} />
      </div>
    </div>
  );
}
