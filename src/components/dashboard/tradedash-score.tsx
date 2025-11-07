'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';

const score = 78; // Example score

export function TradeDashScore() {
  const [offset, setOffset] = useState(0);
  const size = 120;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progressOffset = ((100 - score) / 100) * circumference;
    setOffset(progressOffset);
  }, [circumference]);

  return (
    <Card>
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
