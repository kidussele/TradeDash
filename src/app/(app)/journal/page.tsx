
'use client';
import {useState, useEffect, useMemo} from 'react';
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
import {Trash2, Edit, PlusCircle, Image as ImageIcon} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type JournalEntry = {
  id: number;
  currencyPair: string;
  direction: 'Long' | 'Short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  entryTime?: Date;
  exitTime?: Date;
  pnl?: number;
  rMultiple?: number;
  result: 'Win' | 'Loss' | 'Breakeven' | 'Ongoing';
  notes: string;
  screenshotBefore?: string;
  screenshotAfter?: string;
  adherenceToPlan: 'Yes' | 'No' | 'Partial';
};


export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({});
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
        setEntries(JSON.parse(storedEntries).map((entry: any) => ({
            ...entry,
            entryTime: entry.entryTime ? new Date(entry.entryTime) : undefined,
            exitTime: entry.exitTime ? new Date(entry.exitTime) : undefined,
        })));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('journalEntries', JSON.stringify(entries));
    }
  }, [entries, isClient]);

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


  const handleSave = () => {
    const risk = Math.abs((Number(currentEntry.entryPrice) || 0) - (Number(currentEntry.stopLoss) || 0));
    let rMultiple;
    if (risk > 0 && currentEntry.pnl) {
        rMultiple = currentEntry.pnl / (risk * (currentEntry.positionSize || 1));
    }

    const finalEntry: JournalEntry = {
      id: editIndex !== null ? entries[editIndex].id : Date.now(),
      currencyPair: currentEntry.currencyPair || '',
      direction: currentEntry.direction || 'Long',
      entryPrice: Number(currentEntry.entryPrice) || 0,
      stopLoss: Number(currentEntry.stopLoss) || 0,
      takeProfit: Number(currentEntry.takeProfit) || 0,
      positionSize: Number(currentEntry.positionSize) || 0,
      entryTime: currentEntry.entryTime,
      exitTime: currentEntry.exitTime,
      pnl: currentEntry.pnl,
      rMultiple: rMultiple,
      result: currentEntry.result || 'Ongoing',
      notes: currentEntry.notes || '',
      screenshotBefore: currentEntry.screenshotBefore,
      screenshotAfter: currentEntry.screenshotAfter,
      adherenceToPlan: currentEntry.adherenceToPlan || 'Yes',
    };

    if (editIndex !== null) {
      const updatedEntries = [...entries];
      updatedEntries[editIndex] = finalEntry;
      setEntries(updatedEntries);
    } else {
      setEntries([...entries, finalEntry]);
    }
    setIsEditDialogOpen(false);
    setEditIndex(null);
    setCurrentEntry({});
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentEntry({
        ...entries[index],
        entryTime: entries[index].entryTime ? new Date(entries[index].entryTime!) : undefined,
        exitTime: entries[index].exitTime ? new Date(entries[index].exitTime!) : undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditIndex(null);
    setCurrentEntry({ result: 'Ongoing', direction: 'Long', entryTime: new Date() });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
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


  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Journal Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editIndex !== null ? 'Edit' : 'Add'} Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
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
                  onValueChange={(value: 'Long' | 'Short') => setCurrentEntry({ ...currentEntry, direction: value })}
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
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pair</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Stop-Loss</TableHead>
            <TableHead>Take-Profit</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Before</TableHead>
            <TableHead>After</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.currencyPair}</TableCell>
              <TableCell>{entry.direction}</TableCell>
              <TableCell>{entry.entryPrice}</TableCell>
              <TableCell>{entry.stopLoss}</TableCell>
              <TableCell>{entry.takeProfit}</TableCell>
              <TableCell className={getResultColor(entry.result)}>
                {entry.pnl?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={getResultBadgeVariant(entry.result)}>{entry.result}</Badge>
              </TableCell>
              <TableCell>
                {entry.screenshotBefore ? (
                  <Link href={`/image-preview?imageUrl=${encodeURIComponent(entry.screenshotBefore)}`} target="_blank">
                    <ImageIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                  </Link>
                ) : 'N/A'}
              </TableCell>
              <TableCell>
                {entry.screenshotAfter ? (
                  <Link href={`/image-preview?imageUrl=${encodeURIComponent(entry.screenshotAfter)}`} target="_blank">
                    <ImageIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                  </Link>
                ) : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            No journal entries yet.
        </div>
      )}
    </div>
  );
}
