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
import { PlusCircle, Edit, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export type Note = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  createdAt: Date;
};

export default function NotebookPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedNotes = localStorage.getItem('notebookEntries');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
      })));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('notebookEntries', JSON.stringify(notes));
    }
  }, [notes, isClient]);

  const handleSave = () => {
    const finalNote: Note = {
      id: editIndex !== null ? notes[editIndex].id : Date.now(),
      title: currentNote.title || 'Untitled Note',
      content: currentNote.content || '',
      imageUrl: currentNote.imageUrl,
      linkUrl: currentNote.linkUrl,
      createdAt: editIndex !== null ? notes[editIndex].createdAt : new Date(),
    };

    if (editIndex !== null) {
      const updatedNotes = [...notes];
      updatedNotes[editIndex] = finalNote;
      setNotes(updatedNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } else {
      setNotes([finalNote, ...notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }
    setIsEditDialogOpen(false);
    setEditIndex(null);
    setCurrentNote({});
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentNote(notes[index]);
    setIsEditDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditIndex(null);
    setCurrentNote({});
    setIsEditDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };
  
  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Notebook</h1>
                <p className="text-muted-foreground">Your personal space for market analysis and trading ideas.</p>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Note
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editIndex !== null ? 'Edit' : 'Add'} Note</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={currentNote.title || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                                placeholder="e.g., EUR/USD Breakout Analysis"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={currentNote.content || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                                placeholder="Write your analysis, thoughts, and observations..."
                                className="min-h-[150px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={currentNote.imageUrl || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, imageUrl: e.target.value })}
                                placeholder="https://example.com/chart.png"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkUrl">Link URL</Label>
                            <Input
                                id="linkUrl"
                                value={currentNote.linkUrl || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, linkUrl: e.target.value })}
                                placeholder="https://example.com/news-article"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSave}>Save Note</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
       </div>
       
       {notes.length === 0 ? (
         <div className="text-center py-24 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">No notes yet</h2>
            <p className="text-muted-foreground mt-2">Click "Add Note" to start your journal.</p>
         </div>
       ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note, index) => (
            <Card key={note.id} className="flex flex-col">
              {note.imageUrl && (
                <div className="relative w-full h-40">
                  <Image
                    src={note.imageUrl}
                    alt={note.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>
                  {note.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    {note.linkUrl && (
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={note.linkUrl} target="_blank">
                                <LinkIcon className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                    {note.imageUrl && (
                        <Button variant="ghost" size="icon" asChild>
                             <Link href={note.imageUrl} target="_blank">
                                <ImageIcon className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                 </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
       )}
    </div>
  );
}
