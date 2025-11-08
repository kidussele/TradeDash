
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function NewsSection({ topic }: { topic: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setError(null);
      setSummary(null);
      try {
        const response = await fetch('/api/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch news summary.');
        }

        const result = await response.json();
        setSummary(result.summary);
      } catch (e: any) {
        console.error(`Error fetching news for ${topic}:`, e);
        setError(e.message || 'An unknown error occurred.');
      }
    };
    fetchNews();
  }, [topic]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 capitalize">{topic.replace(' market', '')} News</h2>
      {error && (
        <div className="text-destructive p-4 border border-destructive/50 rounded-md">
          <p className="font-semibold">Could not load news for {topic}:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {!summary && !error && (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-1/4 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      )}
      {summary && (
         <Card>
            <CardHeader>
                <CardTitle className="text-lg">Market Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{summary}</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
};


export default function NewsPage() {

  return (
    <Tabs defaultValue="calendar">
      <TabsList>
        <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
        <TabsTrigger value="ai-news">AI Market News</TabsTrigger>
      </TabsList>
      <TabsContent value="calendar" className="mt-4">
        <Card>
           <CardContent className="p-0 h-[800px]">
            <iframe
              src="https://sslecal2.investing.com/?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=2,3"
              className="w-full h-full border-0"
              title="Economic Calendar"
            ></iframe>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ai-news" className="mt-4">
        <div className="space-y-8">
          <div>
              <h2 className="text-3xl font-bold">AI Market News</h2>
              <p className="text-muted-foreground">AI-generated news summaries from around the financial world.</p>
          </div>
          <NewsSection topic="forex market" />
          <NewsSection topic="commodities" />
          <NewsSection topic="stock market" />
        </div>
      </TabsContent>
    </Tabs>
  );
}
