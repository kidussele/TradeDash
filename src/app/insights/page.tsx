'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { getTradingInsights } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Inputs = {
  tradeData: string;
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setInsights(null);
    const result = await getTradingInsights({ historicalTradeData: data.tradeData });

    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else {
      setInsights(result.insights);
    }
    setIsLoading(false);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Insights</CardTitle>
          <CardDescription>
            Paste your historical trade data (e.g., in CSV format) to get AI-powered analysis on your trading performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tradeData">Historical Trade Data</Label>
              <Textarea
                id="tradeData"
                placeholder="Example: Date,Symbol,Type,Entry,Exit,P&L&#x0a;2024-05-01,AAPL,BUY,170.00,172.50,250.00"
                className="min-h-[200px]"
                {...register('tradeData', { required: 'Trade data is required.' })}
              />
              {errors.tradeData && <p className="text-sm text-destructive">{errors.tradeData.message}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-fit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Your AI-Powered Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Analysis Complete!</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap text-sm">
                {insights}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}