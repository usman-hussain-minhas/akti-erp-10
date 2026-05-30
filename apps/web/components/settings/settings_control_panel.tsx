'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import { PLATFORM_BRANDING, PLATFORM_PRODUCT_NAME } from '../../lib/platform_branding.config';
import { AdvancedDiagnosticsSessionPanel } from '../session/advanced_diagnostics_session_panel';
import { SessionStatusNotice } from '../session/session_status';
import { Button } from '../ui/button';
import { EmptyState, ErrorState, FormActions, LoadingState, PermissionState, SectionCard, StateMessage, StatusBadge, SuccessState } from '../ui/design_system';

type GatekeeperDenialMessages = {
  forbidden: string;
  approvalRequired: string;
  apiUnavailable: string;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission';

type SectionSnapshot = {
  state: LoadState;
  message: string;
  value?: string;
};

type SettingsSnapshotKind = 'portal' | 'users' | 'groups' | 'hierarchy' | 'modules' | 'branding' | 'organizationProfile';

function resolveApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export function SettingsControlPanel({ denialMessages }: { denialMessages: GatekeeperDenialMessages }) {
  const { context, sessionState } = useLeadDeskOperatorContext();
  const [portalMode, setPortalMode] = useState<SectionSnapshot>({
    state: 'idle',
    message: 'Load portal mode from the existing Configuration API when a local/demo session is active.',
  });
  const [usersRoles, setUsersRoles] = useState<SectionSnapshot>({
    state: 'idle',
    message: 'Read-only users and roles can load when session context is active.',
  });
  const [groupsAccess, setGroupsAccess] = useState<SectionSnapshot>({
    state: 'idle',
    message: 'Read-only groups and access can load when session context is active.',
  });
  const [hierarchy, setHierarchy] = useState<SectionSnapshot>({
    state: 'idle',
    message: 'Read-only hierarchy can load when session context is active.',
  });
  const [modules, setModules] = useState<SectionSnapshot>({
    state: 'idle',
    message: 'Read-only module list can load from the existing module registry endpoint.',
  });
  const [branding, setBranding] = useState<SectionSnapshot>({
    state: 'idle',
    message: 'Read-only branding facts can load from the effective branding API.',
  });
  const [organizationProfile, setOrganizationProfile] = useState<SectionSnapshot>({
    state: 'idle',
    message: 'Read-only organization profile can load when session context is active.',
  });

  async function loadSettingsSnapshot(kind: SettingsSnapshotKind) {
    const base = resolveApiBase();
    if (!base) {
      updateSnapshot(kind, { state: 'error', message: denialMessages.apiUnavailable });
      return;
    }

    if (kind !== 'modules' && (sessionState !== 'active' || context.organizationId.trim().length === 0)) {
      updateSnapshot(kind, { state: 'permission', message: 'Set up session in Advanced Diagnostics before loading this section.' });
      return;
    }

    updateSnapshot(kind, { state: 'loading', message: 'Loading settings.' });

    const headers = context.sessionToken.trim().length > 0 ? { Authorization: `Bearer ${context.sessionToken.trim()}` } : undefined;
    const organizationPath = encodeURIComponent(context.organizationId.trim());
    const paths = {
      portal: `/platform/configuration/organizations/${organizationPath}/portal-mode`,
      users: `/platform/access/organizations/${organizationPath}/users`,
      groups: `/platform/access/organizations/${organizationPath}/groups`,
      hierarchy: `/platform/hierarchy/organizations/${organizationPath}/units`,
      modules: '/platform/modules',
      branding: '/platform/branding/effective',
      organizationProfile: '/platform/organization/profile',
    };

    try {
      const response = await fetch(`${base}${paths[kind]}`, { headers });
      if (response.status === 401 || response.status === 403) {
        updateSnapshot(kind, { state: 'permission', message: denialMessages.forbidden });
        return;
      }
      if (!response.ok) {
        updateSnapshot(kind, { state: 'error', message: denialMessages.apiUnavailable });
        return;
      }

      const payload = (await response.json()) as unknown;
      updateSnapshot(kind, { state: 'ready', message: describePayload(kind, payload), value: describePayload(kind, payload) });
    } catch {
      updateSnapshot(kind, { state: 'error', message: denialMessages.apiUnavailable });
    }
  }

  function updateSnapshot(kind: SettingsSnapshotKind, snapshot: SectionSnapshot) {
    const setters = {
      portal: setPortalMode,
      users: setUsersRoles,
      groups: setGroupsAccess,
      hierarchy: setHierarchy,
      modules: setModules,
      branding: setBranding,
      organizationProfile: setOrganizationProfile,
    };
    setters[kind](snapshot);
  }

  return (
    <main className="min-h-screen bg-[var(--phase5c-bg)] px-4 py-6 text-[var(--phase5c-text)] md:px-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="grid gap-4 rounded-lg border border-[var(--phase5c-border)] bg-[var(--phase5c-surface)] p-5 shadow-[var(--akti-glow-cyan)]">
          <Link className="text-sm font-medium text-[var(--primary)] underline underline-offset-4" href="/app">
            Back to Mission Control
          </Link>
          <div className="grid gap-2">
            <StatusBadge tone="info">{PLATFORM_PRODUCT_NAME} control panel</StatusBadge>
            <h1 className="m-0 text-2xl font-semibold">Settings</h1>
            <p className="m-0 max-w-3xl text-sm text-[#55605a]">
              Review supported settings, read-only admin surfaces, and future-phase placeholders without exposing
              unsupported write controls or fake data.
            </p>
          </div>
          <SessionStatusNotice state={sessionState} />
        </header>

        <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
          <nav className="grid h-fit gap-2 rounded-lg border border-[var(--phase5c-border)] bg-[var(--phase5c-surface)] p-3" aria-label="Settings section navigation">
            {[
              ['General', '#general'],
              ['Organization profile', '#organization-profile'],
              ['Users & Roles', '#users-roles'],
              ['Groups / Access', '#groups-access'],
              ['Hierarchy / Organization Structure', '#hierarchy'],
              ['Modules', '#modules'],
              ['Appearance', '#appearance'],
              ['Security', '#security'],
              ['Notifications', '#notifications'],
              ['Advanced Diagnostics', '#advanced-diagnostics'],
            ].map(([label, href]) => (
              <a key={href} className="rounded-md px-3 py-2 text-sm hover:bg-[var(--phase5c-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--akti-cyan)]" href={href}>
                {label}
              </a>
            ))}
          </nav>

          <div className="grid min-w-0 gap-4">
            <BuiltSection id="general" title="General / portal mode" snapshot={portalMode} onLoad={() => loadSettingsSnapshot('portal')} />
            <BuiltSection
              id="organization-profile"
              title="Organization profile"
              snapshot={organizationProfile}
              onLoad={() => loadSettingsSnapshot('organizationProfile')}
              note="Source: GET /platform/organization/profile. Read-only display only; no org switching, logo upload, or account rewrite."
            />
            <BuiltSection id="users-roles" title="Users & Roles" snapshot={usersRoles} onLoad={() => loadSettingsSnapshot('users')} />
            <BuiltSection id="groups-access" title="Groups / Access" snapshot={groupsAccess} onLoad={() => loadSettingsSnapshot('groups')} />
            <BuiltSection id="hierarchy" title="Hierarchy / Organization Structure" snapshot={hierarchy} onLoad={() => loadSettingsSnapshot('hierarchy')} />
            <BuiltSection id="modules" title="Modules" snapshot={modules} onLoad={() => loadSettingsSnapshot('modules')} />
            <BuiltSection
              id="appearance"
              title="Branding / Appearance"
              snapshot={branding}
              onLoad={() => loadSettingsSnapshot('branding')}
              note={`${PLATFORM_BRANDING.effectiveBrandingEndpoint}; read-only only. No logo upload, cropper, domain branding, or write UI.`}
            />
            <PlaceholderSection id="security" title="Security" phase="Phase 5A auth/security policy" />
            <PlaceholderSection id="notifications" title="Notifications" phase="Phase 5A notification/communication policy" />
            <section id="advanced-diagnostics" className="grid gap-3">
              <SectionHeading title="Advanced Diagnostics" disposition="Built / admin-gated" />
              <AdvancedDiagnosticsSessionPanel />
            </section>
            <SectionCard className="grid gap-3">
              <SectionHeading title="Gatekeeper denial messages" disposition="Exact copy required" />
              <ul className="m-0 grid gap-2 pl-5 text-sm text-[#55605a]">
                <li>{denialMessages.forbidden}</li>
                <li>{denialMessages.approvalRequired}</li>
                <li>{denialMessages.apiUnavailable}</li>
              </ul>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}

function BuiltSection({
  id,
  title,
  snapshot,
  onLoad,
  note,
}: {
  id: string;
  title: string;
  snapshot: SectionSnapshot;
  onLoad: () => void;
  note?: string;
}) {
  return (
    <SectionCard id={id} className="grid gap-3">
      <SectionHeading title={title} disposition="Built where current APIs safely support read-only proof" />
      {note ? <p className="m-0 text-sm text-[var(--phase5c-text-muted)]">{note}</p> : null}
      <SectionSnapshotMessage snapshot={snapshot} />
      <FormActions>
        <Button type="button" variant="secondary" onClick={onLoad} disabled={snapshot.state === 'loading'}>
          {snapshot.state === 'loading' ? 'Loading' : 'Load read-only view'}
        </Button>
      </FormActions>
    </SectionCard>
  );
}

function SectionSnapshotMessage({ snapshot }: { snapshot: SectionSnapshot }) {
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

  return <StateMessage title="Ready when connected" message={snapshot.message} />;
}

function PlaceholderSection({ id, title, phase }: { id: string; title: string; phase: string }) {
  return (
    <section id={id}>
      <EmptyState
        title={title}
        message={`Coming in a future phase: ${phase}. No functional controls are exposed here in Phase 4B.`}
      />
    </section>
  );
}

function SectionHeading({ title, disposition }: { title: string; disposition: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 text-lg font-semibold">{title}</h2>
      <StatusBadge>{disposition}</StatusBadge>
    </div>
  );
}

function describePayload(kind: SettingsSnapshotKind, payload: unknown): string {
  if (kind === 'portal' && payload && typeof payload === 'object' && 'mode' in payload) {
    return `Portal mode loaded: ${String((payload as { mode?: unknown }).mode)}`;
  }

  if (kind === 'branding' && payload && typeof payload === 'object') {
    const branding = payload as { product_name?: unknown; theme_mode?: unknown; logo_url?: unknown };
    return `Effective branding loaded: ${String(branding.product_name ?? PLATFORM_PRODUCT_NAME)}; theme ${String(
      branding.theme_mode ?? 'system',
    )}; logo ${branding.logo_url ? 'configured' : 'not configured'}.`;
  }

  if (kind === 'organizationProfile' && payload && typeof payload === 'object') {
    const profile = payload as { display_name?: unknown; short_name?: unknown; my_role?: unknown };
    return `Organization profile loaded: ${String(profile.display_name ?? 'Workspace')}; short name ${String(
      profile.short_name ?? 'not configured',
    )}; role ${String(profile.my_role ?? 'not available')}.`;
  }

  const items = Array.isArray((payload as { items?: unknown })?.items)
    ? ((payload as { items: unknown[] }).items)
    : Array.isArray(payload)
      ? payload
      : [];

  const labels = {
    users: 'users',
    groups: 'groups',
    hierarchy: 'hierarchy units',
    modules: 'modules',
    portal: 'portal mode',
    branding: 'branding facts',
    organizationProfile: 'organization profile facts',
  };

  return `${items.length} ${labels[kind]} loaded.`;
}
