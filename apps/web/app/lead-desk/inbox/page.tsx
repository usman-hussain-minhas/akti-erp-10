'use client';

import Link from 'next/link';
import { useState } from 'react';

import { hasOperatorContext, leadDeskApiFetch } from '../api-client';
import { LeadDeskWorkspace } from '../lead-desk-workspace';
import { useLeadDeskOperatorContext } from '../operator-context';
import { CRM_INBOX_VISIBLE_LABEL, CRM_VISIBLE_LABEL } from '../../../lib/crm-alias.config';
import { Button } from '../../../components/ui/button';
import {
  DataTable,
  DegradedState,
  EmptyState,
  ErrorState,
  Field,
  FormActions,
  Input,
  LoadingState,
  PermissionState,
  SectionCard,
  StateMessage,
} from '../../../components/ui/design-system';

type LeadRow = {
  lead_id: string;
  full_name: string;
  status: string;
  assigned_user_id: string | null;
  source_ref: string;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission' | 'degraded';

export default function LeadDeskInboxPage() {
  const { context, sessionState } = useLeadDeskOperatorContext();
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [state, setState] = useState<LoadState>('idle');
  const [message, setMessage] = useState(`Set up session in Advanced Diagnostics to load the ${CRM_VISIBLE_LABEL} inbox.`);

  const canLoad = hasOperatorContext(context);

  async function loadInbox() {
    if (!canLoad) {
      setState('permission');
      setMessage(`Set up session in Advanced Diagnostics before loading the ${CRM_VISIBLE_LABEL} inbox.`);
      return;
    }

    setState('loading');
    setMessage(`${CRM_VISIBLE_LABEL} records are loading.`);

    const params = new URLSearchParams();
    if (statusFilter.trim()) {
      params.set('status', statusFilter.trim());
    }
    if (assignedFilter.trim()) {
      params.set('assigned_user_id', assignedFilter.trim());
    }

    try {
      const response = await leadDeskApiFetch(context, `/leads${params.size > 0 ? `?${params.toString()}` : ''}`, {
        method: 'GET',
      });

      if (response.status === 401 || response.status === 403) {
        setRows([]);
        setState('permission');
        setMessage(`You do not have permission to view the ${CRM_VISIBLE_LABEL} inbox.`);
        return;
      }

      if (!response.ok) {
        setRows([]);
        setState('error');
        setMessage(`${CRM_VISIBLE_LABEL} inbox is temporarily unavailable. Try again later.`);
        return;
      }

      const payload = (await response.json()) as { items?: LeadRow[] };
      const items = Array.isArray(payload.items) ? payload.items : [];
      setRows(items);
      setState('ready');
      setMessage(items.length === 0 ? `There are no ${CRM_VISIBLE_LABEL} records matching the current filters.` : `${CRM_VISIBLE_LABEL} inbox loaded.`);
    } catch {
      setRows([]);
      setState('degraded');
      setMessage(`${CRM_VISIBLE_LABEL} inbox is limited because the local/demo API is not connected.`);
    }
  }

  return (
    <LeadDeskWorkspace
      title={CRM_INBOX_VISIBLE_LABEL}
      description={`${CRM_VISIBLE_LABEL} is the visible label for the existing Lead Desk technical surface. Review current records with safe session status, clear filters, and no raw technical session details.`}
      sessionState={sessionState}
    >
      <SectionCard className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Status filter" helperText="Use the current contract status terms until product terminology is finalized.">
            <Input
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              placeholder="new, contacted, qualified, closed"
            />
          </Field>
          <Field label="Assigned owner reference" helperText="Optional filter. Friendly owner lookup is deferred until a backend surface exists.">
            <Input
              value={assignedFilter}
              onChange={(event) => setAssignedFilter(event.target.value)}
              placeholder="Optional owner reference"
            />
          </Field>
        </div>

        <FormActions>
          <Button type="button" onClick={loadInbox} disabled={!canLoad || state === 'loading'}>
            {state === 'loading' ? `Loading ${CRM_VISIBLE_LABEL} inbox` : `Load ${CRM_VISIBLE_LABEL} inbox`}
          </Button>
          <StateMessage title="Inbox status" message={message} />
        </FormActions>
      </SectionCard>

      <LeadDeskState state={state} message={message} empty={rows.length === 0} />

      {rows.length > 0 ? (
        <DataTable>
          <thead className="bg-[var(--surface-muted)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Lead name</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Assigned owner</th>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.lead_id} className="border-t border-[var(--border)] hover:bg-[var(--surface-muted)] focus-within:bg-[var(--surface-muted)]">
                <td className="px-3 py-2">{row.full_name}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">{row.assigned_user_id ? 'Assigned' : 'Unassigned'}</td>
                <td className="px-3 py-2">{row.source_ref}</td>
                <td className="px-3 py-2">
                  <Button asChild variant="secondary">
                    <Link href={`/lead-desk/leads/${encodeURIComponent(row.lead_id)}`}>Open</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : null}
    </LeadDeskWorkspace>
  );
}

function LeadDeskState({ state, message, empty }: { state: LoadState; message: string; empty: boolean }) {
  if (state === 'loading') {
    return <LoadingState message="Loading CRM inbox." />;
  }

  if (state === 'permission') {
    return <PermissionState message="You do not have permission to view the CRM inbox." />;
  }

  if (state === 'degraded') {
    return <DegradedState message="CRM inbox is limited because the local/demo API is not connected." />;
  }

  if (state === 'error') {
    return <ErrorState message="CRM inbox is temporarily unavailable. Try again later." />;
  }

  if (state === 'ready' && empty) {
    return <EmptyState title="No CRM records waiting" message="There are no CRM records matching the current filters." />;
  }

  if (state === 'idle') {
    return <StateMessage title="Ready when session is active" message={message} />;
  }

  return null;
}
