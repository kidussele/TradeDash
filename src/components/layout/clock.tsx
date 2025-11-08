'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

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

  return (
    <div className="flex items-center gap-2">
       <div className="text-sm font-medium text-muted-foreground hidden sm:block">
         {format(time, 'eeee, LLLL d')}
       </div>
        <div className="text-sm font-semibold text-foreground bg-muted/50 px-2.5 py-1 rounded-md">
            {format(time, 'HH:mm:ss')}
        </div>
    </div>
  );
}
