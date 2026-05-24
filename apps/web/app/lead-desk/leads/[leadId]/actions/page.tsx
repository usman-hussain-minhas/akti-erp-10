'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

type LeadDetail = {
  lead_id: string;
  full_name: string;
  status: string;
  assigned_user_id: string | null;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission' | 'degraded' | 'not_found';

type ActionState = 'idle' | 'submitting' | 'success' | 'error' | 'permission';

function apiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export default function LeadDeskActionsPage() {
  const params = useParams<{ leadId: string }>();
  const query = useSearchParams();

  const routeLeadId = decodeURIComponent(params.leadId);
  const [organizationId, setOrganizationId] = useState(query.get('organization_id') ?? '');
  const [actorUserId, setActorUserId] = useState(query.get('actor_user_id') ?? '');

  const [detailState, setDetailState] = useState<LoadState>('idle');
  const [detailMessage, setDetailMessage] = useState('Load lead context to update status or assignment.');
  const [lead, setLead] = useState<LeadDetail | null>(null);

  const [statusValue, setStatusValue] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [assigneeUserId, setAssigneeUserId] = useState('');

  const [statusActionState, setStatusActionState] = useState<ActionState>('idle');
  const [statusActionMessage, setStatusActionMessage] = useState('');
  const [assignActionState, setAssignActionState] = useState<ActionState>('idle');
  const [assignActionMessage, setAssignActionMessage] = useState('');

  const base = useMemo(() => apiBase(), []);
  const canLoad = organizationId.trim().length > 0 && actorUserId.trim().length > 0;

  async function loadLeadContext() {
    if (!canLoad) {
      setDetailState('error');
      setDetailMessage('Organization and actor are required.');
      return;
    }

    if (!base) {
      setDetailState('degraded');
      setDetailMessage('Lead actions are limited because API base URL is not configured.');
      return;
    }

    setDetailState('loading');
    setDetailMessage('Loading lead action context.');

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
        setDetailState('permission');
        setDetailMessage('You do not have permission to update lead status or assignment.');
        return;
      }

      if (response.status === 404) {
        setLead(null);
        setDetailState('not_found');
        setDetailMessage('A lead must be selected before status or assignment can be changed.');
        return;
      }

      if (!response.ok) {
        setLead(null);
        setDetailState('error');
        setDetailMessage('Could not load lead context. Check values and try again.');
        return;
      }

      const payload = (await response.json()) as LeadDetail;
      setLead(payload);
      setStatusValue(payload.status);
      setAssigneeUserId(payload.assigned_user_id ?? '');
      setDetailState('ready');
      setDetailMessage('Lead action context loaded.');
    } catch {
      setLead(null);
      setDetailState('error');
      setDetailMessage('Could not load lead context. Check values and try again.');
    }
  }

  async function submitStatusUpdate() {
    if (!lead) {
      setStatusActionState('error');
      setStatusActionMessage('Load a lead before updating status.');
      return;
    }

    if (!statusValue.trim()) {
      setStatusActionState('error');
      setStatusActionMessage('Status is required.');
      return;
    }

    if (!base) {
      setStatusActionState('error');
      setStatusActionMessage('Status updates are temporarily limited.');
      return;
    }

    setStatusActionState('submitting');
    setStatusActionMessage('Submitting status update.');

    const endpoint = `${base}/api/lead-desk/organizations/${encodeURIComponent(organizationId.trim())}/leads/${encodeURIComponent(
      routeLeadId,
    )}/status`;

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'x-actor-user-id': actorUserId.trim(),
        },
        body: JSON.stringify({
          status: statusValue.trim(),
          reason: statusReason.trim().length > 0 ? statusReason.trim() : undefined,
          requested_at: new Date().toISOString(),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        setStatusActionState('permission');
        setStatusActionMessage('You do not have permission to update status.');
        return;
      }

      if (!response.ok) {
        setStatusActionState('error');
        setStatusActionMessage('Could not apply status update. Check values and try again.');
        return;
      }

      const payload = (await response.json()) as { status: string };
      setLead((current) => (current ? { ...current, status: payload.status } : current));
      setStatusActionState('success');
      setStatusActionMessage('Lead status updated.');
    } catch {
      setStatusActionState('error');
      setStatusActionMessage('Could not apply status update. Check values and try again.');
    }
  }

  async function submitAssignmentUpdate() {
    if (!lead) {
      setAssignActionState('error');
      setAssignActionMessage('Load a lead before assigning.');
      return;
    }

    if (!assigneeUserId.trim()) {
      setAssignActionState('error');
      setAssignActionMessage('Assigned user ID is required.');
      return;
    }

    if (!base) {
      setAssignActionState('error');
      setAssignActionMessage('Assignment updates are temporarily limited.');
      return;
    }

    setAssignActionState('submitting');
    setAssignActionMessage('Submitting assignment update.');

    const endpoint = `${base}/api/lead-desk/organizations/${encodeURIComponent(organizationId.trim())}/leads/${encodeURIComponent(
      routeLeadId,
    )}/assignment`;

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'x-actor-user-id': actorUserId.trim(),
        },
        body: JSON.stringify({
          assigned_user_id: assigneeUserId.trim(),
          requested_at: new Date().toISOString(),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        setAssignActionState('permission');
        setAssignActionMessage('You do not have permission to assign this lead.');
        return;
      }

      if (!response.ok) {
        setAssignActionState('error');
        setAssignActionMessage('Could not apply assignment update. Check values and try again.');
        return;
      }

      const payload = (await response.json()) as { assigned_user_id: string };
      setLead((current) => (current ? { ...current, assigned_user_id: payload.assigned_user_id } : current));
      setAssignActionState('success');
      setAssignActionMessage('Lead assignment updated.');
    } catch {
      setAssignActionState('error');
      setAssignActionMessage('Could not apply assignment update. Check values and try again.');
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Lead Status and Assignment</h1>
        <p className="text-sm text-gray-700">Update status and assignment with organization-scoped checks.</p>
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
            onClick={loadLeadContext}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={!canLoad || detailState === 'loading'}
          >
            {detailState === 'loading' ? 'Loading lead' : 'Load lead context'}
          </button>
          <span className="text-sm text-gray-600">{detailMessage}</span>
        </div>
      </section>

      {detailState === 'permission' ? (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">Access needed: you do not have permission to update lead status or assignment.</p>
      ) : null}
      {detailState === 'degraded' ? (
        <p className="rounded border border-orange-200 bg-orange-50 p-3 text-sm">Status and assignment actions are temporarily limited.</p>
      ) : null}
      {detailState === 'error' ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm">Could not apply update. Check selected values and try again.</p>
      ) : null}
      {detailState === 'not_found' ? (
        <p className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">A lead must be selected before status or assignment can be changed.</p>
      ) : null}

      {lead ? (
        <section className="space-y-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Current lead</p>
            <p className="text-sm text-gray-700">{lead.full_name}</p>
            <p className="text-sm text-gray-700">Current status: {lead.status}</p>
            <p className="text-sm text-gray-700">Assigned owner: {lead.assigned_user_id ?? 'Unassigned'}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="space-y-3 rounded border border-gray-200 p-3">
              <h2 className="text-sm font-medium">Update status</h2>
              <label className="space-y-1 text-sm">
                <span>New status</span>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                  placeholder="new, contacted, qualified, closed"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Status note (optional)</span>
                <textarea
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={statusReason}
                  onChange={(event) => setStatusReason(event.target.value)}
                  rows={3}
                  placeholder="Context for this status change"
                />
              </label>
              <button
                type="button"
                onClick={submitStatusUpdate}
                className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                disabled={statusActionState === 'submitting'}
              >
                {statusActionState === 'submitting' ? 'Updating status' : 'Update status'}
              </button>
              {statusActionMessage ? <p className="text-sm text-gray-600">{statusActionMessage}</p> : null}
            </section>

            <section className="space-y-3 rounded border border-gray-200 p-3">
              <h2 className="text-sm font-medium">Assign owner</h2>
              <label className="space-y-1 text-sm">
                <span>Assigned User ID</span>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={assigneeUserId}
                  onChange={(event) => setAssigneeUserId(event.target.value)}
                  placeholder="Enter assignee user ID"
                />
              </label>
              <button
                type="button"
                onClick={submitAssignmentUpdate}
                className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                disabled={assignActionState === 'submitting'}
              >
                {assignActionState === 'submitting' ? 'Updating assignment' : 'Assign owner'}
              </button>
              {assignActionMessage ? <p className="text-sm text-gray-600">{assignActionMessage}</p> : null}
            </section>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              href={`/lead-desk/leads/${encodeURIComponent(routeLeadId)}?organization_id=${encodeURIComponent(
                organizationId.trim(),
              )}&actor_user_id=${encodeURIComponent(actorUserId.trim())}`}
            >
              Back to detail
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
