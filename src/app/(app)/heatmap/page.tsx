
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function HeatmapPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
            <Lightbulb className="size-8 text-primary hidden sm:block"/>
            <div>
                <CardTitle>Understanding the Forex Heatmap</CardTitle>
                <CardDescription>
                The heatmap shows the relative strength of major currencies. Each square represents a forex pair. The color indicates the percentage change: green means the base currency (vertical) has strengthened against the quote currency (horizontal), and red means it has weakened. Brighter colors signify stronger price moves.
                </CardDescription>
            </div>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="p-0 h-[600px] sm:h-[800px]">
          <iframe
            src="https://s.tradingview.com/embed-widget/forex-heat-map/?locale=en&colorTheme=light&width=100%25&height=100%25&currencies=EUR,USD,JPY,GBP,CHF,AUD,CAD,NZD"
            className="w-full h-full border-0"
            title="Forex Heatmap"
          ></iframe>
        </CardContent>
      </Card>
    </div>
  );
}
