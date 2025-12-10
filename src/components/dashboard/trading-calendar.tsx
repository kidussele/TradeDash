
'use client';

import * as React from 'react';
import { DayPicker, type DayContentProps } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, getISOWeek, getYear, startOfWeek, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import type { JournalEntry } from '@/app/(app)/journal/page';

type WeeklySummaryData = {
  pnl: number;
  tradeDays: number;
};

type TradingCalendarProps = {
  entries: JournalEntry[];
};

function DayContent(props: DayContentProps & { calendarData: Record<string, { pnl: number }> }) {
  const dateStr = format(props.date, 'yyyy-MM-dd');
  const dayData = props.calendarData[dateStr];
  const isCurrentMonth = isSameMonth(props.date, props.displayMonth);

  return (
    <div className={cn("relative flex flex-col items-center justify-center h-full w-full p-1", !isCurrentMonth && "opacity-50")}>
      <div>{format(props.date, 'd')}</div>
      {dayData && (
        <div className={cn(
            "absolute bottom-1.5 h-1.5 w-1.5 rounded-full", 
            dayData.pnl > 0 ? "bg-positive" : "bg-destructive"
        )} />
      )}
    </div>
  );
}

export function TradingCalendar({ entries }: TradingCalendarProps) {
  const [month, setMonth] = React.useState(new Date());

  const calendarData = React.useMemo(() => (entries || [])
    .filter(entry => entry.result !== 'Ongoing' && entry.pnl !== undefined && entry.date)
    .reduce((acc, entry) => {
        const dateStr = new Date(entry.date).toISOString().split('T')[0];
        if (!acc[dateStr]) {
            acc[dateStr] = { pnl: 0 };
        }
        acc[dateStr].pnl += entry.pnl!;
        return acc;
    }, {} as Record<string, { pnl: number }>), [entries]);

  const weeklyPnl = React.useMemo(() => {
    const weeklyData: Record<string, WeeklySummaryData> = {};
    const tradeDaysByWeek: Record<string, Set<string>> = {};

    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    (entries || [])
      .filter(entry => {
        if (entry.result === 'Ongoing' || entry.pnl === undefined) return false;
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart && entryDate <= monthEnd;
      })
      .forEach(entry => {
        const date = new Date(entry.date);
        const year = getYear(date);
        const week = getISOWeek(date);
        const weekKey = `${year}-W${String(week).padStart(2, '0')}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { pnl: 0, tradeDays: 0 };
          tradeDaysByWeek[weekKey] = new Set();
        }
        
        weeklyData[weekKey].pnl += entry.pnl!;
        tradeDaysByWeek[weekKey].add(date.toISOString().split('T')[0]);
      });
      
    Object.keys(weeklyData).forEach(weekKey => {
      weeklyData[weekKey].tradeDays = tradeDaysByWeek[weekKey].size;
    });

    const weeksInMonth = [];
    let current = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    while(current <= monthEnd) {
      const year = getYear(current);
      const week = getISOWeek(current);
      const weekKey = `${year}-W${String(week).padStart(2, '0')}`;
      if (!weeksInMonth.find(w => w.key === weekKey)) {
        weeksInMonth.push({ 
            key: weekKey, 
            display: `Week ${weeksInMonth.length + 1}`,
            ... (weeklyData[weekKey] || { pnl: 0, tradeDays: 0 })
        });
      }
      current = new Date(current.setDate(current.getDate() + 7));
    }

    return weeksInMonth;

  }, [entries, month]);

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
      <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <DayPicker
            month={month}
            onMonthChange={setMonth}
            modifiers={{
                profitable: profitableDays,
                losing: losingDays,
            }}
            modifiersClassNames={{
                profitable: '', // Handled by dot indicator
                losing: '', // Handled by dot indicator
                selected: 'border-primary',
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
                head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'size-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day: 'h-16 w-full p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent/50 transition-colors border border-transparent',
                day_selected: 'bg-accent/50 text-accent-foreground border-primary',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'text-muted-foreground opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
            }}
            />
        </div>
        <div className="md:col-span-1 md:border-l md:pl-6">
            <h3 className="font-semibold text-foreground mb-4">Weekly Summary</h3>
            <div className="space-y-3">
                {weeklyPnl.map(({ key, display, pnl, tradeDays }) => {
                    const isPositive = pnl > 0;
                    const isNegative = pnl < 0;
                    return (
                        <Card key={key} className={cn(
                            "bg-muted/50",
                            isPositive && "bg-positive/10 border-positive/30",
                            isNegative && "bg-destructive/10 border-destructive/30"
                        )}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-muted-foreground">{display}</p>
                                    {pnl !== 0 && (isPositive ? <TrendingUp className="size-4 text-positive"/> : <TrendingDown className="size-4 text-destructive"/>)}
                                </div>
                                <p className={cn("text-2xl font-bold mt-1", isPositive && "text-positive", isNegative && "text-destructive")}>
                                    {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </p>
                                <p className="text-xs text-muted-foreground">{tradeDays} trading day{tradeDays !== 1 ? 's' : ''}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
