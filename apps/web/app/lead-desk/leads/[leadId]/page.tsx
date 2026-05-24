'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

type LeadDetail = {
  lead_id: string;
  full_name: string;
  phone_e164: string;
  source_ref: string;
  status: string;
  assigned_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission' | 'degraded' | 'not_found';

function apiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export default function LeadDeskDetailPage() {
  const params = useParams<{ leadId: string }>();
  const query = useSearchParams();

  const routeLeadId = decodeURIComponent(params.leadId);
  const [organizationId, setOrganizationId] = useState(query.get('organization_id') ?? '');
  const [actorUserId, setActorUserId] = useState(query.get('actor_user_id') ?? '');
  const [state, setState] = useState<LoadState>('idle');
  const [message, setMessage] = useState('Open lead detail with organization and actor context.');
  const [lead, setLead] = useState<LeadDetail | null>(null);

  const base = useMemo(() => apiBase(), []);
  const canLoad = organizationId.trim().length > 0 && actorUserId.trim().length > 0;

  async function loadDetail() {
    if (!canLoad) {
      setState('error');
      setMessage('Organization and actor are required.');
      return;
    }

    if (!base) {
      setState('degraded');
      setMessage('Lead detail is limited because API base URL is not configured.');
      return;
    }

    setState('loading');
    setMessage('Lead details are loading.');

    const endpoint = `${base}/api/lead-desk/organizations/${encodeURIComponent(organizationId.trim())}/leads/${encodeURIComponent(
      routeLeadId,
    )}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'x-actor-user-id': actorUserId.trim(),
        },
      });

      if (response.status === 401 || response.status === 403) {
        setLead(null);
        setState('permission');
        setMessage('You do not have permission to view this lead detail.');
        return;
      }

      if (response.status === 404) {
        setLead(null);
        setState('not_found');
        setMessage('This lead is not available in the selected organization.');
        return;
      }

      if (!response.ok) {
        setLead(null);
        setState('error');
        setMessage('Could not load lead. Try again or contact support if the issue continues.');
        return;
      }

      const payload = (await response.json()) as LeadDetail;
      setLead(payload);
      setState('ready');
      setMessage('Lead detail loaded.');
    } catch {
      setLead(null);
      setState('error');
      setMessage('Could not load lead. Try again or contact support if the issue continues.');
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Lead Detail</h1>
        <p className="text-sm text-gray-700">Review one lead and open approved status or assignment actions.</p>
      </header>

      <section className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Lead ID</span>
          <input className="w-full rounded border border-gray-300 px-3 py-2" value={routeLeadId} disabled />
        </label>
        <label className="space-y-1 text-sm">
          <span>Organization ID</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            placeholder="Enter organization ID"
          />
        </label>
        <label className="space-y-1 text-sm md:col-span-2">
          <span>Actor User ID</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={actorUserId}
            onChange={(event) => setActorUserId(event.target.value)}
            placeholder="Enter actor user ID"
          />
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="button"
            onClick={loadDetail}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={!canLoad || state === 'loading'}
          >
            {state === 'loading' ? 'Loading lead' : 'View lead record'}
          </button>
          <span className="text-sm text-gray-600">{message}</span>
        </div>
      </section>

      {state === 'loading' ? <p className="rounded border border-blue-200 bg-blue-50 p-3 text-sm">Loading lead.</p> : null}
      {state === 'permission' ? (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">Access needed: you do not have permission to view this lead detail.</p>
      ) : null}
      {state === 'degraded' ? (
        <p className="rounded border border-orange-200 bg-orange-50 p-3 text-sm">Limited detail mode: API base URL is not configured.</p>
      ) : null}
      {state === 'error' ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm">Could not load lead. Try again or contact support if the issue continues.</p>
      ) : null}
      {state === 'not_found' ? (
        <p className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">Lead not found in selected organization.</p>
      ) : null}

      {lead ? (
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <dl className="grid gap-3 md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Lead name</dt>
              <dd className="text-sm">{lead.full_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Phone number</dt>
              <dd className="text-sm">{lead.phone_e164}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Source reference</dt>
              <dd className="text-sm">{lead.source_ref}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Status</dt>
              <dd className="text-sm">{lead.status}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Assigned owner</dt>
              <dd className="text-sm">{lead.assigned_user_id ?? 'Unassigned'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Updated at</dt>
              <dd className="text-sm">{new Date(lead.updated_at).toLocaleString()}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              href={`/lead-desk/leads/${encodeURIComponent(routeLeadId)}/actions?organization_id=${encodeURIComponent(
                organizationId.trim(),
              )}&actor_user_id=${encodeURIComponent(actorUserId.trim())}`}
            >
              Open status or assignment
            </Link>
            <Link
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              href={`/lead-desk/inbox?organization_id=${encodeURIComponent(organizationId.trim())}&actor_user_id=${encodeURIComponent(
                actorUserId.trim(),
              )}`}
            >
              Back to inbox
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
