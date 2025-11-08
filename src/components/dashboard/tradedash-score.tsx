
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import type { JournalEntry } from '@/app/(app)/journal/page';

type TradeDashScoreProps = {
    entries: JournalEntry[];
};

export function TradeDashScore({ entries }: TradeDashScoreProps) {
  const [score, setScore] = useState(0);
  const [offset, setOffset] = useState(0);
  const size = 120;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const closedTrades = (entries || []).filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
    if (closedTrades.length === 0) {
      setScore(0);
      return;
    }

    const wins = closedTrades.filter(trade => (trade.pnl || 0) > 0).length;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

    const followedPlan = closedTrades.filter(t => t.adherenceToPlan === 'Yes').length;
    const adherenceRate = (followedPlan / closedTrades.length) * 100;
    
    const rMultiples = closedTrades.map(t => t.rMultiple).filter((r): r is number => r !== undefined);
    const avgRMultiple = rMultiples.length > 0 ? rMultiples.reduce((acc, r) => acc + r, 0) / rMultiples.length : 0;
    const rMultipleStdDev = rMultiples.length > 0 ? Math.sqrt(rMultiples.map(x => Math.pow(x - avgRMultiple, 2)).reduce((a, b) => a + b) / rMultiples.length) : 0;
    const rMultipleConsistency = rMultipleStdDev > 0 ? (1 / rMultipleStdDev) * 10 : 10; // Normalize

    // Weighted score
    const winRateWeight = 0.5;
    const adherenceWeight = 0.3;
    const consistencyWeight = 0.2;

    const calculatedScore = 
        (winRate * winRateWeight) + 
        (adherenceRate * adherenceWeight) +
        (Math.min(rMultipleConsistency, 10) * 10 * consistencyWeight);

    setScore(Math.max(0, Math.min(100, Math.round(calculatedScore))));

  }, [entries]);

  useEffect(() => {
    const progressOffset = ((100 - score) / 100) * circumference;
    setOffset(progressOffset);
  }, [score, circumference]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>TradeDash Score</CardTitle>
        <CardDescription>Overall trading performance</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              className="text-muted/30"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={center}
              cy={center}
            />
            <circle
              className="text-primary"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={center}
              cy={center}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
