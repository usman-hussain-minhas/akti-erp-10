'use client';

import Link from 'next/link';
import {
  Bell,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import { ModuleLauncher } from './module-launcher';
import { SessionStatusNotice } from '../session/session-status';
import { Button } from '../ui/button';
import { EmptyState, StatusBadge } from '../ui/design-system';

const NAV_ITEMS = [
  { label: 'Mission Control', href: '/app', icon: LayoutDashboard, description: 'Default ERP shell' },
  { label: 'Lead Desk', href: '/lead-desk/inbox', icon: Inbox, description: 'Open current lead work' },
  { label: 'Settings', href: '/app/settings', icon: Settings, description: 'Control panel shell' },
];

export function MissionControlShell() {
  const { sessionState } = useLeadDeskOperatorContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      {mobileDrawerOpen ? (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" role="presentation">
          <aside className="h-full w-80 max-w-[86vw] bg-white p-4 shadow-xl" aria-label="Mobile navigation drawer">
            <div className="mb-4 flex items-center justify-between">
              <p className="m-0 text-sm font-semibold">AKTI ERP</p>
              <Button type="button" variant="ghost" size="icon" onClick={() => setMobileDrawerOpen(false)} aria-label="Close menu">
                <X aria-hidden="true" size={18} />
              </Button>
            </div>
            <ShellNavigation collapsed={false} onNavigate={() => setMobileDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 hidden border-r border-[var(--border)] bg-white p-3 md:grid ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
        aria-label="Module navigation"
      >
        <div className="flex items-center justify-between gap-2">
          {sidebarCollapsed ? <span className="sr-only">AKTI ERP</span> : <p className="m-0 text-sm font-semibold">AKTI ERP</p>}
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
        <ShellNavigation collapsed={sidebarCollapsed} />
      </aside>

      <div className={sidebarCollapsed ? 'md:pl-20' : 'md:pl-72'}>
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4">
            <Button type="button" variant="ghost" size="icon" onClick={() => setMobileDrawerOpen(true)} aria-label="Open menu" className="md:hidden">
              <Menu aria-hidden="true" size={18} />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-semibold">Mission Control</p>
              <p className="m-0 hidden text-xs text-[#55605a] sm:block">Frontend Operational Experience shell</p>
            </div>
            <button
              type="button"
              className="hidden min-w-48 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm text-[#55605a] md:inline-flex"
              aria-label="Command palette entry"
              disabled
            >
              <Search aria-hidden="true" size={16} />
              <span>Command palette</span>
              <kbd className="ml-auto rounded border border-[var(--border)] px-1.5 text-xs">Ctrl K</kbd>
            </button>
            <Button type="button" variant="ghost" size="icon" aria-label="Help">
              <HelpCircle aria-hidden="true" size={18} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => setNotificationOpen((current) => !current)}
            >
              <Bell aria-hidden="true" size={18} />
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Settings">
              <Link href="/app/settings">
                <Settings aria-hidden="true" size={18} />
              </Link>
            </Button>
            <div className="hidden items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm md:flex" aria-label="User and organization menu">
              <UserRound aria-hidden="true" size={16} />
              <span>Operator workspace</span>
            </div>
          </div>
          <div className="px-4 pb-3">
            <SessionStatusNotice state={sessionState} />
          </div>
        </header>

        <main className="grid min-w-0 gap-6 px-4 py-6 pb-24 md:px-6 md:pb-6" aria-label="Main content outlet">
          <section className="grid gap-2">
            <StatusBadge tone="info">Phase 4B local/demo shell</StatusBadge>
            <h1 className="m-0 text-2xl font-semibold">Mission Control</h1>
            <p className="m-0 max-w-3xl text-sm text-[#55605a]">
              Start with session status, then open an available work area. Unsupported operational widgets stay as clear
              placeholders until their API or policy surface exists.
            </p>
          </section>

          <ModuleLauncher />

          <section className="grid gap-3" aria-labelledby="next-steps-title">
            <h2 id="next-steps-title" className="m-0 text-lg font-semibold">
              Next steps
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <EmptyState
                title="Dashboard widgets are bounded"
                message="Dashboard v1 uses existing APIs only. Missing data surfaces remain placeholders, not fake operational data."
              />
              <EmptyState
                title="Advanced Diagnostics owns token entry"
                message="Normal screens show session state only. Bearer-token entry stays inside Settings Advanced Diagnostics."
              />
            </div>
          </section>

          <section id="notification-region" aria-labelledby="notification-title" className="grid gap-3">
            <h2 id="notification-title" className="m-0 text-lg font-semibold">
              Notification shell
            </h2>
            {notificationOpen ? (
              <EmptyState
                title="No notifications"
                message="Notification infrastructure is ready as a shell region. Delivery, retention, and module semantics wait for a later policy phase."
              />
            ) : (
              <p className="m-0 text-sm text-[#55605a]">Use the bell to open the notification drawer region.</p>
            )}
          </section>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--border)] bg-white p-2 md:hidden" aria-label="Bottom primary navigation">
        <MobileNavLink href="/app" label="Home" icon={LayoutDashboard} />
        <MobileNavLink href="/lead-desk/inbox" label="Leads" icon={Inbox} />
        <MobileNavLink href="/app/settings" label="Settings" icon={Settings} />
        <button type="button" className="grid justify-items-center gap-1 rounded-md px-2 py-1 text-xs" onClick={() => setMobileDrawerOpen(true)}>
          <Menu aria-hidden="true" size={18} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}

function ShellNavigation({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="mt-6 grid gap-2" aria-label="Primary module navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[var(--surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
          >
            <Icon aria-hidden="true" size={18} />
            {collapsed ? null : (
              <span className="grid">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-[#66716a]">{item.description}</span>
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
