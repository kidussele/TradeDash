'use client';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { JournalEntry } from '@/app/journal/page';

const chartConfig = {
  cumulativePnl: {
    label: 'Cumulative P&L',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

type CumulativePnlChartProps = {
    entries: JournalEntry[];
};

export function CumulativePnlChart({ entries }: CumulativePnlChartProps) {
  const cumulativePnlData = entries
    .filter(entry => entry.result !== 'Ongoing' && entry.pnl !== undefined && entry.entryTime)
    .sort((a, b) => a.entryTime!.getTime() - b.entryTime!.getTime())
    .reduce((acc, entry) => {
      const lastPnl = acc.length > 0 ? acc[acc.length - 1].cumulativePnl : 0;
      acc.push({
        date: entry.entryTime!.toISOString().split('T')[0],
        cumulativePnl: lastPnl + (entry.pnl || 0),
      });
      return acc;
    }, [] as { date: string; cumulativePnl: number }[]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative P&L</CardTitle>
        <CardDescription>Your profit and loss over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          {cumulativePnlData.length > 0 ? (
            <AreaChart data={cumulativePnlData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="line" labelFormatter={(value, payload) => payload[0] ? new Date(payload[0].payload.date).toLocaleDateString('en-US', { weekday: 'long' }) : ''} />} />
              <Area
                dataKey="cumulativePnl"
                type="natural"
                fill="var(--color-cumulativePnl)"
                fillOpacity={0.4}
                stroke="var(--color-cumulativePnl)"
                stackId="a"
              />
            </AreaChart>
          ) : (
            <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
              No data to display. Add journal entries.
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
