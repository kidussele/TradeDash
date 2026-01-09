'use client';

import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  BookUser,
  BookCopy,
  Goal,
  Check,
  ClipboardCheck,
  BarChart,
  Newspaper,
  NotebookText,
  HeartPulse,
  Settings,
  Flame,
  AreaChart,
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { NavLink } from '@/components/ui/nav-link';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/layout/user-profile';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

export function AppSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const primaryNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Journal', href: '/journal', icon: BookUser },
    { name: 'Backtest Journal', href: '/backtest-journal', icon: BookCopy },
    { name: 'Trading Plans', href: '/plan', icon: Goal },
    { name: 'Strategy Playbook', href: '/strategy-checklist', icon: ClipboardCheck },
    { name: 'Goals', href: '/goals', icon: Check },
  ];

  const secondaryNav = [
    { name: 'Analysis Notebook', href: '/notebook', icon: NotebookText },
    { name: 'Market Heatmap', href: '/heatmap', icon: Flame },
    { name: 'Economic Calendar', href: '/news', icon: Newspaper },
    { name: 'Self Development', href: '/self-development', icon: HeartPulse },
    { name: 'Resources', href: '/resource', icon: BarChart },
    { name: 'Reports', href: '/report', icon: AreaChart },
  ];

  const settingsNav = [{ name: 'Settings', href: '/settings', icon: Settings }];

  const renderNavLinks = (navItems: typeof primaryNav) => (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          href={item.href}
          className={cn(pathname.startsWith(item.href) && 'bg-muted')}
        >
          <item.icon className="h-5 w-5" />
          <span className="sr-only">{item.name}</span>
        </NavLink>
      ))}
    </>
  );

  const renderNavLinksWithLabels = (navItems: typeof primaryNav) => (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          href={item.href}
          className={cn(
            'justify-start gap-3',
            pathname.startsWith(item.href) && 'bg-muted'
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </NavLink>
      ))}
    </>
  );

  return (
    <div
      className={cn(
        'hidden md:flex flex-col h-screen p-2 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div
        className={cn(
          'flex items-center',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!isCollapsed && (
          <div className="p-2">
            <Logo />
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <nav className="flex-grow flex flex-col gap-y-1 mt-4 overflow-y-auto overflow-x-hidden">
        {isCollapsed ? (
          <>
            <div className="flex flex-col gap-y-1">{renderNavLinks(primaryNav)}</div>
            <hr className="my-2" />
            <div className="flex flex-col gap-y-1">{renderNavLinks(secondaryNav)}</div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-y-1">{renderNavLinksWithLabels(primaryNav)}</div>
            <hr className="my-2" />
            <p className="px-3 text-xs font-medium uppercase text-muted-foreground tracking-wider">
              Tools
            </p>
            <div className="flex flex-col gap-y-1">{renderNavLinksWithLabels(secondaryNav)}</div>
          </>
        )}
      </nav>

      <div className="mt-auto">
        <nav className="flex flex-col gap-y-1">
          {isCollapsed ? renderNavLinks(settingsNav) : renderNavLinksWithLabels(settingsNav)}
        </nav>
        <hr className="my-2" />
        <div className={cn(isCollapsed && 'flex justify-center')}>
          <UserProfile isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
}
