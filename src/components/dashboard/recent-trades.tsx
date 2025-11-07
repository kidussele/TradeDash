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
import { recentTradesData } from '@/lib/data';
import { cn } from '@/lib/utils';

export function RecentTrades() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardDescription>Here are your most recent trades.</CardDescription>
      </CardHeader>
      <CardContent>
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
                  <Badge variant={trade.status === 'Open' ? 'outline' : 'secondary'}>{trade.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
