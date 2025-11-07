'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { dailyPnlData } from '@/lib/data';

const chartConfig = {
  pnl: {
    label: 'Daily P&L',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function DailyPnlChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily P&L</CardTitle>
        <CardDescription>Your daily profit and loss for the last week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={dailyPnlData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="pnl" fill="var(--color-pnl)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
