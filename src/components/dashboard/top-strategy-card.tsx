
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';
import { useMemo } from 'react';

type TopStrategyCardProps = {
  strategies: Checklist[];
};

export function TopStrategyCard({ strategies }: TopStrategyCardProps) {
  const topStrategy = useMemo(() => {
    if (!strategies || strategies.length === 0) {
      return null;
    }
    return [...strategies].sort((a, b) => (b.useCount || 0) - (a.useCount || 0))[0];
  }, [strategies]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Top Strategy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topStrategy ? (
          <div className="flex items-center gap-4">
            <Trophy className="size-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{topStrategy.title}</p>
              <p className="text-xs text-muted-foreground">
                Used {topStrategy.useCount} times
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No strategies used yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
