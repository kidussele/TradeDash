
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
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
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


export type ChecklistItem = {
  id: string;
  text: string;
  isChecked: boolean;
};

export type Checklist = {
  id: string;
  title: string;
  items: ChecklistItem[];
};

export default function StrategyChecklistPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const checklistsRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'strategyChecklists') : null
  , [user, firestore]);
  
  const { data: checklists = [], isLoading } = useCollection<Omit<Checklist, 'id'>>(checklistsRef);

  // For adding/editing a checklist (strategy)
  const [isChecklistDialog, setIsChecklistDialog] = useState(false);
  const [currentChecklistTitle, setCurrentChecklistTitle] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);

  // For adding/editing an item within a checklist
  const [isItemDialog, setIsItemDialog] = useState(false);
  const [currentItemText, setCurrentItemText] = useState('');
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);


  // Checklist (Strategy) handlers
  const handleSaveChecklist = () => {
    if (!currentChecklistTitle.trim() || !user || !checklistsRef) return;

    if (editingChecklistId) {
      const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', editingChecklistId);
      setDocumentNonBlocking(docRef, { title: currentChecklistTitle }, { merge: true });
    } else {
      addDocumentNonBlocking(checklistsRef, { title: currentChecklistTitle, items: [] });
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

  const handleDeleteChecklist = (checklistId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', checklistId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const handleAddNewChecklist = () => {
    setEditingChecklistId(null);
    setCurrentChecklistTitle('');
    setIsChecklistDialog(true);
  };

  // Item handlers
  const handleSaveItem = () => {
    if (!currentItemText.trim() || !activeChecklistId || !user) return;

    const checklist = checklists.find(c => c.id === activeChecklistId);
    if (!checklist) return;

    let newItems: ChecklistItem[];

    if (editingItemId) { // Editing existing item
      newItems = checklist.items.map(item =>
        item.id === editingItemId ? { ...item, text: currentItemText } : item
      );
    } else { // Adding new item
      const newItem: ChecklistItem = {
        id: String(Date.now()),
        text: currentItemText,
        isChecked: false,
      };
      newItems = [...checklist.items, newItem];
    }
    
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', activeChecklistId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });

    setIsItemDialog(false);
    setCurrentItemText('');
    setEditingItemId(null);
    setActiveChecklistId(null);
  };
  
  const handleAddNewItem = (checklistId: string) => {
    setActiveChecklistId(checklistId);
    setEditingItemId(null);
    setCurrentItemText('');
    setIsItemDialog(true);
  };
  
  const handleEditItem = (checklistId: string, item: ChecklistItem) => {
    setActiveChecklistId(checklistId);
    setEditingItemId(item.id);
    setCurrentItemText(item.text);
    setIsItemDialog(true);
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    if (!user) return;
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const newItems = checklist.items.filter(item => item.id !== itemId);
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', checklistId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });
  };
  
  const handleCheckChange = (checklistId: string, itemId: string) => {
    if (!user) return;
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const newItems = checklist.items.map(item =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      );
    
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', checklistId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });
  };
  
  const handleResetChecks = (checklistId: string) => {
    if (!user) return;
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const newItems = checklist.items.map(item => ({ ...item, isChecked: false }));
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', checklistId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
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

      {checklists.length === 0 && !isLoading ? (
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
                        <div className="text-center p-3 rounded-md bg-positive/10 text-sm font-semibold text-positive">
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
