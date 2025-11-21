
'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';

const chartConfig = {
  count: {
    label: 'Times Used',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type StrategyUsageChartProps = {
  strategies: Checklist[];
};

export function StrategyUsageChart({ strategies }: StrategyUsageChartProps) {
  const chartData = (strategies || [])
    .filter(s => (s.useCount || 0) > 0)
    .map(strategy => ({
      name: strategy.title,
      count: strategy.useCount || 0,
      fill: 'var(--color-count)',
    }))
    .sort((a,b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Usage Frequency</CardTitle>
        <CardDescription>
          How often each strategy checklist has been completed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={120}
                className="text-sm"
              />
              <XAxis dataKey="count" type="number" hide />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="count" radius={4} />
            </BarChart>
          ) : (
            <div className="flex h-[400px] w-full items-center justify-center text-muted-foreground">
              <p>No strategy usage data yet. Complete a checklist!</p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
