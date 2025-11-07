import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { JournalEntry } from '@/app/journal/page';

type RecentTradesProps = {
    entries: JournalEntry[];
};

export function RecentTrades({ entries }: RecentTradesProps) {
  const recentTradesData = entries
    .sort((a, b) => (b.entryTime?.getTime() || 0) - (a.entryTime?.getTime() || 0))
    .slice(0, 5)
    .map(entry => ({
        symbol: entry.currencyPair,
        type: entry.direction,
        netPnl: entry.pnl ?? 0,
        status: entry.result,
    }));


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardDescription>Here are your most recent trades.</CardDescription>
      </CardHeader>
      <CardContent>
         {recentTradesData.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Net P&L</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTradesData.map((trade, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{trade.symbol}</TableCell>
                <TableCell>{trade.type}</TableCell>
                <TableCell className={cn('text-right', trade.netPnl >= 0 ? 'text-positive' : 'text-negative')}>
                  {trade.netPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={trade.status === 'Ongoing' ? 'outline' : 'secondary'}>{trade.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         ) : (
            <div className="text-center py-12 text-muted-foreground">
                No recent trades to display.
            </div>
         )}
      </CardContent>
    </Card>
  );
}
