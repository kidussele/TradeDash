'use client';
import { PolarGrid, PolarAngleAxis, Radar, RadarChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { JournalEntry } from '@/app/(app)/journal/page';
import { useMemo } from 'react';

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--primary-foreground))',
  },
};

type PerformanceRadarChartProps = {
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
      >
        <path
          d="M8 40H17.2929C17.6834 40 18.0584 39.842 18.3414 39.5589L39.5589 18.3414C39.842 18.0584 40 17.6834 40 17.2929V8"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 12V24H36"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

export function PerformanceRadarChart({ entries }: PerformanceRadarChartProps) {
  const { chartData, performanceScore } = useMemo(() => {
    const closedTrades = (entries || []).filter(e => e.result !== 'Ongoing');
    
    if (closedTrades.length === 0) {
      return { 
        chartData: [
            { metric: 'Win Rate', value: 0 },
            { metric: 'RR', value: 0 },
            { metric: 'SL usage', value: 0 },
            { metric: 'Consistency', value: 0 },
        ], 
        performanceScore: 0 
      };
    }

    // 1. Win Rate (scaled 0-100)
    const wins = closedTrades.filter(t => t.result === 'Win').length;
    const tradesWithOutcome = closedTrades.filter(t => t.result === 'Win' || t.result === 'Loss').length;
    const winRate = tradesWithOutcome > 0 ? (wins / tradesWithOutcome) : 0;

    // 2. Average R/R Ratio (scaled, target is 2:1)
    const rRatios = closedTrades.map(t => {
        const risk = Math.abs(t.entryPrice - t.stopLoss);
        const reward = Math.abs(t.takeProfit - t.entryPrice);
        return risk > 0 ? reward / risk : 0;
    }).filter(r => r > 0);
    const avgRR = rRatios.length > 0 ? rRatios.reduce((a, b) => a + b, 0) / rRatios.length : 0;
    const rrScore = avgRR / 2; // Normalize against a target of 2

    // 3. SL Usage
    const slSetCount = closedTrades.filter(t => t.stopLoss > 0).length;
    const slUsage = closedTrades.length > 0 ? slSetCount / closedTrades.length : 0;

    // 4. Consistency (Sharpe Ratio, normalized)
    const pnlValues = closedTrades.map(t => t.pnl || 0).filter(pnl => pnl !== 0);
    const meanPnl = pnlValues.length > 0 ? pnlValues.reduce((a, b) => a + b, 0) / pnlValues.length : 0;
    const stdDev = pnlValues.length > 0 ? Math.sqrt(pnlValues.map(x => Math.pow(x - meanPnl, 2)).reduce((a, b) => a + b) / pnlValues.length) : 0;
    const sharpeRatio = stdDev > 0 ? meanPnl / stdDev : 0;
    const consistencyScore = (sharpeRatio + 1) / 2; // Normalize sharpe to 0-1 scale, assuming sharpe is between -1 and 1

    const finalChartData = [
      { metric: 'WR', value: winRate * 100 },
      { metric: 'RR', value: rrScore * 100 },
      { metric: 'SL usage', value: slUsage * 100 },
      { metric: 'Consistency', value: consistencyScore * 100 },
    ];
    
    // The main score is the average of the R-multiples
    const rMultiples = closedTrades.map(e => e.rMultiple).filter((r): r is number => r !== undefined && r !== null);
    const overallScore = rMultiples.length > 0 ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : 0;


    return { chartData: finalChartData, performanceScore: overallScore };
  }, [entries]);

  return (
    <Card className="flex flex-col h-full bg-primary text-primary-foreground">
      <CardHeader className="flex flex-row items-center justify-start pb-0">
        <CardTitle className="flex items-center gap-2 text-lg"><KilaLogo /> Score</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pb-0">
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-full w-full max-w-[250px]"
            >
                <RadarChart data={chartData}>
                <ChartTooltip
                    cursor={false}
                    content={
                    <ChartTooltipContent
                        indicator="line"
                        labelKey="value"
                        labelFormatter={(_, payload) => payload[0]?.payload.metric}
                        formatter={(value) => `${(value as number).toFixed(0)}%`}
                    />
                    }
                />
                <PolarGrid className="fill-primary-foreground/20 stroke-primary-foreground/40" />
                <PolarAngleAxis dataKey="metric" className="fill-primary-foreground text-xs" />
                <Radar
                    dataKey="value"
                    stroke="hsl(var(--primary-foreground))"
                />
                </RadarChart>
            </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">
                {performanceScore.toFixed(2)}
            </span>
            <span className="text-base text-primary-foreground/80">R</span>
        </div>
      </CardFooter>
    </Card>
  );
}
