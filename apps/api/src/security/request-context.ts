import { createHmac, timingSafeEqual } from 'node:crypto';

import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

const AUTHORIZATION_HEADER = 'authorization';
const BEARER_PREFIX = 'Bearer ';
const MIN_SECRET_LENGTH = 16;
const DEFAULT_SESSION_MAX_AGE_SECONDS = 3600;

export type HeaderValue = string | string[] | undefined;

export type HeaderRecord = Record<string, HeaderValue>;

export type TrustedRequestContext = {
  organization_id: string;
  actor_user_id: string;
  issued_at: string;
  expires_at: string;
};

export type TrustedActorContext = Pick<TrustedRequestContext, 'organization_id' | 'actor_user_id'>;

export type Phase3SessionPayload = {
  organization_id: string;
  actor_user_id: string;
  issued_at: string;
  expires_at: string;
  session_id?: string;
  auth_level?: string;
};

export type ResolveTrustedRequestContextOptions = {
  routeOrganizationId?: string;
  secret?: string;
  now?: Date;
  maxAgeSeconds?: number;
};

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function signPayload(payloadJson: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadJson).digest('base64url');
}

function normalizeNonEmptyString(input: unknown): string | null {
  return typeof input === 'string' && input.trim().length > 0 ? input.trim() : null;
}

function readHeader(headers: HeaderRecord, key: string): string | null {
  const direct = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
  const value = Array.isArray(direct) ? direct[0] : direct;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function requireSecret(secret?: string): string {
  const resolved = secret ?? process.env.AKTI_AUTH_SESSION_SECRET;
  if (!resolved || resolved.length < MIN_SECRET_LENGTH) {
    throw new UnauthorizedException('AKTI auth session secret is not configured');
  }
  return resolved;
}

function resolveSessionMaxAgeSeconds(maxAgeSeconds?: number): number {
  if (maxAgeSeconds !== undefined) {
    if (
      !Number.isSafeInteger(maxAgeSeconds) ||
      maxAgeSeconds <= 0 ||
      maxAgeSeconds > Number.MAX_SAFE_INTEGER / 1000
    ) {
      throw new UnauthorizedException('AKTI auth session max age is invalid');
    }
    return maxAgeSeconds;
  }

  const raw = process.env.AKTI_AUTH_SESSION_MAX_AGE_SECONDS;
  if (raw === undefined || raw.trim().length === 0) {
    return DEFAULT_SESSION_MAX_AGE_SECONDS;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value <= 0 || value > Number.MAX_SAFE_INTEGER / 1000 || value.toString() !== raw.trim()) {
    throw new UnauthorizedException('AKTI auth session max age is invalid');
  }

  return value;
}

function assertTrustedPayload(input: unknown, now: Date, maxAgeSeconds: number): TrustedRequestContext {
  if (!input || typeof input !== 'object') {
    throw new UnauthorizedException('AKTI session payload is invalid');
  }

  const payload = input as Partial<Phase3SessionPayload>;
  const organizationId = normalizeNonEmptyString(payload.organization_id);
  const actorUserId = normalizeNonEmptyString(payload.actor_user_id);
  const issuedAt = normalizeNonEmptyString(payload.issued_at);
  const expiresAt = normalizeNonEmptyString(payload.expires_at);

  if (!organizationId || !actorUserId || !issuedAt || !expiresAt) {
    throw new UnauthorizedException('AKTI session payload is missing required context');
  }

  const issuedAtDate = new Date(issuedAt);
  const expiresAtDate = new Date(expiresAt);
  if (Number.isNaN(issuedAtDate.getTime()) || Number.isNaN(expiresAtDate.getTime())) {
    throw new UnauthorizedException('AKTI session timestamps are invalid');
  }

  if (issuedAtDate.getTime() > now.getTime() + 60_000) {
    throw new UnauthorizedException('AKTI session issued-at timestamp is invalid');
  }

  if (expiresAtDate.getTime() <= now.getTime()) {
    throw new UnauthorizedException('AKTI session has expired');
  }

  if (expiresAtDate.getTime() - issuedAtDate.getTime() > maxAgeSeconds * 1000) {
    throw new UnauthorizedException('AKTI session exceeds configured max age');
  }

  return {
    organization_id: organizationId,
    actor_user_id: actorUserId,
    issued_at: issuedAtDate.toISOString(),
    expires_at: expiresAtDate.toISOString(),
  };
}

function extractBearerToken(headers: HeaderRecord): string {
  const authorization = readHeader(headers, AUTHORIZATION_HEADER);
  if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
    throw new UnauthorizedException('AKTI bearer session is required');
  }

  const token = authorization.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    throw new UnauthorizedException('AKTI bearer session is required');
  }

  return token;
}

export function createPhase3SessionToken(payload: Phase3SessionPayload, secret: string): string {
  const resolvedSecret = requireSecret(secret);
  const payloadJson = JSON.stringify({
    organization_id: payload.organization_id.trim(),
    actor_user_id: payload.actor_user_id.trim(),
    issued_at: new Date(payload.issued_at).toISOString(),
    expires_at: new Date(payload.expires_at).toISOString(),
    ...(payload.session_id ? { session_id: payload.session_id.trim() } : {}),
    ...(payload.auth_level ? { auth_level: payload.auth_level.trim() } : {}),
  });
  const encodedPayload = base64UrlEncode(payloadJson);
  const signature = signPayload(payloadJson, resolvedSecret);
  return `${encodedPayload}.${signature}`;
}

export function verifyPhase3SessionToken(
  token: string,
  options: ResolveTrustedRequestContextOptions = {},
): TrustedRequestContext {
  const secret = requireSecret(options.secret);
  const maxAgeSeconds = resolveSessionMaxAgeSeconds(options.maxAgeSeconds);
  const [encodedPayload, signature, unexpected] = token.split('.');
  if (!encodedPayload || !signature || unexpected !== undefined) {
    throw new UnauthorizedException('AKTI bearer session is malformed');
  }

  let payloadJson: string;
  try {
    payloadJson = base64UrlDecode(encodedPayload);
  } catch {
    throw new UnauthorizedException('AKTI bearer session payload is invalid');
  }

  const expectedSignature = signPayload(payloadJson, secret);
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
  const actualBuffer = Buffer.from(signature, 'base64url');
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new UnauthorizedException('AKTI bearer session signature is invalid');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    throw new UnauthorizedException('AKTI bearer session payload is invalid');
  }

  return assertTrustedPayload(parsed, options.now ?? new Date(), maxAgeSeconds);
}

export function resolveTrustedRequestContext(
  headers: HeaderRecord,
  options: ResolveTrustedRequestContextOptions = {},
): TrustedRequestContext {
  const token = extractBearerToken(headers);
  const context = verifyPhase3SessionToken(token, options);
  const routeOrganizationId = options.routeOrganizationId?.trim();

  if (routeOrganizationId && routeOrganizationId !== context.organization_id) {
    throw new ForbiddenException('AKTI session organization does not match route organization');
  }

  return context;
}

export function requireContextBodyMatch(
  context: Pick<TrustedRequestContext, 'organization_id' | 'actor_user_id'>,
  body: { organization_id?: string; actor_user_id?: string },
) {
  if (body.organization_id !== undefined && body.organization_id.trim() !== context.organization_id) {
    throw new ForbiddenException('Request organization does not match trusted context');
  }

  if (body.actor_user_id !== undefined && body.actor_user_id.trim() !== context.actor_user_id) {
    throw new ForbiddenException('Request actor does not match trusted context');
  }
}
