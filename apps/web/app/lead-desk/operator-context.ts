'use client';

import { useEffect, useMemo, useState } from 'react';

const CONTEXT_STORAGE_KEY = 'akti.leadDesk.sessionContext.v1';

export type LeadDeskOperatorContext = {
  sessionToken: string;
  organizationId: string;
  actorUserId: string;
};

export type LeadDeskOperatorContextInput = {
  sessionToken: string;
};

function emptyContext(): LeadDeskOperatorContext {
  return { sessionToken: '', organizationId: '', actorUserId: '' };
}

function readStoredContext(): LeadDeskOperatorContext {
  if (typeof window === 'undefined') {
    return emptyContext();
  }

  try {
    const raw = window.sessionStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!raw) {
      return emptyContext();
    }

    const parsed = JSON.parse(raw) as Partial<LeadDeskOperatorContext>;
    return normalizeContext({ sessionToken: typeof parsed.sessionToken === 'string' ? parsed.sessionToken : '' });
  } catch {
    return emptyContext();
  }
}

function normalizeContext(input: LeadDeskOperatorContextInput): LeadDeskOperatorContext {
  const sessionToken = input.sessionToken.trim();
  const metadata = decodeSessionMetadata(sessionToken);

  return {
    sessionToken,
    organizationId: metadata?.organizationId ?? '',
    actorUserId: metadata?.actorUserId ?? '',
  };
}

function decodeSessionMetadata(sessionToken: string): { organizationId: string; actorUserId: string } | null {
  const [encodedPayload] = sessionToken.split('.');
  if (!encodedPayload || typeof globalThis.atob !== 'function') {
    return null;
  }

  try {
    const padded = encodedPayload
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
    const parsed = JSON.parse(globalThis.atob(padded)) as {
      organization_id?: unknown;
      actor_user_id?: unknown;
    };
    const organizationId = typeof parsed.organization_id === 'string' ? parsed.organization_id.trim() : '';
    const actorUserId = typeof parsed.actor_user_id === 'string' ? parsed.actor_user_id.trim() : '';

    return organizationId && actorUserId ? { organizationId, actorUserId } : null;
  } catch {
    return null;
  }
}

export function useLeadDeskOperatorContext() {
  const [context, setContext] = useState<LeadDeskOperatorContext>(emptyContext);

  useEffect(() => {
    setContext(readStoredContext());
  }, []);

  function updateContext(next: LeadDeskOperatorContextInput): boolean {
    const normalized = normalizeContext(next);
    setContext(normalized);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized.sessionToken.length > 0 && normalized.organizationId.length > 0 && normalized.actorUserId.length > 0;
  }

  const hasContext = useMemo(
    () => context.sessionToken.length > 0 && context.organizationId.length > 0 && context.actorUserId.length > 0,
    [context.sessionToken, context.organizationId, context.actorUserId],
  );

  return { context, hasContext, updateContext };
}
