
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNews } from './actions';
import type { GenerateNewsSummaryOutput } from '@/ai/flows/generate-news-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

type NewsArticle = GenerateNewsSummaryOutput['articles'][0];

const NewsSection = ({ topic }: { topic: string }) => {
  const [news, setNews] = useState<NewsArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      const result = await getNews({ topic });
      if ('error' in result) {
        setError(result.error);
      } else {
        setNews(result.articles);
      }
    };
    fetchNews();
  }, [topic]);

  const getImpactBadgeVariant = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'high':
        return 'impact-high';
      case 'medium':
        return 'impact-medium';
      case 'low':
        return 'impact-low';
      default:
        return 'secondary';
    }
  };


  if (error) {
    return (
      <div className="text-destructive">
        Could not load news for {topic}: {error}
      </div>
    );
  }

  if (!news) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4 capitalize">{topic}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div>
        <h2 className="text-2xl font-bold mb-4 capitalize">{topic.replace(' market', '')} News</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={getImpactBadgeVariant(article.impact)}
                        className="mt-1.5 flex-shrink-0 p-0 size-3"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="capitalize">{article.impact} Impact</p>
                    </TooltipContent>
                  </Tooltip>
                  <CardTitle className="text-lg">{article.headline}</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-2 text-xs pt-2 pl-[21px]">
                  <span>{article.publishedAt}</span>
                  <Badge variant="secondary">{article.source}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pl-[45px]">
                <p className="text-sm text-muted-foreground">{article.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default function NewsPage() {
  const topics = ['forex market', 'commodities', 'stock market'];
  const [calendarTimeframe, setCalendarTimeframe] = useState<'week' | 'today'>('week');

  const calendarUrl = `https://sslecal2.investing.com/?importance=2,3&timeframe=${calendarTimeframe === 'today' ? 'today' : '7'}`;

  return (
    <div className="space-y-8">
      <div className="h-[calc(100vh-14rem)]">
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Economic Calendar</CardTitle>
                    <CardDescription>
                    Live economic calendar provided by Investing.com.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={calendarTimeframe === 'today' ? 'default' : 'outline'} onClick={() => setCalendarTimeframe('today')}>Today</Button>
                    <Button variant={calendarTimeframe === 'week' ? 'default' : 'outline'} onClick={() => setCalendarTimeframe('week')}>This Week</Button>
                </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <iframe 
                    src={calendarUrl}
                    className="w-full h-full border-0 rounded-lg"
                    title="Economic Calendar"
                />
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Market News</CardTitle>
          <CardDescription>
            AI-generated news summaries from around the financial world.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {topics.map(topic => (
        <NewsSection key={topic} topic={topic} />
      ))}
    </div>
  );
}
