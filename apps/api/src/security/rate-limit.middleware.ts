const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 120;

export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export type RateLimitRequest = {
  ip?: string;
  method?: string;
  originalUrl?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
};

export type RateLimitResponse = {
  setHeader(name: string, value: string | number): void;
  status(code: number): RateLimitResponse;
  json?(body: unknown): void;
  end?(body?: string): void;
};

type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export function readRateLimitConfig(env: NodeJS.ProcessEnv = process.env): RateLimitConfig {
  return {
    windowMs: readPositiveIntegerEnv(env, 'AKTI_RATE_LIMIT_WINDOW_MS', DEFAULT_RATE_LIMIT_WINDOW_MS),
    maxRequests: readPositiveIntegerEnv(env, 'AKTI_RATE_LIMIT_MAX_REQUESTS', DEFAULT_RATE_LIMIT_MAX_REQUESTS),
  };
}

export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();

  constructor(
    private readonly config: RateLimitConfig,
    private readonly now: () => number = () => Date.now(),
  ) {}

  check(key: string): RateLimitDecision {
    const now = this.now();
    this.pruneExpiredBuckets(now);

    const existing = this.buckets.get(key);
    const bucket =
      existing && existing.resetAt > now
        ? existing
        : {
            count: 0,
            resetAt: now + this.config.windowMs,
          };

    bucket.count += 1;
    this.buckets.set(key, bucket);

    const remaining = Math.max(this.config.maxRequests - bucket.count, 0);
    const retryAfterSeconds = Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1);

    return {
      allowed: bucket.count <= this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining,
      resetAt: bucket.resetAt,
      retryAfterSeconds,
    };
  }

  private pruneExpiredBuckets(now: number): void {
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}

export function createRateLimitMiddleware(
  config: RateLimitConfig = readRateLimitConfig(),
  limiter = new InMemoryRateLimiter(config),
) {
  return (request: RateLimitRequest, response: RateLimitResponse, next: () => void): void => {
    const decision = limiter.check(resolveRateLimitKey(request));
    writeRateLimitHeaders(response, decision);

    if (decision.allowed) {
      next();
      return;
    }

    response.status(429);
    const body = {
      error: 'rate_limited',
      retry_after_seconds: decision.retryAfterSeconds,
      limit: decision.limit,
      window_ms: config.windowMs,
    };

    if (response.json) {
      response.json(body);
      return;
    }

    response.end?.(JSON.stringify(body));
  };
}

function writeRateLimitHeaders(response: RateLimitResponse, decision: RateLimitDecision): void {
  response.setHeader('X-RateLimit-Limit', decision.limit);
  response.setHeader('X-RateLimit-Remaining', decision.remaining);
  response.setHeader('X-RateLimit-Reset', Math.ceil(decision.resetAt / 1000));

  if (!decision.allowed) {
    response.setHeader('Retry-After', decision.retryAfterSeconds);
  }
}

function resolveRateLimitKey(request: RateLimitRequest): string {
  const forwardedFor = readHeader(request, 'x-forwarded-for');
  const client = forwardedFor?.split(',')[0]?.trim() || request.ip || 'unknown-client';
  const method = request.method?.toUpperCase() || 'UNKNOWN';
  const url = request.originalUrl || request.url || 'unknown-route';
  const route = url.split('?')[0] || 'unknown-route';
  return `${client}:${method}:${route}`;
}

function readHeader(request: RateLimitRequest, key: string): string | null {
  const headers = request.headers ?? {};
  const value = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
  const firstValue = Array.isArray(value) ? value[0] : value;
  return typeof firstValue === 'string' && firstValue.trim().length > 0 ? firstValue.trim() : null;
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
