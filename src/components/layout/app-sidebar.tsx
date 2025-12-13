
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, LayoutDashboard, Sparkles, Settings, BookText, FlaskConical, LogIn, Sun, Moon, Laptop, FileText, Newspaper, BookCopy, ClipboardCheck, Smile, Target, Lightbulb, Flame, Share2, Shield } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { placeholderImages } from '@/lib/placeholder-images';
import { useTheme } from "next-themes";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookText },
  { href: '/backtest-journal', label: 'Backtest Journal', icon: FlaskConical },
  { href: '/notebook', label: 'Market Analysis', icon: BookCopy },
  { href: '/strategy-checklist', label: 'Strategy Checklist', icon: ClipboardCheck },
  { href: '/self-development', label: 'Self Development', icon: Smile },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/report', label: 'Reports', icon: FileText },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/heatmap', label: 'Forex Heatmap', icon: Flame },
  { href: '/resource', label: 'Resource', icon: Share2 },
];

const bottomMenuItems: { href: string; label: string; icon: React.ElementType }[] = [];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, setOpenMobile } = useSidebar();
  const { user, signOut } = useUser();
  const firestore = useFirestore();
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');
  const { setTheme } = useTheme();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null
  , [user, firestore]);
  
  const { data: userProfile } = useDoc(userProfileRef);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email || 'User';
  const displayAvatar = userProfile?.photoURL || user?.photoURL || userAvatar?.imageUrl;
  const displayFallback = displayName[0]?.toUpperCase() ?? 'U';
  
  const isAdmin = user?.email === 'kiyuenterprise@gmail.com';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
           <Activity className="size-7 shrink-0 text-primary" />
           <div className={cn("flex-1 overflow-hidden transition-all duration-200", state === 'collapsed' ? "w-0" : "w-auto")}>
            <h1 className='text-lg font-semibold'>
              KilaTrade
            </h1>
           </div>
           <div className={cn("ml-auto", state === 'collapsed' && "hidden")}>
             <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                onClick={() => setOpenMobile(false)}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {isAdmin && (
             <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/admin'}
                  onClick={() => setOpenMobile(false)}
                  tooltip={{ children: 'Admin' }}
                >
                  <Link href="/admin">
                    <Shield />
                    <span>Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          )}
        </SidebarMenu>
        <SidebarMenu className="mt-auto">
            {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    onClick={() => setOpenMobile(false)}
                    tooltip={{ children: item.label }}
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start p-2 text-left',
                state === 'collapsed' && 'size-8 justify-center'
              )}
            >
              <Avatar className="size-7 rounded-full">
                <AvatarImage src={displayAvatar} alt="User Avatar" />
                <AvatarFallback>{displayFallback}</AvatarFallback>
              </Avatar>
              <span className={cn('ml-2 truncate', state === 'collapsed' && 'hidden')}>
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mb-2 w-56" side="top" align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
             <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Appearance</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogIn className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
