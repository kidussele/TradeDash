
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, Link as LinkIcon, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const books = [
  {
    title: 'Trading in the Zone',
    author: 'Mark Douglas',
    description: 'Master the mental game of trading by understanding and overcoming the psychological challenges that hold traders back.',
    url: 'https://www.amazon.com/Trading-Zone-Confidence-Discipline-Attitude/dp/0735201447',
    category: 'Psychology',
  },
  {
    title: 'Reminiscences of a Stock Operator',
    author: 'Edwin Lefèvre',
    description: 'A fictionalized biography of Jesse Livermore, offering timeless insights into market speculation and crowd psychology.',
    url: 'https://www.amazon.com/Reminiscences-Stock-Operator-Edwin-Lefevre/dp/0471770884',
    category: 'Biography',
  },
    {
    title: 'Market Wizards',
    author: 'Jack D. Schwager',
    description: 'A collection of interviews with dozens of top traders across most financial markets, revealing their secrets to success.',
    url: 'https://www.amazon.com/Market-Wizards-Interviews-Top-Traders/dp/1118273052',
    category: 'Interviews',
  },
  {
    title: 'Technical Analysis of the Financial Markets',
    author: 'John J. Murphy',
    description: 'A comprehensive guide to technical analysis, covering everything from chart construction to indicators.',
    url: 'https://www.amazon.com/Technical-Analysis-Financial-Markets-Comprehensive/dp/0735200661',
    category: 'Technical Analysis',
  },
    {
    title: 'The Daily Trading Coach',
    author: 'Brett N. Steenbarger',
    description: '101 practical lessons to help you build the psychology of a successful trader, with actionable tips and exercises.',
    url: 'https://www.amazon.com/Daily-Trading-Coach-101-Yourself/dp/0470398717',
    category: 'Psychology',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An easy and proven way to build good habits and break bad ones. Highly applicable to trading discipline.',
    url: 'https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299',
    category: 'Personal Development',
  },
]

export default function ResourcePage() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <h1 className="text-2xl font-bold">Trading Resources</h1>
        <p className="text-muted-foreground">
          A curated list of valuable tools, websites, and books for traders.
        </p>
      </div>

      <Tabs defaultValue="websites">
        <TabsList className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
            <TabsTrigger value="websites"><LinkIcon className="mr-2 h-4 w-4"/>Websites</TabsTrigger>
            <TabsTrigger value="books"><BookOpen className="mr-2 h-4 w-4"/>Books</TabsTrigger>
        </TabsList>
        <TabsContent value="websites" className="animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: '200ms' }}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
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
        </TabsContent>
        <TabsContent value="books" className="animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: '200ms' }}>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {books.map((book, index) => (
                <div key={book.title} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <Card className="flex flex-col h-full">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{book.title}</CardTitle>
                                <CardDescription>by {book.author}</CardDescription>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">{book.category}</div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">{book.description}</p>
                    </CardContent>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link href={book.url} target="_blank" rel="noopener noreferrer">
                                Find on Amazon
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                    </Card>
                </div>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
