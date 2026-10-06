'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, PenLine, Sun, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/', label: 'Hari Ini', icon: Sun },
  { href: '/log', label: 'Catat', icon: PenLine },
  { href: '/calendar', label: 'Kalender', icon: CalendarDays },
  { href: '/insights', label: 'Wawasan', icon: TrendingUp },
  { href: '/settings', label: 'Profil', icon: User },
] as const;

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className='app-tabbar app-no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-md'>
      <div className='mx-auto grid w-full max-w-md grid-cols-5'>
        {TABS.map((tab) => {
          const active =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-full transition-colors',
                  active && 'bg-primary/10'
                )}
              >
                <Icon className='size-[19px]' strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
