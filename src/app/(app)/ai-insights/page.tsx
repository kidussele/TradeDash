'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AiInsightsPage() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateIdea = async () => {
    if (!topic || !context) {
      setError('Please select a topic and provide some context.');
      return;
    }
    setIsLoading(true);
    setError('');
    setIdea('');

    try {
      const response = await fetch('/api/trade-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate idea.');
      }

      const result = await response.json();
      setIdea(result.idea);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Trade Ideas</CardTitle>
          <CardDescription>
            Generate actionable trade ideas by providing context from your analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium">Market/Topic</label>
              <Select onValueChange={setTopic} value={topic}>
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Select a market..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Forex">Forex</SelectItem>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Commodities">Commodities</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="context" className="text-sm font-medium">Your Analysis / Context</label>
              <Textarea
                id="context"
                placeholder="e.g., 'EUR/USD is approaching a key resistance level at 1.0900. RSI is overbought, and there's bearish divergence on the 4H chart.'"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <Button onClick={handleGenerateIdea} disabled={isLoading || !topic || !context}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate Idea'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-500 text-sm p-4 bg-red-500/10 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                </Skeleton>
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {idea && !isLoading && (
        <Card>
          <CardHeader>
             <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Generated Idea</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{idea}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
