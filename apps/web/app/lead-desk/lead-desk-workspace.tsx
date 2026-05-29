'use client';

import Link from 'next/link';
import { ClipboardList, LayoutDashboard, Plus, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import type { OperatorSessionState } from './operator-context';
import { CRM_VISIBLE_LABEL } from '../../lib/crm-alias.config';
import { SessionStatusNotice } from '../../components/session/session-status';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/design-system';

export function LeadDeskWorkspace({
  title,
  description,
  sessionState,
  children,
}: {
  title: string;
  description: string;
  sessionState: OperatorSessionState;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] md:px-6">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-2">
              <StatusBadge tone="info">{CRM_VISIBLE_LABEL}</StatusBadge>
              <h1 className="m-0 text-2xl font-semibold">{title}</h1>
              <p className="m-0 max-w-3xl text-sm text-[#55605a]">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary">
                <Link href="/app">
                  <LayoutDashboard aria-hidden="true" size={16} />
                  Mission Control
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/app/settings">
                  <Settings aria-hidden="true" size={16} />
                  Advanced Diagnostics
                </Link>
              </Button>
            </div>
          </div>
          <SessionStatusNotice state={sessionState} />
          <nav className="flex flex-wrap gap-2 rounded-lg border border-[var(--border)] bg-white p-3" aria-label={`${CRM_VISIBLE_LABEL} navigation`}>
            <LeadDeskNavLink href="/lead-desk/inbox" label="Inbox" icon={<ClipboardList aria-hidden="true" size={16} />} />
            <LeadDeskNavLink href="/lead-desk/create" label="Create lead" icon={<Plus aria-hidden="true" size={16} />} />
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}

function LeadDeskNavLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-[var(--surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      {icon}
      {label}
    </Link>
  );
}
