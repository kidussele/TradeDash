
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { JournalEntry, Emotion } from '@/app/(app)/journal/page';

const chartConfig = {
  pnl: {
    label: 'P&L',
  },
  positive: {
    color: 'hsl(var(--positive))',
  },
  negative: {
    color: 'hsl(var(--negative))',
  },
} satisfies ChartConfig;

type EmotionAnalysisChartProps = {
    entries: JournalEntry[];
};

export function EmotionAnalysisChart({ entries }: EmotionAnalysisChartProps) {
    const emotionData = entries
        .filter(entry => entry.result !== 'Ongoing' && entry.pnl !== undefined && entry.emotion)
        .reduce((acc, entry) => {
            const emotion = entry.emotion!;
            if (!acc[emotion]) {
                acc[emotion] = { pnl: 0, count: 0, name: emotion };
            }
            acc[emotion].pnl += entry.pnl!;
            acc[emotion].count += 1;
            return acc;
        }, {} as Record<Emotion, { pnl: number, count: number, name: string }>);
    
    const chartData = Object.values(emotionData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Analysis</CardTitle>
        <CardDescription>Breakdown of trades by emotion.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
           {chartData.length > 0 ? (
            <PieChart>
                <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }} 
                    content={
                        <ChartTooltipContent 
                            formatter={(value, name, props) => (
                                <div>
                                    <p className="font-medium">{props.payload.name}</p>
                                    <p>P&L: {props.payload.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    <p>Trades: {value} ({((value / entries.filter(e => e.emotion).length) * 100).toFixed(1)}%)</p>
                                </div>
                            )}
                            nameKey="count"
                            indicator="dot" 
                        />
                    }
                />
                <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={60}
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs fill-foreground">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                        );
                    }}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'} />
                    ))}
                </Pie>
                 <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                  />
            </PieChart>
           ) : (
            <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
                No emotion data to display.
            </div>
           )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
