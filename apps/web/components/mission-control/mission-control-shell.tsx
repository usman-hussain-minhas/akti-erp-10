'use client';

import Link from 'next/link';
import {
  Building2,
  ChevronDown,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shapes,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  '/app#module-launcher': Shapes,
  '/app/settings': Settings,
} as const;

type OrgProfileSnapshot =
  | { state: 'placeholder'; label: string; detail: string }
  | { state: 'loading'; label: string; detail: string }
  | { state: 'ready'; label: string; detail: string }
  | { state: 'error'; label: string; detail: string };

type WorkspaceStatusSnapshot =
  | { state: 'placeholder'; label: string; detail: string }
  | { state: 'loading'; label: string; detail: string }
  | { state: 'ready'; label: string; detail: string }
  | { state: 'error'; label: string; detail: string };

function resolveApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export function MissionControlShell() {
  const { context, sessionState } = useLeadDeskOperatorContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const apiBase = useMemo(resolveApiBase, []);
  const [orgProfile, setOrgProfile] = useState<OrgProfileSnapshot>({
    state: 'placeholder',
    label: 'Workspace not connected',
    detail: 'Connect your workspace',
  });
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatusSnapshot>({
    state: 'placeholder',
    label: 'Workspace not connected',
    detail: 'Connect to enable CRM and platform services.',
  });

  const loadOrgProfile = useCallback(async () => {
    if (!apiBase) {
      setOrgProfile({ state: 'placeholder', label: 'Workspace not connected', detail: 'Connect your workspace' });
      return;
    }

    setOrgProfile({ state: 'loading', label: 'Loading workspace', detail: 'Reading organization profile' });
    const headers = context.sessionToken.trim().length > 0 ? { Authorization: `Bearer ${context.sessionToken.trim()}` } : undefined;

    try {
      const response = await fetch(`${apiBase}/platform/organization/profile`, { headers });
      if (!response.ok) {
        setOrgProfile({ state: 'error', label: 'Workspace unavailable', detail: 'Profile cannot be loaded' });
        return;
      }

      const payload = (await response.json()) as {
        organization?: {
          short_name?: unknown;
          name?: unknown;
          display_name?: unknown;
        };
      };
      const organization = payload.organization ?? {};
      const label =
        typeof organization.short_name === 'string' && organization.short_name.trim()
          ? organization.short_name.trim()
          : typeof organization.display_name === 'string' && organization.display_name.trim()
            ? organization.display_name.trim()
            : typeof organization.name === 'string' && organization.name.trim()
              ? organization.name.trim()
              : 'Workspace';

      setOrgProfile({ state: 'ready', label, detail: 'Organization profile' });
    } catch {
      setOrgProfile({ state: 'error', label: 'Workspace unavailable', detail: 'Profile cannot be loaded' });
    }
  }, [apiBase, context.sessionToken]);

  useEffect(() => {
    void loadOrgProfile();
  }, [loadOrgProfile]);

  const loadWorkspaceStatus = useCallback(async () => {
    if (!apiBase) {
      setWorkspaceStatus({
        state: 'placeholder',
        label: 'Workspace not connected',
        detail: 'Connect to enable CRM and platform services.',
      });
      return;
    }

    setWorkspaceStatus({ state: 'loading', label: 'Checking workspace', detail: 'Reading platform status overview.' });
    const headers = context.sessionToken.trim().length > 0 ? { Authorization: `Bearer ${context.sessionToken.trim()}` } : undefined;

    try {
      const response = await fetch(`${apiBase}/platform/status/overview`, { headers });
      if (!response.ok) {
        setWorkspaceStatus({ state: 'error', label: 'Workspace unavailable', detail: 'Platform status cannot be loaded.' });
        return;
      }

      const payload = (await response.json()) as {
        status?: {
          workspace_connection?: unknown;
        };
      };
      const workspaceConnection =
        typeof payload.status?.workspace_connection === 'string'
          ? payload.status.workspace_connection
          : 'not_connected';

      setWorkspaceStatus({
        state: 'ready',
        label: workspaceConnection === 'connected' ? 'Workspace connected' : 'Workspace not connected',
        detail:
          workspaceConnection === 'connected'
            ? 'Platform status overview is available.'
            : 'Connect to enable CRM and platform services.',
      });
    } catch {
      setWorkspaceStatus({ state: 'error', label: 'Workspace unavailable', detail: 'Platform status cannot be loaded.' });
    }
  }, [apiBase, context.sessionToken]);

  useEffect(() => {
    void loadWorkspaceStatus();
  }, [loadWorkspaceStatus]);

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
            <OrgBadge snapshot={orgProfile} />
            <UserAvatar />
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
        <WorkspaceStatusCard collapsed={sidebarCollapsed} snapshot={workspaceStatus} />
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

      <nav
        className="phase5c-safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--phase5c-border)] bg-[rgb(5_7_12_/_.94)] px-2 pt-2 backdrop-blur-xl md:hidden"
        aria-label="Bottom primary navigation"
      >
        <MobileNavLink href="/app" label="Home" icon={LayoutDashboard} />
        <MobileNavLink href="/lead-desk/inbox" label={SHELL_NAVIGATION_ROUTES[1].label} icon={Inbox} />
        <MobileNavLink href="/app/settings" label="Settings" icon={Settings} />
        <button
          type="button"
          className="grid min-h-12 justify-items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-[var(--phase5c-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--akti-cyan)]"
          onClick={() => setMobileDrawerOpen(true)}
        >
          <Menu aria-hidden="true" size={18} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}

function OrgBadge({ snapshot }: { snapshot: OrgProfileSnapshot }) {
  return (
    <button
      type="button"
      className="hidden max-w-56 items-center gap-2 rounded-md border border-[var(--phase5c-border)] bg-[var(--phase5c-surface)] px-3 py-2 text-left text-sm transition-all hover:border-[var(--akti-cyan)] focus-visible:ring-2 focus-visible:ring-[var(--akti-cyan)] md:flex"
      aria-label={`Organization badge: ${snapshot.label}`}
      aria-disabled="true"
    >
      <Building2 aria-hidden="true" size={16} className="text-[var(--akti-violet)]" />
      <span className="grid min-w-0">
        <span className="truncate font-medium">{snapshot.label}</span>
        <span className="truncate text-xs text-[var(--phase5c-text-muted)]">{snapshot.detail}</span>
      </span>
      <ChevronDown aria-hidden="true" size={14} className="text-[var(--phase5c-text-muted)]" />
    </button>
  );
}

function UserAvatar() {
  return (
    <button
      type="button"
      className="hidden h-10 w-10 place-items-center rounded-full border border-[var(--akti-violet)] bg-[rgb(139_92_246_/_.16)] text-sm font-semibold text-[var(--phase5c-text)] shadow-[var(--akti-glow-violet)] focus-visible:ring-2 focus-visible:ring-[var(--akti-cyan)] md:grid"
      aria-label="User account avatar"
    >
      <UserRound aria-hidden="true" size={17} />
    </button>
  );
}

function WorkspaceStatusCard({
  collapsed,
  snapshot,
}: {
  collapsed: boolean;
  snapshot: WorkspaceStatusSnapshot;
}) {
  const toneClass =
    snapshot.state === 'ready'
      ? 'border-[rgb(18_217_123_/_.45)]'
      : snapshot.state === 'error'
        ? 'border-[rgb(255_107_122_/_.45)]'
        : 'border-[rgb(0_213_255_/_.35)]';

  return (
    <section
      className={`mt-4 grid gap-2 rounded-lg border ${toneClass} bg-[rgb(255_255_255_/_.03)] p-3 text-sm`}
      aria-label="Workspace status card"
    >
      {collapsed ? (
        <span className="mx-auto h-2.5 w-2.5 rounded-full bg-[var(--akti-cyan)]" aria-label={snapshot.label} />
      ) : (
        <>
          <p className="m-0 font-medium">{snapshot.label}</p>
          <p className="m-0 text-xs text-[var(--phase5c-text-muted)]">{snapshot.detail}</p>
        </>
      )}
    </section>
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
    <Link
      href={href}
      className="grid min-h-12 justify-items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-[var(--phase5c-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--akti-cyan)]"
    >
      <Icon aria-hidden="true" size={18} />
      <span>{label}</span>
    </Link>
  );
}
