
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';
import { Trophy } from 'lucide-react';
import { useMemo } from 'react';

type StrategyPerformanceChartProps = {
  strategies: Checklist[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function StrategyPerformanceChart({ strategies }: StrategyPerformanceChartProps) {
  const chartData = useMemo(() => (strategies || [])
    .filter(s => (s.useCount || 0) > 0)
    .map(strategy => ({
      name: strategy.title,
      count: strategy.useCount || 0,
    })), [strategies]);

  const topStrategy = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    return chartData.reduce((prev, current) => (prev.count > current.count) ? prev : current);
  }, [chartData]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">Strategy</span>
                <span className="font-bold">{label || data.name}</span>
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
        <CardTitle>Strategy Usage Analysis</CardTitle>
        <CardDescription>How often each strategy checklist is completed.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="h-[350px] lg:col-span-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ left: -20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={false} />
                            <YAxis allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                            <Bar dataKey="count" name="Times Used" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="h-[350px] lg:col-span-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="name"
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                        {`(${(percent * 100).toFixed(0)}%)`}
                                        </text>
                                    );
                                }}
                            >
                                {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-1 flex items-center justify-center">
                    {topStrategy && (
                        <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-950/30 border-amber-300/50 w-full">
                            <CardHeader className="items-center text-center">
                                <Trophy className="size-12 text-amber-500" />
                                <CardTitle className="text-amber-700 dark:text-amber-300">Top Strategy</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-2xl font-bold">{topStrategy.name}</p>
                                <p className="text-muted-foreground">Used <span className="font-bold text-foreground">{topStrategy.count}</span> times</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        ) : (
            <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
                <p>No strategy usage data yet. Complete a checklist!</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
