
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, User } from 'lucide-react';
import { getTradeIdeas } from './actions';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { JournalEntry } from '@/app/(app)/journal/page';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function TradeIdeasPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const entriesRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'journalEntries') : null
  , [user, firestore]);
  
  const { data: journalEntries = [] } = useCollection<Omit<JournalEntry, 'id'>>(entriesRef);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Convert journal entries to CSV
    const headers = 'Date,CurrencyPair,Direction,P&L,Result,Emotion,Notes';
    const csvRows = journalEntries.map(e => {
        const date = e.date ? new Date(e.date).toLocaleDateString() : 'N/A';
        const pnl = e.pnl ?? 'N/A';
        const emotion = e.emotion ?? 'N/A';
        const notes = `"${(e.notes || '').replace(/"/g, '""')}"`; // Handle quotes in notes
        return [date, e.currencyPair, e.direction, pnl, e.result, emotion, notes].join(',');
    });
    const historyCsv = [headers, ...csvRows].join('\\n');

    const result = await getTradeIdeas({
      question: input,
      history: historyCsv,
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
                No conversation started yet.
             </div>
           )}
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Ask a question about your trades..."
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
