'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, PlusCircle, GraduationCap, Settings, Crown } from 'lucide-react';
import Logo from '@/app/components/Logo';
import { DynamicUserButton } from '@/app/components/DynamicUserButton';
import ThemeToggle from '@/app/components/ThemeToggle';
import { useSubscription } from '@/app/hooks/useSubscription';
import { usePracticeStatus } from '@/app/hooks/usePractice';
import { cn } from '@/app/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  premium?: boolean;
};

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Notes', icon: FileText, exact: true },
  { href: '/dashboard/new', label: 'New Note', icon: PlusCircle },
  { href: '/dashboard/practice', label: 'Practice', icon: GraduationCap, premium: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: subscription } = useSubscription();
  const { data: practiceStatus } = usePracticeStatus();
  const isPremium = subscription?.isPremium ?? false;
  const dueCount = practiceStatus?.notesNeedingReview ?? 0;
  const practiceDone = practiceStatus?.completed ?? false;

  const visibleNav = NAV.filter((item) => !item.premium || isPremium);

  const desktopBadge = (item: NavItem) => {
    if (item.href !== '/dashboard/practice' || !isPremium || !practiceStatus) return null;
    return (
      <span
        className={cn(
          'ml-auto min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center',
          practiceDone
            ? 'bg-success text-success-foreground'
            : 'bg-primary text-primary-foreground',
        )}
      >
        {practiceDone ? '✓' : dueCount}
      </span>
    );
  };

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:flex fixed left-4 top-4 bottom-4 w-60 flex-col rounded-3xl border border-border/60 bg-card shadow-elevation-2 z-40">
        <div className="flex items-center gap-2.5 px-5 h-16 shrink-0">
          <Logo size={30} />
          <span className="text-[15px] font-extrabold text-foreground tracking-tight">
            MemoMind
          </span>
          {isPremium && <Crown className="w-3.5 h-3.5 text-primary ml-0.5" />}
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-primary" />
                )}
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {item.label}
                {desktopBadge(item)}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3 space-y-3">
          {!isPremium && (
            <Link
              href="/pricing"
              className="block rounded-2xl border border-primary/20 bg-primary/[0.07] p-4 transition-colors hover:bg-primary/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlock AI analysis and daily practice.
              </p>
            </Link>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-border/60 px-2.5 py-2">
            <DynamicUserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 z-40 glass border-b border-border/60 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="text-[15px] font-extrabold text-foreground tracking-tight">
            MemoMind
          </span>
          {isPremium && <Crown className="w-3.5 h-3.5 text-primary" />}
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DynamicUserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
        </div>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around px-2">
          {visibleNav.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            const showBadge =
              item.href === '/dashboard/practice' &&
              isPremium &&
              practiceStatus &&
              !practiceDone &&
              dueCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {dueCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            );
          })}
          {!isPremium && (
            <Link
              href="/pricing"
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
            >
              <Crown className="w-5 h-5" />
              Upgrade
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
