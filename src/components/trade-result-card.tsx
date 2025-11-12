
'use client';
import { useRef, useMemo, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, Activity } from 'lucide-react';
import type { JournalEntry } from '@/app/(app)/journal/page';

type TradeResultCardProps = {
  entry: JournalEntry;
};

export function TradeResultCard({ entry }: TradeResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
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
        className="text-white p-6 rounded-lg w-[380px] h-[500px] flex flex-col justify-center items-center font-sans bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      >
        <div className="absolute inset-0 bg-black/50"/>
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <p className={cn("text-8xl font-bold tracking-wider", isWin ? 'text-green-400' : 'text-red-400')}>
              {entry.result.toUpperCase()}
            </p>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-300">
                1 : {riskRewardRatio}
              </p>
              <p className="text-sm text-gray-400">Risk/Reward</p>
            </div>
            {entry.session && (
              <div className="text-center">
                 <p className="text-2xl font-semibold text-gray-300">{entry.session}</p>
                 <p className="text-sm text-gray-400">Session</p>
              </div>
            )}
        </div>
      </div>
      <Button onClick={onDownload} variant="outline" className="w-full">
        <Download className="mr-2" />
        Download Card
      </Button>
    </div>
  );
}
