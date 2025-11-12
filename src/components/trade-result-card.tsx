
'use client';
import { useRef, useMemo, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useUser } from '@/firebase';
import type { JournalEntry } from '@/app/(app)/journal/page';

type TradeResultCardProps = {
  entry: JournalEntry;
  allEntries: JournalEntry[];
  tradeIndex: number;
};

export function TradeResultCard({ entry, allEntries, tradeIndex }: TradeResultCardProps) {
  const { user } = useUser();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isWin = entry.result === 'Win';

  const chartData = useMemo(() => {
    const relevantTrades = allEntries
      .slice(0, tradeIndex + 1)
      .filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);

    let cumulativePnl = 0;
    return relevantTrades.map(trade => {
        cumulativePnl += trade.pnl || 0;
        return { cumulativePnl };
    });
  }, [allEntries, tradeIndex]);

  const onDownload = useCallback(() => {
    if (cardRef.current === null) {
      return;
    }
    toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `TradeDash-${entry.currencyPair}-${entry.date.split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error(err);
      });
  }, [cardRef, entry]);


  return (
    <div className="space-y-2">
      <div ref={cardRef} className="bg-[#0D1117] text-white p-6 rounded-lg w-[380px] h-[500px] flex flex-col font-sans">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-2xl font-bold flex items-center">
              {entry.currencyPair.toUpperCase()}
              <span className={cn("ml-2", isWin ? "text-green-400" : "text-red-400")}>
                {isWin ? '+' : ''}{(entry.pnl ?? 0).toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-gray-400">
              CLOSE DATE {new Date(entry.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300">
                <path d="M4 20H8.34315C8.70364 20 9.051 19.856 9.31019 19.5968L19.5968 9.31019C19.856 9.051 20 8.70364 20 8.34315V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold text-sm text-gray-300">TRADEDASH</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-grow flex flex-col justify-center items-start relative -ml-6 -mr-6">
          <div className="pl-6">
            <p className={cn("text-6xl font-bold", isWin ? 'text-blue-500' : 'text-red-500')}>
              {entry.result.toUpperCase()}
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-semibold">
                {isWin ? '+' : ''}{(entry.rMultiple?.toFixed(2) ?? '0.00')}R
              </p>
              {entry.session && (
                 <p className="text-2xl font-semibold text-gray-400">{entry.session}</p>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-48">
            <AreaChart data={chartData} width={380} height={192} margin={{top:0, right:0, left: 0, bottom: 0}}>
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cumulativePnl" stroke="#3B82F6" strokeWidth={2} fill="url(#chartGradient)" />
            </AreaChart>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-400">TRADER</p>
            <p className="font-semibold">{user?.displayName || 'Trader'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 text-right">STATUS</p>
            <p className="font-semibold">{user?.isAnonymous ? 'Guest' : 'Member'}</p>
          </div>
        </div>
      </div>
      <Button onClick={onDownload} variant="outline" className="w-full">
        <Download className="mr-2" />
        Download Card
      </Button>
    </div>
  );
}
