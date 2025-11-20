
'use client';
import { useRef, useMemo, useCallback } from 'react';
import { toPng } from 'html-to-image';
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

function Logo() {
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
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 12V24H36"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 8L40 40"
          stroke="hsl(var(--foreground))"
          strokeWidth="4"
          strokeOpacity="0.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

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
    toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, fontEmbedCSS: '' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `QuantumLedger-${entry.currencyPair}-${entry.date.split('T')[0]}.png`;
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
        style={{ backgroundImage: "url('https://i.ibb.co/S43wJjCz/Gemini-Generated-Image-njuz27njuz27njuz.png')" }}
      >
        <div className="absolute inset-0 bg-black/60"/>
        <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <Logo />
                    <span className="font-bold text-sm text-gray-300">QUANTUM LEDGER</span>
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
                <p className="text-3xl font-semibold text-blue-400">
                  1 : {riskRewardRatio}
                </p>
                <p className="text-sm text-gray-400">Risk/Reward</p>
              </div>
              {entry.session && (
                <div className="text-center">
                   <p className="text-3xl font-semibold text-yellow-400">{entry.session}</p>
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
