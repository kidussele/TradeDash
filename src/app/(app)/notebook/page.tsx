
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
import { PlusCircle, Edit, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

export type Note = {
  id: string;
  title: string;
  content: string;
  currencyPair?: string;
  imageUrl?: string;
  linkUrl?: string;
  createdAt: any; // Firestore Timestamp
};

export default function NotebookPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notesRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'notebookNotes') : null
  , [user, firestore]);
  
  const { data: notes = [], isLoading } = useCollection<Omit<Note, 'id'>>(notesRef);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});
  const [editId, setEditId] = useState<string | null>(null);

  const handleSave = () => {
    if (!user || !notesRef) return;

    const { id, createdAt, ...noteData } = currentNote;

    const finalNote: Omit<Note, 'id' | 'createdAt'> & { createdAt?: any } = {
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      currencyPair: noteData.currencyPair,
      imageUrl: noteData.imageUrl,
      linkUrl: noteData.linkUrl,
    };

    if (editId) {
      const docRef = doc(firestore, 'users', user.uid, 'notebookNotes', editId);
      setDocumentNonBlocking(docRef, finalNote, { merge: true });
    } else {
      finalNote.createdAt = serverTimestamp();
      addDocumentNonBlocking(notesRef, finalNote);
    }

    setIsEditDialogOpen(false);
    setEditId(null);
    setCurrentNote({});
  };

  const handleEdit = (note: Note) => {
    setEditId(note.id);
    setCurrentNote(note);
    setIsEditDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditId(null);
    setCurrentNote({});
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'notebookNotes', id);
    deleteDocumentNonBlocking(docRef);
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sortedNotes = [...(notes || [])].sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));


  return (
    <div className="space-y-6">
       <div className="flex justify-end items-center animate-in fade-in-0 duration-500">
            <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
              setIsEditDialogOpen(isOpen);
              if (!isOpen) {
                setEditId(null);
                setCurrentNote({});
              }
            }}>
                <DialogTrigger asChild>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Note
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editId ? 'Edit' : 'Add'} Analysis Note</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={currentNote.title || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                                placeholder="e.g., EUR/USD Long Setup"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency-pair">Currency Pair</Label>
                            <Input
                                id="currency-pair"
                                value={currentNote.currencyPair || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, currencyPair: e.target.value })}
                                placeholder="e.g., EUR/USD"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={currentNote.content || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                                placeholder="Write your analysis, thoughts, and observations..."
                                className="min-h-[200px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                                id="image-url"
                                value={currentNote.imageUrl || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, imageUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link-url">Link URL</Label>
                            <Input
                                id="link-url"
                                value={currentNote.linkUrl || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, linkUrl: e.target.value })}
                                placeholder="https://..."
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
       
       {(!notes || notes.length === 0) && !isLoading ? (
         <div className="text-center py-24 border-2 border-dashed rounded-lg animate-in fade-in-0 zoom-in-95 duration-500">
            <h2 className="text-xl font-semibold text-muted-foreground">No notes yet</h2>
            <p className="text-muted-foreground mt-2">Click "Add Note" to start your analysis notebook.</p>
         </div>
       ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedNotes.map((note, index) => (
            <div key={note.id} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{note.title}</CardTitle>
                        <CardDescription>
                          {note.createdAt?.toDate().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) || 'No date'}
                        </CardDescription>
                    </div>
                    {note.currencyPair && <div className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">{note.currencyPair}</div>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
                {note.imageUrl && (
                     <div className="mt-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={note.imageUrl} alt="Analysis chart" className="rounded-md object-cover aspect-video" />
                     </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                 <div>
                    {note.linkUrl && (
                        <Button variant="link" asChild className="p-0 h-auto">
                            <Link href={note.linkUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Resource
                            </Link>
                        </Button>
                    )}
                 </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            </div>
          ))}
        </div>
       )}
    </div>
  );
}
