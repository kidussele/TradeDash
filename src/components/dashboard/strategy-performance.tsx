
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { JournalEntry } from '@/app/(app)/journal/page';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';
import { BookCheck } from 'lucide-react';

type StrategyPerformanceProps = {
  entries: JournalEntry[];
  strategies: Checklist[];
};

type StrategyStats = {
  id: string;
  name: string;
  trades: number;
  wins: number;
  pnl: number;
  avgRR: number;
  winRate: number;
};

export function StrategyPerformance({ entries, strategies }: StrategyPerformanceProps) {
  const performanceData = useMemo(() => {
    const statsMap: Record<string, Omit<StrategyStats, 'id' | 'name' | 'winRate'>> = {};

    const usedStrategies = strategies.filter(s => entries.some(e => e.strategyId === s.id));

    usedStrategies.forEach(strategy => {
      statsMap[strategy.id] = {
        trades: 0,
        wins: 0,
        pnl: 0,
        avgRR: 0,
      };
    });

    const closedTrades = entries.filter(e => e.result !== 'Ongoing' && e.strategyId);

    closedTrades.forEach(trade => {
      const { strategyId, result, pnl } = trade;
      if (strategyId && statsMap[strategyId]) {
        statsMap[strategyId].trades += 1;
        statsMap[strategyId].pnl += pnl || 0;

        if (result === 'Win') {
          statsMap[strategyId].wins += 1;
        }
        
        const risk = Math.abs(trade.entryPrice - trade.stopLoss);
        const reward = Math.abs(trade.takeProfit - trade.entryPrice);
        const rr = risk > 0 ? reward / risk : 0;
        statsMap[strategyId].avgRR += rr;
      }
    });

    return usedStrategies.map(strategy => {
      const stats = statsMap[strategy.id];
      const winRate = stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0;
      const avgRR = stats.trades > 0 ? stats.avgRR / stats.trades : 0;

      return {
        id: strategy.id,
        name: strategy.title,
        trades: stats.trades,
        winRate,
        pnl: stats.pnl,
        avgRR,
      };
    }).sort((a, b) => b.pnl - a.pnl);

  }, [entries, strategies]);

  return (
    <Card className="h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BookCheck className="size-5" />
                Strategy Performance
            </CardTitle>
        </CardHeader>
        <CardContent>
            {performanceData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Strategy</TableHead>
                            <TableHead className="text-center">Trades</TableHead>
                            <TableHead className="text-center">Win Rate</TableHead>
                            <TableHead className="text-center">Avg. R:R</TableHead>
                            <TableHead className="text-right">Net P&L</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {performanceData.map(stat => (
                            <TableRow key={stat.id}>
                                <TableCell className="font-medium">{stat.name}</TableCell>
                                <TableCell className="text-center">{stat.trades}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={stat.winRate > 50 ? 'positive' : 'destructive'} className="w-[60px] justify-center">
                                        {stat.winRate.toFixed(1)}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">{stat.avgRR.toFixed(2)}</TableCell>
                                <TableCell className={cn("text-right font-semibold", stat.pnl > 0 ? 'text-positive' : 'text-destructive')}>
                                    {stat.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>No strategy performance data yet.</p>
                    <p className="text-xs">Assign strategies to your journal entries to see results.</p>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
