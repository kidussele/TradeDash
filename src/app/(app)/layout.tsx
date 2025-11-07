'use client';

import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
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
