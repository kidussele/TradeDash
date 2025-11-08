
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
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';


export type Note = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  createdAt: any; // Firestore Timestamp
};

export default function SelfDevelopmentPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notesRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'selfDevelopmentNotes') : null
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
      imageUrl: noteData.imageUrl,
      linkUrl: noteData.linkUrl,
    };
    
    if (editId) {
      const docRef = doc(firestore, 'users', user.uid, 'selfDevelopmentNotes', editId);
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
    const docRef = doc(firestore, 'users', user.uid, 'selfDevelopmentNotes', id);
    deleteDocumentNonBlocking(docRef);
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sortedNotes = [...(notes || [])].sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Self Development</h1>
              <p className="text-muted-foreground">A space for personal growth and reflection.</p>
            </div>
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
                        <DialogTitle>{editId ? 'Edit' : 'Add'} Note</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={currentNote.title || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                                placeholder="e.g., Weekly Reflection"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={currentNote.content || ''}
                                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                                placeholder="Write your thoughts, goals, and observations..."
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
         <div className="text-center py-24 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">No notes yet</h2>
            <p className="text-muted-foreground mt-2">Click "Add Note" to start your self-development journal.</p>
         </div>
       ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedNotes.map((note) => (
            <Card key={note.id} className="flex flex-col">
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
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
                 {note.imageUrl && (
                     <div className="mt-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={note.imageUrl} alt="Note attachment" className="rounded-md object-cover aspect-video" />
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
          ))}
        </div>
       )}
    </div>
  );
}
