'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { cumulativePnlData } from '@/lib/data';

const chartConfig = {
  cumulativePnl: {
    label: 'Cumulative P&L',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function CumulativePnlChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative P&L</CardTitle>
        <CardDescription>Your profit and loss over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
