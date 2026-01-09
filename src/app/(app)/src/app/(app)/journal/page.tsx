
'use client';
import {useState, useEffect, useMemo, useRef} from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Trash2, Edit, PlusCircle, Image as ImageIcon, X, FileUp, Eye} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { TradeResultCard } from '@/components/trade-result-card';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';

export type TradingSession = 'London' | 'New York' | 'Tokyo' | 'Sydney';
export type Emotion = 'Greedy' | 'Fearful' | 'Confident' | 'Neutral' | 'Anxious' | 'Patient';

export type JournalEntry = {
  id: string;
  date: string; // Storing as ISO string
  session?: TradingSession;
  currencyPair: string;
  direction: 'Long' | 'Short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  entryTime?: string; // Storing as ISO string
  exitTime?: string; // Storing as ISO string
  pnl?: number;
  rMultiple?: number;
  result: 'Win' | 'Loss' | 'Breakeven' | 'Ongoing';
  notes: string;
  screenshotBefore?: string;
  screenshotAfter?: string;
  adherenceToPlan: 'Yes' | 'No' | 'Partial';
  emotion?: Emotion;
  strategyId?: string;
  strategyTitle?: string;
  isImported?: boolean;
  createdAt?: any;
};


export default function JournalPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const entriesRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'journalEntries') : null),
    [user, firestore]
  );

  const checklistsRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'strategyChecklists') : null
  , [user, firestore]);

  const { data: checklists = [] } = useCollection<Omit<Checklist, 'id'>>(checklistsRef);

  const entriesQuery = useMemoFirebase(() =>
    entriesRef ? query(entriesRef, orderBy('date', 'asc')) : null,
    [entriesRef]
  );
  
  const { data: entries = [], isLoading } = useCollection<Omit<JournalEntry, 'id'>>(entriesQuery);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [cardPreviewEntry, setCardPreviewEntry] = useState<{entry: JournalEntry, index: number} | null>(null);

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
        emotion: currentEntry.emotion,
        strategyId: currentEntry.strategyId,
        strategyTitle: selectedStrategy?.title,
    };

    const finalEntry: Partial<Omit<JournalEntry, 'id'>> = { ...baseEntry };

    for (const [key, value] of Object.entries(optionalFields)) {
        if (value !== undefined && value !== null && value !== '') {
            (finalEntry as any)[key] = value;
        }
    }
    
    if (editId) {
      const docRef = doc(firestore, 'users', user.uid, 'journalEntries', editId);
      setDocumentNonBlocking(docRef, finalEntry, { merge: true });
    } else {
      (finalEntry as any).createdAt = serverTimestamp();
      addDocumentNonBlocking(entriesRef, finalEntry);
    }
    
    setIsEditDialogOpen(false);
    setEditId(null);
    setCurrentEntry({});
  };

  const handleEdit = (entry: JournalEntry) => {
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
    const docRef = doc(firestore, 'users', user.uid, 'journalEntries', id);
    deleteDocumentNonBlocking(docRef);
  };
  
  const getResultColor = (result: JournalEntry['result']) => {
    switch (result) {
      case 'Win': return 'text-positive';
      case 'Loss': return 'text-negative';
      default: return 'text-muted-foreground';
    }
  };

  const getResultBadgeVariant = (result: JournalEntry['result']) => {
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

  const handleRemoveImported = async () => {
    if (!user || !entriesRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not remove trades. User not found.' });
      return;
    }
    
    toast({ title: 'Removing imported trades...', description: 'Please wait.' });

    try {
      const q = query(entriesRef, where('isImported', '==', true));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ title: 'No Imported Trades Found', description: 'There are no trades flagged as imported to remove.' });
        return;
      }
      
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();

      toast({ title: 'Success', description: `Removed ${querySnapshot.size} imported trades.` });

    } catch (error) {
      console.error("Error removing imported trades:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not remove imported trades.' });
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !entriesRef) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, {
                raw: false, // This ensures dates are parsed as strings
                defval: null // Use null for empty cells
            });

            if (json.length === 0) {
              toast({ variant: 'destructive', title: 'Import Error', description: 'CSV file is empty or in the wrong format.' });
              return;
            }

            const batch = writeBatch(firestore);
            let importedCount = 0;
            
            // Normalize headers of the first row to create a map.
            const originalHeaders = Object.keys(json[0] || {});
            const normalizedHeaderMap: { [key: string]: string } = {};
            const rowHeaderMap: { [key: string]: string } = {};
            originalHeaders.forEach(h => {
                const normalizedKey = h.trim().toLowerCase();
                normalizedHeaderMap[normalizedKey] = h;
                rowHeaderMap[h] = normalizedKey;
            });

            const getValue = (row: any, keys: string[]) => {
                for (const key of keys) {
                    // key is already normalized
                    const originalHeader = normalizedHeaderMap[key];
                    if (originalHeader && row[originalHeader] !== null && row[originalHeader] !== undefined) {
                        return row[originalHeader];
                    }
                }
                return undefined;
            }

            json.forEach(row => {
                // --- Flexible Column Mapping ---
                const pnl = parseFloat(getValue(row, ['profit', 'profit_usd', 'pnl']));
                const entryPrice = parseFloat(getValue(row, ['open price', 'open_price', 'price', 'entry price', 'entry_price']));
                const stopLoss = parseFloat(getValue(row, ['sl', 's/l', 'stop_loss', 'stoploss', 'stop loss']));
                const takeProfit = parseFloat(getValue(row, ['tp', 't/p', 'take_profit', 'takeprofit', 'take profit']));
                const positionSize = parseFloat(getValue(row, ['lots', 'volume', 'size', 'positionsize', 'position size']));
                const direction = (getValue(row, ['type', 'direction']) || '').toLowerCase();
                const symbol = getValue(row, ['symbol']);
                const openTime = getValue(row, ['open time', 'open_time', 'time']);
                const ticketId = getValue(row, ['ticket id', 'ticket_id', 'ticket', 'order', 'id']);
                const reason = getValue(row, ['reason', 'comment']);
                

                // Basic validation
                if (!symbol || !direction || entryPrice === undefined || entryPrice === null) {
                    console.warn('Skipping invalid row (missing symbol, direction, or entry price):', row);
                    return;
                }

                let notes = `Imported trade.`;
                if (ticketId) notes += ` Order #${ticketId}.`;
                if (reason) notes += ` Reason: ${reason}.`;

                const newEntry: Omit<JournalEntry, 'id'> = {
                    date: openTime ? new Date(openTime).toISOString() : new Date().toISOString(),
                    currencyPair: symbol,
                    direction: direction.includes('buy') ? 'Long' : 'Short',
                    entryPrice,
                    stopLoss: stopLoss || 0,
                    takeProfit: takeProfit || 0,
                    positionSize: positionSize || 0,
                    pnl: isNaN(pnl) ? 0 : pnl,
                    result: (pnl > 0) ? 'Win' : (pnl < 0) ? 'Loss' : 'Breakeven',
                    notes: notes,
                    adherenceToPlan: 'Yes',
                    isImported: true,
                    createdAt: serverTimestamp()
                };

                const docRef = doc(entriesRef);
                batch.set(docRef, newEntry);
                importedCount++;
            });

            if (importedCount > 0) {
              await batch.commit();
              toast({ title: 'Import Successful', description: `${importedCount} trades were successfully imported.` });
            } else {
              toast({ variant: 'destructive', title: 'Import Failed', description: 'No valid trades were found in the file. Please check the file format and column headers.' });
            }

        } catch (error) {
            console.error("CSV Import Error:", error);
            toast({ variant: 'destructive', title: 'Import Failed', description: 'There was an error processing your file.' });
        } finally {
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
  };

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  const sortedEntries = [...(entries || [])].sort((a,b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.date);
    const dateB = b.createdAt?.toDate?.() || new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const hasImportedTrades = entries?.some(e => e.isImported);

  return (
    <div className="animate-in fade-in-0 duration-500">
      <div className="flex justify-end mb-4 gap-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="mr-2 h-4 w-4" />
            Import from CSV
        </Button>
        {hasImportedTrades && (
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Imported
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="animate-in fade-in-0 zoom-in-95 duration-300">
                  <AlertDialogHeader>
                  <AlertDialogTitleComponent>Are you absolutely sure?</AlertDialogTitleComponent>
                  <AlertDialogDescription>
                      This will permanently delete all trades that were imported via CSV.
                      This action cannot be undone.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveImported}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        )}
        <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) {
            setEditId(null);
            setCurrentEntry({});
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Journal Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] grid-rows-[auto,minmax(0,1fr),auto] max-h-[90vh] animate-in fade-in-0 zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit' : 'Add'} Journal Entry</DialogTitle>
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
                    onValueChange={(value: JournalEntry['result']) => setCurrentEntry({ ...currentEntry, result: value })}
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
                 <div className="space-y-2">
                    <Label htmlFor="emotion">Emotion</Label>
                    <Select
                        value={currentEntry.emotion}
                        onValueChange={(value: Emotion) => setCurrentEntry({ ...currentEntry, emotion: value })}
                    >
                        <SelectTrigger id="emotion">
                        <SelectValue placeholder="Select emotion" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Confident">Confident</SelectItem>
                            <SelectItem value="Fearful">Fearful</SelectItem>
                            <SelectItem value="Greedy">Greedy</SelectItem>
                            <SelectItem value="Anxious">Anxious</SelectItem>
                            <SelectItem value="Patient">Patient</SelectItem>
                            <SelectItem value="Neutral">Neutral</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="pnl">Net P&amp;L</Label>
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
      <div className="animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: '200ms' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Pair</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Strategy</TableHead>
            <TableHead>P&amp;L</TableHead>
            <TableHead>Emotion</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Before</TableHead>
            <TableHead>After</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.map((entry, index) => (
            <TableRow key={entry.id} className="animate-in fade-in-0">
              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
              <TableCell className="font-medium">{entry.currencyPair}</TableCell>
              <TableCell>{entry.direction}</TableCell>
              <TableCell>{entry.strategyTitle || 'N/A'}</TableCell>
              <TableCell className={getResultColor(entry.result)}>
                {entry.pnl?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? 'N/A'}
              </TableCell>
              <TableCell>{entry.emotion || 'N/A'}</TableCell>
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
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => setCardPreviewEntry({entry: entry as JournalEntry, index})}>
                  <Eye className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(entry as JournalEntry)}>
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
      </div>

       {cardPreviewEntry && (
        <Dialog open={!!cardPreviewEntry} onOpenChange={(isOpen) => !isOpen && setCardPreviewEntry(null)}>
          <DialogContent className="max-w-min bg-transparent border-none shadow-none p-0 animate-in fade-in-0 zoom-in-95 duration-300">
             <DialogHeader>
                <DialogTitle className="sr-only">Trade Result Card Preview</DialogTitle>
             </DialogHeader>
             <TradeResultCard 
                entry={cardPreviewEntry.entry} 
                allEntries={entries as JournalEntry[]}
                tradeIndex={cardPreviewEntry.index}
            />
          </DialogContent>
        </Dialog>
      )}

       {(!entries || entries.length === 0) && !isLoading && (
        <div className="text-center py-12 text-muted-foreground animate-in fade-in-0 duration-500">
            No journal entries yet.
        </div>
      )}
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
                    <img
                        src={previewImageUrl}
                        alt="Screenshot preview"
                        className="rounded-md object-cover aspect-video"
                    />
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
