
'use client';
import { Activity } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { JournalEntry } from '@/app/(app)/journal/page';
import { useMemo } from 'react';

const chartConfig = {
  score: {
    label: 'Kila Score',
    color: 'hsl(var(--primary))',
  },
};

type QuantumScoreProps = {
  entries: JournalEntry[];
};

export function QuantumScore({ entries }: QuantumScoreProps) {
  const { kilaScore } = useMemo(() => {
    const closedTrades = (entries || []).filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
    
    if (closedTrades.length < 5) {
      return { kilaScore: 0 };
    }

    // 1. Win Rate (scaled 0-100)
    const wins = closedTrades.filter(t => t.result === 'Win').length;
    const totalClosed = closedTrades.length;
    const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;

    // 2. Average R/R Ratio (scaled, target is 2:1)
    const rRatios = closedTrades.map(t => {
        const risk = Math.abs(t.entryPrice - t.stopLoss);
        const reward = Math.abs(t.takeProfit - t.entryPrice);
        return risk > 0 ? reward / risk : 0;
    }).filter(r => r > 0);
    const avgRR = rRatios.length > 0 ? rRatios.reduce((a, b) => a + b, 0) / rRatios.length : 0;
    const rrScore = Math.min(100, (avgRR / 2) * 100);

    // 3. Discipline (Adherence to plan)
    const followedPlanCount = closedTrades.filter(t => t.adherenceToPlan === 'Yes').length;
    const partialPlanCount = closedTrades.filter(t => t.adherenceToPlan === 'Partial').length;
    const disciplineScore = totalClosed > 0 ? ((followedPlanCount + partialPlanCount * 0.5) / totalClosed) * 100 : 0;

    // 4. Consistency (Sharpe Ratio, normalized)
    const pnlValues = closedTrades.map(t => t.pnl || 0);
    const meanPnl = pnlValues.reduce((a, b) => a + b, 0) / pnlValues.length;
    const stdDev = Math.sqrt(pnlValues.map(x => Math.pow(x - meanPnl, 2)).reduce((a, b) => a + b) / pnlValues.length);
    const sharpeRatio = stdDev > 0 ? meanPnl / stdDev : 0;
    const consistencyScore = Math.min(100, Math.max(0, (sharpeRatio + 1) * 50)); // Normalize sharpe to 0-100 scale

    // 5. Profit Factor
    const grossProfit = closedTrades.filter(t => t.pnl! > 0).reduce((sum, t) => sum + t.pnl!, 0);
    const grossLoss = Math.abs(closedTrades.filter(t => t.pnl! < 0).reduce((sum, t) => sum + t.pnl!, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 100 : 0;
    const profitFactorScore = Math.min(100, (profitFactor / 3) * 100); // Target a 3:1 profit factor

    const finalChartData = [
      { metric: 'Win Rate', value: winRate },
      { metric: 'R/R Ratio', value: rrScore },
      { metric: 'Discipline', value: disciplineScore },
      { metric: 'Consistency', value: consistencyScore },
      { metric: 'Profit Factor', value: profitFactorScore },
    ];
    
    const overallScore = finalChartData.reduce((acc, item) => acc + item.value, 0) / finalChartData.length;

    return { kilaScore: overallScore };
  }, [entries]);

  const chartData = [{ name: 'score', value: kilaScore, fill: 'var(--color-score)' }];
  const hasData = entries.length >= 5;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Kila Score</CardTitle>
        <CardDescription>Overall trading performance</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pb-0">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-full max-h-[250px]"
          >
            <RadialBarChart
              data={chartData}
              startAngle={90}
              endAngle={-270}
              innerRadius="70%"
              outerRadius="100%"
              barSize={20}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                dataKey="value"
                tick={false}
              />
              <RadialBar
                dataKey="value"
                background={{ fill: 'hsla(var(--muted))' }}
                cornerRadius={10}
              />
              <Tooltip content={<ChartTooltipContent nameKey="name" />} />
            </RadialBarChart>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-bold">{kilaScore.toFixed(0)}</p>
                <p className="text-muted-foreground">/ 100</p>
            </div>
          </ChartContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground text-sm p-4">
            Not enough data. <br /> At least 5 trades are needed to calculate your score.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
