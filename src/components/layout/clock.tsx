'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


type Session = 'Sydney' | 'Tokyo' | 'London' | 'New York';

const sessions: { name: Session; startUTC: number; endUTC: number; label: string }[] = [
    { name: 'Sydney', startUTC: 22, endUTC: 7, label: 'Sydney' },
    { name: 'Tokyo', startUTC: 0, endUTC: 9, label: 'Asian' },
    { name: 'London', startUTC: 8, endUTC: 17, label: 'London' },
    { name: 'New York', startUTC: 13, endUTC: 22, label: 'New York' },
];

function getCurrentSessions(utcHour: number): { name: Session, label: string }[] {
    const activeSessions = sessions.filter(session => {
        if (session.startUTC > session.endUTC) { // Overnight session (e.g., Sydney)
            return utcHour >= session.startUTC || utcHour < session.endUTC;
        }
        return utcHour >= session.startUTC && utcHour < session.endUTC;
    });

    // Tokyo and Sydney are both part of the "Asian" session. If both are active, just show Tokyo's label.
    const hasTokyo = activeSessions.some(s => s.name === 'Tokyo');
    if (hasTokyo) {
        return activeSessions.filter(s => s.name !== 'Sydney');
    }
    
    return activeSessions;
}


export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const utcHour = time.getUTCHours();
  const activeSessions = getCurrentSessions(utcHour);

  return (
    <div className="flex items-center gap-4">
       <div className="text-sm font-medium text-muted-foreground hidden lg:block">
         {format(time, 'eeee, LLLL d')}
       </div>
       <div className="flex items-center gap-2">
            {activeSessions.map(session => (
                 <TooltipProvider key={session.name} delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/50">
                                <div className="size-2 rounded-full bg-positive" />
                                <span className="text-xs font-semibold text-foreground">{session.label}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{session.label} Session is active</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
             {activeSessions.length === 0 && (
                 <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/50">
                                <div className="size-2 rounded-full bg-muted-foreground/50" />
                                <span className="text-xs font-semibold text-muted-foreground">Markets Closed</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Major market sessions are currently closed.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             )}
       </div>
        <div className="text-sm font-semibold text-foreground bg-muted/50 px-2.5 py-1 rounded-md hidden sm:block">
            {format(time, 'HH:mm:ss')}
        </div>
    </div>
  );
}
