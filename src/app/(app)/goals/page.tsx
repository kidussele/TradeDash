
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, ExternalLink, Image as ImageIcon, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';


export type Goal = {
  id: string;
  period: 'Monthly' | 'Quarterly' | 'Half Year' | 'Yearly' | 'Big Goal';
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  imageHint?: string;
  status: 'In Progress' | 'Completed';
};

const initialGoals: Omit<Goal, 'id'>[] = [
  {
    period: 'Monthly',
    title: 'Achieve 4% Account Growth',
    description: 'Consistently apply my strategy and aim for a 4% profit target for the month, focusing on high-probability setups and disciplined risk management.',
    imageUrl: 'https://picsum.photos/seed/goal1/600/400',
    linkUrl: 'https://www.google.com/search?q=how+to+grow+trading+account',
    imageHint: 'financial growth',
    status: 'In Progress',
  },
  {
    period: 'Quarterly',
    title: 'Master a New Trading Setup',
    description: 'Dedicate this quarter to backtesting and mastering one new trading setup, like the ICT Silver Bullet, until it becomes second nature.',
    imageUrl: 'https://picsum.photos/seed/goal2/600/400',
    linkUrl: 'https://www.google.com/search?q=learn+new+trading+strategy',
    imageHint: 'learning strategy',
    status: 'In Progress',
  },
  {
    period: 'Half Year',
    title: 'Build a $10,000 Trading Account',
    description: 'Through consistent profits and periodic deposits, I will build my trading account to the $10,000 milestone within the next six months.',
    imageUrl: 'https://picsum.photos/seed/goal3/600/400',
    linkUrl: 'https://www.google.com/search?q=how+to+build+trading+capital',
    imageHint: 'money milestone',
    status: 'In Progress',
  },
  {
    period: 'Yearly',
    title: 'Become a Full-Time Trader',
    description: 'Develop the skills, discipline, and capital base required to transition into full-time trading by the end of the year.',
    imageUrl: 'https://picsum.photos/seed/goal4/600/400',
    linkUrl: 'https://www.google.com/search?q=how+to+become+a+full-time+trader',
    imageHint: 'professional desk',
    status: 'In Progress',
  },
  {
    period: 'Big Goal',
    title: 'Achieve Financial Freedom',
    description: 'My ultimate goal is to achieve complete financial freedom through trading, enabling me to live life on my own terms.',
    imageUrl: 'https://picsum.photos/seed/goal5/600/400',
    linkUrl: 'https://www.google.com/search?q=achieve+financial+freedom',
    imageHint: 'financial freedom',
    status: 'In Progress',
  },
];

export default function GoalsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const goalsRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'goals') : null
  , [user, firestore]);

  const { data: goals = [], isLoading } = useCollection<Omit<Goal, 'id'>>(goalsRef);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Partial<Goal>>({});
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isLoading && goals?.length === 0 && goalsRef) {
      const batch = writeBatch(firestore);
      initialGoals.forEach(goal => {
        const docRef = doc(goalsRef);
        batch.set(docRef, goal);
      });
      batch.commit().catch(console.error);
    }
  }, [user, isLoading, goals, goalsRef, firestore]);
  

  const handleEdit = (goal: Goal) => {
    setEditId(goal.id);
    setCurrentGoal(goal);
    setIsEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setCurrentGoal({ period: 'Monthly', title: '', description: '', imageUrl: '', status: 'In Progress' });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!user || !goalsRef) return;
    
    const { id, ...goalData } = currentGoal;

    const finalGoal = {
        ...goalData,
        status: goalData.status || 'In Progress',
    };

    if (editId) {
        const docRef = doc(firestore, 'users', user.uid, 'goals', editId);
        setDocumentNonBlocking(docRef, finalGoal, { merge: true });
    } else {
        addDocumentNonBlocking(goalsRef, finalGoal);
    }

    setIsEditDialogOpen(false);
    setCurrentGoal({});
    setEditId(null);
  };

  const handleDelete = (goalId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'goals', goalId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const handleStatusChange = (goal: Goal, isChecked: boolean) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'goals', goal.id);
    setDocumentNonBlocking(docRef, { status: isChecked ? 'Completed' : 'In Progress' }, { merge: true });
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  const sortedGoals = [...(goals || [])].sort((a, b) => {
    const order = ['Monthly', 'Quarterly', 'Half Year', 'Yearly', 'Big Goal'];
    return order.indexOf(a.period) - order.indexOf(b.period);
  });

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center animate-in fade-in-0 duration-500">
        <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Set and track what you want to achieve.</p>
        </div>
        <Button onClick={handleAddNew} className="animate-in fade-in-0 zoom-in-95 duration-500">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Goal
        </Button>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) {
            setCurrentGoal({});
            setEditId(null);
          }
        }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit' : 'Add'} Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select
                    value={currentGoal.period}
                    onValueChange={(value: Goal['period']) => setCurrentGoal({ ...currentGoal, period: value })}
                >
                    <SelectTrigger id="period">
                        <SelectValue placeholder="Select a period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Half Year">Half Year</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                        <SelectItem value="Big Goal">Big Goal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={currentGoal.title || ''}
                onChange={(e) => setCurrentGoal({ ...currentGoal, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentGoal.description || ''}
                onChange={(e) => setCurrentGoal({ ...currentGoal, description: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={currentGoal.imageUrl || ''}
                onChange={(e) => setCurrentGoal({ ...currentGoal, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">Link URL</Label>
              <Input
                id="link-url"
                value={currentGoal.linkUrl || ''}
                onChange={(e) => setCurrentGoal({ ...currentGoal, linkUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedGoals.filter(g => g.period !== 'Big Goal').map((goal, index) => (
              <div key={goal.id} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <GoalCard goal={goal} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange}/>
              </div>
          ))}
      </div>
      
       <div className="pt-6">
         {sortedGoals.filter(g => g.period === 'Big Goal').map((goal) => (
              <div key={goal.id} className="animate-in fade-in-0 zoom-in-95 duration-500">
                <GoalCard goal={goal} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} isBigGoal />
              </div>
          ))}
       </div>
    </div>
  );
}

type GoalCardProps = {
    goal: Goal;
    onEdit: (goal: Goal) => void;
    onDelete: (goalId: string) => void;
    onStatusChange: (goal: Goal, isChecked: boolean) => void;
    isBigGoal?: boolean;
}

function GoalCard({ goal, onEdit, onDelete, onStatusChange, isBigGoal = false }: GoalCardProps) {
    const isCompleted = goal.status === 'Completed';

    if (isBigGoal) {
        return (
            <Card className={cn("overflow-hidden transition-all", isCompleted && "bg-positive/5 border-positive")}>
                <div className="grid md:grid-cols-2">
                    <div className="p-6 flex flex-col">
                         <CardHeader className="p-0">
                             <div className="flex justify-between items-start">
                                <div>
                                    <CardDescription>{goal.period}</CardDescription>
                                    <CardTitle className="text-3xl">{goal.title}</CardTitle>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`check-${goal.id}`} 
                                        checked={isCompleted}
                                        onCheckedChange={(checked) => onStatusChange(goal, Boolean(checked))}
                                    />
                                     <label htmlFor={`check-${goal.id}`} className="text-sm font-medium">Completed</label>
                                </div>
                             </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow pt-4">
                            <p className="text-muted-foreground">{goal.description}</p>
                        </CardContent>
                        <CardFooter className="p-0 pt-6 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => onEdit(goal)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this goal.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(goal.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            {goal.linkUrl && (
                                <Button variant="link" asChild>
                                    <Link href={goal.linkUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2" />
                                        Learn More
                                    </Link>
                                </Button>
                            )}
                        </CardFooter>
                    </div>
                     <Link href={`/image-preview?imageUrl=${encodeURIComponent(goal.imageUrl)}`} target="_blank" className="relative group min-h-[250px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={goal.imageUrl} alt={goal.title} data-ai-hint={goal.imageHint} className="absolute inset-0 w-full h-full object-cover"/>
                        <div className={cn("absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center", isCompleted && "bg-positive/20")}>
                             {isCompleted ? <CheckCircle2 className="size-16 text-white/80" /> : <ImageIcon className="size-12 text-white/50 group-hover:text-white/80 transition-colors" />}
                        </div>
                    </Link>
                </div>
            </Card>
        )
    }

    return (
        <Card className={cn("flex flex-col overflow-hidden transition-all", isCompleted && "bg-positive/5 border-positive")}>
            <Link href={`/image-preview?imageUrl=${encodeURIComponent(goal.imageUrl)}`} target="_blank" className="relative group aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={goal.imageUrl} alt={goal.title} data-ai-hint={goal.imageHint} className="absolute inset-0 w-full h-full object-cover"/>
                 <div className={cn("absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center", isCompleted && "bg-positive/20")}>
                    {isCompleted ? <CheckCircle2 className="size-12 text-white/80" /> : <ImageIcon className="size-8 text-white/50 group-hover:text-white/80 transition-colors" />}
                </div>
            </Link>
            <div className="flex flex-col flex-grow p-6">
                <CardHeader className="p-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardDescription>{goal.period}</CardDescription>
                            <CardTitle>{goal.title}</CardTitle>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox 
                                id={`check-${goal.id}`} 
                                checked={isCompleted}
                                onCheckedChange={(checked) => onStatusChange(goal, Boolean(checked))}
                            />
                            <label htmlFor={`check-${goal.id}`} className="text-sm font-medium">Done</label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow pt-4">
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                </CardContent>
                <CardFooter className="p-0 pt-6 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this goal.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(goal.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    {goal.linkUrl && (
                        <Button variant="link" asChild>
                            <Link href={goal.linkUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2" />
                                More
                            </Link>
                        </Button>
                    )}
                </CardFooter>
            </div>
        </Card>
    )
}
