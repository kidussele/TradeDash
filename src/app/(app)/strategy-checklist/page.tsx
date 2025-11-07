
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export type ChecklistItem = {
  id: number;
  text: string;
  isChecked: boolean;
};

export default function StrategyChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItemText, setCurrentItemText] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedItems = localStorage.getItem('strategyChecklist');
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('strategyChecklist', JSON.stringify(items));
    }
  }, [items, isClient]);

  const handleSave = () => {
    if (!currentItemText.trim()) return;

    if (editIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editIndex].text = currentItemText;
      setItems(updatedItems);
    } else {
      const newItem: ChecklistItem = {
        id: Date.now(),
        text: currentItemText,
        isChecked: false,
      };
      setItems([...items, newItem]);
    }
    setIsEditDialogOpen(false);
    setEditIndex(null);
    setCurrentItemText('');
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentItemText(items[index].text);
    setIsEditDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditIndex(null);
    setCurrentItemText('');
    setIsEditDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const handleCheckChange = (index: number) => {
    const updatedItems = [...items];
    updatedItems[index].isChecked = !updatedItems[index].isChecked;
    setItems(updatedItems);
  };

  const handleResetChecks = () => {
    setItems(items.map(item => ({ ...item, isChecked: false })));
  };

  if (!isClient) {
    return null; // Or a loading spinner
  }

  const allChecked = items.length > 0 && items.every(item => item.isChecked);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Strategy Checklist</CardTitle>
                <CardDescription>
                    Your predefined rules to follow before entering a trade.
                </CardDescription>
            </div>
             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Rule
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editIndex !== null ? 'Edit' : 'Add'} Rule</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rule-text">Rule Description</Label>
                            <Input
                                id="rule-text"
                                value={currentItemText}
                                onChange={(e) => setCurrentItemText(e.target.value)}
                                placeholder="e.g., Is the trade in line with the trend?"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSave}>Save Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            {items.length === 0 ? (
                 <div className="text-center py-24 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold text-muted-foreground">No rules yet</h2>
                    <p className="text-muted-foreground mt-2">Click "Add Rule" to build your checklist.</p>
                 </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-3">
                        {items.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <Checkbox
                                id={`item-${item.id}`}
                                checked={item.isChecked}
                                onCheckedChange={() => handleCheckChange(index)}
                                className="size-5"
                            />
                            <label
                                htmlFor={`item-${item.id}`}
                                className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {item.text}
                            </label>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={handleResetChecks}>Reset Checklist</Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      {allChecked && (
          <div className="text-center p-6 rounded-lg bg-positive/10 text-positive-foreground">
              <p className="font-semibold text-positive">All checks passed. You are cleared to trade!</p>
          </div>
      )}
    </div>
  );
}
