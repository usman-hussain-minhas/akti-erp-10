'use client';

import Link from 'next/link';
import { RefreshCw, Shapes } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import { CRM_VISIBLE_LABEL } from '../../lib/crm-alias.config';
import { Button } from '../ui/button';
import { EmptyState, ErrorState, LoadingState, SectionCard, StatusBadge } from '../ui/design-system';

type ModuleRegistryItem = {
  module_key: string;
  display_name: string;
  version: string;
  status: string;
};

type ModuleListSnapshot =
  | { state: 'placeholder'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'ready'; items: ModuleRegistryItem[] }
  | { state: 'error'; message: string };

const MODULE_SURFACES: Record<string, { href?: string; description: string }> = {
  'core.access': {
    href: '/app/settings',
    description: 'Control panel, Access read surfaces, and Advanced Diagnostics.',
  },
  'engagement.gateway': {
    description: 'Shared messaging platform foundation. No operator screen is exposed in Phase 4B.',
  },
  'lead.desk': {
    href: '/lead-desk/inbox',
    description: `${CRM_VISIBLE_LABEL} inbox and intake work area using approved session context.`,
  },
};

function resolveApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export function ModuleLauncher() {
  const { context } = useLeadDeskOperatorContext();
  const [snapshot, setSnapshot] = useState<ModuleListSnapshot>({
    state: 'placeholder',
    message: 'Connect the local/demo API to load the module registry.',
  });
  const apiBase = useMemo(resolveApiBase, []);

  const loadModules = useCallback(async () => {
    if (!apiBase) {
      setSnapshot({
        state: 'placeholder',
        message: 'Connect the local/demo API to load the module registry.',
      });
      return;
    }

    setSnapshot({ state: 'loading', message: 'Loading modules.' });
    const headers = context.sessionToken.trim().length > 0 ? { Authorization: `Bearer ${context.sessionToken.trim()}` } : undefined;

    try {
      const response = await fetch(`${apiBase}/platform/modules`, { headers });
      if (!response.ok) {
        setSnapshot({ state: 'error', message: 'Module list is temporarily unavailable. Try again later.' });
        return;
      }

      const payload = (await response.json()) as { items?: ModuleRegistryItem[] };
      setSnapshot({ state: 'ready', items: Array.isArray(payload.items) ? payload.items : [] });
    } catch {
      setSnapshot({ state: 'error', message: 'Module list is temporarily unavailable. Try again later.' });
    }
  }, [apiBase, context.sessionToken]);

  useEffect(() => {
    if (!apiBase) {
      return;
    }

    void loadModules();
  }, [apiBase, loadModules]);

  return (
    <section className="grid gap-3" aria-labelledby="module-launcher-title">
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

      {snapshot.state === 'loading' ? <LoadingState message={snapshot.message} /> : null}
      {snapshot.state === 'placeholder' ? <EmptyState title="Module registry not connected" message={snapshot.message} /> : null}
      {snapshot.state === 'error' ? <ErrorState message={snapshot.message} /> : null}
      {snapshot.state === 'ready' && snapshot.items.length === 0 ? (
        <EmptyState title="No modules available" message="Available modules will appear after the local/demo registry is seeded." />
      ) : null}
      {snapshot.state === 'ready' && snapshot.items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {snapshot.items.map((item) => (
            <ModuleCard key={item.module_key} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ModuleCard({ item }: { item: ModuleRegistryItem }) {
  const surface = MODULE_SURFACES[item.module_key];
  const isAvailable = item.status === 'available';
  const description = surface?.description ?? 'Registered module with no Phase 4B shell surface yet.';

  return (
    <SectionCard className="grid min-w-0 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="m-0 text-base font-semibold">{item.display_name}</h3>
        <StatusBadge tone={isAvailable ? 'success' : 'warning'}>{isAvailable ? 'Available' : 'Unavailable'}</StatusBadge>
      </div>
      <p className="m-0 text-sm text-[#55605a]">{description}</p>
      <p className="m-0 text-xs text-[#66716a]">Version {item.version}</p>
      {surface?.href && isAvailable ? (
        <Button asChild variant="secondary">
          <Link href={surface.href}>Open work area</Link>
        </Button>
      ) : (
        <p className="m-0 text-sm text-[#66716a]">No operator screen is available for this module in Phase 4B.</p>
      )}
    </SectionCard>
  );
}
