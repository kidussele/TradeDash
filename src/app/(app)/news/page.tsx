
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Economic Calendar</h1>
        <p className="text-muted-foreground">
          Key financial events and indicators from around the world.
        </p>
      </div>
      <Card>
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
