
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';


export type Goal = {
  id: string;
  period: 'Monthly' | 'Quarterly' | 'Half Year' | 'Yearly' | 'Big Goal';
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  imageHint?: string;
};

const initialGoals: Omit<Goal, 'id'>[] = [
  {
    period: 'Monthly',
    title: 'Achieve 4% Account Growth',
    description: 'Consistently apply my strategy and aim for a 4% profit target for the month, focusing on high-probability setups and disciplined risk management.',
    imageUrl: 'https://picsum.photos/seed/goal1/600/400',
    linkUrl: 'https://www.google.com/search?q=how+to+grow+trading+account',
    imageHint: 'financial growth',
  },
  {
    period: 'Quarterly',
    title: 'Master a New Trading Setup',
    description: 'Dedicate this quarter to backtesting and mastering one new trading setup, like the ICT Silver Bullet, until it becomes second nature.',
    imageUrl: 'https://picsum.photos/seed/goal2/600/400',
    linkUrl: 'https://www.google.com/search?q=learn+new+trading+strategy',
    imageHint: 'learning strategy',
  },
  {
    period: 'Half Year',
    title: 'Build a $10,000 Trading Account',
    description: 'Through consistent profits and periodic deposits, I will build my trading account to the $10,000 milestone within the next six months.',
    imageUrl: 'https://picsum.photos/seed/goal3/600/400',
    linkUrl: 'https://www.google.com/search?q=how+to+build+trading+capital',
    imageHint: 'money milestone',
  },
  {
    period: 'Yearly',
    title: 'Become a Full-Time Trader',
    description: 'Develop the skills, discipline, and capital base required to transition into full-time trading by the end of the year.',
    imageUrl: 'https://picsum.photos/seed/goal4/600/400',
    linkUrl: 'https://www.google.com/search?q=how+to+become+a+full-time+trader',
    imageHint: 'professional desk',
  },
  {
    period: 'Big Goal',
    title: 'Achieve Financial Freedom',
    description: 'My ultimate goal is to achieve complete financial freedom through trading, enabling me to live life on my own terms.',
    imageUrl: 'https://picsum.photos/seed/goal5/600/400',
    linkUrl: 'https://www.google.com/search?q=achieve+financial+freedom',
    imageHint: 'financial freedom',
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

  useEffect(() => {
    if (user && !isLoading && goals.length === 0 && goalsRef) {
      const batch = writeBatch(firestore);
      initialGoals.forEach(goal => {
        const docRef = doc(goalsRef);
        batch.set(docRef, goal);
      });
      batch.commit().catch(console.error);
    }
  }, [user, isLoading, goals, goalsRef, firestore]);
  

  const handleEdit = (goal: Goal) => {
    setCurrentGoal(goal);
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!user || !currentGoal.id) return;
    
    const { id, ...goalData } = currentGoal;
    const docRef = doc(firestore, 'users', user.uid, 'goals', id);
    setDocumentNonBlocking(docRef, goalData, { merge: true });

    setIsEditDialogOpen(false);
    setCurrentGoal({});
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  const sortedGoals = [...goals].sort((a, b) => {
    const order = ['Monthly', 'Quarterly', 'Half Year', 'Yearly', 'Big Goal'];
    return order.indexOf(a.period) - order.indexOf(b.period);
  });

  return (
    <div className="space-y-6">
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) setCurrentGoal({});
        }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit {currentGoal.period} Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          {sortedGoals.filter(g => g.period !== 'Big Goal').map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
          ))}
      </div>
      
       <div className="pt-6">
         {sortedGoals.filter(g => g.period === 'Big Goal').map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} isBigGoal />
          ))}
       </div>
    </div>
  );
}

type GoalCardProps = {
    goal: Goal;
    onEdit: (goal: Goal) => void;
    isBigGoal?: boolean;
}

function GoalCard({ goal, onEdit, isBigGoal = false }: GoalCardProps) {
    if (isBigGoal) {
        return (
            <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2">
                    <div className="p-6 flex flex-col">
                         <CardHeader className="p-0">
                            <CardDescription>{goal.period}</CardDescription>
                            <CardTitle className="text-3xl">{goal.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow pt-4">
                            <p className="text-muted-foreground">{goal.description}</p>
                        </CardContent>
                        <CardFooter className="p-0 pt-6 flex justify-between items-center">
                             <Button variant="outline" onClick={() => onEdit(goal)}>
                                <Edit className="mr-2" />
                                Edit Goal
                            </Button>
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
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                             <ImageIcon className="size-12 text-white/50 group-hover:text-white/80 transition-colors" />
                        </div>
                    </Link>
                </div>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col overflow-hidden">
            <Link href={`/image-preview?imageUrl=${encodeURIComponent(goal.imageUrl)}`} target="_blank" className="relative group aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={goal.imageUrl} alt={goal.title} data-ai-hint={goal.imageHint} className="absolute inset-0 w-full h-full object-cover"/>
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ImageIcon className="size-8 text-white/50 group-hover:text-white/80 transition-colors" />
                </div>
            </Link>
            <div className="flex flex-col flex-grow p-6">
                <CardHeader className="p-0">
                    <CardDescription>{goal.period}</CardDescription>
                    <CardTitle>{goal.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow pt-4">
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                </CardContent>
                <CardFooter className="p-0 pt-6 flex justify-between items-center">
                    <Button variant="ghost" onClick={() => onEdit(goal)}>
                        <Edit className="mr-2" />
                        Edit
                    </Button>
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

    