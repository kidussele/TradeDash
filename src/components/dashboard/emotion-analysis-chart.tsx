
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
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
                acc[emotion] = { pnl: 0, count: 0 };
            }
            acc[emotion].pnl += entry.pnl!;
            acc[emotion].count += 1;
            return acc;
        }, {} as Record<Emotion, { pnl: number, count: number }>);
    
    const totalTrades = entries.filter(e => e.emotion).length;

    const chartData = Object.entries(emotionData).map(([emotion, data]) => ({
        emotion,
        pnl: data.pnl,
        percentage: totalTrades > 0 ? (data.count / totalTrades) * 100 : 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Analysis</CardTitle>
        <CardDescription>Profit &amp; loss breakdown by emotion.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
           {chartData.length > 0 ? (
          <BarChart 
            data={chartData} 
            margin={{ left: -20, right: 20, top: 20, bottom: 0 }}
            layout="vertical"
          >
            <CartesianGrid horizontal={false} />
            <YAxis 
                dataKey="emotion" 
                type="category"
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                width={80}
            />
            <XAxis type="number" hide />
            <Tooltip 
                cursor={{ fill: 'hsl(var(--muted))' }} 
                content={
                    <ChartTooltipContent 
                        formatter={(value, name, props) => (
                            <div className="flex flex-col">
                                <span>{props.payload.emotion}</span>
                                <span>P&L: {Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                <span>Trades: {props.payload.percentage.toFixed(1)}%</span>
                            </div>
                        )}
                        indicator="dot" 
                    />
                } 
            />
            <Bar dataKey="pnl" radius={4}>
                 <LabelList
                    dataKey="pnl"
                    position="right"
                    offset={8}
                    className="fill-foreground text-sm"
                    formatter={(value: number) =>
                      value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    }
                  />
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'} />
                ))}
            </Bar>
          </BarChart>
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
