'use client';

import Link from 'next/link';
import { RefreshCw, Shapes } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import {
  MODULES_ROUTE_ACTION_AUTHORITY,
  PHASE5C_MODULE_ROUTE_AUTHORITY,
  PHASE6_RUNTIME_NAVIGATION_AUTHORITY,
} from '../../lib/routes.config';
import { Button } from '../ui/button';
import { EmptyState, ErrorState, LoadingState, SectionCard, StatusBadge } from '../ui/design_system';

type ModuleRegistryItem = {
  module_key: string;
  display_name: string;
  display_description?: string;
  display_features?: string[];
  icon_key?: string;
  category?: string;
  route?: string | null;
  visibility_state?: 'available' | 'requires_setup' | 'locked' | 'coming_soon' | 'hidden';
  version: string;
  status: string;
  required_capabilities?: string[];
};

type ModuleListSnapshot =
  | { state: 'placeholder'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'ready'; items: ModuleRegistryItem[] }
  | { state: 'error'; message: string };

type Phase6RuntimeSurface = {
  surface_key: string;
  source_ffet: string;
  source_surface: string;
  capability_surface: string;
  activation_required: true;
  active: boolean;
};

type Phase6RuntimeStatus = {
  phase: '6A' | '6B' | '6C';
  activation_authority: 'foundry_runtime_authority';
  caller_controlled_activation_allowed: false;
  active_surface_count: number;
  inactive_surface_count: number;
  surfaces: readonly Phase6RuntimeSurface[];
};

export type Phase6RuntimeNavigationItem = {
  id: string;
  phase: Phase6RuntimeStatus['phase'];
  label: string;
  route: string;
  sourceFfet: string;
  capabilitySurface: string;
};

type Phase6RuntimeNavigationSnapshot =
  | { state: 'placeholder'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'ready'; items: Phase6RuntimeNavigationItem[]; inactiveCount: number }
  | { state: 'error'; message: string };

const MODULE_VISUAL_STATES = {
  available: {
    label: 'Available',
    tone: 'success',
    className: 'border-[rgb(18_217_123_/_.35)]',
    actionLabel: 'Open work area',
  },
  requires_setup: {
    label: 'Requires setup',
    tone: 'warning',
    className: 'border-[rgb(255_193_7_/_.35)]',
    actionLabel: 'Setup required',
  },
  locked: {
    label: 'Locked',
    tone: 'warning',
    className: 'border-[rgb(139_92_246_/_.25)] opacity-90',
    actionLabel: 'Locked',
  },
  coming_soon: {
    label: 'Coming soon',
    tone: 'neutral',
    className: 'border-[var(--phase5c-border)] opacity-85',
    actionLabel: 'Coming soon',
  },
  hidden: {
    label: 'Hidden',
    tone: 'neutral',
    className: 'hidden',
    actionLabel: 'Hidden',
  },
} as const;

function resolveApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export function buildPhase6RuntimeNavigationItems(statuses: readonly Phase6RuntimeStatus[]): Phase6RuntimeNavigationItem[] {
  return statuses.flatMap((status) =>
    status.surfaces
      .filter((surface) => surface.active)
      .map((surface) => ({
        id: `${status.phase}:${surface.surface_key}`,
        phase: status.phase,
        label: `${status.phase} ${surface.source_surface}`,
        route: PHASE6_RUNTIME_NAVIGATION_AUTHORITY.shellAnchorRoute,
        sourceFfet: surface.source_ffet,
        capabilitySurface: surface.capability_surface,
      })),
  );
}

function countInactivePhase6Surfaces(statuses: readonly Phase6RuntimeStatus[]): number {
  return statuses.reduce((count, status) => count + status.surfaces.filter((surface) => !surface.active).length, 0);
}

async function fetchModuleRegistryItems(apiBase: string, headers: Record<string, string> | undefined): Promise<ModuleRegistryItem[]> {
  const response = await fetch(`${apiBase}/platform/modules`, { headers });
  if (!response.ok) {
    throw new Error('module_registry_unavailable');
  }

  const payload = (await response.json()) as { items?: ModuleRegistryItem[] };
  return Array.isArray(payload.items) ? payload.items : [];
}

async function fetchPhase6RuntimeStatuses(apiBase: string, headers: Record<string, string> | undefined): Promise<Phase6RuntimeStatus[]> {
  return Promise.all(
    PHASE6_RUNTIME_NAVIGATION_AUTHORITY.statusEndpoints.map(async (endpoint) => {
      const response = await fetch(`${apiBase}${endpoint.route.replace('GET ', '')}`, { headers });
      if (!response.ok) {
        throw new Error(`${endpoint.phase.toLowerCase()}_runtime_status_unavailable`);
      }

      return (await response.json()) as Phase6RuntimeStatus;
    }),
  );
}

export function ModuleLauncher() {
  const { context } = useLeadDeskOperatorContext();
  const [snapshot, setSnapshot] = useState<ModuleListSnapshot>({
    state: 'placeholder',
    message: 'Connect the local/demo API to load the module registry.',
  });
  const [phase6Snapshot, setPhase6Snapshot] = useState<Phase6RuntimeNavigationSnapshot>({
    state: 'placeholder',
    message: 'Connect the local/demo API to load activation-aware Phase 6A-6C navigation.',
  });
  const apiBase = useMemo(resolveApiBase, []);

  const loadModules = useCallback(async () => {
    if (!apiBase) {
      setSnapshot({
        state: 'placeholder',
        message: 'Connect the local/demo API to load the module registry.',
      });
      setPhase6Snapshot({
        state: 'placeholder',
        message: 'Connect the local/demo API to load activation-aware Phase 6A-6C navigation.',
      });
      return;
    }

    setSnapshot({ state: 'loading', message: 'Loading modules.' });
    setPhase6Snapshot({ state: 'loading', message: 'Loading Phase 6A-6C activation navigation.' });
    const headers = context.sessionToken.trim().length > 0 ? { Authorization: `Bearer ${context.sessionToken.trim()}` } : undefined;

    try {
      const [moduleItems, phase6Statuses] = await Promise.all([
        fetchModuleRegistryItems(apiBase, headers),
        fetchPhase6RuntimeStatuses(apiBase, headers),
      ]);
      setSnapshot({ state: 'ready', items: moduleItems });
      setPhase6Snapshot({
        state: 'ready',
        items: buildPhase6RuntimeNavigationItems(phase6Statuses),
        inactiveCount: countInactivePhase6Surfaces(phase6Statuses),
      });
    } catch {
      setSnapshot({ state: 'error', message: 'Module list is temporarily unavailable. Try again later.' });
      setPhase6Snapshot({ state: 'error', message: 'Phase 6A-6C activation navigation is temporarily unavailable.' });
    }
  }, [apiBase, context.sessionToken]);

  useEffect(() => {
    if (!apiBase) {
      return;
    }

    void loadModules();
  }, [apiBase, loadModules]);

  return (
    <section id="module-launcher" className="grid scroll-mt-28 gap-3" aria-labelledby="module-launcher-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shapes aria-hidden="true" size={18} />
          <h2 id="module-launcher-title" className="m-0 text-lg font-semibold">
            Module launcher
          </h2>
        </div>
        <Button type="button" variant="secondary" onClick={loadModules}>
          <RefreshCw aria-hidden="true" size={16} />
          Refresh modules
        </Button>
      </div>

      <p className="m-0 max-w-3xl text-sm text-[#55605a]">
        This read-only list uses the current module registry when the local/demo API is connected. Module lifecycle
        actions remain out of Phase 4B.
      </p>
      <p className="m-0 max-w-3xl text-xs text-[var(--phase5c-text-muted)]">
        Modules route action authority uses {MODULES_ROUTE_ACTION_AUTHORITY.dataSource}. A working Open Modules action
        requires an approved {MODULES_ROUTE_ACTION_AUTHORITY.deferredRoute} frontend route; until then, this area may
        show module availability and status only.
      </p>
      <PlatformModulesSurfaceCard />
      <Phase6RuntimeNavigationCard snapshot={phase6Snapshot} />

      {snapshot.state === 'loading' ? <LoadingState message={snapshot.message} /> : null}
      {snapshot.state === 'placeholder' ? <EmptyState title="Module registry not connected" message={snapshot.message} /> : null}
      {snapshot.state === 'error' ? <ErrorState message={snapshot.message} /> : null}
      {snapshot.state === 'ready' && snapshot.items.length === 0 ? (
        <EmptyState title="No modules available" message="Available modules will appear after the local/demo registry is seeded." />
      ) : null}
      {snapshot.state === 'ready' && snapshot.items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.items.filter(isVisibleModule).map((item) => (
            <ModuleCard key={item.module_key} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Phase6RuntimeNavigationCard({ snapshot }: { snapshot: Phase6RuntimeNavigationSnapshot }) {
  return (
    <SectionCard className="grid gap-3 border-[rgb(18_217_123_/_.28)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="m-0 text-base font-semibold">Phase 6A-6C runtime capabilities</h3>
        <StatusBadge tone={snapshot.state === 'ready' && snapshot.items.length > 0 ? 'success' : 'neutral'}>
          Foundry governed
        </StatusBadge>
      </div>
      <p className="m-0 text-sm text-[#55605a]">
        Navigation is driven by {PHASE6_RUNTIME_NAVIGATION_AUTHORITY.activationAuthority}; inactive services are not
        rendered as openable links.
      </p>
      <p className="m-0 text-xs text-[var(--phase5c-text-muted)]">
        Screen contract: {PHASE6_RUNTIME_NAVIGATION_AUTHORITY.screenContract}. Direct inactive route behavior:{' '}
        {PHASE6_RUNTIME_NAVIGATION_AUTHORITY.directInactiveRouteBehavior}.
      </p>
      {snapshot.state === 'loading' ? <LoadingState message={snapshot.message} /> : null}
      {snapshot.state === 'placeholder' ? <EmptyState title="Phase 6 navigation not connected" message={snapshot.message} /> : null}
      {snapshot.state === 'error' ? <ErrorState message={snapshot.message} /> : null}
      {snapshot.state === 'ready' && snapshot.items.length === 0 ? (
        <EmptyState
          title="No activated Phase 6A-6C services"
          message={`${snapshot.inactiveCount} inactive service surface(s) are hidden until Foundry activation permits navigation.`}
        />
      ) : null}
      {snapshot.state === 'ready' && snapshot.items.length > 0 ? (
        <div className="grid gap-2">
          {snapshot.items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--phase5c-border)] p-3">
              <div className="grid gap-1">
                <p className="m-0 text-sm font-semibold">{item.label}</p>
                <p className="m-0 text-xs text-[var(--phase5c-text-muted)]">
                  {item.capabilitySurface} from {item.sourceFfet}
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href={item.route}>Open runtime shell</Link>
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </SectionCard>
  );
}

function ModuleCard({ item }: { item: ModuleRegistryItem }) {
  const visibilityState = item.visibility_state ?? 'locked';
  const visualState = MODULE_VISUAL_STATES[visibilityState];
  const isAvailable = visibilityState === 'available' && item.status === 'available';
  const description = item.display_description ?? 'Registered module with no approved display description.';
  const moduleRoute = resolveApprovedModuleRoute(item);
  const displayFeatures = Array.isArray(item.display_features)
    ? item.display_features.filter((feature) => feature.trim().length > 0)
    : [];
  const routeAuthorityNotice =
    MODULES_ROUTE_ACTION_AUTHORITY.approvedRoute === null
      ? `Open Modules action is disabled until ${MODULES_ROUTE_ACTION_AUTHORITY.deferredRoute} route authority is approved.`
      : null;

  return (
    <SectionCard className={`grid min-w-0 gap-3 ${visualState.className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="m-0 text-base font-semibold">{item.display_name}</h3>
        <StatusBadge tone={visualState.tone}>{visualState.label}</StatusBadge>
      </div>
      <p className="m-0 text-sm text-[#55605a]">{description}</p>
      <p className="m-0 text-xs text-[var(--phase5c-text-muted)]">
        Source: GET /platform/modules. Visibility does not equal authority.
      </p>
      {displayFeatures.length > 0 ? (
        <ul className="m-0 grid gap-1 pl-4 text-sm text-[var(--phase5c-text-muted)]" aria-label={`${item.display_name} features`}>
          {displayFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      ) : null}
      <p className="m-0 text-xs text-[#66716a]">Version {item.version}</p>
      {moduleRoute && isAvailable ? (
        <Button asChild variant="secondary">
          <Link href={moduleRoute}>{visualState.actionLabel}</Link>
        </Button>
      ) : (
        <p className="m-0 text-sm text-[#66716a]">
          {visualState.actionLabel}. No approved operator route is available for this module.
        </p>
      )}
      {routeAuthorityNotice ? <p className="m-0 text-xs text-[var(--phase5c-text-muted)]">{routeAuthorityNotice}</p> : null}
    </SectionCard>
  );
}

function PlatformModulesSurfaceCard() {
  return (
    <SectionCard className="grid gap-3 border-[rgb(0_213_255_/_.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="m-0 text-base font-semibold">Modules</h3>
        <StatusBadge tone="success">Active platform surface</StatusBadge>
      </div>
      <p className="m-0 text-sm text-[#55605a]">
        The Modules card is a legitimate Phase 5B1 platform surface backed by {PHASE5C_MODULE_ROUTE_AUTHORITY.dataSource}.
        It is distinct from future business-module cards.
      </p>
      <p className="m-0 text-xs text-[var(--phase5c-text-muted)]">
        Open Modules action is conditional on an approved {MODULES_ROUTE_ACTION_AUTHORITY.deferredRoute} frontend route.
        Until that route exists, this surface shows availability and status only.
      </p>
    </SectionCard>
  );
}

function isVisibleModule(item: ModuleRegistryItem): boolean {
  return item.visibility_state !== 'hidden';
}

function resolveApprovedModuleRoute(item: ModuleRegistryItem): string | null {
  const rawRoute = typeof item.route === 'string' && item.route.trim().length > 0 ? item.route.trim() : null;
  if (!rawRoute) {
    return null;
  }

  const normalizedRoute = item.module_key === 'lead.desk' && rawRoute === '/lead-desk' ? '/lead-desk/inbox' : rawRoute;
  if (item.category === 'business' && item.module_key !== 'lead.desk') {
    return null;
  }

  return PHASE5C_MODULE_ROUTE_AUTHORITY.approvedModuleRoutes.includes(
    normalizedRoute as (typeof PHASE5C_MODULE_ROUTE_AUTHORITY.approvedModuleRoutes)[number],
  )
    ? normalizedRoute
    : null;
}
