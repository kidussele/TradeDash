'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TradeIdeasPage() {
  const [ideaType, setIdeaType] = useState('scalping');
  const [isLoading, setIsLoading] = useState(false);
  const [idea, setIdea] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchTradeIdea = async () => {
    setIsLoading(true);
    setError(null);
    setIdea('');

    try {
      const response = await fetch('/api/trade-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: ideaType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch trade idea.');
      }

      const result = await response.json();
      setIdea(result.summary);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>AI Trade Idea Generator</CardTitle>
          <CardDescription>
            Get a fresh, AI-generated trade idea to spark your analysis. This is not financial advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={ideaType} onValueChange={setIdeaType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select idea type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scalping">Scalping Setup</SelectItem>
                <SelectItem value="swing">Swing Trade Setup</SelectItem>
                <SelectItem value="investment">Long-Term Investment</SelectItem>
                <SelectItem value="contrarian">Contrarian View</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchTradeIdea} disabled={isLoading}>
              <Sparkles className="mr-2" />
              {isLoading ? 'Generating...' : 'Generate Idea'}
            </Button>
          </div>
          
          {(isLoading || error || idea) && (
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                {isLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                )}
                {error && (
                   <div className="text-center text-destructive">
                     <p className="font-semibold">Generation Failed</p>
                     <p className="text-sm">{error}</p>
                   </div>
                )}
                {idea && (
                  <p className="whitespace-pre-wrap">{idea}</p>
                )}
              </CardContent>
            </Card>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
