
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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

export type Checklist = {
  id: number;
  title: string;
  items: ChecklistItem[];
};

export default function StrategyChecklistPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isClient, setIsClient] = useState(false);

  // For adding/editing a checklist (strategy)
  const [isChecklistDialog, setIsChecklistDialog] = useState(false);
  const [currentChecklistTitle, setCurrentChecklistTitle] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);

  // For adding/editing an item within a checklist
  const [isItemDialog, setIsItemDialog] = useState(false);
  const [currentItemText, setCurrentItemText] = useState('');
  const [activeChecklistId, setActiveChecklistId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);


  useEffect(() => {
    setIsClient(true);
    const storedChecklists = localStorage.getItem('strategyChecklists');
    if (storedChecklists) {
      setChecklists(JSON.parse(storedChecklists));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('strategyChecklists', JSON.stringify(checklists));
    }
  }, [checklists, isClient]);

  // Checklist (Strategy) handlers
  const handleSaveChecklist = () => {
    if (!currentChecklistTitle.trim()) return;

    if (editingChecklistId !== null) {
      setChecklists(
        checklists.map((cl) =>
          cl.id === editingChecklistId ? { ...cl, title: currentChecklistTitle } : cl
        )
      );
    } else {
      const newChecklist: Checklist = {
        id: Date.now(),
        title: currentChecklistTitle,
        items: [],
      };
      setChecklists([...checklists, newChecklist]);
    }
    setIsChecklistDialog(false);
    setCurrentChecklistTitle('');
    setEditingChecklistId(null);
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setEditingChecklistId(checklist.id);
    setCurrentChecklistTitle(checklist.title);
    setIsChecklistDialog(true);
  };

  const handleDeleteChecklist = (checklistId: number) => {
    setChecklists(checklists.filter((cl) => cl.id !== checklistId));
  };
  
  const handleAddNewChecklist = () => {
    setEditingChecklistId(null);
    setCurrentChecklistTitle('');
    setIsChecklistDialog(true);
  };

  // Item handlers
  const handleSaveItem = () => {
    if (!currentItemText.trim() || activeChecklistId === null) return;

    setChecklists(checklists.map(cl => {
      if (cl.id === activeChecklistId) {
        if (editingItemId !== null) { // Editing existing item
          return {
            ...cl,
            items: cl.items.map(item =>
              item.id === editingItemId ? { ...item, text: currentItemText } : item
            ),
          };
        } else { // Adding new item
          const newItem: ChecklistItem = {
            id: Date.now(),
            text: currentItemText,
            isChecked: false,
          };
          return { ...cl, items: [...cl.items, newItem] };
        }
      }
      return cl;
    }));

    setIsItemDialog(false);
    setCurrentItemText('');
    setEditingItemId(null);
    setActiveChecklistId(null);
  };
  
  const handleAddNewItem = (checklistId: number) => {
    setActiveChecklistId(checklistId);
    setEditingItemId(null);
    setCurrentItemText('');
    setIsItemDialog(true);
  };
  
  const handleEditItem = (checklistId: number, item: ChecklistItem) => {
    setActiveChecklistId(checklistId);
    setEditingItemId(item.id);
    setCurrentItemText(item.text);
    setIsItemDialog(true);
  };

  const handleDeleteItem = (checklistId: number, itemId: number) => {
    setChecklists(checklists.map(cl =>
      cl.id === checklistId
        ? { ...cl, items: cl.items.filter(item => item.id !== itemId) }
        : cl
    ));
  };
  
  const handleCheckChange = (checklistId: number, itemId: number) => {
    setChecklists(checklists.map(cl =>
      cl.id === checklistId
        ? {
            ...cl,
            items: cl.items.map(item =>
              item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
            ),
          }
        : cl
    ));
  };
  
  const handleResetChecks = (checklistId: number) => {
    setChecklists(checklists.map(cl =>
      cl.id === checklistId
        ? { ...cl, items: cl.items.map(item => ({ ...item, isChecked: false })) }
        : cl
    ));
  };

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Strategy Checklists</h1>
          <p className="text-muted-foreground">
            Manage your predefined rules for different trading strategies.
          </p>
        </div>
        <Dialog open={isChecklistDialog} onOpenChange={setIsChecklistDialog}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNewChecklist}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Strategy
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingChecklistId !== null ? 'Edit' : 'Add'} Strategy</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="checklist-title">Strategy Name</Label>
                        <Input
                            id="checklist-title"
                            value={currentChecklistTitle}
                            onChange={(e) => setCurrentChecklistTitle(e.target.value)}
                            placeholder="e.g., ICT Silver Bullet"
                        />
                    </div>
                </div>
                <DialogFooter>
                     <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveChecklist}>Save Strategy</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

       {/* Item Dialog */}
        <Dialog open={isItemDialog} onOpenChange={setIsItemDialog}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingItemId !== null ? 'Edit' : 'Add'} Rule</DialogTitle>
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
                    <Button onClick={handleSaveItem}>Save Rule</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      {checklists.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">No checklists yet</h2>
          <p className="text-muted-foreground mt-2">Click "Add Strategy" to create your first checklist.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {checklists.map((cl) => {
            const allChecked = cl.items.length > 0 && cl.items.every(item => item.isChecked);
            return (
              <Card key={cl.id} className="flex flex-col">
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle>{cl.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditChecklist(cl)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteChecklist(cl.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {cl.items.length === 0 ? (
                     <div className="text-center py-10 text-muted-foreground">
                        <p>No rules added yet.</p>
                     </div>
                  ) : (
                    cl.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.isChecked}
                          onCheckedChange={() => handleCheckChange(cl.id, item.id)}
                          className="size-5"
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className="flex-1 text-sm font-medium leading-none"
                        >
                          {item.text}
                        </label>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditItem(cl.id, item)}>
                            <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteItem(cl.id, item.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-3 pt-6">
                    <Button onClick={() => handleAddNewItem(cl.id)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Rule
                    </Button>
                     {cl.items.length > 0 && (
                        <Button variant="outline" onClick={() => handleResetChecks(cl.id)}>Reset Checklist</Button>
                     )}
                     {allChecked && (
                        <div className="text-center p-3 rounded-md bg-positive/10 text-sm font-semibold text-positive-foreground text-positive">
                            Cleared to trade!
                        </div>
                    )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
