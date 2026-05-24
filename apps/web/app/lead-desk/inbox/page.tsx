'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type LeadRow = {
  lead_id: string;
  full_name: string;
  status: string;
  assigned_user_id: string | null;
  source_ref: string;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission' | 'degraded';

function buildApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  return null;
}

export default function LeadDeskInboxPage() {
  const [organizationId, setOrganizationId] = useState('');
  const [actorUserId, setActorUserId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [state, setState] = useState<LoadState>('idle');
  const [message, setMessage] = useState('Enter organization and actor details to load the lead inbox.');

  const canLoad = organizationId.trim().length > 0 && actorUserId.trim().length > 0;
  const apiBase = useMemo(() => buildApiBase(), []);

  async function loadInbox() {
    if (!canLoad) {
      setState('error');
      setMessage('Organization and actor are required.');
      return;
    }

    if (!apiBase) {
      setState('degraded');
      setMessage('Lead inbox is limited because API base URL is not configured.');
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

    const endpoint = `${apiBase}/api/lead-desk/organizations/${encodeURIComponent(organizationId.trim())}/leads${
      params.size > 0 ? `?${params.toString()}` : ''
    }`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'x-actor-user-id': actorUserId.trim(),
        },
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
      setState('error');
      setMessage('Could not load inbox. Try again or contact support if the issue continues.');
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Lead Inbox</h1>
        <p className="text-sm text-gray-700">Review and open leads without leaving organization scope.</p>
      </header>

      <section className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Organization ID</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            placeholder="Enter organization ID"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Actor User ID</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={actorUserId}
            onChange={(event) => setActorUserId(event.target.value)}
            placeholder="Enter actor user ID"
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
          <button
            type="button"
            onClick={loadInbox}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={!canLoad || state === 'loading'}
          >
            {state === 'loading' ? 'Loading inbox' : 'Apply filters'}
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
                      href={`/lead-desk/leads/${encodeURIComponent(row.lead_id)}?organization_id=${encodeURIComponent(
                        organizationId.trim(),
                      )}&actor_user_id=${encodeURIComponent(actorUserId.trim())}`}
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
