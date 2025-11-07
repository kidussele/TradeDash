'use client';

import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const pathToTitle: { [key: string]: string } = {
  '/': 'Dashboard',
  '/insights': 'AI Insights',
};

export function Header() {
  const pathname = usePathname();
  const title = pathToTitle[pathname] || 'Page';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FileUp className="mr-2 h-4 w-4" />
              Import Trades
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Trades</DialogTitle>
              <DialogDescription>
                Connect your broker or upload a file to import your trades. This feature is coming soon.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center text-sm text-muted-foreground">
              [Import options will be available here]
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
