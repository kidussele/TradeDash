
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { StatCardData } from '@/app/(app)/dashboard/page';
import { cn } from '@/lib/utils';

export function StatCard({ title, value, change, changeType }: StatCardData) {
  const isPositive = changeType === 'positive';
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
            <p className="text-xs text-muted-foreground flex items-center">
            <span className={cn('flex items-center gap-1', isPositive ? 'text-positive' : 'text-negative')}>
                {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {change}
            </span>
            </p>
        )}
      </CardContent>
    </Card>
  );
}

    
