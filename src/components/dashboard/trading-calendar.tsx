
'use client';

import * as React from 'react';
import { DayPicker, type DayContentProps } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, getISOWeek, getYear, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import type { JournalEntry } from '@/app/(app)/journal/page';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type TradingCalendarProps = {
  entries: JournalEntry[];
};

function DayContent(props: DayContentProps & { calendarData: Record<string, { pnl: number }> }) {
  const dateStr = format(props.date, 'yyyy-MM-dd');
  const dayData = props.calendarData[dateStr];
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-1">
      <div>{format(props.date, 'd')}</div>
      {dayData && (
        <div className="text-[10px] mt-1 font-medium">
          <span className={cn(dayData.pnl >= 0 ? 'text-positive' : 'text-negative')}>
            {dayData.pnl >= 0 ? '+' : ''}${Math.abs(dayData.pnl).toFixed(0)}
          </span>
        </div>
      )}
    </div>
  );
}

export function TradingCalendar({ entries }: TradingCalendarProps) {
  const calendarData = React.useMemo(() => (entries || [])
    .filter(entry => entry.result !== 'Ongoing' && entry.pnl !== undefined && (entry.entryTime || entry.date))
    .reduce((acc, entry) => {
        const dateStr = new Date(entry.date).toISOString().split('T')[0];
        if (!acc[dateStr]) {
            acc[dateStr] = { pnl: 0 };
        }
        acc[dateStr].pnl += entry.pnl!;
        return acc;
    }, {} as Record<string, { pnl: number }>), [entries]);
    
  const weeklyPnl = React.useMemo(() => {
    const weeklyData: Record<string, number> = {};
    (entries || [])
      .filter(entry => entry.result !== 'Ongoing' && entry.pnl !== undefined)
      .forEach(entry => {
        const date = new Date(entry.date);
        const year = getYear(date);
        const week = getISOWeek(date);
        const weekKey = `${year}-W${String(week).padStart(2, '0')}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = 0;
        }
        weeklyData[weekKey] += entry.pnl!;
      });
      return Object.entries(weeklyData).sort(([keyA], [keyB]) => keyB.localeCompare(keyA));
  }, [entries]);

  const profitableDays = Object.keys(calendarData)
    .filter((d) => calendarData[d].pnl > 0)
    .map((d) => new Date(d.replace(/-/g, '/')));

  const losingDays = Object.keys(calendarData)
    .filter((d) => calendarData[d].pnl <= 0)
    .map((d) => new Date(d.replace(/-/g, '/')));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Trading Calendar</CardTitle>        
        <CardDescription>Your performance at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex justify-center">
        <DayPicker
          modifiers={{
            profitable: profitableDays,
            losing: losingDays,
          }}
          modifiersClassNames={{
            profitable: 'bg-positive/10',
            losing: 'bg-negative/10',
            selected: '!bg-primary !text-primary-foreground',
          }}
          components={{
            DayContent: (props) => <DayContent {...props} calendarData={calendarData} />,
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
          className="p-0 w-full"
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 w-full',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-base font-medium',
            nav: 'space-x-1 flex items-center',
            nav_button: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-muted-foreground rounded-md w-full font-normal text-sm',
            row: 'flex w-full mt-2',
            cell: 'size-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'h-16 w-full p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent/50 transition-colors',
            day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            day_today: 'bg-accent text-accent-foreground rounded-md',
            day_outside: 'text-muted-foreground opacity-50',
            day_disabled: 'text-muted-foreground opacity-50',
          }}
        />
      </CardContent>
      {weeklyPnl.length > 0 && (
         <CardFooter className="flex-col items-start border-t p-4 mt-auto">
            <h3 className="font-semibold text-sm mb-2">Weekly Summary</h3>
            <ScrollArea className="h-24 w-full">
                <div className="space-y-2 pr-4">
                    {weeklyPnl.map(([weekKey, pnl]) => (
                        <div key={weekKey} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{weekKey.replace('-', ' ')}</span>
                            <span className={cn('font-semibold', pnl >= 0 ? 'text-positive' : 'text-negative')}>
                                {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </CardFooter>
      )}
    </Card>
  );
}
