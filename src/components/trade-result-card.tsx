
'use client';
import { useRef, useMemo, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { JournalEntry } from '@/app/(app)/journal/page';
import { useUser } from '@/firebase';

type TradeResultCardProps = {
  entry: JournalEntry;
};

function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300">
        <path d="M4 20H8.34315C8.70364 20 9.051 19.856 9.31019 19.5968L19.5968 9.31019C19.856 9.051 20 8.70364 20 8.34315V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function TradeResultCard({ entry }: TradeResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const isWin = entry.result === 'Win';

  const riskRewardRatio = useMemo(() => {
    if (entry.entryPrice && entry.stopLoss && entry.takeProfit) {
        const risk = Math.abs(entry.entryPrice - entry.stopLoss);
        const reward = Math.abs(entry.takeProfit - entry.entryPrice);
        if (risk > 0) {
            return (reward / risk).toFixed(2);
        }
    }
    return '0.00';
  }, [entry.entryPrice, entry.stopLoss, entry.takeProfit]);


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
      <div 
        ref={cardRef} 
        className="text-white p-6 rounded-lg w-[380px] h-[500px] flex flex-col font-sans bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      >
        <div className="absolute inset-0 bg-black/60"/>
        <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <Logo />
                    <span className="font-bold text-sm text-gray-300">TRADEDASH</span>
                </div>
                <p className="text-sm text-gray-400">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
            </div>
            
            <div className="flex justify-between items-baseline mt-4">
                 <div>
                    <p className="text-sm text-gray-400">PAIR</p>
                    <p className="text-2xl font-bold">{entry.currencyPair.toUpperCase()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-sm text-gray-400">PROFIT</p>
                    <p className={cn("text-2xl font-bold", isWin ? "text-green-400" : "text-red-400")}>
                        {isWin ? '+' : ''}{(entry.pnl ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                 </div>
            </div>

            {/* Main Body */}
            <div className="flex-grow flex flex-col justify-center items-center text-center gap-4">
              <p className={cn("text-8xl font-bold tracking-wider", isWin ? 'text-green-400' : 'text-red-400')}>
                {entry.result.toUpperCase()}
              </p>
              <div className="text-center">
                <p className="text-3xl font-semibold text-gray-200">
                  1 : {riskRewardRatio}
                </p>
                <p className="text-sm text-gray-400">Risk/Reward</p>
              </div>
              {entry.session && (
                <div className="text-center">
                   <p className="text-3xl font-semibold text-gray-200">{entry.session}</p>
                   <p className="text-sm text-gray-400">Session</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-center items-end">
              <div>
                <p className="text-xs text-gray-400 text-center">TRADER</p>
                <p className="font-semibold text-center">{user?.displayName || 'Trader'}</p>
              </div>
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
