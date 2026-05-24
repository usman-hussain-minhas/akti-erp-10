'use client';

import { useEffect, useMemo, useState } from 'react';

const CONTEXT_STORAGE_KEY = 'akti.leadDesk.operatorContext.v1';

export type LeadDeskOperatorContext = {
  organizationId: string;
  actorUserId: string;
};

function readStoredContext(): LeadDeskOperatorContext {
  if (typeof window === 'undefined') {
    return { organizationId: '', actorUserId: '' };
  }

  try {
    const raw = window.sessionStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!raw) {
      return { organizationId: '', actorUserId: '' };
    }

    const parsed = JSON.parse(raw) as Partial<LeadDeskOperatorContext>;
    return {
      organizationId: typeof parsed.organizationId === 'string' ? parsed.organizationId : '',
      actorUserId: typeof parsed.actorUserId === 'string' ? parsed.actorUserId : '',
    };
  } catch {
    return { organizationId: '', actorUserId: '' };
  }
}

export function useLeadDeskOperatorContext() {
  const [context, setContext] = useState<LeadDeskOperatorContext>({ organizationId: '', actorUserId: '' });

  useEffect(() => {
    setContext(readStoredContext());
  }, []);

  function updateContext(next: LeadDeskOperatorContext) {
    const normalized = {
      organizationId: next.organizationId.trim(),
      actorUserId: next.actorUserId.trim(),
    };
    setContext(normalized);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(normalized));
    }
  }

  const hasContext = useMemo(
    () => context.organizationId.length > 0 && context.actorUserId.length > 0,
    [context.organizationId, context.actorUserId],
  );

  return { context, hasContext, updateContext };
}
