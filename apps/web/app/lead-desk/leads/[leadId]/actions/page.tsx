'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { hasOperatorContext, leadDeskApiFetch } from '../../../api-client';
import { LeadDeskWorkspace } from '../../../lead-desk-workspace';
import { useLeadDeskOperatorContext } from '../../../operator-context';
import { Button } from '../../../../../components/ui/button';
import {
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
  SuccessState,
  Textarea,
} from '../../../../../components/ui/design-system';

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
  const { context, sessionState } = useLeadDeskOperatorContext();

  const [detailState, setDetailState] = useState<LoadState>('idle');
  const [detailMessage, setDetailMessage] = useState('Load lead context to update status or assignment.');
  const [lead, setLead] = useState<LeadDetail | null>(null);

  const [statusValue, setStatusValue] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [assigneeReference, setAssigneeReference] = useState('');

  const [statusActionState, setStatusActionState] = useState<ActionState>('idle');
  const [statusActionMessage, setStatusActionMessage] = useState('');
  const [assignActionState, setAssignActionState] = useState<ActionState>('idle');
  const [assignActionMessage, setAssignActionMessage] = useState('');

  const canLoad = hasOperatorContext(context);

  async function loadLeadContext() {
    if (!canLoad) {
      setDetailState('permission');
      setDetailMessage('Set up session in Advanced Diagnostics before loading actions.');
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
        setDetailMessage('Lead action context is temporarily unavailable. Try again later.');
        return;
      }

      const payload = (await response.json()) as LeadDetail;
      setLead(payload);
      setStatusValue(payload.status);
      setAssigneeReference('');
      setDetailState('ready');
      setDetailMessage('Lead action context loaded.');
    } catch {
      setLead(null);
      setDetailState('degraded');
      setDetailMessage('Lead actions are limited because the local/demo API is not connected.');
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
      setStatusActionMessage('Set up session in Advanced Diagnostics before updating status.');
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

    if (!assigneeReference.trim()) {
      setAssignActionState('error');
      setAssignActionMessage('Assigned owner reference is required.');
      return;
    }

    if (!canLoad) {
      setAssignActionState('permission');
      setAssignActionMessage('Set up session in Advanced Diagnostics before assignment update.');
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
          assigned_user_id: assigneeReference.trim(),
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
      setAssigneeReference('');
      setAssignActionState('success');
      setAssignActionMessage('Lead assignment updated.');
    } catch {
      setAssignActionState('error');
      setAssignActionMessage('Assignment updates are temporarily limited.');
    }
  }

  return (
    <LeadDeskWorkspace
      title="Lead Status and Assignment"
      description="Update status and assignment with safe session handling and without exposing route or tenant identifiers."
      sessionState={sessionState}
    >
      <SectionCard className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-sm text-[#55605a]">Load the selected lead before applying status or assignment changes.</p>
          <Button type="button" onClick={loadLeadContext} disabled={!canLoad || detailState === 'loading'}>
            {detailState === 'loading' ? 'Loading lead' : 'Load lead context'}
          </Button>
        </div>
        <StateMessage title="Action context" message={detailMessage} />
      </SectionCard>

      <ActionContextState state={detailState} />

      {lead ? (
        <SectionCard className="grid gap-6">
          <section className="grid gap-2">
            <p className="m-0 text-sm font-medium">Current lead</p>
            <p className="m-0 text-sm text-[#55605a]">{lead.full_name}</p>
            <p className="m-0 text-sm text-[#55605a]">Current status: {lead.status}</p>
            <p className="m-0 text-sm text-[#55605a]">Assigned owner: {lead.assigned_user_id ? 'Assigned' : 'Unassigned'}</p>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="grid gap-3 rounded-lg border border-[var(--border)] p-3">
              <h2 className="m-0 text-sm font-medium">Update status</h2>
              <Field label="New status">
                <Input
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                  placeholder="new, contacted, qualified, closed"
                />
              </Field>
              <Field label="Status note" helperText="Optional context for this status change.">
                <Textarea
                  value={statusReason}
                  onChange={(event) => setStatusReason(event.target.value)}
                  rows={3}
                  placeholder="Context for this status change"
                />
              </Field>
              <Button type="button" onClick={submitStatusUpdate} disabled={statusActionState === 'submitting'}>
                {statusActionState === 'submitting' ? 'Updating status' : 'Update status'}
              </Button>
              <ActionStateMessage state={statusActionState} message={statusActionMessage} />
            </section>

            <section className="grid gap-3 rounded-lg border border-[var(--border)] p-3">
              <h2 className="m-0 text-sm font-medium">Assign owner</h2>
              <Field
                label="Assigned owner reference"
                helperText="Friendly owner lookup is a known backend gap; use only an approved local/demo reference."
              >
                <Input
                  value={assigneeReference}
                  onChange={(event) => setAssigneeReference(event.target.value)}
                  placeholder="Owner reference"
                />
              </Field>
              <Button type="button" onClick={submitAssignmentUpdate} disabled={assignActionState === 'submitting'}>
                {assignActionState === 'submitting' ? 'Updating assignment' : 'Assign owner'}
              </Button>
              <ActionStateMessage state={assignActionState} message={assignActionMessage} />
            </section>
          </div>

          <FormActions>
            <Button asChild variant="secondary">
              <Link href={`/lead-desk/leads/${encodeURIComponent(routeLeadId)}`}>Back to detail</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/lead-desk/inbox">Back to inbox</Link>
            </Button>
          </FormActions>
        </SectionCard>
      ) : null}
    </LeadDeskWorkspace>
  );
}

function ActionContextState({ state }: { state: LoadState }) {
  if (state === 'loading') {
    return <LoadingState message="Loading lead action context." />;
  }

  if (state === 'permission') {
    return <PermissionState message="You do not have permission to update lead status or assignment." />;
  }

  if (state === 'degraded') {
    return <DegradedState message="Lead actions are limited because the local/demo API is not connected." />;
  }

  if (state === 'error') {
    return <ErrorState message="Lead action context is temporarily unavailable. Try again later." />;
  }

  if (state === 'not_found') {
    return <EmptyState title="Lead not found" message="A lead must be selected before status or assignment can be changed." />;
  }

  return null;
}

function ActionStateMessage({ state, message }: { state: ActionState; message: string }) {
  if (!message) {
    return null;
  }

  if (state === 'success') {
    return <SuccessState message={message} />;
  }

  if (state === 'permission') {
    return <PermissionState message={message} />;
  }

  if (state === 'error') {
    return <ErrorState message={message} />;
  }

  return <StateMessage title="Action status" message={message} />;
}
