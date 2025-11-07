'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, PlusCircle, Image as ImageIcon, Trash2, Edit, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const journalEntrySchema = z.object({
  entryTime: z.date({ required_error: 'Entry date is required.'}),
  entryTimeTime: z.string().optional(), // For time input
  exitTime: z.date().optional(),
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
  beforeScreenshot: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  afterScreenshot: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
});

type JournalEntry = z.infer<typeof journalEntrySchema> & { id: number };
type Inputs = z.infer<typeof journalEntrySchema>;

function JournalForm({
  onSubmit,
  defaultValues,
  isEditing,
}: {
  onSubmit: SubmitHandler<Inputs>;
  defaultValues?: Partial<Inputs>;
  isEditing: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: defaultValues || {
      direction: 'Long',
      result: 'Ongoing',
      adherenceToPlan: 'Yes',
      preTradeConviction: 5,
    },
  });

  useEffect(() => {
    if (isEditing && defaultValues) {
        const { entryTime, ...rest } = defaultValues;
        const time = entryTime ? format(entryTime, 'HH:mm') : undefined;
        reset({ ...rest, entryTime, entryTimeTime: time });
    } else if (!isEditing) {
        reset({
          direction: 'Long',
          result: 'Ongoing',
          adherenceToPlan: 'Yes',
          preTradeConviction: 5,
          entryTime: undefined,
          entryTimeTime: '',
          currencyPair: '',
          timeframe: '',
          positionSize: undefined,
          entryPrice: undefined,
          exitPrice: undefined,
          stopLoss: undefined,
          takeProfit: undefined,
          initialRisk: undefined,
          riskRewardRatio: '',
          pnl: undefined,
          rMultiple: undefined,
          strategy: '',
          reasonForEntry: '',
          lessonLearned: '',
          beforeScreenshot: '',
          afterScreenshot: '',
        });
    }
  }, [isEditing, defaultValues, reset]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Trade Entry' : 'New Trade Journal Entry'}</CardTitle>
        <CardDescription>{isEditing ? 'Update the details of your trade.' : 'Log a new trade with detailed analysis.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base font-semibold">Trade Details</AccordionTrigger>
                <AccordionContent className="grid gap-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entryTime">Entry Date</Label>
                       <Controller
                        control={control}
                        name="entryTime"
                        render={({ field }) => (
                           <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                      {errors.entryTime && <p className="text-sm text-destructive">{errors.entryTime.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="entryTimeTime">Entry Time</Label>
                        <Input id="entryTimeTime" type="time" {...register('entryTimeTime')} />
                    </div>
                  </div>
                  <div>
                      <Label htmlFor="timeframe">Timeframe</Label>
                      <Input id="timeframe" placeholder="e.g., H4, M15" {...register('timeframe')} />
                      {errors.timeframe && <p className="text-sm text-destructive">{errors.timeframe.message}</p>}
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
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-base font-semibold">Screenshots</AccordionTrigger>
                <AccordionContent className="grid gap-4 pt-4">
                  <div>
                    <Label htmlFor="beforeScreenshot">Before Screenshot URL</Label>
                    <Input id="beforeScreenshot" placeholder="https://..." {...register('beforeScreenshot')} />
                    {errors.beforeScreenshot && <p className="text-sm text-destructive">{errors.beforeScreenshot.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="afterScreenshot">After Screenshot URL</Label>
                    <Input id="afterScreenshot" placeholder="https://..." {...register('afterScreenshot')} />
                    {errors.afterScreenshot && <p className="text-sm text-destructive">{errors.afterScreenshot.message}</p>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button type="submit" className="mt-4">
                <PlusCircle className="mr-2" />
                {isEditing ? 'Update Entry' : 'Add Trade Entry'}
            </Button>
            {isEditing && (
                <Button type="button" variant="outline" onClick={() => (onSubmit as any)(null)}>
                Cancel Edit
                </Button>
            )}
        </form>
      </CardContent>
    </Card>
  );
}


export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    // If data is null, it's a cancel action
    if (data === null) {
        setEditingId(null);
        return;
    }
    
    // Combine date and time
    if (data.entryTime && data.entryTimeTime) {
      const [hours, minutes] = data.entryTimeTime.split(':').map(Number);
      const combinedDateTime = new Date(data.entryTime);
      combinedDateTime.setHours(hours, minutes);
      data.entryTime = combinedDateTime;
    }

    if (editingId) {
      setEntries(entries.map((entry) => (entry.id === editingId ? { ...entry, ...data } : entry)));
    } else {
      const newEntry: JournalEntry = {
        id: Date.now(),
        ...data,
      };
      setEntries([newEntry, ...entries]);
    }
    setEditingId(null);
  };

  const deleteEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };
  
  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
  };

  const editingEntry = editingId ? entries.find(e => e.id === editingId) : undefined;

  return (
    <div className="grid md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1">
        <JournalForm 
          onSubmit={onSubmit} 
          isEditing={!!editingId}
          defaultValues={editingEntry}
        />
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Trade Journal</CardTitle>
            <CardDescription>Review your past trade entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length > 0 ? (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Collapsible key={entry.id} defaultOpen={true} className="bg-muted/30 rounded-lg border">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                           <CardTitle className='text-lg flex items-center gap-2'>
                            <CollapsibleTrigger asChild>
                               <Button variant="ghost" size="icon" className="group h-6 w-6">
                                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                               </Button>
                            </CollapsibleTrigger>
                             {entry.currencyPair} {entry.direction}
                           </CardTitle>
                           <CardDescription className="pl-8">
                            Entered: {entry.entryTime ? entry.entryTime.toLocaleString() : 'N/A'} | Result: {entry.result}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                           <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
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

                            {(entry.beforeScreenshot || entry.afterScreenshot) && <Separator className="my-4" />}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {entry.beforeScreenshot && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Before</h4>
                                        <div className="relative aspect-video rounded-md overflow-hidden border">
                                            <Image src={entry.beforeScreenshot} alt="Before screenshot" layout="fill" objectFit="cover" />
                                        </div>
                                    </div>
                                )}
                                {entry.afterScreenshot && (
                                    <div>
                                        <h4 className="font-semibold mb-2">After</h4>
                                        <div className="relative aspect-video rounded-md overflow-hidden border">
                                            <Image src={entry.afterScreenshot} alt="After screenshot" layout="fill" objectFit="cover" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
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
