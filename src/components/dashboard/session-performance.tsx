
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { JournalEntry, TradingSession } from '@/app/(app)/journal/page';
import { Globe, Sun, Landmark, Building } from 'lucide-react';

type SessionPerformanceProps = {
  entries: JournalEntry[];
};

type SessionStats = {
  trades: number;
  wins: number;
  pnl: number;
};

const sessionConfig: Record<string, { name: string; icon: React.ElementType; mapTo: TradingSession[] }> = {
    Asian: { name: 'Asian', icon: Sun, mapTo: ['Tokyo', 'Sydney'] },
    London: { name: 'London', icon: Landmark, mapTo: ['London'] },
    NewYork: { name: 'New York', icon: Building, mapTo: ['New York'] },
};


export function SessionPerformance({ entries }: SessionPerformanceProps) {
  const sessionStats = useMemo(() => {
    const initialStats: Record<string, SessionStats> = {
      Asian: { trades: 0, wins: 0, pnl: 0 },
      London: { trades: 0, wins: 0, pnl: 0 },
      NewYork: { trades: 0, wins: 0, pnl: 0 },
    };

    const closedTrades = entries.filter(e => e.result !== 'Ongoing' && e.session);
    
    return closedTrades.reduce((acc, trade) => {
        for (const key in sessionConfig) {
            if (sessionConfig[key].mapTo.includes(trade.session!)) {
                acc[key].trades += 1;
                acc[key].pnl += trade.pnl || 0;
                if (trade.result === 'Win') {
                    acc[key].wins += 1;
                }
                break; 
            }
        }
        return acc;
    }, initialStats);

  }, [entries]);

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Globe className="size-5" />
                Session Performance
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {Object.keys(sessionConfig).map(key => {
                    const stats = sessionStats[key];
                    const winRate = stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0;
                    const SessionIcon = sessionConfig[key].icon;
                    const isPositive = stats.pnl > 0;
                    const isNegative = stats.pnl < 0;

                    return (
                        <Card key={key} className={cn(
                            "transition-colors",
                            isPositive && "bg-positive/10 border-positive/30",
                            isNegative && "bg-destructive/10 border-destructive/30"
                        )}>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">{sessionConfig[key].name}</CardTitle>
                                <SessionIcon className="size-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={cn("text-3xl font-bold", isPositive && "text-positive", isNegative && "text-destructive")}>
                                    {stats.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </div>
                                <p className="text-xs text-muted-foreground">{stats.trades} trades</p>
                                <div className="mt-4 flex space-x-4 text-sm">
                                    <div>
                                        <p className="font-semibold">{winRate.toFixed(1)}%</p>
                                        <p className="text-xs text-muted-foreground">Win Rate</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{stats.wins}</p>
                                        <p className="text-xs text-muted-foreground">Wins</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </CardContent>
    </Card>
  );
}
