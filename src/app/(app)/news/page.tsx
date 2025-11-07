
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNews } from './actions';
import type { GenerateNewsSummaryOutput } from '@/ai/flows/generate-news-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
    <div>
      <h2 className="text-2xl font-bold mb-4 capitalize">{topic.replace(' market', '')} News</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((article, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start gap-2">
                <Badge
                  variant={getImpactBadgeVariant(article.impact)}
                  className="mt-1.5 h-3.5 w-3.5 flex-shrink-0 p-0"
                >
                    <span className="sr-only">{article.impact} impact</span>
                </Badge>
                <CardTitle className="text-lg">{article.headline}</CardTitle>
              </div>
              <CardDescription className="flex items-center gap-2 text-xs ml-[22px]">
                <span>{article.publishedAt}</span>
                <Badge variant="secondary">{article.source}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow ml-[22px]">
              <p className="text-sm text-muted-foreground">{article.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default function NewsPage() {
  const topics = ['forex market', 'commodities', 'stock market'];

  return (
    <div className="space-y-8">
       <Card>
        <CardHeader>
          <CardTitle>Market News</CardTitle>
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
