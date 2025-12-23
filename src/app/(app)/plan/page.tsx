
'use client';
import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type ChecklistItem = {
  id: string;
  text: string;
  isChecked: boolean;
};

type ProgressEntry = {
  id: string;
  date: Timestamp;
  notes: string;
  imageUrl: string;
};

export type Plan = {
  id: string;
  title: string;
  description?: string;
  createdAt: any;
  items: ChecklistItem[];
  progressEntries?: ProgressEntry[];
};

export default function PlanPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const plansRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'plans') : null
  , [user, firestore]);
  
  const { data: plansData, isLoading } = useCollection<Omit<Plan, 'id'>>(plansRef);
  const plans = plansData || [];

  const [isPlanDialog, setIsPlanDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>({});
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const [isItemDialog, setIsItemDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ChecklistItem>>({});
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [isProgressDialog, setIsProgressDialog] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<Partial<Omit<ProgressEntry, 'id' | 'date'>>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // --- Plan Handlers ---
  const handleSavePlan = () => {
    if (!currentPlan.title?.trim() || !user || !plansRef) return;
    
    const planData: Partial<Omit<Plan, 'id'>> = {
      title: currentPlan.title,
      description: currentPlan.description || '',
    };

    if (editingPlanId) {
      const docRef = doc(firestore, 'users', user.uid, 'plans', editingPlanId);
      setDocumentNonBlocking(docRef, planData, { merge: true });
    } else {
      planData.createdAt = serverTimestamp();
      planData.items = [];
      planData.progressEntries = [];
      addDocumentNonBlocking(plansRef, planData);
    }
    setIsPlanDialog(false);
    setCurrentPlan({});
    setEditingPlanId(null);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setCurrentPlan(plan);
    setIsPlanDialog(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'plans', planId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const handleAddNewPlan = () => {
    setEditingPlanId(null);
    setCurrentPlan({});
    setIsPlanDialog(true);
  };

  // --- Checklist Item Handlers ---
  const handleSaveItem = () => {
    if (!currentItem.text?.trim() || !activePlanId || !user) return;

    const plan = plans.find(p => p.id === activePlanId);
    if (!plan) return;

    let newItems: ChecklistItem[];
    if (editingItemId) {
      newItems = (plan.items || []).map(item => item.id === editingItemId ? { ...item, text: currentItem.text! } : item);
    } else {
      const newItem: ChecklistItem = { id: String(Date.now()), text: currentItem.text!, isChecked: false };
      newItems = [...(plan.items || []), newItem];
    }
    
    const docRef = doc(firestore, 'users', user.uid, 'plans', activePlanId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });

    setIsItemDialog(false);
    setCurrentItem({});
    setEditingItemId(null);
    setActivePlanId(null);
  };
  
  const handleAddNewItem = (planId: string) => {
    setActivePlanId(planId);
    setEditingItemId(null);
    setCurrentItem({});
    setIsItemDialog(true);
  };

  const handleCheckChange = (planId: string, itemId: string, isChecked: boolean) => {
    if (!user) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const newItems = (plan.items || []).map(item => item.id === itemId ? { ...item, isChecked } : item);
    const docRef = doc(firestore, 'users', user.uid, 'plans', planId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });
  };

  const handleDeleteItem = (planId: string, itemId: string) => {
    if (!user) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const newItems = (plan.items || []).filter(item => item.id !== itemId);
    const docRef = doc(firestore, 'users', user.uid, 'plans', planId);
    setDocumentNonBlocking(docRef, { items: newItems }, { merge: true });
  };
  
  // --- Progress Entry Handlers ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const { url } = await response.json();
      setCurrentProgress(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: (error as Error).message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProgress = () => {
    if (!currentProgress.imageUrl || !activePlanId || !user) return;
    
    const plan = plans.find(p => p.id === activePlanId);
    if (!plan) return;

    const newEntry: ProgressEntry = {
      id: String(Date.now()),
      date: Timestamp.now(),
      notes: currentProgress.notes || '',
      imageUrl: currentProgress.imageUrl,
    };

    const newProgressEntries = [newEntry, ...(plan.progressEntries || [])];
    
    const docRef = doc(firestore, 'users', user.uid, 'plans', activePlanId);
    setDocumentNonBlocking(docRef, { progressEntries: newProgressEntries }, { merge: true });
    
    setIsProgressDialog(false);
    setCurrentProgress({});
    setActivePlanId(null);
  };
  
  const handleAddNewProgress = (planId: string) => {
    setActivePlanId(planId);
    setCurrentProgress({});
    setIsProgressDialog(true);
  };

  if (isLoading) {
    return <div>Loading plans...</div>;
  }

  const sortedPlans = [...plans].sort((a,b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-in fade-in-0 duration-500">
        <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
          <h1 className="text-2xl font-bold">My Plans</h1>
          <p className="text-muted-foreground">Create and track your long-term plans.</p>
        </div>
        <Button onClick={handleAddNewPlan} className="animate-in fade-in-0 zoom-in-95 duration-500">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      {sortedPlans.length === 0 ? (
         <div className="text-center py-24 border-2 border-dashed rounded-lg animate-in fade-in-0 zoom-in-95 duration-500">
            <h2 className="text-xl font-semibold text-muted-foreground">No plans yet.</h2>
            <p className="text-muted-foreground mt-2">Click "New Plan" to get started.</p>
         </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {sortedPlans.map((plan) => (
            <Card key={plan.id} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <AccordionItem value={plan.id} className="border-b-0">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <AccordionTrigger className="w-full text-left p-0 hover:no-underline">
                             <CardTitle>{plan.title}</CardTitle>
                        </AccordionTrigger>
                        <div className="flex items-center gap-1 pl-4">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan as Plan)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <AccordionContent>
                  <CardContent className="grid md:grid-cols-2 gap-8">
                    {/* Checklist Section */}
                    <div>
                        <h3 className="font-semibold mb-4">Checklist</h3>
                        <div className="space-y-3">
                        {(plan.items || []).map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                            <Checkbox id={item.id} checked={item.isChecked} onCheckedChange={(checked) => handleCheckChange(plan.id, item.id, Boolean(checked))} />
                            <label htmlFor={item.id} className="flex-1 text-sm font-medium">{item.text}</label>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteItem(plan.id, item.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                            </div>
                        ))}
                        </div>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => handleAddNewItem(plan.id)}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Item
                        </Button>
                    </div>
                    {/* Progress Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Progress Check-ins</h3>
                             <Button size="sm" onClick={() => handleAddNewProgress(plan.id)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add Progress
                            </Button>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                           {(plan.progressEntries || []).map(entry => (
                            <Card key={entry.id} className="bg-muted/50">
                                <CardContent className="p-4 flex gap-4">
                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                     <img src={entry.imageUrl} alt="Progress" className="w-24 h-24 object-cover rounded-md" />
                                     <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">{entry.date?.toDate().toLocaleDateString()}</p>
                                        <p className="text-sm mt-1">{entry.notes}</p>
                                     </div>
                                </CardContent>
                            </Card>
                           ))}
                           {(plan.progressEntries || []).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">No progress entries yet.</p>
                           )}
                        </div>
                    </div>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>
      )}

      {/* Plan Dialog */}
      <Dialog open={isPlanDialog} onOpenChange={setIsPlanDialog}>
          <DialogContent>
              <DialogHeader><DialogTitle>{editingPlanId ? 'Edit' : 'New'} Plan</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                  <div className="space-y-2">
                      <Label htmlFor="plan-title">Title</Label>
                      <Input id="plan-title" value={currentPlan.title || ''} onChange={e => setCurrentPlan({...currentPlan, title: e.target.value})} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="plan-desc">Description</Label>
                      <Textarea id="plan-desc" value={currentPlan.description || ''} onChange={e => setCurrentPlan({...currentPlan, description: e.target.value})} />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleSavePlan}>Save Plan</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Item Dialog */}
      <Dialog open={isItemDialog} onOpenChange={setIsItemDialog}>
          <DialogContent>
              <DialogHeader><DialogTitle>Add Checklist Item</DialogTitle></DialogHeader>
              <div className="space-y-2 py-2">
                  <Label htmlFor="item-text">Task</Label>
                  <Input id="item-text" value={currentItem.text || ''} onChange={e => setCurrentItem({...currentItem, text: e.target.value})} />
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleSaveItem}>Save Item</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={isProgressDialog} onOpenChange={setIsProgressDialog}>
          <DialogContent>
              <DialogHeader><DialogTitle>Add Progress Check-in</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                  <div className="space-y-2">
                      <Label>Image</Label>
                      {currentProgress.imageUrl ? (
                        <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={currentProgress.imageUrl} alt="upload preview" className="w-full h-48 object-cover rounded-md"/>
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setCurrentProgress({...currentProgress, imageUrl: undefined})}><X className="h-4 w-4"/></Button>
                        </div>
                      ) : (
                        <Card className="flex flex-col items-center justify-center p-8 border-2 border-dashed">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                <Upload className="mr-2 h-4 w-4"/> {isUploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">Max 1MB.</p>
                        </Card>
                      )}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="progress-notes">Notes</Label>
                      <Textarea id="progress-notes" value={currentProgress.notes || ''} onChange={e => setCurrentProgress({...currentProgress, notes: e.target.value})} />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleSaveProgress} disabled={!currentProgress.imageUrl}>Save Progress</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

    </div>
  );
}
