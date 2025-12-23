
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
import { PlusCircle, Edit, Trash2, X, CalendarDays, ArrowLeft, ArrowRight } from 'lucide-react';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


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
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);


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
      planData.createdAt = Timestamp.fromDate(new Date());
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
  const handleSaveProgress = () => {
    if (!currentProgress.imageUrl || !activePlanId || !user) return;
    
    const plan = plans.find(p => p.id === activePlanId);
    if (!plan) return;

    const newEntry: ProgressEntry = {
      id: String(Date.now()),
      date: Timestamp.fromDate(new Date()),
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

  const sortedPlans = [...(plans || [])].sort((a,b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

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
        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={sortedPlans[0]?.id}>
          {sortedPlans.map((plan) => {
            const totalItems = plan.items?.length || 0;
            const completedItems = plan.items?.filter(item => item.isChecked).length || 0;
            const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            const itemsLeft = totalItems - completedItems;
            const isCompleted = progress === 100;
            
            return (
              <Card key={plan.id} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 overflow-hidden">
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
                    <div className="border rounded-lg p-2 space-y-2 mt-2">
                        <div className="flex items-center gap-3 px-1">
                            <Badge variant={isCompleted ? "positive" : "destructive"} className={cn("text-white", isCompleted ? "bg-green-500 hover:bg-green-500" : "bg-pink-500 hover:bg-pink-500")}>
                                {Math.round(progress)}%
                            </Badge>
                            {isCompleted ? (
                                <span className="text-sm font-medium text-green-600">Congratulations!</span>
                            ) : (
                                <span className="text-sm font-medium text-pink-600">Update in progress..</span>
                            )}
                            <span className="ml-auto text-sm text-muted-foreground">{itemsLeft} left</span>
                        </div>
                        <Progress value={progress} className={cn("h-2", isCompleted ? "[&>div]:bg-green-500" : "[&>div]:bg-pink-500")} />
                    </div>
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

                          {(plan.progressEntries || []).length === 0 ? (
                              <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center py-8 border rounded-lg bg-muted/30">
                                No progress entries yet.
                              </div>
                          ) : (
                            <Carousel
                                opts={{
                                align: "start",
                                }}
                                className="w-full"
                            >
                                <CarouselContent>
                                {(plan.progressEntries || []).map((entry) => (
                                    <CarouselItem key={entry.id} className="md:basis-1/2 lg:basis-1/3">
                                      <div className="p-1">
                                        <Card
                                            className="overflow-hidden group cursor-pointer"
                                            onClick={() => setPreviewImageUrl(entry.imageUrl)}
                                        >
                                            <CardContent className="p-0 aspect-square relative">
                                                <img src={entry.imageUrl} alt="Progress" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                                <div className="absolute bottom-0 left-0 p-4 text-white">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <CalendarDays className="size-3" />
                                                        <span>{entry.date?.toDate().toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm font-semibold mt-1 line-clamp-2">{entry.notes}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                      </div>
                                    </CarouselItem>
                                ))}
                                </CarouselContent>
                                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                            </Carousel>
                          )}
                      </div>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            )
          })}
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
                    <Label htmlFor="progress-image-url">Image URL</Label>
                    <Input 
                        id="progress-image-url"
                        value={currentProgress.imageUrl || ''} 
                        onChange={e => setCurrentProgress({...currentProgress, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.png"
                    />
                </div>
                {currentProgress.imageUrl && (
                    <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentProgress.imageUrl} alt="upload preview" className="w-full h-48 object-cover rounded-md"/>
                    </div>
                )}
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

      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in-0 duration-300" onClick={() => setPreviewImageUrl(null)}>
            <Card className="w-[90vw] max-w-4xl h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-2 relative w-full h-full">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-background/50 hover:bg-background/80 z-10"
                        onClick={() => setPreviewImageUrl(null)}
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close preview</span>
                    </Button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImageUrl} alt="Progress preview" className="rounded-md object-contain w-full h-full" />
                </CardContent>
            </Card>
        </div>
      )}

    </div>
  );
}
