
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
  Confident: { color: 'hsl(var(--chart-1))', label: 'Confident' },
  Fearful: { color: 'hsl(var(--chart-2))', label: 'Fearful' },
  Greedy: { color: 'hsl(var(--chart-3))', label: 'Greedy' },
  Anxious: { color: 'hsl(var(--chart-4))', label: 'Anxious' },
  Patient: { color: 'hsl(var(--chart-5))', label: 'Patient' },
  Neutral: { color: 'hsl(var(--muted-foreground))', label: 'Neutral' },
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
                acc[emotion] = { pnl: 0, count: 0, name: emotion, fill: `var(--color-${emotion})` };
            }
            acc[emotion].pnl += entry.pnl!;
            acc[emotion].count += 1;
            return acc;
        }, {} as Record<Emotion, { pnl: number, count: number, name: string, fill: string }>);
    
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
                >
                    {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} opacity={0.7} />
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
