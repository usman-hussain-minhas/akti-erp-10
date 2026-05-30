'use client';

import { useState } from 'react';

import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import { Button } from '../ui/button';
import { Field, Textarea } from '../ui/design_system';
import { SESSION_STATE_COPY } from './session_state';

export function AdvancedDiagnosticsSessionPanel() {
  const { sessionState, updateContext } = useLeadDeskOperatorContext();
  const [sessionTokenDraft, setSessionTokenDraft] = useState('');
  const [message, setMessage] = useState(SESSION_STATE_COPY[sessionState].message);

  function applySession() {
    const applied = updateContext({ sessionToken: sessionTokenDraft });
    setMessage(applied ? 'Session active.' : 'Session expired/invalid. Paste a valid demo session token.');
  }

  return (
    <section aria-labelledby="advanced-diagnostics-session-title" className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <div className="grid gap-1">
        <h2 id="advanced-diagnostics-session-title" className="m-0 text-lg font-semibold">
          Advanced Diagnostics Session
        </h2>
        <p className="m-0 text-sm text-[#55605a]">
          This is the only Phase 4B surface where bearer-token entry is allowed. Normal operator screens must show only
          session state.
        </p>
      </div>
      <Field label="Bearer session token" helperText="Used only for local/demo diagnostics. Do not paste production credentials.">
        <Textarea
          value={sessionTokenDraft}
          onChange={(event) => setSessionTokenDraft(event.target.value)}
          rows={3}
          placeholder="Paste local/demo bearer session token"
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={applySession} disabled={sessionTokenDraft.trim().length === 0}>
          Set session
        </Button>
        <p className="m-0 text-sm text-[#55605a]">{message}</p>
      </div>
    </section>
  );
}
