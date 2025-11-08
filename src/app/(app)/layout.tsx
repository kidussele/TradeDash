
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {SidebarProvider} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/layout/app-sidebar';
import {SidebarInset} from '@/components/ui/sidebar';
import {Header} from '@/components/layout/header';
import {Toaster} from '@/components/ui/toaster';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/auth') {
      router.push('/auth');
    }
    // Redirect from the root of the app layout to the dashboard
    if (pathname === '/') {
        router.replace('/dashboard');
    }
  }, [user, isUserLoading, router, pathname]);

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

  // If loading is finished and there's still no user, we do nothing.
  // The useEffect above has already triggered the redirect.
  // This prevents rendering the children for a brief moment before the redirect happens.
  if (!user || pathname === '/') {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 lg:p-6">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
