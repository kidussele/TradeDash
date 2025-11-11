
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ForexHeatmapWidget } from '@/components/widgets/forex-heatmap-widget';
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
      
      <div className="h-[75vh] w-full rounded-lg border overflow-hidden">
        <ForexHeatmapWidget />
      </div>
    </div>
  );
}
