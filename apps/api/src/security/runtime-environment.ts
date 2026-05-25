import type { RateLimitConfig } from './rate-limit.middleware';
import { readRateLimitConfig } from './rate-limit.middleware';

const DEFAULT_PORT = 3001;
const DEFAULT_SESSION_MAX_AGE_SECONDS = 3600;

export type ApiRuntimeEnvironment = {
  port: number;
  authSessionSecret: string;
  authSessionMaxAgeSeconds: number;
  corsAllowedOrigins: string[];
  securityHeadersEnabled: boolean;
  rateLimit: RateLimitConfig;
};

export function readApiRuntimeEnvironment(env: NodeJS.ProcessEnv = process.env): ApiRuntimeEnvironment {
  const authSessionSecret = readRequiredSecretName(env, 'AKTI_AUTH_SESSION_SECRET');

  return {
    port: readPositiveIntegerEnv(env, 'PORT', DEFAULT_PORT),
    authSessionSecret,
    authSessionMaxAgeSeconds: readPositiveIntegerEnv(
      env,
      'AKTI_AUTH_SESSION_MAX_AGE_SECONDS',
      DEFAULT_SESSION_MAX_AGE_SECONDS,
    ),
    corsAllowedOrigins: readCorsAllowedOrigins(env),
    securityHeadersEnabled: readBooleanEnv(env, 'AKTI_SECURITY_HEADERS_ENABLED', true),
    rateLimit: readRateLimitConfig(env),
  };
}

export function createCorsOriginValidator(allowedOrigins: string[]) {
  const allowed = new Set(allowedOrigins);

  return (origin: string | undefined, callback: (error: Error | null, allowed?: boolean) => void): void => {
    if (!origin) {
      callback(null, false);
      return;
    }

    if (allowed.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS origin is not allowed'), false);
  };
}

export function configureCors(
  app: { enableCors(options: unknown): void },
  allowedOrigins: string[],
): void {
  if (allowedOrigins.length === 0) {
    return;
  }

  app.enableCors({
    origin: createCorsOriginValidator(allowedOrigins),
    credentials: false,
  });
}

function readCorsAllowedOrigins(env: NodeJS.ProcessEnv): string[] {
  const raw = env.AKTI_CORS_ALLOWED_ORIGINS;
  if (raw === undefined || raw.trim().length === 0) {
    return [];
  }

  return raw.split(',').map((origin) => parseAllowedOrigin(origin.trim()));
}

function parseAllowedOrigin(origin: string): string {
  if (!origin || origin === '*') {
    throw new Error('AKTI_CORS_ALLOWED_ORIGINS must not contain wildcard or empty origins');
  }

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error('AKTI_CORS_ALLOWED_ORIGINS must contain valid origins');
  }

  if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || parsed.origin !== origin) {
    throw new Error('AKTI_CORS_ALLOWED_ORIGINS must contain origins without paths');
  }

  return parsed.origin;
}

function readRequiredSecretName(env: NodeJS.ProcessEnv, key: string): string {
  const raw = env[key];
  if (raw === undefined || raw.trim().length < 16) {
    throw new Error(`${key} must be configured outside source control`);
  }

  return raw.trim();
}

function readBooleanEnv(env: NodeJS.ProcessEnv, key: string, fallback: boolean): boolean {
  const raw = env[key];
  if (raw === undefined || raw.trim().length === 0) {
    return fallback;
  }

  if (raw === 'true') {
    return true;
  }

  if (raw === 'false') {
    return false;
  }

  throw new Error(`${key} must be true or false`);
}

function readPositiveIntegerEnv(env: NodeJS.ProcessEnv, key: string, fallback: number): number {
  const raw = env[key];
  if (raw === undefined || raw.trim().length === 0) {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value <= 0 || value.toString() !== raw.trim()) {
    throw new Error(`${key} must be a positive integer`);
  }

  return value;
}
