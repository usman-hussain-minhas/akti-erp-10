'use client';

import Link from 'next/link';
import { useState } from 'react';

import { hasOperatorContext, leadDeskApiFetch } from '../api-client';
import { useLeadDeskOperatorContext } from '../operator-context';

type LeadRow = {
  lead_id: string;
  full_name: string;
  status: string;
  assigned_user_id: string | null;
  source_ref: string;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission' | 'degraded';

export default function LeadDeskInboxPage() {
  const { context, hasContext, updateContext } = useLeadDeskOperatorContext();
  const [sessionTokenDraft, setSessionTokenDraft] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [state, setState] = useState<LoadState>('idle');
  const [message, setMessage] = useState('Set session context to load the lead inbox.');

  const canSetContext = sessionTokenDraft.trim().length > 0;
  const canLoad = hasOperatorContext(context);

  function applyContext() {
    if (!canSetContext) {
      setState('error');
      setMessage('Session token is required.');
      return;
    }
    const applied = updateContext({ sessionToken: sessionTokenDraft });
    setMessage(applied ? 'Session context applied.' : 'Session token must include organization and actor context.');
  }

  async function loadInbox() {
    if (!canLoad) {
      setState('permission');
      setMessage('Set session context before loading inbox.');
      return;
    }

    setState('loading');
    setMessage('Lead records are loading.');

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
        setMessage('You do not have permission to view the lead inbox.');
        return;
      }

      if (!response.ok) {
        setRows([]);
        setState('error');
        setMessage('Could not load inbox. Try again or contact support if the issue continues.');
        return;
      }

      const payload = (await response.json()) as { items?: LeadRow[] };
      const items = Array.isArray(payload.items) ? payload.items : [];
      setRows(items);
      setState('ready');

      if (items.length === 0) {
        setMessage('There are no leads matching the current filters.');
      } else {
        setMessage('Lead inbox loaded.');
      }
    } catch {
      setRows([]);
      setState('degraded');
      setMessage('Lead inbox is limited because API base URL is not configured.');
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Lead Inbox</h1>
        <p className="text-sm text-gray-700">Review and open leads without leaving organization scope.</p>
        <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          Session context: {hasContext ? `${context.organizationId} / ${context.actorUserId}` : 'not set'}
        </p>
      </header>

      <section className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm md:col-span-2">
          <span>Phase 3 session token</span>
          <textarea
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={sessionTokenDraft}
            onChange={(event) => setSessionTokenDraft(event.target.value)}
            rows={3}
            placeholder="Paste bearer session token"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Status filter</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="new, contacted, qualified, closed"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Assigned owner filter</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={assignedFilter}
            onChange={(event) => setAssignedFilter(event.target.value)}
            placeholder="User ID"
          />
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button type="button" onClick={applyContext} className="rounded border border-gray-300 px-4 py-2 text-sm" disabled={!canSetContext}>
            Set context
          </button>
          <button type="button" onClick={loadInbox} className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={!canLoad || state === 'loading'}>
            {state === 'loading' ? 'Loading inbox' : 'Load inbox'}
          </button>
          <span className="text-sm text-gray-600">{message}</span>
        </div>
      </section>

      {state === 'loading' ? <p className="rounded border border-blue-200 bg-blue-50 p-3 text-sm">Loading inbox.</p> : null}
      {state === 'permission' ? (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">Access needed: you do not have permission to view the lead inbox.</p>
      ) : null}
      {state === 'degraded' ? (
        <p className="rounded border border-orange-200 bg-orange-50 p-3 text-sm">Limited inbox: API base URL is not configured.</p>
      ) : null}
      {state === 'error' ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm">Could not load inbox. Try again or contact support if the issue continues.</p>
      ) : null}

      {state === 'ready' && rows.length === 0 ? (
        <p className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">No leads waiting.</p>
      ) : null}

      {rows.length > 0 ? (
        <section className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
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
                <tr key={row.lead_id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{row.full_name}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.assigned_user_id ?? 'Unassigned'}</td>
                  <td className="px-3 py-2">{row.source_ref}</td>
                  <td className="px-3 py-2">
                    <Link
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                      href={`/lead-desk/leads/${encodeURIComponent(row.lead_id)}`}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </main>
  );
}
