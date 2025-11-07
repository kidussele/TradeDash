'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BacktestJournalPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Backtest Journal</CardTitle>
          <CardDescription>
            Log and analyze the results of your backtesting sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>Backtest journaling features are coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
