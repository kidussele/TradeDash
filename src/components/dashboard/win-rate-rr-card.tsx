
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, Percent } from 'lucide-react';

type WinRateRRCardProps = {
  winRate: number;
  avgRR: number;
};

export function WinRateRRCard({ winRate, avgRR }: WinRateRRCardProps) {
    const winRateIsPositive = winRate > 50;
    const rrIsPositive = avgRR >= 1;
    
  return (
    <Card>
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate / Avg. R:R</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-around items-center pt-2">
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
             <span className={cn("text-2xl font-bold", winRateIsPositive ? 'text-positive' : 'text-negative')}>
                {winRate.toFixed(1)}
             </span>
             <span className={cn("text-lg font-bold", winRateIsPositive ? 'text-positive' : 'text-negative')}>%</span>
          </div>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
                <span className={cn("text-2xl font-bold", rrIsPositive ? 'text-positive' : 'text-negative')}>
                    {avgRR.toFixed(2)}
                </span>
                 <span className={cn("text-lg font-bold", rrIsPositive ? 'text-positive' : 'text-negative')}>: 1</span>
            </div>
           <p className="text-xs text-muted-foreground">Avg. R:R</p>
        </div>
      </CardContent>
    </Card>
  );
}
