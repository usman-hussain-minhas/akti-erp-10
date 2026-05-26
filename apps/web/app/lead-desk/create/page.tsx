'use client';

import Link from 'next/link';
import { useState } from 'react';

import { hasOperatorContext, leadDeskApiFetch } from '../api-client';
import { LeadDeskWorkspace } from '../lead-desk-workspace';
import { useLeadDeskOperatorContext } from '../operator-context';
import { Button } from '../../../components/ui/button';
import {
  DegradedState,
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
} from '../../../components/ui/design-system';

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission' | 'degraded';

type CreateResponse = {
  lead_id: string;
  organization_id: string;
  status: string;
  created_at: string;
};

export default function LeadDeskCreatePage() {
  const { context, sessionState } = useLeadDeskOperatorContext();
  const [fullName, setFullName] = useState('');
  const [phoneE164, setPhoneE164] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [notes, setNotes] = useState('');

  const [state, setState] = useState<LoadState>('idle');
  const [message, setMessage] = useState('Enter lead details to create a new intake record.');
  const [created, setCreated] = useState<CreateResponse | null>(null);

  const canSubmit = hasOperatorContext(context) && fullName.trim().length > 0 && phoneE164.trim().length > 0 && sourceRef.trim().length > 0;

  function resetForm() {
    setFullName('');
    setPhoneE164('');
    setSourceRef('');
    setNotes('');
    setCreated(null);
    setState('idle');
    setMessage('Form reset. Enter lead details to create a new intake record.');
  }

  async function createLead() {
    if (!canSubmit) {
      setState('permission');
      setMessage('Set up session in Advanced Diagnostics and fill required lead fields.');
      return;
    }

    setState('loading');
    setMessage('Submitting lead intake.');

    try {
      const response = await leadDeskApiFetch(context, '/leads', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: context.organizationId.trim(),
          actor_user_id: context.actorUserId.trim(),
          full_name: fullName.trim(),
          phone_e164: phoneE164.trim(),
          source_ref: sourceRef.trim(),
          notes: notes.trim().length > 0 ? notes.trim() : undefined,
          requested_at: new Date().toISOString(),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        setCreated(null);
        setState('permission');
        setMessage('You do not have permission to create leads.');
        return;
      }

      if (!response.ok) {
        setCreated(null);
        setState('error');
        setMessage('Could not create lead. Check required fields and try again.');
        return;
      }

      const payload = (await response.json()) as CreateResponse;
      setCreated(payload);
      setState('ready');
      setMessage('Lead created successfully.');
    } catch {
      setCreated(null);
      setState('degraded');
      setMessage('Lead creation is temporarily unavailable because the local/demo API is not connected.');
    }
  }

  return (
    <LeadDeskWorkspace
      title="Create Lead"
      description="Capture a new intake record with clear required fields and safe session handling."
      sessionState={sessionState}
    >
      <SectionCard className="grid gap-4">
        <Field label="Full name">
          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter lead full name" />
        </Field>

        <Field label="Phone number">
          <Input value={phoneE164} onChange={(event) => setPhoneE164(event.target.value)} placeholder="+923001234567" />
        </Field>

        <Field label="Source reference">
          <Input value={sourceRef} onChange={(event) => setSourceRef(event.target.value)} placeholder="website, referral, event" />
        </Field>

        <Field label="Notes" helperText="Optional context for the intake team.">
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Any context for intake" />
        </Field>

        <FormActions>
          <Button type="button" onClick={createLead} disabled={!canSubmit || state === 'loading'}>
            {state === 'loading' ? 'Creating lead' : 'Create lead'}
          </Button>
          <Button type="button" variant="secondary" onClick={resetForm}>
            Reset form
          </Button>
          <StateMessage title="Create status" message={message} />
        </FormActions>
      </SectionCard>

      <CreateState state={state} />

      {created ? (
        <SectionCard className="grid gap-3 border-[var(--success)]">
          <SuccessState message={`Lead created successfully with status ${created.status}.`} />
          <FormActions>
            <Button asChild variant="secondary">
              <Link href={`/lead-desk/leads/${encodeURIComponent(created.lead_id)}`}>Open created lead</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/lead-desk/inbox">Go to inbox</Link>
            </Button>
          </FormActions>
        </SectionCard>
      ) : null}
    </LeadDeskWorkspace>
  );
}

function CreateState({ state }: { state: LoadState }) {
  if (state === 'loading') {
    return <LoadingState message="Submitting lead intake." />;
  }

  if (state === 'permission') {
    return <PermissionState message="You do not have permission to create leads." />;
  }

  if (state === 'degraded') {
    return <DegradedState message="Lead creation is temporarily unavailable." />;
  }

  if (state === 'error') {
    return <ErrorState message="Could not create lead. Check required fields and try again." />;
  }

  return null;
}
