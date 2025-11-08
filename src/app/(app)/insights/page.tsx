
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function InsightsPage() {
  const [tradeData, setTradeData] = useState('');
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights('');

    // Placeholder for when getTradingInsights is implemented
    await new Promise(resolve => setTimeout(resolve, 1000));
    setError("This feature is not yet implemented.");


    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Trading Insights</CardTitle>
          <CardDescription>
            Paste your historical trade data below to get AI-powered analysis and insights.
            For best results, provide data in a structured format like CSV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., Date,Symbol,Type,Entry,Exit,P/L..."
            value={tradeData}
            onChange={(e) => setTradeData(e.target.value)}
            className="min-h-[150px] font-mono"
          />
          <Button onClick={handleGenerateInsights} disabled={isLoading || !tradeData}>
            {isLoading ? 'Generating...' : 'Generate Insights'}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
         <div className="space-y-2">
            <div className="animate-pulse bg-muted rounded-md h-8 w-1/4"></div>
            <div className="animate-pulse bg-muted rounded-md h-24 w-full"></div>
         </div>
      )}

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>{insights}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
