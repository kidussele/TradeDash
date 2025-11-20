
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Market News & Analysis</h1>
        <p className="text-muted-foreground">
          Stay ahead with key financial events.
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Economic Calendar</CardTitle>
            <CardDescription>
                Key financial events and indicators from around the world.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[800px]">
          <iframe
            src="https://sslecal2.investing.com/?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=2,3"
            className="w-full h-full border-0"
            title="Economic Calendar"
          ></iframe>
        </CardContent>
      </Card>
    </div>
  );
}
