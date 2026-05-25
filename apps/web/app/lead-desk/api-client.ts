'use client';

import type { LeadDeskOperatorContext } from './operator-context';

function resolveApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export function hasOperatorContext(context: LeadDeskOperatorContext): boolean {
  return (
    context.sessionToken.trim().length > 0 &&
    context.organizationId.trim().length > 0 &&
    context.actorUserId.trim().length > 0
  );
}

export async function leadDeskApiFetch(
  context: LeadDeskOperatorContext,
  path: string,
  init?: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> },
) {
  const base = resolveApiBase();
  if (!base) {
    throw new Error('API_BASE_UNAVAILABLE');
  }

  const url = `${base}/api/lead-desk/organizations/${encodeURIComponent(context.organizationId.trim())}${path}`;
  const headers: Record<string, string> = {
    ...(init?.headers ?? {}),
    Authorization: `Bearer ${context.sessionToken.trim()}`,
  };

  return fetch(url, {
    ...init,
    headers,
  });
}
