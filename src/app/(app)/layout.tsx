
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {SidebarProvider} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/layout/app-sidebar';
import {SidebarInset} from '@/components/ui/sidebar';
import {Header} from '@/components/layout/header';
import {Toaster} from '@/components/ui/toaster';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatWidget } from '@/components/chat/chat-widget';
import { PresenceIndicator } from '@/components/presence-indicator';
import { PageLoader } from '@/components/layout/page-loader';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/auth') {
      router.push('/auth');
    }
    // Redirect from the root of the app layout to the dashboard
    if (pathname === '/') {
        router.replace('/dashboard');
    }
  }, [user, isUserLoading, router, pathname]);

  useEffect(() => {
    // Don't show loader for the initial dashboard load as it has its own skeleton
    if (pathname === '/dashboard' && isPageLoading === false) {
        return;
    }
    
    setIsPageLoading(true);
    const timer = setTimeout(() => {
        setIsPageLoading(false);
    }, 1500); // Show loader for 1.5 seconds

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (isUserLoading) {
    return (
       <div className="flex min-h-screen">
        <div className="hidden md:block">
            <div className="h-screen w-[16rem] p-2">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
        <div className="flex-1 p-4 lg:p-6 space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-[calc(100vh-10rem)] w-full" />
        </div>
      </div>
    );
  }

  if (!user || pathname === '/') {
    return null;
  }

  return (
    <SidebarProvider>
      {isPageLoading && <PageLoader />}
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 lg:p-6 flex-grow">{children}</main>
        <Toaster />
        <div className="fixed bottom-0 right-0 z-40">
          <ChatWidget />
        </div>
        <PresenceIndicator />
      </SidebarInset>
    </SidebarProvider>
  );
}
