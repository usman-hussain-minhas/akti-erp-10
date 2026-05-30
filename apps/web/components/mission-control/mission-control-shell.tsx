'use client';

import Link from 'next/link';
import {
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import { PLATFORM_PRODUCT_NAME } from '../../lib/platform-branding.config';
import { SHELL_NAVIGATION_ROUTES } from '../../lib/routes.config';
import { CommandPalette } from './command-palette';
import { DashboardOverview } from './dashboard-overview';
import { ModuleLauncher } from './module-launcher';
import { NotificationCenter } from './notification-center';
import { SessionStatusNotice } from '../session/session-status';
import { Button } from '../ui/button';
import { EmptyState, StatusBadge } from '../ui/design-system';

const NAV_ICONS = {
  '/app': LayoutDashboard,
  '/lead-desk/inbox': Inbox,
  '/app/settings': Settings,
} as const;

export function MissionControlShell() {
  const { sessionState } = useLeadDeskOperatorContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--phase5c-bg)] text-[var(--phase5c-text)]">
      {mobileDrawerOpen ? (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" role="presentation">
          <aside className="h-full w-80 max-w-[86vw] bg-[var(--phase5c-surface)] p-4 shadow-xl" aria-label="Mobile navigation drawer">
            <div className="mb-4 flex items-center justify-between">
              <BrandLockup collapsed={false} />
              <Button type="button" variant="ghost" size="icon" onClick={() => setMobileDrawerOpen(false)} aria-label="Close menu">
                <X aria-hidden="true" size={18} />
              </Button>
            </div>
            <ShellNavigation collapsed={false} onNavigate={() => setMobileDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-[var(--phase5c-border)] bg-[rgb(5_7_12_/_.92)] backdrop-blur-xl">
        <div className="flex min-h-[4.5rem] items-center gap-3 px-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => setMobileDrawerOpen(true)} aria-label="Open menu" className="md:hidden">
            <Menu aria-hidden="true" size={18} />
          </Button>
          <div className="min-w-0 flex-1 md:flex-none">
            <BrandLockup collapsed={false} />
          </div>
          <div className="hidden min-w-0 flex-1 justify-center md:flex">
            <CommandPalette />
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Help">
              <Link href="#help-region">
                <HelpCircle aria-hidden="true" size={18} />
              </Link>
            </Button>
            <NotificationCenter />
            <Button asChild variant="ghost" size="icon" aria-label="Settings">
              <Link href="/app/settings">
                <Settings aria-hidden="true" size={18} />
              </Link>
            </Button>
            <div className="hidden items-center gap-2 rounded-md border border-[var(--phase5c-border)] bg-[var(--phase5c-surface)] px-3 py-2 text-sm md:flex" aria-label="User and organization menu">
              <UserRound aria-hidden="true" size={16} />
              <span>Operator workspace</span>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <SessionStatusNotice state={sessionState} />
        </div>
      </header>

      <aside
        className={`fixed bottom-0 left-0 top-[4.5rem] hidden grid-rows-[auto_1fr] border-r border-[var(--phase5c-border)] bg-[var(--phase5c-surface)] p-3 md:grid ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
        aria-label="Sidebar navigation only"
      >
        <div className="flex items-center justify-between gap-2">
          <BrandLockup collapsed={sidebarCollapsed} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" size={18} /> : <PanelLeftClose aria-hidden="true" size={18} />}
          </Button>
        </div>
        <div className="min-h-0 overflow-y-auto">
          <ShellNavigation collapsed={sidebarCollapsed} />
        </div>
      </aside>

      <div className={sidebarCollapsed ? 'md:pl-20' : 'md:pl-72'}>
        <main className="grid min-w-0 gap-6 px-4 py-6 pb-24 md:px-8 md:pb-8" aria-label="Main content outlet">
          <section className="grid gap-2">
            <StatusBadge tone="info">Phase 5C operator shell</StatusBadge>
            <h1 className="m-0 text-2xl font-semibold">Mission Control</h1>
            <p className="m-0 max-w-3xl text-sm text-[#55605a]">
              Start with session status, then open an available work area. Unsupported operational widgets stay as clear
              placeholders until their API or policy surface exists.
            </p>
          </section>

          <ModuleLauncher />

          <DashboardOverview />

          <section id="notification-region" aria-labelledby="notification-title" className="grid gap-3">
            <h2 id="notification-title" className="m-0 text-lg font-semibold">
              Notification shell
            </h2>
            <EmptyState
              title="Notification drawer region"
              message="Use the bell to open the drawer. Phase 4B keeps notifications as static system messages and placeholders only."
            />
          </section>

          <section id="help-region" aria-labelledby="help-title">
            <EmptyState
              title="Help"
              message="Use Mission Control, the sidebar, or the command palette to open available work areas. Advanced Diagnostics owns session setup."
            />
          </section>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--border)] bg-white p-2 md:hidden" aria-label="Bottom primary navigation">
        <MobileNavLink href="/app" label="Home" icon={LayoutDashboard} />
        <MobileNavLink href="/lead-desk/inbox" label={SHELL_NAVIGATION_ROUTES[1].label} icon={Inbox} />
        <MobileNavLink href="/app/settings" label="Settings" icon={Settings} />
        <button type="button" className="grid justify-items-center gap-1 rounded-md px-2 py-1 text-xs" onClick={() => setMobileDrawerOpen(true)}>
          <Menu aria-hidden="true" size={18} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}

function BrandLockup({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3" aria-label={PLATFORM_PRODUCT_NAME}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--akti-cyan)] bg-[rgb(0_213_255_/_.08)] text-[var(--akti-cyan)] shadow-[var(--akti-glow-cyan)]">
        <Sparkles aria-hidden="true" size={22} />
      </span>
      {collapsed ? null : (
        <p className="m-0 truncate text-lg font-semibold tracking-normal">
          AKTI <span className="text-[var(--akti-violet)]">Spark</span>
        </p>
      )}
    </div>
  );
}

function ShellNavigation({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="mt-6 grid gap-2" aria-label="Primary and system navigation">
      {SHELL_NAVIGATION_ROUTES.map((item) => {
        const Icon = NAV_ICONS[item.route];

        return (
          <Link
            key={item.route}
            href={item.route}
            onClick={onNavigate}
            className="flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[var(--phase5c-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--akti-cyan)]"
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
          >
            <Icon aria-hidden="true" size={18} />
            {collapsed ? null : (
              <span className="grid">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-[var(--phase5c-text-muted)]">{item.description}</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}) {
  return (
    <Link href={href} className="grid justify-items-center gap-1 rounded-md px-2 py-1 text-xs">
      <Icon aria-hidden="true" size={18} />
      <span>{label}</span>
    </Link>
  );
}
