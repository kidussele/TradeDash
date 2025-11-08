'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, User } from 'lucide-react';
import { getTradeIdeas } from './actions';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { JournalEntry } from '@/app/(app)/journal/page';
import type { BacktestJournalEntry } from '@/app/(app)/backtest-journal/page';
import type { Goal } from '@/app/(app)/goals/page';
import type { Note as NotebookNote } from '@/app/(app)/notebook/page';
import type { Note as SelfDevNote } from '@/app/(app)/self-development/page';
import type { Checklist } from '@/app/(app)/strategy-checklist/page';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function TradeIdeasPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Fetch all relevant data collections
  const liveJournalRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'journalEntries') : null, [user, firestore]);
  const backtestJournalRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'backtestJournalEntries') : null, [user, firestore]);
  const goalsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'goals') : null, [user, firestore]);
  const marketNotesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'notebookNotes') : null, [user, firestore]);
  const selfDevNotesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'selfDevelopmentNotes') : null, [user, firestore]);
  const checklistsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'strategyChecklists') : null, [user, firestore]);

  const { data: liveJournalEntries = [] } = useCollection<Omit<JournalEntry, 'id'>>(liveJournalRef);
  const { data: backtestJournalEntries = [] } = useCollection<Omit<BacktestJournalEntry, 'id'>>(backtestJournalRef);
  const { data: goals = [] } = useCollection<Omit<Goal, 'id'>>(goalsRef);
  const { data: marketNotes = [] } = useCollection<Omit<NotebookNote, 'id'>>(marketNotesRef);
  const { data: selfDevNotes = [] } = useCollection<Omit<SelfDevNote, 'id'>>(selfDevNotesRef);
  const { data: checklists = [] } = useCollection<Omit<Checklist, 'id'>>(checklistsRef);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    // Basic check to see if we have some data loaded.
    if (liveJournalEntries && backtestJournalEntries && goals && marketNotes && selfDevNotes && checklists) {
        setIsDataReady(true);
    }
  }, [liveJournalEntries, backtestJournalEntries, goals, marketNotes, selfDevNotes, checklists]);

  const handleSendMessage = async () => {
    if (!input.trim() || !isDataReady) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const allData = {
        liveJournalEntries,
        backtestJournalEntries,
        goals,
        marketNotes,
        selfDevNotes,
        strategyChecklists: checklists,
    };

    // Sanitize data for the AI
    const dataString = JSON.stringify(allData, (key, value) => {
        if (key === 'createdAt' && value && typeof value.toDate === 'function') {
            return value.toDate().toISOString();
        }
        return value;
    }, 2);


    const result = await getTradeIdeas({
      question: input,
      allData: dataString,
    });
    
    if ('error' in result) {
      const assistantMessage: Message = { role: 'assistant', content: `Error: ${result.error}` };
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setMessages(prev => [...prev, assistantMessage]);
    }

    setIsLoading(false);
  };
  
  const displayName = user?.displayName || user?.email || 'User';
  const displayFallback = displayName[0]?.toUpperCase() ?? 'U';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>AI Trade Assistant</CardTitle>
          <CardDescription>
            Ask questions about your trading data. For example: "Did I take any trades yesterday?"
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto space-y-4 pr-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                 <Avatar className="size-7 bg-primary text-primary-foreground">
                    <AvatarFallback><Lightbulb size={16} /></AvatarFallback>
                 </Avatar>
              )}
              <div className={`rounded-lg px-4 py-2 max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
               {message.role === 'user' && (
                 <Avatar className="size-7">
                    <AvatarFallback>{displayFallback}</AvatarFallback>
                 </Avatar>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3">
                 <Avatar className="size-7 bg-primary text-primary-foreground">
                    <AvatarFallback><Lightbulb size={16} /></AvatarFallback>
                 </Avatar>
                <div className="rounded-lg px-4 py-2 max-w-lg bg-muted">
                    <p className="text-sm animate-pulse">Thinking...</p>
                </div>
            </div>
           )}
           {messages.length === 0 && !isLoading && (
             <div className="text-center text-muted-foreground pt-16">
                {!isDataReady ? 'Loading your data...' : 'No conversation started yet.'}
             </div>
           )}
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder={!isDataReady ? "Please wait, loading data..." : "Ask a question about your data..."}
              disabled={isLoading || !isDataReady}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim() || !isDataReady}>
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
