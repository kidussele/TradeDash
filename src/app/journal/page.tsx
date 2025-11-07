'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const journalEntrySchema = z.object({
  entryTime: z.string().min(1, 'Entry date is required.'),
  exitTime: z.string().optional(),
  timeframe: z.string().min(1, 'Timeframe is required.'),
  currencyPair: z.string().min(1, 'Currency pair is required.'),
  direction: z.enum(['Long', 'Short']),
  positionSize: z.coerce.number().positive('Must be a positive number.'),
  entryPrice: z.coerce.number().positive('Must be a positive number.'),
  exitPrice: z.coerce.number().optional(),
  stopLoss: z.coerce.number().positive('Must be a positive number.'),
  takeProfit: z.coerce.number().positive('Must be a positive number.'),
  initialRisk: z.coerce.number().positive('Must be a positive number.'),
  riskRewardRatio: z.string().min(1, 'R:R ratio is required.'),
  result: z.enum(['Win', 'Loss', 'Breakeven', 'Ongoing']),
  pnl: z.coerce.number().optional(),
  rMultiple: z.coerce.number().optional(),
  strategy: z.string().min(1, 'Strategy is required.'),
  reasonForEntry: z.string().min(1, 'Reason for entry is required.'),
  marketConditions: z.string().optional(),
  tradeManagement: z.string().optional(),
  adherenceToPlan: z.enum(['Yes', 'No']),
  preTradeConviction: z.coerce.number().min(1).max(10),
  emotionsDuringTrade: z.string().optional(),
  postTradeReflection: z.string().optional(),
  whatWentRight: z.string().optional(),
  whatWentWrong: z.string().optional(),
  lessonLearned: z.string().min(1, 'Lesson learned is required.'),
});

type JournalEntry = z.infer<typeof journalEntrySchema> & { id: number };
type Inputs = z.infer<typeof journalEntrySchema>;

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      direction: 'Long',
      result: 'Ongoing',
      adherenceToPlan: 'Yes',
      preTradeConviction: 5,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const newEntry: JournalEntry = {
      id: Date.now(),
      ...data,
    };
    setEntries([newEntry, ...entries]);
    reset();
  };

  const deleteEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>New Trade Journal Entry</CardTitle>
            <CardDescription>Log a new trade with detailed analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-base font-semibold">Trade Details</AccordionTrigger>
                  <AccordionContent className="grid gap-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entryTime">Entry Date</Label>
                        <Input id="entryTime" type="datetime-local" {...register('entryTime')} />
                        {errors.entryTime && <p className="text-sm text-destructive">{errors.entryTime.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="timeframe">Timeframe</Label>
                        <Input id="timeframe" placeholder="e.g., H4, M15" {...register('timeframe')} />
                        {errors.timeframe && <p className="text-sm text-destructive">{errors.timeframe.message}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="currencyPair">Currency Pair</Label>
                      <Input id="currencyPair" placeholder="e.g., EUR/USD" {...register('currencyPair')} />
                      {errors.currencyPair && <p className="text-sm text-destructive">{errors.currencyPair.message}</p>}
                    </div>
                    <div>
                        <Label>Direction</Label>
                        <Controller
                          control={control}
                          name="direction"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Long">Long (Buy)</SelectItem>
                                <SelectItem value="Short">Short (Sell)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                    </div>
                    <div>
                      <Label htmlFor="positionSize">Position Size</Label>
                      <Input id="positionSize" type="number" step="0.01" placeholder="e.g., 1.0" {...register('positionSize')} />
                      {errors.positionSize && <p className="text-sm text-destructive">{errors.positionSize.message}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="entryPrice">Entry Price</Label>
                            <Input id="entryPrice" type="number" step="any" placeholder="1.12345" {...register('entryPrice')} />
                            {errors.entryPrice && <p className="text-sm text-destructive">{errors.entryPrice.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="exitPrice">Exit Price</Label>
                            <Input id="exitPrice" type="number" step="any" placeholder="1.13345" {...register('exitPrice')} />
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-base font-semibold">Risk & Rationale</AccordionTrigger>
                  <AccordionContent className="grid gap-4 pt-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="stopLoss">Stop-Loss Price</Label>
                            <Input id="stopLoss" type="number" step="any" placeholder="1.11995" {...register('stopLoss')} />
                            {errors.stopLoss && <p className="text-sm text-destructive">{errors.stopLoss.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="takeProfit">Take-Profit Price</Label>
                            <Input id="takeProfit" type="number" step="any" placeholder="1.14345" {...register('takeProfit')} />
                            {errors.takeProfit && <p className="text-sm text-destructive">{errors.takeProfit.message}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="initialRisk">Initial Risk ($)</Label>
                            <Input id="initialRisk" type="number" step="any" placeholder="50" {...register('initialRisk')} />
                            {errors.initialRisk && <p className="text-sm text-destructive">{errors.initialRisk.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="riskRewardRatio">Risk-to-Reward</Label>
                            <Input id="riskRewardRatio" placeholder="e.g., 2:1" {...register('riskRewardRatio')} />
                            {errors.riskRewardRatio && <p className="text-sm text-destructive">{errors.riskRewardRatio.message}</p>}
                        </div>
                    </div>
                     <div>
                      <Label htmlFor="strategy">Strategy / Setup</Label>
                      <Input id="strategy" placeholder="e.g., Head & Shoulders" {...register('strategy')} />
                      {errors.strategy && <p className="text-sm text-destructive">{errors.strategy.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="reasonForEntry">Reason for Entry</Label>
                        <Textarea id="reasonForEntry" placeholder="What criteria were met?" {...register('reasonForEntry')} />
                        {errors.reasonForEntry && <p className="text-sm text-destructive">{errors.reasonForEntry.message}</p>}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                  <AccordionTrigger className="text-base font-semibold">Review & Reflection</AccordionTrigger>
                  <AccordionContent className="grid gap-4 pt-4">
                     <div>
                        <Label>Result</Label>
                        <Controller
                          control={control}
                          name="result"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ongoing">Ongoing</SelectItem>
                                <SelectItem value="Win">Win</SelectItem>
                                <SelectItem value="Loss">Loss</SelectItem>
                                <SelectItem value="Breakeven">Breakeven</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pnl">Profit/Loss ($)</Label>
                        <Input id="pnl" type="number" step="any" placeholder="100" {...register('pnl')} />
                      </div>
                      <div>
                        <Label htmlFor="rMultiple">R-Multiple</Label>
                        <Input id="rMultiple" type="number" step="any" placeholder="2" {...register('rMultiple')} />
                      </div>
                    </div>
                    <div>
                      <Label>Adherence to Plan</Label>
                      <Controller
                          control={control}
                          name="adherenceToPlan"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                    </div>
                    <div>
                      <Label htmlFor="preTradeConviction">Pre-Trade Conviction (1-10)</Label>
                      <Input id="preTradeConviction" type="number" min="1" max="10" {...register('preTradeConviction')} />
                      {errors.preTradeConviction && <p className="text-sm text-destructive">{errors.preTradeConviction.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="lessonLearned">Lesson Learned</Label>
                        <Textarea id="lessonLearned" placeholder="A concise takeaway for future trades." {...register('lessonLearned')} />
                        {errors.lessonLearned && <p className="text-sm text-destructive">{errors.lessonLearned.message}</p>}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Button type="submit" className="mt-4">
                <PlusCircle className="mr-2" />
                Add Trade Entry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Trade Journal</CardTitle>
            <CardDescription>Review your past trade entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length > 0 ? (
              <div className="space-y-6">
                {entries.map((entry) => (
                  <Card key={entry.id} className="bg-muted/30">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                           <CardTitle className='text-lg'>{entry.currencyPair} {entry.direction}</CardTitle>
                           <CardDescription>
                            Entered: {new Date(entry.entryTime).toLocaleString()} | Result: {entry.result}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                            <div className="font-semibold">P/L: <span className="font-normal">{entry.pnl ? `$${entry.pnl}`: 'N/A'}</span></div>
                            <div className="font-semibold">R-Multiple: <span className="font-normal">{entry.rMultiple ? `${entry.rMultiple}R`: 'N/A'}</span></div>
                            <div className="font-semibold">Entry Price: <span className="font-normal">{entry.entryPrice}</span></div>
                            <div className="font-semibold">Exit Price: <span className="font-normal">{entry.exitPrice || 'N/A'}</span></div>
                            <div className="font-semibold">Stop-Loss: <span className="font-normal">{entry.stopLoss}</span></div>
                            <div className="font-semibold">Take-Profit: <span className="font-normal">{entry.takeProfit}</span></div>
                            <div className="font-semibold">Strategy: <span className="font-normal">{entry.strategy}</span></div>
                            <div className="font-semibold">Conviction: <span className="font-normal">{entry.preTradeConviction}/10</span></div>
                        </div>
                        <Separator className="my-4" />
                         <h4 className="font-semibold mb-2">Rationale & Reflection</h4>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground"><strong className="text-foreground">Reason for Entry:</strong> {entry.reasonForEntry}</p>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground mt-2"><strong className="text-foreground">Lesson Learned:</strong> {entry.lessonLearned}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <p>No trade journal entries yet.</p>
                <p className="text-sm">Use the form to log your first trade.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
