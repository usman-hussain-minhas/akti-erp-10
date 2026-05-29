'use client';

import Link from 'next/link';
import { ClipboardList, HeartPulse, Settings, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { hasOperatorContext, leadDeskApiFetch } from '../../app/lead-desk/api-client';
import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import { CRM_VISIBLE_LABEL } from '../../lib/crm-alias.config';
import { Button } from '../ui/button';
import { EmptyState, ErrorState, LoadingState, PermissionState, SectionCard, StateMessage, StatusBadge, SuccessState } from '../ui/design-system';

type HealthSnapshot =
  | { state: 'placeholder'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'ready'; message: string }
  | { state: 'error'; message: string };

type LeadDeskSnapshot =
  | { state: 'placeholder'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'ready'; message: string }
  | { state: 'error'; message: string }
  | { state: 'permission'; message: string };

type LeadDeskListResponse = {
  items?: unknown[];
};

function resolveApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export function DashboardOverview() {
  const { context, sessionState } = useLeadDeskOperatorContext();
  const apiBase = useMemo(resolveApiBase, []);
  const sessionReady = hasOperatorContext(context);
  const [health, setHealth] = useState<HealthSnapshot>({
    state: 'placeholder',
    message: 'Connect the local/demo API to show health status.',
  });
  const [leadDesk, setLeadDesk] = useState<LeadDeskSnapshot>({
    state: 'placeholder',
    message: `Set up session in Advanced Diagnostics to load ${CRM_VISIBLE_LABEL} status.`,
  });

  const loadHealth = useCallback(async () => {
    if (!apiBase) {
      setHealth({ state: 'placeholder', message: 'Connect the local/demo API to show health status.' });
      return;
    }

    setHealth({ state: 'loading', message: 'Checking API health.' });
    try {
      const response = await fetch(`${apiBase}/health`);
      if (!response.ok) {
        setHealth({ state: 'error', message: 'API health is temporarily unavailable. Try again later.' });
        return;
      }

      const payload = (await response.json()) as { status?: unknown };
      setHealth({
        state: 'ready',
        message: payload.status === 'healthy' ? 'API health is healthy.' : 'API responded without a healthy status.',
      });
    } catch {
      setHealth({ state: 'error', message: 'API health is temporarily unavailable. Try again later.' });
    }
  }, [apiBase]);

  const loadLeadDesk = useCallback(async () => {
    if (!apiBase) {
      setLeadDesk({ state: 'placeholder', message: `Connect the local/demo API to load ${CRM_VISIBLE_LABEL} status.` });
      return;
    }

    if (!sessionReady) {
      setLeadDesk({ state: 'placeholder', message: `Set up session in Advanced Diagnostics to load ${CRM_VISIBLE_LABEL} status.` });
      return;
    }

    setLeadDesk({ state: 'loading', message: `Loading ${CRM_VISIBLE_LABEL} status from the existing list API.` });
    try {
      const response = await leadDeskApiFetch(context, '/leads', { method: 'GET' });
      if (response.status === 401 || response.status === 403) {
        setLeadDesk({ state: 'permission', message: `You do not have permission to view the ${CRM_VISIBLE_LABEL} summary.` });
        return;
      }
      if (!response.ok) {
        setLeadDesk({ state: 'error', message: `${CRM_VISIBLE_LABEL} status is temporarily unavailable. Try again later.` });
        return;
      }

      const payload = (await response.json()) as LeadDeskListResponse;
      const count = Array.isArray(payload.items) ? payload.items.length : 0;
      setLeadDesk({ state: 'ready', message: `${count} ${CRM_VISIBLE_LABEL} records returned by the existing list API.` });
    } catch {
      setLeadDesk({ state: 'error', message: `${CRM_VISIBLE_LABEL} status is temporarily unavailable. Try again later.` });
    }
  }, [apiBase, context, sessionReady]);

  useEffect(() => {
    if (apiBase) {
      void loadHealth();
    }
  }, [apiBase, loadHealth]);

  useEffect(() => {
    if (sessionReady) {
      void loadLeadDesk();
    }
  }, [loadLeadDesk, sessionReady]);

  return (
    <section className="grid gap-3" aria-labelledby="dashboard-overview-title">
      <div className="grid gap-2">
        <StatusBadge tone="info">Dashboard v1</StatusBadge>
        <h2 id="dashboard-overview-title" className="m-0 text-lg font-semibold">
          Operational overview
        </h2>
        <p className="m-0 max-w-3xl text-sm text-[#55605a]">
          Dashboard v1 uses existing APIs only. Unsupported widgets are explicit placeholders or deferrals, never
          hardcoded operational data.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <DashboardCard
          title="Local/demo API health"
          icon={HeartPulse}
          badge={health.state === 'ready' ? 'Ready' : 'Local/demo'}
          badgeTone={health.state === 'ready' ? 'success' : 'neutral'}
          action={<Button type="button" variant="secondary" onClick={loadHealth}>Refresh health</Button>}
        >
          <SnapshotMessage snapshot={health} />
        </DashboardCard>

        <DashboardCard
          title={`${CRM_VISIBLE_LABEL} quick card`}
          icon={ClipboardList}
          badge={leadDesk.state === 'ready' ? 'Loaded' : sessionState === 'active' ? 'Session active' : 'Session needed'}
          badgeTone={leadDesk.state === 'ready' ? 'success' : sessionState === 'active' ? 'info' : 'warning'}
          action={
            <Button type="button" variant="secondary" onClick={loadLeadDesk} disabled={!sessionReady || leadDesk.state === 'loading'}>
              Load {CRM_VISIBLE_LABEL} status
            </Button>
          }
        >
          <SnapshotMessage snapshot={leadDesk} />
        </DashboardCard>

        <DashboardCard
          title="Settings quick card"
          icon={Settings}
          badge="Built"
          badgeTone="success"
          action={
            <Button asChild variant="secondary">
              <Link href="/app/settings">Open settings</Link>
            </Button>
          }
        >
          <p className="m-0 text-sm text-[#55605a]">
            Open the Settings control panel for portal mode, read-only access sections, modules, and Advanced Diagnostics.
          </p>
        </DashboardCard>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <EmptyState
          title="Recent activity deferred"
          message="No frontend-safe activity endpoint is confirmed. This widget stays deferred until a named backend surface exists."
        />
        <EmptyState
          title="Notifications summary deferred"
          message="Notification content waits for Phase 5A policy. Phase 4B provides the shell region only."
        />
      </div>
    </section>
  );
}

function DashboardCard({
  title,
  icon: Icon,
  badge,
  badgeTone,
  action,
  children,
}: {
  title: string;
  icon: LucideIcon;
  badge: string;
  badgeTone: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SectionCard className="grid min-w-0 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon aria-hidden="true" size={18} />
          <h3 className="m-0 text-base font-semibold">{title}</h3>
        </div>
        <StatusBadge tone={badgeTone}>{badge}</StatusBadge>
      </div>
      {children}
      {action ? <div>{action}</div> : null}
    </SectionCard>
  );
}

function SnapshotMessage({ snapshot }: { snapshot: HealthSnapshot | LeadDeskSnapshot }) {
  if (snapshot.state === 'loading') {
    return <LoadingState message={snapshot.message} />;
  }

  if (snapshot.state === 'ready') {
    return <SuccessState message={snapshot.message} />;
  }

  if (snapshot.state === 'error') {
    return <ErrorState message={snapshot.message} />;
  }

  if (snapshot.state === 'permission') {
    return <PermissionState message={snapshot.message} />;
  }

  return <StateMessage title="Not connected yet" message={snapshot.message} />;
}
