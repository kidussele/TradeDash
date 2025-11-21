
'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2, CheckCircle2, HelpCircle, BarChart2, ClipboardCheck } from 'lucide-react';
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
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, increment } from 'firebase/firestore';
import { Confetti } from '@/components/ui/confetti';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategyUsageChart } from '@/components/strategy-usage-chart';

export type ChecklistItem = {
  id: string;
  text: string;
  description?: string;
  isChecked: boolean;
};

export type Narrative = 'Bullish' | 'Bearish';

export type Checklist = {
  id:string;
  title: string;
  description?: string;
  narrative: Narrative;
  items: ChecklistItem[];
  useCount?: number;
};

export default function StrategyChecklistPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const checklistsRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'strategyChecklists') : null
  , [user, firestore]);
  
  const { data: checklists = [], isLoading: isLoadingChecklists } = useCollection<Omit<Checklist, 'id'>>(checklistsRef);

  const [narrative, setNarrative] = useState<Narrative>('Bullish');
  
  // For adding/editing a checklist (strategy)
  const [isChecklistDialog, setIsChecklistDialog] = useState(false);
  const [currentChecklist, setCurrentChecklist] = useState<Partial<Checklist>>({});
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);

  // For adding/editing an item within a checklist
  const [isItemDialog, setIsItemDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ChecklistItem>>({});
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [showConfettiFor, setShowConfettiFor] = useState<string | null>(null);


  // Checklist (Strategy) handlers
  const handleSaveChecklist = () => {
    if (!currentChecklist.title?.trim() || !user || !checklistsRef) return;
    
    const checklistData: Partial<Checklist> = {
      title: currentChecklist.title,
      description: currentChecklist.description || '',
      narrative: currentChecklist.narrative || 'Bullish',
    }

    if (editingChecklistId) {
      const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', editingChecklistId);
      setDocumentNonBlocking(docRef, checklistData, { merge: true });
    } else {
      checklistData.items = [];
      checklistData.useCount = 0;
      addDocumentNonBlocking(checklistsRef, checklistData);
    }
    setIsChecklistDialog(false);
    setCurrentChecklist({});
    setEditingChecklistId(null);
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setEditingChecklistId(checklist.id);
    setCurrentChecklist(checklist);
    setIsChecklistDialog(true);
  };

  const handleDeleteChecklist = (checklistId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', checklistId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const handleAddNewChecklist = () => {
    setEditingChecklistId(null);
    setCurrentChecklist({ narrative: 'Bullish' });
    setIsChecklistDialog(true);
  };

  // Item handlers
  const handleSaveItem = () => {
    if (!currentItem.text?.trim() || !activeChecklistId || !user || !checklists) return;

    const checklist = checklists.find(c => c.id === activeChecklistId);
    if (!checklist) return;

    let newItems: ChecklistItem[];

    if (editingItemId) { // Editing existing item
      newItems = checklist.items.map(item =>
        item.id === editingItemId ? { ...item, text: currentItem.text!, description: currentItem.description || '' } : item
      );
    } else { // Adding new item
      const newItem: ChecklistItem = {
        id: String(Date.now()),
        text: currentItem.text!,
        description: currentItem.description || '',
        isChecked: false,
      };
      newItems = [...checklist.items, newItem];
    }
    
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', activeChecklistId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });

    setIsItemDialog(false);
    setCurrentItem({});
    setEditingItemId(null);
    setActiveChecklistId(null);
  };
  
  const handleAddNewItem = (checklistId: string) => {
    setActiveChecklistId(checklistId);
    setEditingItemId(null);
    setCurrentItem({});
    setIsItemDialog(true);
  };
  
  const handleEditItem = (checklistId: string, item: ChecklistItem) => {
    setActiveChecklistId(checklistId);
    setEditingItemId(item.id);
    setCurrentItem(item);
    setIsItemDialog(true);
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    if (!user || !checklists) return;
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const newItems = checklist.items.filter(item => item.id !== itemId);
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', checklistId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });
  };
  
  const handleCheckChange = (checklistId: string, itemId: string, isChecked: boolean) => {
    if (!user || !checklists) return;
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const wasAllChecked = checklist.items.length > 0 && checklist.items.every(item => item.isChecked);

    const newItems = checklist.items.map(item =>
        item.id === itemId ? { ...item, isChecked } : item
      );
    
    const isAllCheckedNow = newItems.length > 0 && newItems.every(item => item.isChecked);

    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', checklistId);
    
    if (isAllCheckedNow && !wasAllChecked) {
        setShowConfettiFor(checklistId);
        updateDocumentNonBlocking(docRef, { 
            items: newItems,
            useCount: increment(1)
        });
    } else {
        setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });
    }
  };
  
  const handleResetChecks = (checklistId: string) => {
    if (!user || !checklists) return;
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const newItems = checklist.items.map(item => ({ ...item, isChecked: false }));
    const docRef = doc(firestore, 'users', user.uid, 'strategyChecklists', checklistId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });
  };
  
  const filteredChecklists = (checklists || []).filter(cl => cl.narrative === narrative);

  const isLoading = isLoadingChecklists;

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-in fade-in-0 duration-500">
        <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
          <h1 className="text-2xl font-bold">Strategy Playbook</h1>
          <p className="text-muted-foreground">
            Define your rules of engagement and analyze their performance.
          </p>
        </div>
        <Dialog open={isChecklistDialog} onOpenChange={setIsChecklistDialog}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNewChecklist} className="animate-in fade-in-0 zoom-in-95 duration-500">
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
                            value={currentChecklist.title || ''}
                            onChange={(e) => setCurrentChecklist({ ...currentChecklist, title: e.target.value})}
                            placeholder="e.g., ICT Silver Bullet"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="checklist-description">Description</Label>
                        <Textarea
                            id="checklist-description"
                            value={currentChecklist.description || ''}
                            onChange={(e) => setCurrentChecklist({ ...currentChecklist, description: e.target.value})}
                            placeholder="Describe what this strategy is for."
                        />
                    </div>
                    <div className="space-y-2">
                      <Label>Narrative</Label>
                       <RadioGroup
                          value={currentChecklist.narrative}
                          onValueChange={(value: Narrative) => setCurrentChecklist({ ...currentChecklist, narrative: value })}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Bullish" id="r-bullish" />
                            <Label htmlFor="r-bullish">Bullish</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Bearish" id="r-bearish" />
                            <Label htmlFor="r-bearish">Bearish</Label>
                          </div>
                        </RadioGroup>
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

      <Tabs defaultValue="checklists">
        <TabsList>
          <TabsTrigger value="checklists"><ClipboardCheck className="mr-2 h-4 w-4" />Checklists</TabsTrigger>
          <TabsTrigger value="analysis"><BarChart2 className="mr-2 h-4 w-4" />Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="checklists" className="space-y-6">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                    <CardTitle>HTF Narrative</CardTitle>
                    <CardDescription>Select the current higher time frame market bias.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                    defaultValue="Bullish"
                    value={narrative}
                    onValueChange={(value: Narrative) => setNarrative(value)}
                    className="flex flex-wrap gap-4"
                    >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Bullish" id="narrative-bullish" />
                        <Label htmlFor="narrative-bullish" className="text-base">Bullish</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Bearish" id="narrative-bearish" />
                        <Label htmlFor="narrative-bearish" className="text-base">Bearish</Label>
                    </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {(!filteredChecklists || filteredChecklists.length === 0) && !isLoading ? (
                <div className="text-center py-24 border-2 border-dashed rounded-lg animate-in fade-in-0 zoom-in-95 duration-500">
                <h2 className="text-xl font-semibold text-muted-foreground">No {narrative.toLowerCase()} checklists yet</h2>
                <p className="text-muted-foreground mt-2">Click "Add Strategy" to create one.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredChecklists.map((cl, index) => {
                    const allChecked = cl.items.length > 0 && cl.items.every(item => item.isChecked);
                    return (
                    <div key={cl.id} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
                        <Card className="flex flex-col h-full">
                            {showConfettiFor === cl.id && <Confetti onComplete={() => setShowConfettiFor(null)} />}
                            <CardHeader className="flex-row items-start justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle>{cl.title}</CardTitle>
                                {cl.description && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">{cl.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditChecklist(cl as Checklist)}>
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
                                    onCheckedChange={(checked) => handleCheckChange(cl.id, item.id, Boolean(checked))}
                                    className="size-5"
                                    />
                                    <label
                                    htmlFor={`item-${item.id}`}
                                    className="flex-1 text-sm font-medium leading-none"
                                    >
                                    {item.text}
                                    </label>
                                    {item.description && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">{item.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    )}
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
                                    <div className="flex items-center justify-center gap-2 text-center p-3 rounded-md bg-positive/10 text-base font-semibold text-positive animate-in fade-in-0 zoom-in-95">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span>Cleared to trade!</span>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                    );
                })}
                </div>
            )}
        </TabsContent>
        <TabsContent value="analysis">
            <StrategyUsageChart strategies={checklists as Checklist[]} />
        </TabsContent>
      </Tabs>
      
       {/* Item Dialog */}
        <Dialog open={isItemDialog} onOpenChange={setIsItemDialog}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingItemId !== null ? 'Edit' : 'Add'} Rule</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="rule-text">Rule</Label>
                        <Input
                            id="rule-text"
                            value={currentItem.text || ''}
                            onChange={(e) => setCurrentItem({ ...currentItem, text: e.target.value })}
                            placeholder="e.g., Is the trade in line with the trend?"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rule-description">Description (Optional)</Label>
                         <Textarea
                            id="rule-description"
                            value={currentItem.description || ''}
                            onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                            placeholder="Explain the reasoning or importance of this rule."
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
    </div>
  );
}
