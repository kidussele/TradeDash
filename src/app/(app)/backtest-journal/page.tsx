
'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Edit, PlusCircle, Image as ImageIcon, X, TrendingUp, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/dashboard/stat-card';
import { CumulativePnlChart } from '@/components/dashboard/cumulative-pnl-chart';
import type { StatCardData } from '@/app/(app)/dashboard/page';
import type { TradingSession } from '@/app/(app)/journal/page';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';
import { BacktestStrategyPerformance } from '@/components/dashboard/backtest-strategy-performance';


export type BacktestJournalEntry = {
  id: string;
  date: string;
  session?: TradingSession;
  currencyPair: string;
  direction: 'Long' | 'Short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  entryTime?: string;
  exitTime?: string;
  pnl?: number;
  rMultiple?: number;
  result: 'Win' | 'Loss' | 'Breakeven' | 'Ongoing';
  notes: string;
  screenshotBefore?: string;
  screenshotAfter?: string;
  adherenceToPlan: 'Yes' | 'No' | 'Partial';
  strategyId?: string;
  strategyTitle?: string;
};

type AdvancedStats = {
    sharpeRatio: number;
    bestSession: {
        session: string;
        pnl: number;
    } | null;
}

function getAdvancedStats(entries: BacktestJournalEntry[]): AdvancedStats {
    const closedTrades = entries.filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
    
    // Sharpe Ratio
    const pnlValues = closedTrades.map(t => t.pnl || 0).filter(pnl => pnl !== 0);
    const meanPnl = pnlValues.length > 0 ? pnlValues.reduce((a,b) => a + b, 0) / pnlValues.length : 0;
    const stdDev = pnlValues.length > 0 ? Math.sqrt(pnlValues.map(x => Math.pow(x - meanPnl, 2)).reduce((a, b) => a + b) / pnlValues.length) : 0;
    const sharpeRatio = stdDev > 0 ? meanPnl / stdDev : 0;

    // Best Session
    const sessionPnl: Record<string, number> = {
        'London': 0,
        'New York': 0,
        'Tokyo': 0,
        'Sydney': 0,
    };

    closedTrades.forEach(entry => {
        if (entry.session && entry.pnl !== undefined) {
            sessionPnl[entry.session] += entry.pnl;
        }
    });

    const bestSessionEntry = Object.entries(sessionPnl).sort(([, pnlA], [, pnlB]) => pnlB - pnlA)[0];
    
    let bestSession: { session: string; pnl: number } | null = null;
    if (bestSessionEntry && bestSessionEntry[1] > 0) {
        bestSession = { session: bestSessionEntry[0], pnl: bestSessionEntry[1] };
    }

    return { sharpeRatio, bestSession };
}


export default function BacktestJournalPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const entriesRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'backtestJournalEntries') : null
  , [user, firestore]);
  
  const { data: entries = [], isLoading } = useCollection<Omit<BacktestJournalEntry, 'id'>>(entriesRef);

  const checklistsRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'strategyChecklists') : null
  , [user, firestore]);

  const { data: checklists = [] } = useCollection<Omit<Checklist, 'id'>>(checklistsRef);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<BacktestJournalEntry>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<StatCardData[]>([]);
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats>({ sharpeRatio: 0, bestSession: null });

   useEffect(() => {
    if (entries && entries.length > 0) {
      const closedTrades = entries.filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
      
      const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
      
      const wins = closedTrades.filter(trade => trade.result === 'Win').length;
      const tradesWithOutcome = closedTrades.filter(trade => trade.result === 'Win' || trade.result === 'Loss' || trade.result === 'Breakeven').length;
      const winRate = tradesWithOutcome > 0 ? (wins / tradesWithOutcome) * 100 : 0;
      
      const rrRatios = entries
        .map(trade => {
            const risk = Math.abs(trade.entryPrice - trade.stopLoss);
            const reward = Math.abs(trade.takeProfit - trade.entryPrice);
            return risk > 0 ? reward / risk : 0;
        })
        .filter(ratio => ratio > 0);

      const avgRR = rrRatios.length > 0 ? rrRatios.reduce((acc, ratio) => acc + ratio, 0) / rrRatios.length : 0;

      setStatsData([
        {
          title: 'Net P&L',
          value: totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
          change: '',
          changeType: totalPnl >= 0 ? 'positive' : 'negative',
        },
        {
          title: 'Win Rate',
          value: `${winRate.toFixed(1)}%`,
          change: '',
          changeType: winRate > 50 ? 'positive' : 'negative',
        },
        {
            title: 'Average R:R',
            value: `${avgRR.toFixed(2)} : 1`,
            change: '',
            changeType: avgRR >= 1 ? 'positive' : 'negative',
        },
      ]);
      setAdvancedStats(getAdvancedStats(entries as BacktestJournalEntry[]));

    } else if (entries?.length === 0) {
        setStatsData([
            { title: 'Net P&L', value: '$0.00', change: '', changeType: 'positive' },
            { title: 'Win Rate', value: '0.0%', change: '', changeType: 'negative' },
            { title: 'Average R:R', value: '0.00 : 1', change: '', changeType: 'negative' },
        ]);
        setAdvancedStats({ sharpeRatio: 0, bestSession: null });
    }
  }, [entries]);

  const rr = useMemo(() => {
    if (currentEntry.entryPrice && currentEntry.stopLoss && currentEntry.takeProfit) {
      const risk = Math.abs(currentEntry.entryPrice - currentEntry.stopLoss);
      const reward = Math.abs(currentEntry.takeProfit - currentEntry.entryPrice);
      if (risk > 0) {
        return (reward / risk).toFixed(2);
      }
    }
    return '0.00';
  }, [currentEntry.entryPrice, currentEntry.stopLoss, currentEntry.takeProfit]);

  const availableStrategies = useMemo(() => {
    if (!checklists) return [];
    const narrative = currentEntry.direction === 'Long' ? 'Bullish' : 'Bearish';
    return checklists.filter(c => c.narrative === narrative);
  }, [checklists, currentEntry.direction]);


  const handleSave = () => {
    if (!user || !entriesRef) return;

    const risk = Math.abs((Number(currentEntry.entryPrice) || 0) - (Number(currentEntry.stopLoss) || 0));
    let rMultiple;
    if (risk > 0 && currentEntry.pnl) {
        rMultiple = currentEntry.pnl / (risk * (currentEntry.positionSize || 1));
    }
    
    const selectedStrategy = checklists.find(c => c.id === currentEntry.strategyId);

    const baseEntry = {
      date: currentEntry.date || new Date().toISOString(),
      currencyPair: currentEntry.currencyPair || '',
      direction: currentEntry.direction || 'Long',
      entryPrice: Number(currentEntry.entryPrice) || 0,
      stopLoss: Number(currentEntry.stopLoss) || 0,
      takeProfit: Number(currentEntry.takeProfit) || 0,
      positionSize: Number(currentEntry.positionSize) || 0,
      result: currentEntry.result || 'Ongoing',
      notes: currentEntry.notes || '',
      adherenceToPlan: currentEntry.adherenceToPlan || 'Yes',
    };

    const optionalFields = {
        session: currentEntry.session,
        entryTime: currentEntry.entryTime,
        exitTime: currentEntry.exitTime,
        pnl: currentEntry.pnl,
        rMultiple: rMultiple,
        screenshotBefore: currentEntry.screenshotBefore,
        screenshotAfter: currentEntry.screenshotAfter,
        strategyId: currentEntry.strategyId,
        strategyTitle: selectedStrategy?.title,
    };

    const finalEntry: Partial<Omit<BacktestJournalEntry, 'id'>> = { ...baseEntry };

    for (const [key, value] of Object.entries(optionalFields)) {
        if (value !== undefined && value !== null && value !== '') {
            (finalEntry as any)[key] = value;
        }
    }

    if (editId) {
      const docRef = doc(firestore, 'users', user.uid, 'backtestJournalEntries', editId);
      setDocumentNonBlocking(docRef, finalEntry, { merge: true });
    } else {
      addDocumentNonBlocking(entriesRef, finalEntry);
    }
    setIsEditDialogOpen(false);
    setEditId(null);
    setCurrentEntry({});
  };

  const handleEdit = (entry: BacktestJournalEntry) => {
    setEditId(entry.id);
    setCurrentEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setCurrentEntry({ result: 'Ongoing', direction: 'Long', date: new Date().toISOString().split('T')[0] });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'backtestJournalEntries', id);
    deleteDocumentNonBlocking(docRef);
  };
  
  const getResultColor = (result: BacktestJournalEntry['result']) => {
    switch (result) {
      case 'Win': return 'text-positive';
      case 'Loss': return 'text-negative';
      default: return 'text-muted-foreground';
    }
  };

  const getResultBadgeVariant = (result: BacktestJournalEntry['result']) => {
    switch (result) {
        case 'Win': return 'positive';
        case 'Loss': return 'destructive';
        case 'Breakeven': return 'secondary';
        default: return 'outline';
    }
  };

  const handlePreviewImage = (url: string) => {
    setPreviewImageUrl(url);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const chartEntries = (entries || []).map(e => ({
    ...e,
    entryTime: new Date(e.date),
  }));

  const sortedEntries = [...(entries || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Tabs defaultValue="journal" className="animate-in fade-in-0 duration-500">
        <div className="flex justify-between items-center mb-4">
            <TabsList className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
                <TabsTrigger value="journal">Journal</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
            <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
              setIsEditDialogOpen(isOpen);
              if (!isOpen) {
                setEditId(null);
                setCurrentEntry({});
              }
            }}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew} className="animate-in fade-in-0 zoom-in-95 duration-500">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Backtest Entry
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] grid-rows-[auto,minmax(0,1fr),auto] max-h-[90vh] animate-in fade-in-0 zoom-in-95 duration-300">
                <DialogHeader>
                <DialogTitle>{editId !== null ? 'Edit' : 'Add'} Backtest Entry</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto pr-6">
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={currentEntry.date ? currentEntry.date.split('T')[0] : ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, date: e.target.value })}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="session">Session</Label>
                        <Select
                            value={currentEntry.session}
                            onValueChange={(value: TradingSession) => setCurrentEntry({ ...currentEntry, session: value })}
                        >
                            <SelectTrigger id="session">
                            <SelectValue placeholder="Select session" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="London">London</SelectItem>
                                <SelectItem value="New York">New York</SelectItem>
                                <SelectItem value="Tokyo">Tokyo</SelectItem>
                                <SelectItem value="Sydney">Sydney</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency-pair">Currency Pair</Label>
                        <Input
                            id="currency-pair"
                            value={currentEntry.currencyPair || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, currencyPair: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="direction">Direction</Label>
                        <Select
                            value={currentEntry.direction}
                            onValueChange={(value: 'Long' | 'Short') => setCurrentEntry({ ...currentEntry, direction: value, strategyId: undefined })}
                        >
                            <SelectTrigger id="direction">
                            <SelectValue placeholder="Select direction" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Long">Long</SelectItem>
                            <SelectItem value="Short">Short</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2 col-span-2">
                        <Label htmlFor="strategy">Strategy</Label>
                        <Select
                            value={currentEntry.strategyId}
                            onValueChange={(value: string) => setCurrentEntry({ ...currentEntry, strategyId: value })}
                            disabled={availableStrategies.length === 0}
                        >
                            <SelectTrigger id="strategy">
                            <SelectValue placeholder={availableStrategies.length === 0 ? `No ${currentEntry.direction === 'Long' ? 'bullish' : 'bearish'} strategies` : "Select a strategy"} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStrategies.map(strategy => (
                                    <SelectItem key={strategy.id} value={strategy.id}>{strategy.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="entry-price">Entry Price</Label>
                        <Input
                            id="entry-price"
                            type="number"
                            value={currentEntry.entryPrice || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, entryPrice: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stop-loss">Stop-Loss</Label>
                        <Input
                            id="stop-loss"
                            type="number"
                            value={currentEntry.stopLoss || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, stopLoss: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="take-profit">Take-Profit</Label>
                        <Input
                            id="take-profit"
                            type="number"
                            value={currentEntry.takeProfit || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, takeProfit: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Risk/Reward Ratio</Label>
                        <Input value={rr} readOnly disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="position-size">Position Size</Label>
                        <Input
                            id="position-size"
                            type="number"
                            value={currentEntry.positionSize || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, positionSize: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="result">Result</Label>
                        <Select
                            value={currentEntry.result}
                            onValueChange={(value: BacktestJournalEntry['result']) => setCurrentEntry({ ...currentEntry, result: value })}
                        >
                            <SelectTrigger id="result">
                            <SelectValue placeholder="Select result" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Win">Win</SelectItem>
                            <SelectItem value="Loss">Loss</SelectItem>
                            <SelectItem value="Breakeven">Breakeven</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="pnl">Net P&L</Label>
                        <Input
                            id="pnl"
                            type="number"
                            value={currentEntry.pnl ?? ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, pnl: parseFloat(e.target.value) || undefined })}
                            placeholder="e.g. 150.50"
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="adherence">Adherence to Plan</Label>
                        <Select
                            value={currentEntry.adherenceToPlan}
                            onValueChange={(value: 'Yes' | 'No' | 'Partial') => setCurrentEntry({ ...currentEntry, adherenceToPlan: value })}
                        >
                            <SelectTrigger id="adherence">
                            <SelectValue placeholder="Select adherence" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Partial">Partial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={currentEntry.notes || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="screenshot-before">Screenshot Before</Label>
                        <Input
                            id="screenshot-before"
                            value={currentEntry.screenshotBefore || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, screenshotBefore: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="screenshot-after">Screenshot After</Label>
                        <Input
                            id="screenshot-after"
                            value={currentEntry.screenshotAfter || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, screenshotAfter: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
        <TabsContent value="journal" className="animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: '200ms' }}>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {sortedEntries.map((entry) => (
                    <TableRow key={entry.id} className="animate-in fade-in-0">
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{entry.currencyPair}</TableCell>
                    <TableCell>{entry.direction}</TableCell>
                    <TableCell>{entry.strategyTitle || 'N/A'}</TableCell>
                    <TableCell className={getResultColor(entry.result)}>
                        {entry.pnl?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? 'N/A'}
                    </TableCell>
                    <TableCell>
                        <Badge variant={getResultBadgeVariant(entry.result)}>{entry.result}</Badge>
                    </TableCell>
                    <TableCell>
                        {entry.screenshotBefore ? (
                        <Button variant="ghost" size="icon" onClick={() => handlePreviewImage(entry.screenshotBefore!)}>
                            <ImageIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                        </Button>
                        ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                        {entry.screenshotAfter ? (
                        <Button variant="ghost" size="icon" onClick={() => handlePreviewImage(entry.screenshotAfter!)}>
                            <ImageIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                        </Button>
                        ) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry as BacktestJournalEntry)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            {(!entries || entries.length === 0) && !isLoading && (
                <div className="text-center py-12 text-muted-foreground animate-in fade-in-0 duration-500">
                    No backtest journal entries yet.
                </div>
            )}
        </TabsContent>
         <TabsContent value="dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in-0 duration-300">
                {statsData.map((stat, index) => (
                    <div key={stat.title} className="col-span-1 sm:col-span-2 lg:col-span-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        <StatCard {...stat} />
                    </div>
                ))}
                <Card className="col-span-1 sm:col-span-2 lg:col-span-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Advanced Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="size-5 text-muted-foreground"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
                                <p className="text-lg font-bold">{advancedStats.sharpeRatio.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sun className="size-5 text-muted-foreground"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Best Session</p>
                                {advancedStats.bestSession ? (
                                    <p className="text-lg font-bold">{advancedStats.bestSession.session}
                                     <span className="text-sm font-medium text-positive ml-2">
                                        (+{advancedStats.bestSession.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})
                                     </span>
                                    </p>
                                ) : (
                                    <p className="text-lg font-bold">N/A</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="col-span-1 sm:col-span-2 lg:col-span-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
                    <CumulativePnlChart entries={chartEntries as any[]} />
                </div>
                 <div className="col-span-1 sm:col-span-2 lg:col-span-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '500ms' }}>
                    <BacktestStrategyPerformance entries={entries as BacktestJournalEntry[]} strategies={checklists as Checklist[]} />
                </div>
            </div>
        </TabsContent>

       {previewImageUrl && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in-0 zoom-in-95 duration-300">
            <Card className="w-[600px] max-w-2xl">
                <CardContent className="p-2 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 bg-background/50 hover:bg-background/80"
                        onClick={() => setPreviewImageUrl(null)}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close preview</span>
                    </Button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImageUrl} alt="Screenshot preview" className="rounded-md object-cover aspect-video" />
                </CardContent>
            </Card>
        </div>
      )}
    </Tabs>
  );
}
