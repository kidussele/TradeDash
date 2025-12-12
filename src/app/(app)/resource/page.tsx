
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const resources = [
  {
    title: 'BabyPips.com',
    description: 'A great starting point for forex beginners, covering everything from basic terminology to advanced trading strategies.',
    url: 'https://www.babypips.com',
    category: 'Education',
  },
  {
    title: 'Forex Factory',
    description: 'Provides a high-quality economic calendar, market news, and forums for trader discussion.',
    url: 'https://www.forexfactory.com',
    category: 'News & Calendar',
  },
  {
    title: 'TradingView',
    description: 'The industry-standard platform for charting, technical analysis, and social trading ideas.',
    url: 'https://www.tradingview.com',
    category: 'Charting',
  },
  {
    title: 'The Inner Circle Trader (ICT)',
    description: 'Advanced trading concepts focusing on market maker models, liquidity, and institutional order flow.',
    url: 'https://www.youtube.com/@InnerCircleTrader',
    category: 'Advanced Concepts',
  },
  {
    title: 'Myfxbook',
    description: 'An automated analytical tool for your trading account and a platform to compare and share results.',
    url: 'https://www.myfxbook.com',
    category: 'Analytics',
  },
  {
    title: 'Earn2Trade',
    description: 'Offers funded trading programs and educational resources for futures traders.',
    url: 'https://www.earn2trade.com/',
    category: 'Funding',
  },
];

export default function ResourcePage() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <h1 className="text-2xl font-bold">Trading Resources</h1>
        <p className="text-muted-foreground">
          A curated list of valuable tools and websites for traders.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource, index) => (
          <div key={resource.title} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{resource.title}</CardTitle>
                    <div className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">{resource.category}</div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </CardContent>
              <CardContent>
                 <Button asChild variant="outline" className="w-full">
                    <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                        Visit Site
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
