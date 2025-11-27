
'use client';
import { TrendingUp, Activity } from 'lucide-react';
import { PolarGrid, PolarAngleAxis, Radar, RadarChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { JournalEntry } from '@/app/(app)/journal/page';
import { useMemo } from 'react';

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--primary))',
  },
};

type TradedashScoreProps = {
  entries: JournalEntry[];
};

export function TradedashScore({ entries }: TradedashScoreProps) {
  const { chartData, kilaScore } = useMemo(() => {
    const closedTrades = (entries || []).filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
    
    if (closedTrades.length < 5) {
      return { 
        chartData: [
            { metric: 'Win Rate', value: 0 },
            { metric: 'R/R Ratio', value: 0 },
            { metric: 'Discipline', value: 0 },
            { metric: 'Consistency', value: 0 },
            { metric: 'Profit Factor', value: 0 },
        ], 
        kilaScore: 0 
      };
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

    return { chartData: finalChartData, kilaScore: overallScore };
  }, [entries]);

  const hasData = entries.length >= 5;

  return (
    <Card className="flex flex-col h-full bg-primary/90 text-primary-foreground dark:bg-primary/50 dark:border-primary/20">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2"><Activity /> Kila Score</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Your trading skills at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pb-0">
        {hasData ? (
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-full max-h-[250px]"
            >
                <RadarChart data={chartData}>
                <ChartTooltip
                    cursor={false}
                    content={
                    <ChartTooltipContent
                        indicator="line"
                        labelKey="value"
                        labelFormatter={(_, payload) => payload[0]?.payload.metric}
                    />
                    }
                />
                <PolarGrid className="fill-primary-foreground/20 stroke-primary-foreground/40" />
                <PolarAngleAxis dataKey="metric" className="fill-primary-foreground text-xs" />
                <Radar
                    dataKey="value"
                    fill="hsl(var(--primary-foreground))"
                    fillOpacity={0.4}
                    stroke="hsl(var(--primary-foreground))"
                />
                </RadarChart>
            </ChartContainer>
        ) : (
            <div className="flex-1 flex items-center justify-center text-center text-primary-foreground/70 text-sm">
                Not enough data. <br/> At least 5 trades are needed for analysis.
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 border-t border-primary-foreground/20 pt-4">
        <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">
                {kilaScore.toFixed(2)}
            </span>
            <span className="text-base text-primary-foreground/80">/ 100</span>
        </div>
      </CardFooter>
    </Card>
  );
}
