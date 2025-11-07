'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { JournalEntry } from '@/app/journal/page';

const chartConfig = {
  pnl: {
    label: 'Daily P&L',
  },
  positive: {
    color: 'hsl(var(--positive))',
  },
  negative: {
    color: 'hsl(var(--negative))',
  },
} satisfies ChartConfig;

type DailyPnlChartProps = {
    entries: JournalEntry[];
};

export function DailyPnlChart({ entries }: DailyPnlChartProps) {
    const dailyPnlData = entries
        .filter(entry => entry.result !== 'Ongoing' && entry.pnl !== undefined && entry.entryTime)
        .reduce((acc, entry) => {
            const date = entry.entryTime!.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += entry.pnl!;
            return acc;
        }, {} as Record<string, number>);

    const chartData = Object.entries(dailyPnlData).map(([date, pnl]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        pnl,
    })).slice(-7); // Get last 7 days

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily P&L</CardTitle>
        <CardDescription>Your daily profit and loss for the last week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
           {chartData.length > 0 ? (
          <BarChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="pnl" radius={4}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'} />
                ))}
            </Bar>
          </BarChart>
           ) : (
            <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
                No data to display.
            </div>
           )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
