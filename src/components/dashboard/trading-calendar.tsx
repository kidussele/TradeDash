'use client';

import * as React from 'react';
import { DayPicker, type DayContentProps } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import type { JournalEntry } from '@/app/journal/page';

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
  const calendarData = entries
    .filter(entry => entry.result !== 'Ongoing' && entry.pnl !== undefined && entry.entryTime)
    .reduce((acc, entry) => {
        const dateStr = entry.entryTime!.toISOString().split('T')[0];
        if (!acc[dateStr]) {
            acc[dateStr] = { pnl: 0 };
        }
        acc[dateStr].pnl += entry.pnl!;
        return acc;
    }, {} as Record<string, { pnl: number }>);

  const profitableDays = Object.keys(calendarData)
    .filter((d) => calendarData[d].pnl > 0)
    .map((d) => new Date(d.replace(/-/g, '/')));

  const losingDays = Object.keys(calendarData)
    .filter((d) => calendarData[d].pnl <= 0)
    .map((d) => new Date(d.replace(/-/g, '/')));

  return (
    <Card>
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
          className="p-0"
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
    </Card>
  );
}
