'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function JournalPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Journal</CardTitle>
          <CardDescription>
            Document your trades, thoughts, and analysis here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>Journaling features are coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
