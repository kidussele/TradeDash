
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const newsTopics = [
    'EUR/USD',
    'GBP/USD',
    'USD/JPY',
    'Gold',
    'Oil',
    'US Stock Market',
    'Global Economy'
];

function AiNewsSummary() {
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSummary = async () => {
        if (!selectedTopic) return;
        setIsLoading(true);
        setError(null);
        setSummary('');

        try {
            const response = await fetch('/api/news-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic: selectedTopic }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch summary.');
            }

            const data = await response.json();
            setSummary(data.summary);

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <Card>
            <CardHeader>
                <CardTitle>AI News Summary</CardTitle>
                <CardDescription>
                    Get a concise, AI-generated summary of recent news for a selected topic.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a topic..." />
                        </SelectTrigger>
                        <SelectContent>
                            {newsTopics.map(topic => (
                                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateSummary} disabled={!selectedTopic || isLoading} className="w-full sm:w-auto">
                        {isLoading ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Generate Summary
                    </Button>
                </div>
                 {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {summary && (
                    <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{summary}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Market News & Analysis</h1>
        <p className="text-muted-foreground">
          Stay ahead with AI-powered summaries and key financial events.
        </p>
      </div>

      <AiNewsSummary />
      
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
