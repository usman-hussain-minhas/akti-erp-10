'use client';

import Link from 'next/link';
import { ClipboardList, HeartPulse, ServerCog, Settings, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import { CRM_VISIBLE_LABEL } from '../../lib/crm-alias.config';
import { Button } from '../ui/button';
import { EmptyState, ErrorState, LoadingState, PermissionState, SectionCard, StateMessage, StatusBadge, SuccessState } from '../ui/design-system';

type PlatformStatusOverview = {
  workspace_connection?: string;
  crm_pipeline?: string;
  platform_services?: string;
  data_controls?: string;
};

type WorkspaceConnectionSnapshot =
  | { state: 'placeholder'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'ready'; message: string; status: PlatformStatusOverview }
  | { state: 'error'; message: string }
  | { state: 'permission'; message: string };

type DataControlsSnapshot =
  | { state: 'placeholder'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'ready'; message: string; import_export: string; retention_policy: string; audit_controls: string }
  | { state: 'error'; message: string }
  | { state: 'permission'; message: string };

function resolveApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export function DashboardOverview() {
  const { context } = useLeadDeskOperatorContext();
  const apiBase = useMemo(resolveApiBase, []);
  const [workspaceConnection, setWorkspaceConnection] = useState<WorkspaceConnectionSnapshot>({
    state: 'placeholder',
    message: 'Connect the local/demo API to load workspace status.',
  });
  const [dataControls, setDataControls] = useState<DataControlsSnapshot>({
    state: 'placeholder',
    message: 'Connect the local/demo API to load data controls status.',
  });

  const buildHeaders = useCallback(() => {
    return context.sessionToken.trim().length > 0 ? { Authorization: `Bearer ${context.sessionToken.trim()}` } : undefined;
  }, [context.sessionToken]);

  const loadWorkspaceConnection = useCallback(async () => {
    if (!apiBase) {
      setWorkspaceConnection({ state: 'placeholder', message: 'Connect the local/demo API to load workspace status.' });
      return;
    }

    setWorkspaceConnection({ state: 'loading', message: 'Checking workspace connection.' });
    try {
      const response = await fetch(`${apiBase}/platform/status/overview`, { headers: buildHeaders() });
      if (response.status === 401 || response.status === 403) {
        setWorkspaceConnection({ state: 'permission', message: 'Access needed to read workspace status.' });
        return;
      }
      if (!response.ok) {
        setWorkspaceConnection({ state: 'error', message: 'Workspace status is temporarily unavailable. Try again later.' });
        return;
      }

      const payload = (await response.json()) as { status?: PlatformStatusOverview };
      const status = payload.status ?? {};
      setWorkspaceConnection({
        state: 'ready',
        status,
        message:
          status.workspace_connection === 'connected'
            ? 'Workspace connected. Platform services can load approved live status.'
            : 'Not connected. Workspace connection is required before platform services activate.',
      });
    } catch {
      setWorkspaceConnection({ state: 'error', message: 'Workspace status is temporarily unavailable. Try again later.' });
    }
  }, [apiBase, buildHeaders]);

  const loadDataControls = useCallback(async () => {
    if (!apiBase) {
      setDataControls({ state: 'placeholder', message: 'Connect the local/demo API to load data controls status.' });
      return;
    }

    setDataControls({ state: 'loading', message: 'Checking data controls status.' });
    try {
      const response = await fetch(`${apiBase}/platform/data-controls/status`, { headers: buildHeaders() });
      if (response.status === 401 || response.status === 403) {
        setDataControls({ state: 'permission', message: 'Access needed to read data controls status.' });
        return;
      }
      if (!response.ok) {
        setDataControls({ state: 'error', message: 'Data controls status is temporarily unavailable.' });
        return;
      }

      const payload = (await response.json()) as {
        import_export?: string;
        retention_policy?: string;
        audit_controls?: string;
      };
      setDataControls({
        state: 'ready',
        import_export: payload.import_export ?? 'unavailable',
        retention_policy: payload.retention_policy ?? 'inactive',
        audit_controls: payload.audit_controls ?? 'inactive',
        message: 'Governance inactive until workspace connection and approved controls are available.',
      });
    } catch {
      setDataControls({ state: 'error', message: 'Data controls status is temporarily unavailable.' });
    }
  }, [apiBase, buildHeaders]);

  useEffect(() => {
    if (apiBase) {
      void loadWorkspaceConnection();
    }
  }, [apiBase, loadWorkspaceConnection]);

  useEffect(() => {
    if (apiBase) {
      void loadDataControls();
    }
  }, [apiBase, loadDataControls]);

  return (
    <section className="grid gap-3" aria-labelledby="dashboard-overview-title">
      <div className="grid gap-2">
        <StatusBadge tone="info">Operational status</StatusBadge>
        <h2 id="dashboard-overview-title" className="m-0 text-lg font-semibold">
          Operational overview
        </h2>
        <p className="m-0 max-w-3xl text-sm text-[#55605a]">
          Live status uses existing approved APIs only. Unsupported widgets are explicit unavailable states or deferrals,
          never hardcoded operational data.
        </p>
        <p className="m-0 max-w-3xl text-sm text-[var(--phase5c-text-muted)]">
          Connect your workspace to load your apps. If the local/demo API is not configured, each card stays in an honest
          unavailable state.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <DashboardCard
          title="Workspace connection"
          icon={HeartPulse}
          badge={
            workspaceConnection.state === 'ready' && workspaceConnection.status.workspace_connection === 'connected'
              ? 'Connected'
              : 'Not connected'
          }
          badgeTone={
            workspaceConnection.state === 'ready' && workspaceConnection.status.workspace_connection === 'connected'
              ? 'success'
              : 'warning'
          }
          action={<Button type="button" variant="secondary" onClick={loadWorkspaceConnection}>Refresh workspace</Button>}
        >
          <SnapshotMessage snapshot={workspaceConnection} />
        </DashboardCard>

        <DashboardCard
          title="Platform services"
          icon={ServerCog}
          badge={workspaceConnection.state === 'ready' ? formatStatusLabel(workspaceConnection.status.platform_services) : 'Unavailable'}
          badgeTone={
            workspaceConnection.state === 'ready' && workspaceConnection.status.platform_services === 'online'
              ? 'success'
              : 'warning'
          }
        >
          <StateMessage
            title="Service status"
            message={
              workspaceConnection.state === 'ready'
                ? platformServicesMessage(workspaceConnection.status.platform_services)
                : 'Connect your workspace to read platform service status.'
            }
          />
        </DashboardCard>

        <DashboardCard
          title={`${CRM_VISIBLE_LABEL} pipeline status`}
          icon={ClipboardList}
          badge={workspaceConnection.state === 'ready' ? formatStatusLabel(workspaceConnection.status.crm_pipeline) : 'Not available'}
          badgeTone="warning"
          action={
            <Button asChild variant="secondary">
              <Link href="/lead-desk/inbox">Open {CRM_VISIBLE_LABEL}</Link>
            </Button>
          }
        >
          <StateMessage
            title="Not available"
            message="Workspace connection is required. No CRM pipeline endpoint, stage counts, tasks, revenue, or conversion data exists in Phase 5C."
          />
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

        <DashboardCard
          title="Data controls and governance"
          icon={ShieldCheck}
          badge={dataControls.state === 'ready' ? formatStatusLabel(dataControls.audit_controls) : 'Unavailable'}
          badgeTone="warning"
          action={<Button type="button" variant="secondary" onClick={loadDataControls}>Refresh governance</Button>}
        >
          <DataControlsMessage snapshot={dataControls} />
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

function platformServicesMessage(status: string | undefined): string {
  if (status === 'online') {
    return 'Approved platform services are online.';
  }

  return 'Core platform services are offline or unavailable until the workspace is connected.';
}

function formatStatusLabel(status: string | undefined): string {
  return status ? status.replace(/_/g, ' ') : 'Unavailable';
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

function SnapshotMessage({ snapshot }: { snapshot: WorkspaceConnectionSnapshot }) {
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

function DataControlsMessage({ snapshot }: { snapshot: DataControlsSnapshot }) {
  if (snapshot.state === 'loading') {
    return <LoadingState message={snapshot.message} />;
  }

  if (snapshot.state === 'error') {
    return <ErrorState message={snapshot.message} />;
  }

  if (snapshot.state === 'permission') {
    return <PermissionState message={snapshot.message} />;
  }

  if (snapshot.state === 'ready') {
    return (
      <StateMessage
        title="Governance inactive"
        message={`Import/export ${snapshot.import_export}; retention ${snapshot.retention_policy}; audit controls ${snapshot.audit_controls}. Read only, no execution authority.`}
      />
    );
  }

  return <StateMessage title="Not connected yet" message={snapshot.message} />;
}
