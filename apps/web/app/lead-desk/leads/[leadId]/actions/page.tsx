'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { hasOperatorContext, leadDeskApiFetch } from '../../../api-client';
import { useLeadDeskOperatorContext } from '../../../operator-context';

type LeadDetail = {
  lead_id: string;
  full_name: string;
  status: string;
  assigned_user_id: string | null;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission' | 'degraded' | 'not_found';

type ActionState = 'idle' | 'submitting' | 'success' | 'error' | 'permission';

export default function LeadDeskActionsPage() {
  const params = useParams<{ leadId: string }>();
  const routeLeadId = decodeURIComponent(params.leadId);
  const { context, hasContext, updateContext } = useLeadDeskOperatorContext();
  const [organizationIdDraft, setOrganizationIdDraft] = useState('');
  const [actorUserIdDraft, setActorUserIdDraft] = useState('');

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

  const canSetContext = organizationIdDraft.trim().length > 0 && actorUserIdDraft.trim().length > 0;
  const canLoad = hasOperatorContext(context);

  function applyContext() {
    if (!canSetContext) {
      setDetailState('error');
      setDetailMessage('Organization and actor are required.');
      return;
    }
    updateContext({
      organizationId: organizationIdDraft,
      actorUserId: actorUserIdDraft,
    });
    setDetailMessage('Temporary operator context applied.');
  }

  async function loadLeadContext() {
    if (!canLoad) {
      setDetailState('permission');
      setDetailMessage('Set temporary operator context before loading actions.');
      return;
    }

    setDetailState('loading');
    setDetailMessage('Loading lead action context.');

    try {
      const response = await leadDeskApiFetch(context, `/leads/${encodeURIComponent(routeLeadId)}`, {
        method: 'GET',
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

    if (!canLoad) {
      setStatusActionState('permission');
      setStatusActionMessage('Set temporary operator context before updating status.');
      return;
    }

    setStatusActionState('submitting');
    setStatusActionMessage('Submitting status update.');

    try {
      const response = await leadDeskApiFetch(context, `/leads/${encodeURIComponent(routeLeadId)}/status`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
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

    if (!canLoad) {
      setAssignActionState('permission');
      setAssignActionMessage('Set temporary operator context before assignment update.');
      return;
    }

    setAssignActionState('submitting');
    setAssignActionMessage('Submitting assignment update.');

    try {
      const response = await leadDeskApiFetch(context, `/leads/${encodeURIComponent(routeLeadId)}/assignment`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
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
      setAssignActionMessage('Assignment updates are temporarily limited.');
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Lead Status and Assignment</h1>
        <p className="text-sm text-gray-700">Update status and assignment with organization-scoped checks.</p>
        <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          Temporary operator context: {hasContext ? `${context.organizationId} / ${context.actorUserId}` : 'not set'}
        </p>
      </header>

      <section className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Lead ID</span>
          <input className="w-full rounded border border-gray-300 px-3 py-2" value={routeLeadId} disabled />
        </label>

        <label className="space-y-1 text-sm">
          <span>Organization ID (temporary context)</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={organizationIdDraft}
            onChange={(event) => setOrganizationIdDraft(event.target.value)}
            placeholder="Enter organization ID"
          />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span>Actor User ID (temporary context)</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={actorUserIdDraft}
            onChange={(event) => setActorUserIdDraft(event.target.value)}
            placeholder="Enter actor user ID"
          />
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button type="button" onClick={applyContext} className="rounded border border-gray-300 px-4 py-2 text-sm" disabled={!canSetContext}>
            Set context
          </button>
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
              href={`/lead-desk/leads/${encodeURIComponent(routeLeadId)}`}
            >
              Back to detail
            </Link>
            <Link className="rounded border border-gray-300 px-3 py-2 text-sm" href="/lead-desk/inbox">
              Back to inbox
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
