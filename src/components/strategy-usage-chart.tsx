
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';

type StrategyUsageChartProps = {
  strategies: Checklist[];
};

export function StrategyUsageChart({ strategies }: StrategyUsageChartProps) {
  const chartData = strategies.map(strategy => ({
    name: strategy.title,
    count: strategy.useCount || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">Strategy</span>
                <span className="font-bold">{label}</span>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">Times Used</span>
                <span className="font-bold text-muted-foreground">{data.count}</span>
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
        <CardTitle>Strategy Usage Frequency</CardTitle>
        <CardDescription>How often each strategy checklist is completed.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="count" name="Times Used" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
                <p>No strategy usage data yet.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
