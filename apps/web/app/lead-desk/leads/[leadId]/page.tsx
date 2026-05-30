'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { hasOperatorContext, leadDeskApiFetch } from '../../api-client';
import { LeadDeskWorkspace } from '../../lead-desk-workspace';
import { useLeadDeskOperatorContext } from '../../operator-context';
import { Button } from '../../../../components/ui/button';
import {
  DegradedState,
  EmptyState,
  ErrorState,
  FormActions,
  LoadingState,
  PermissionState,
  SectionCard,
  StateMessage,
  StatusBadge,
} from '../../../../components/ui/design_system';

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

export default function LeadDeskDetailPage() {
  const params = useParams<{ leadId: string }>();
  const routeLeadId = decodeURIComponent(params.leadId);
  const { context, sessionState } = useLeadDeskOperatorContext();
  const [state, setState] = useState<LoadState>('idle');
  const [message, setMessage] = useState('Load lead detail with session context.');
  const [lead, setLead] = useState<LeadDetail | null>(null);

  const canLoad = hasOperatorContext(context);

  async function loadDetail() {
    if (!canLoad) {
      setState('permission');
      setMessage('Set up session in Advanced Diagnostics before loading lead detail.');
      return;
    }

    setState('loading');
    setMessage('Lead details are loading.');

    try {
      const response = await leadDeskApiFetch(context, `/leads/${encodeURIComponent(routeLeadId)}`, {
        method: 'GET',
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
        setMessage('Lead detail is temporarily unavailable. Try again later.');
        return;
      }

      const payload = (await response.json()) as LeadDetail;
      setLead(payload);
      setState('ready');
      setMessage('Lead detail loaded.');
    } catch {
      setLead(null);
      setState('degraded');
      setMessage('Lead detail is limited because the local/demo API is not connected.');
    }
  }

  return (
    <LeadDeskWorkspace
      title="Lead Detail"
      description="Review one lead without exposing raw route, tenant, actor, or session identifiers in the normal workspace."
      sessionState={sessionState}
    >
      <SectionCard className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-2">
            <StatusBadge tone="info">Selected lead</StatusBadge>
            <p className="m-0 text-sm text-[#55605a]">Load the selected lead to view operator-safe details.</p>
          </div>
          <Button type="button" onClick={loadDetail} disabled={!canLoad || state === 'loading'}>
            {state === 'loading' ? 'Loading lead' : 'View lead record'}
          </Button>
        </div>
        <StateMessage title="Detail status" message={message} />
      </SectionCard>

      <LeadDetailState state={state} />

      {lead ? (
        <SectionCard className="grid gap-4">
          <dl className="grid gap-3 md:grid-cols-2">
            <OperatorDetail label="Lead name" value={lead.full_name} />
            <OperatorDetail label="Phone number" value={lead.phone_e164} />
            <OperatorDetail label="Source reference" value={lead.source_ref} />
            <OperatorDetail label="Status" value={lead.status} />
            <OperatorDetail label="Assigned owner" value={lead.assigned_user_id ? 'Assigned' : 'Unassigned'} />
            <OperatorDetail label="Updated" value={new Date(lead.updated_at).toLocaleString()} />
          </dl>

          <FormActions>
            <Button asChild variant="secondary">
              <Link href={`/lead-desk/leads/${encodeURIComponent(routeLeadId)}/actions`}>Open status or assignment</Link>
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

function LeadDetailState({ state }: { state: LoadState }) {
  if (state === 'loading') {
    return <LoadingState message="Loading lead detail." />;
  }

  if (state === 'permission') {
    return <PermissionState message="You do not have permission to view this lead detail." />;
  }

  if (state === 'degraded') {
    return <DegradedState message="Lead detail is limited because the local/demo API is not connected." />;
  }

  if (state === 'error') {
    return <ErrorState message="Lead detail is temporarily unavailable. Try again later." />;
  }

  if (state === 'not_found') {
    return <EmptyState title="Lead not found" message="The selected lead is not available in the current organization." />;
  }

  return null;
}

function OperatorDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-[#66716a]">{label}</dt>
      <dd className="m-0 text-sm">{value}</dd>
    </div>
  );
}
