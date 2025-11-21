
'use client';

import { PieChart, Pie, Tooltip } from 'recharts';
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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';

const chartConfig = {
  count: {
    label: 'Count',
  },
  'ICT Silver Bullet': {
    label: 'ICT Silver Bullet',
    color: 'hsl(var(--chart-1))',
  },
  'Order Block Entry': {
    label: 'Order Block Entry',
    color: 'hsl(var(--chart-2))',
  },
  'Break and Retest': {
    label: 'Break and Retest',
    color: 'hsl(var(--chart-3))',
  },
  'Fair Value Gap': {
    label: 'Fair Value Gap',
    color: 'hsl(var(--chart-4))',
  },
  Other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;


type StrategyBreakdownChartProps = {
  strategies: Checklist[];
};

export function StrategyBreakdownChart({ strategies }: StrategyBreakdownChartProps) {
  const chartData = (strategies || [])
    .filter(s => (s.useCount || 0) > 0)
    .map(strategy => ({
      name: strategy.title,
      count: strategy.useCount || 0,
      fill: `var(--color-${strategy.title.replace(/\s/g, '')})`,
    }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Strategy Breakdown</CardTitle>
        <CardDescription>Usage by strategy type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[250px]"
        >
          {chartData.length > 0 ? (
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel indicator="dot" />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-center">
              <p>No data for breakdown chart.</p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

    