'use client';
import { Activity } from 'lucide-react';
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

function KilaLogo() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary-foreground"
      >
        <path
          d="M8 40H17.2929C17.6834 40 18.0584 39.842 18.3414 39.5589L39.5589 18.3414C39.842 18.0584 40 17.6834 40 17.2929V8"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 12V24H36"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

export function TradedashScore({ entries }: TradedashScoreProps) {
  const { chartData, rMultiple } = useMemo(() => {
    const closedTrades = (entries || []).filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
    
    if (closedTrades.length < 3) {
      return { 
        chartData: [
            { metric: 'Win Rate', value: 0 },
            { metric: 'R/R Ratio', value: 0 },
            { metric: 'Discipline', value: 0 },
            { metric: 'Consistency', value: 0 },
        ], 
        rMultiple: 0 
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
    }).filter(r => r > 0 && r < 100); // Filter out outliers
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

    const finalChartData = [
      { metric: 'Win Rate', value: winRate },
      { metric: 'R/R Ratio', value: rrScore },
      { metric: 'Discipline', value: disciplineScore },
      { metric: 'Consistency', value: consistencyScore },
    ];
    
     const rMultiples = closedTrades.map(t => t.rMultiple).filter((r): r is number => r !== undefined);
     const avgRMultiple = rMultiples.length > 0 ? rMultiples.reduce((acc, r) => acc + r, 0) / rMultiples.length : 0;

    return { chartData: finalChartData, rMultiple: avgRMultiple };
  }, [entries]);

  const hasData = entries.length >= 3;

  return (
    <Card className="flex flex-col h-full bg-primary/90 text-primary-foreground dark:bg-primary/50 dark:border-primary/20">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2"><KilaLogo /> Kila Score</CardTitle>
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
                Not enough data. <br/> At least 3 trades are needed for analysis.
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t border-primary-foreground/20 pt-4">
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
                {rMultiple.toFixed(2)}R
            </span>
            <span className="text-base text-primary-foreground/80">Avg. R-Multiple</span>
        </div>
      </CardFooter>
    </Card>
  );
}
