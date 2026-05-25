'use client';

import Link from 'next/link';
import { useState } from 'react';

import { hasOperatorContext, leadDeskApiFetch } from '../api-client';
import { useLeadDeskOperatorContext } from '../operator-context';

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'permission' | 'degraded';

type CreateResponse = {
  lead_id: string;
  organization_id: string;
  status: string;
  created_at: string;
};

export default function LeadDeskCreatePage() {
  const { context, hasContext, updateContext } = useLeadDeskOperatorContext();
  const [organizationIdDraft, setOrganizationIdDraft] = useState('');
  const [actorUserIdDraft, setActorUserIdDraft] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneE164, setPhoneE164] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [notes, setNotes] = useState('');

  const [state, setState] = useState<LoadState>('idle');
  const [message, setMessage] = useState('Enter lead details to create a new intake record.');
  const [created, setCreated] = useState<CreateResponse | null>(null);

  const canSetContext = organizationIdDraft.trim().length > 0 && actorUserIdDraft.trim().length > 0;
  const canSubmit = hasOperatorContext(context) && fullName.trim().length > 0 && phoneE164.trim().length > 0 && sourceRef.trim().length > 0;

  function applyContext() {
    if (!canSetContext) {
      setState('error');
      setMessage('Organization and actor are required.');
      return;
    }
    updateContext({
      organizationId: organizationIdDraft,
      actorUserId: actorUserIdDraft,
    });
    setMessage('Temporary operator context applied.');
  }

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
      setMessage('Set temporary context and fill required lead fields.');
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
      setMessage('Lead creation is temporarily unavailable because API base URL is not configured.');
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Create Lead</h1>
        <p className="text-sm text-gray-700">Capture new lead intake in one capability-guarded flow.</p>
        <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          Temporary operator context: {hasContext ? `${context.organizationId} / ${context.actorUserId}` : 'not set'}
        </p>
      </header>

      <section className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <label className="space-y-1 text-sm">
          <span>Organization ID</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={organizationIdDraft}
            onChange={(event) => setOrganizationIdDraft(event.target.value)}
            placeholder="Enter organization ID"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Actor User ID</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={actorUserIdDraft}
            onChange={(event) => setActorUserIdDraft(event.target.value)}
            placeholder="Enter actor user ID"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Full name</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter lead full name"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Phone number</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={phoneE164}
            onChange={(event) => setPhoneE164(event.target.value)}
            placeholder="+923001234567"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Source reference</span>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={sourceRef}
            onChange={(event) => setSourceRef(event.target.value)}
            placeholder="website, referral, event"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Notes (optional)</span>
          <textarea
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Any context for intake"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={applyContext} className="rounded border border-gray-300 px-4 py-2 text-sm" disabled={!canSetContext}>
            Set context
          </button>
          <button type="button" onClick={createLead} className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={!canSubmit || state === 'loading'}>
            {state === 'loading' ? 'Creating lead' : 'Create lead'}
          </button>
          <button type="button" onClick={resetForm} className="rounded border border-gray-300 px-4 py-2 text-sm">
            Reset form
          </button>
          <span className="text-sm text-gray-600">{message}</span>
        </div>
      </section>

      {state === 'loading' ? <p className="rounded border border-blue-200 bg-blue-50 p-3 text-sm">Submitting lead intake.</p> : null}
      {state === 'permission' ? (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">Access needed: you do not have permission to create leads.</p>
      ) : null}
      {state === 'degraded' ? (
        <p className="rounded border border-orange-200 bg-orange-50 p-3 text-sm">Lead creation is temporarily unavailable.</p>
      ) : null}
      {state === 'error' ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm">Could not create lead. Check required fields and try again.</p>
      ) : null}

      {created ? (
        <section className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
          <p className="font-medium">Lead created</p>
          <p>Lead ID: {created.lead_id}</p>
          <p>Status: {created.status}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              className="rounded border border-gray-300 bg-white px-3 py-2"
              href={`/lead-desk/leads/${encodeURIComponent(created.lead_id)}`}
            >
              Open lead detail
            </Link>
            <Link
              className="rounded border border-gray-300 bg-white px-3 py-2"
              href="/lead-desk/inbox"
            >
              Go to inbox
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
