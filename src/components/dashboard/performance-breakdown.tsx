
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import type { JournalEntry } from '@/app/(app)/journal/page';

type PerformanceBreakdownProps = {
  entries: JournalEntry[];
};

export function PerformanceBreakdown({ entries }: PerformanceBreakdownProps) {
  const stats = useMemo(() => {
    const allTrades = entries || [];
    const closedTrades = allTrades.filter(e => e.result !== 'Ongoing');
    const wins = closedTrades.filter(e => e.result === 'Win').length;
    const losses = closedTrades.filter(e => e.result === 'Loss').length;
    const pending = allTrades.filter(e => e.result === 'Ongoing').length;
    const totalClosed = wins + losses;
    const overallWinRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;

    const longTrades = closedTrades.filter(e => e.direction === 'Long');
    const longWins = longTrades.filter(e => e.result === 'Win').length;
    const longWinRate = longTrades.length > 0 ? (longWins / longTrades.length) * 100 : 0;

    const shortTrades = closedTrades.filter(e => e.direction === 'Short');
    const shortWins = shortTrades.filter(e => e.result === 'Win').length;
    const shortWinRate = shortTrades.length > 0 ? (shortWins / shortTrades.length) * 100 : 0;

    return {
      wins,
      losses,
      pending,
      overallWinRate,
      longWinRate,
      shortWinRate,
    };
  }, [entries]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5" />
          Performance Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-6">
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className="text-sm font-bold">{stats.overallWinRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.overallWinRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg p-4 bg-positive/10 border border-positive/30">
                <p className="text-sm text-positive">Long Trades</p>
                <p className="text-2xl font-bold text-positive">{stats.longWinRate.toFixed(1)}%</p>
                <p className="text-xs text-positive/80">Win Rate</p>
            </div>
            <div className="rounded-lg p-4 bg-destructive/10 border border-destructive/30">
                 <p className="text-sm text-destructive">Short Trades</p>
                <p className="text-2xl font-bold text-destructive">{stats.shortWinRate.toFixed(1)}%</p>
                <p className="text-xs text-destructive/80">Win Rate</p>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mt-auto">
            <div>
                <p className="text-2xl font-bold text-positive">{stats.wins}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
            </div>
             <div>
                <p className="text-2xl font-bold text-destructive">{stats.losses}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
            </div>
             <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
