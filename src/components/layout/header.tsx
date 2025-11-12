
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Clock } from './clock';

const pathToTitle: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/journal': 'Journal',
  '/backtest-journal': 'Backtest Journal',
  '/report': 'Reports',
  '/news': 'News',
  '/notebook': 'Market Analysis',
  '/strategy-checklist': 'Strategy Checklist',
  '/self-development': 'Self Development',
  '/image-preview': 'Image Preview',
  '/goals': 'Goals',
  '/settings': 'Settings',
  '/heatmap': 'Forex Heatmap',
  '/trade-cards': 'Trade Cards',
};

export function Header() {
  const pathname = usePathname();
  // We need to remove the /app prefix from the pathname
  const cleanPathname = pathname.replace(/^\/app/, '') || '/';
  const title = pathToTitle[cleanPathname] || 'Page';
  
  if (pathname === '/image-preview') {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="h-5 w-5 md:hidden" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Clock />
      </div>
    </header>
  );
}
