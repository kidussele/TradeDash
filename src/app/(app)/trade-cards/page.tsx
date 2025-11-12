
'use client';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { JournalEntry } from '@/app/(app)/journal/page';
import { TradeResultCard } from '@/components/trade-result-card';

export default function TradeCardsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const entriesRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'journalEntries') : null,
    [user, firestore]
  );

  const entriesQuery = useMemoFirebase(() =>
    entriesRef ? query(entriesRef, orderBy('date', 'asc')) : null,
    [entriesRef]
  );
  
  const { data: journalEntries = [], isLoading } = useCollection<Omit<JournalEntry, 'id'>>(entriesQuery);
  
  if (isLoading) {
    return <div>Loading trade cards...</div>;
  }

  if (!journalEntries || journalEntries.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No journal entries found to create cards.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {journalEntries.map((entry, index) => (
          <TradeResultCard 
            key={entry.id}
            entry={entry as JournalEntry} 
            allEntries={journalEntries as JournalEntry[]}
            tradeIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
