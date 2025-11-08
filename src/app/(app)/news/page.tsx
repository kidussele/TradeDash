
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNews } from './actions';
import type { GenerateNewsSummaryOutput } from '@/ai/flows/generate-news-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
        <h2 className="text-2xl font-bold mb-4 capitalize">{topic.replace(' market', '')} News</h2>
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
  const calendarUrl = "https://sslecal2.investing.com/?importance=2,3&timeframe=7";

  return (
    <Tabs defaultValue="calendar">
      <TabsList>
        <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
        <TabsTrigger value="ai-news">AI Market News</TabsTrigger>
      </TabsList>
      <TabsContent value="calendar">
        <div className="h-[calc(100vh-12rem)] mt-4">
          <Card className="h-full flex flex-col">
              <CardHeader>
                  <CardTitle>Economic Calendar</CardTitle>
                  <CardDescription>
                  This week's economic calendar filtered for moderate and high impact events.
                  </CardDescription>
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
      </TabsContent>
      <TabsContent value="ai-news">
        <div className="space-y-8 mt-4">
          <div>
              <h2 className="text-3xl font-bold">AI Market News</h2>
              <p className="text-muted-foreground">AI-generated news summaries from around the financial world.</p>
          </div>
          {topics.map(topic => (
              <NewsSection key={topic} topic={topic} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
