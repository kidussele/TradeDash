'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';
import type { JournalEntry } from '@/app/(app)/journal/page';

type StrategyPerformanceChartProps = {
  strategies: Checklist[];
  journalEntries: JournalEntry[];
};

type StrategyStats = {
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
};

export function StrategyPerformanceChart({ strategies, journalEntries }: StrategyPerformanceChartProps) {
  const strategyData: StrategyStats[] = strategies.map(strategy => {
    const relevantTrades = journalEntries.filter(entry => entry.strategy === strategy.title && entry.result !== 'Ongoing');
    
    if (relevantTrades.length === 0) {
      return { name: strategy.title, pnl: 0, trades: 0, winRate: 0 };
    }

    const totalPnl = relevantTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
    const wins = relevantTrades.filter(trade => trade.result === 'Win').length;
    const winRate = (wins / relevantTrades.length) * 100;

    return {
      name: strategy.title,
      pnl: totalPnl,
      trades: relevantTrades.length,
      winRate: winRate,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">Strategy</span>
                <span className="font-bold">{label}</span>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">Trades</span>
                <span className="font-bold text-muted-foreground">{data.trades}</span>
            </div>
             <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">Win Rate</span>
                <span className="font-bold text-muted-foreground">{data.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">Net P&L</span>
                <span className={`font-bold ${data.pnl >= 0 ? 'text-positive' : 'text-destructive'}`}>
                    {data.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-in fade-in-0 duration-500">
      <CardHeader>
        <CardTitle>Strategy Performance</CardTitle>
        <CardDescription>Comparing the net P&L of your trading strategies.</CardDescription>
      </CardHeader>
      <CardContent>
        {strategyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={strategyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="pnl" name="Net P&L" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
                <p>No strategy performance data yet.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
