'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';

type JournalEntry = {
  id: number;
  title: string;
  content: string;
  date: string;
};

type Inputs = {
  title: string;
  content: string;
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const newEntry: JournalEntry = {
      id: Date.now(),
      ...data,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
    setEntries([newEntry, ...entries]);
    reset();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
            <CardDescription>Record your thoughts and analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Post-Market Analysis"
                  {...register('title', { required: 'Title is required.' })}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind? How was your trading day?"
                  className="min-h-[150px]"
                  {...register('content', { required: 'Content is required.' })}
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
              </div>
              <Button type="submit">
                <PlusCircle className="mr-2" />
                Add Entry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Journal</CardTitle>
            <CardDescription>Review your past entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length > 0 ? (
              <div className="space-y-6">
                {entries.map((entry, index) => (
                  <div key={entry.id}>
                    <Card className="bg-muted/30">
                      <CardHeader>
                        <CardTitle className='text-lg'>{entry.title}</CardTitle>
                        <CardDescription>{entry.date}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <p>No journal entries yet.</p>
                <p className="text-sm">Use the form to add your first entry.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
