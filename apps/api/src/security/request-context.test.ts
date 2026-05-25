import assert from 'node:assert/strict';

import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

import {
  createPhase3SessionToken,
  requireContextBodyMatch,
  resolveTrustedRequestContext,
  verifyPhase3SessionToken,
} from './request-context';
import {
  InMemoryRateLimiter,
  RateLimitResponse,
  createRateLimitMiddleware,
  readRateLimitConfig,
} from './rate-limit.middleware';
import {
  configureCors,
  createCorsOriginValidator,
  readApiRuntimeEnvironment,
} from './runtime-environment';
import { API_SECURITY_HEADERS, createSecurityHeadersMiddleware } from './security-headers.middleware';

const secret = 'phase3-test-secret-value';
const now = new Date('2026-05-25T12:00:00.000Z');

function validPayload() {
  return {
    organization_id: 'org-1',
    actor_user_id: 'user-1',
    issued_at: '2026-05-25T11:55:00.000Z',
    expires_at: '2026-05-25T12:30:00.000Z',
  };
}

function validToken() {
  return createPhase3SessionToken(validPayload(), secret);
}

function testValidTokenResolvesTrustedContext() {
  const context = resolveTrustedRequestContext(
    {
      authorization: `Bearer ${validToken()}`,
    },
    { secret, now, routeOrganizationId: 'org-1' },
  );

  assert.equal(context.organization_id, 'org-1');
  assert.equal(context.actor_user_id, 'user-1');
  assert.equal(context.issued_at, '2026-05-25T11:55:00.000Z');
  assert.equal(context.expires_at, '2026-05-25T12:30:00.000Z');
}

function testMissingBearerFailsClosed() {
  assert.throws(
    () => resolveTrustedRequestContext({}, { secret, now, routeOrganizationId: 'org-1' }),
    UnauthorizedException,
  );
}

function testLegacyActorHeaderIsNotSessionFallback() {
  assert.throws(
    () =>
      resolveTrustedRequestContext(
        {
          'x-actor-user-id': 'user-1',
        },
        { secret, now, routeOrganizationId: 'org-1' },
      ),
    UnauthorizedException,
  );
}

function testMalformedAuthorizationFailsClosed() {
  assert.throws(
    () =>
      resolveTrustedRequestContext(
        {
          authorization: `Basic ${validToken()}`,
        },
        { secret, now, routeOrganizationId: 'org-1' },
      ),
    UnauthorizedException,
  );
  assert.throws(
    () =>
      resolveTrustedRequestContext(
        {
          authorization: 'Bearer    ',
        },
        { secret, now, routeOrganizationId: 'org-1' },
      ),
    UnauthorizedException,
  );
}

function testTamperedTokenFailsClosed() {
  const token = validToken();
  const tampered = `${token.slice(0, -2)}aa`;

  assert.throws(() => verifyPhase3SessionToken(tampered, { secret, now }), UnauthorizedException);
}

function testExpiredTokenFailsClosed() {
  const token = createPhase3SessionToken(
    {
      ...validPayload(),
      expires_at: '2026-05-25T11:59:59.000Z',
    },
    secret,
  );

  assert.throws(() => verifyPhase3SessionToken(token, { secret, now }), UnauthorizedException);
}

function testTokenWithinConfiguredMaxAgePasses() {
  const token = createPhase3SessionToken(
    {
      ...validPayload(),
      issued_at: '2026-05-25T11:30:00.000Z',
      expires_at: '2026-05-25T12:30:00.000Z',
    },
    secret,
  );

  const context = verifyPhase3SessionToken(token, { secret, now, maxAgeSeconds: 3600 });
  assert.equal(context.organization_id, 'org-1');
  assert.equal(context.actor_user_id, 'user-1');
}

function testTokenExceedingConfiguredMaxAgeFailsClosed() {
  const token = createPhase3SessionToken(
    {
      ...validPayload(),
      issued_at: '2026-05-25T10:30:00.000Z',
      expires_at: '2026-05-25T12:30:00.000Z',
    },
    secret,
  );

  assert.throws(() => verifyPhase3SessionToken(token, { secret, now, maxAgeSeconds: 3600 }), UnauthorizedException);
}

function testInvalidSessionMaxAgeFailsClosed() {
  assert.throws(() => verifyPhase3SessionToken(validToken(), { secret, now, maxAgeSeconds: 0 }), UnauthorizedException);

  const previous = process.env.AKTI_AUTH_SESSION_MAX_AGE_SECONDS;
  process.env.AKTI_AUTH_SESSION_MAX_AGE_SECONDS = 'invalid';

  try {
    assert.throws(() => verifyPhase3SessionToken(validToken(), { secret, now }), UnauthorizedException);
  } finally {
    if (previous === undefined) {
      delete process.env.AKTI_AUTH_SESSION_MAX_AGE_SECONDS;
    } else {
      process.env.AKTI_AUTH_SESSION_MAX_AGE_SECONDS = previous;
    }
  }
}

function testFutureIssuedAtFailsClosed() {
  const token = createPhase3SessionToken(
    {
      ...validPayload(),
      issued_at: '2026-05-25T12:02:01.000Z',
      expires_at: '2026-05-25T12:30:00.000Z',
    },
    secret,
  );

  assert.throws(() => verifyPhase3SessionToken(token, { secret, now }), UnauthorizedException);
}

function testMissingRequiredPayloadContextFailsClosed() {
  const token = createPhase3SessionToken(
    {
      ...validPayload(),
      actor_user_id: '   ',
    },
    secret,
  );

  assert.throws(() => verifyPhase3SessionToken(token, { secret, now }), UnauthorizedException);
}

function testShortSessionSecretFailsClosed() {
  assert.throws(() => createPhase3SessionToken(validPayload(), 'short'), UnauthorizedException);
  assert.throws(() => verifyPhase3SessionToken(validToken(), { secret: 'short', now }), UnauthorizedException);
}

function testRouteOrganizationMismatchFailsClosed() {
  assert.throws(
    () =>
      resolveTrustedRequestContext(
        {
          authorization: `Bearer ${validToken()}`,
        },
        { secret, now, routeOrganizationId: 'org-2' },
      ),
    ForbiddenException,
  );
}

function testBodyContextMismatchFailsClosed() {
  const context = resolveTrustedRequestContext(
    {
      authorization: `Bearer ${validToken()}`,
    },
    { secret, now, routeOrganizationId: 'org-1' },
  );

  requireContextBodyMatch(context, {
    organization_id: 'org-1',
    actor_user_id: 'user-1',
  });

  assert.throws(
    () =>
      requireContextBodyMatch(context, {
        organization_id: 'org-2',
        actor_user_id: 'user-1',
      }),
    ForbiddenException,
  );

  assert.throws(
    () =>
      requireContextBodyMatch(context, {
        organization_id: 'org-1',
        actor_user_id: 'user-2',
      }),
    ForbiddenException,
  );
}

function createResponse(): RateLimitResponse & {
  statusCode: number | null;
  headers: Record<string, string | number>;
  body: unknown;
} {
  return {
    statusCode: null,
    headers: {},
    body: null,
    setHeader(name: string, value: string | number) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
    },
  };
}

function testRateLimitAllowsWithinWindowAndFailsClosedAfterLimit() {
  let nowMs = 1_000;
  const config = { windowMs: 10_000, maxRequests: 2, trustProxyHeaders: false };
  const limiter = new InMemoryRateLimiter(config, () => nowMs);
  const middleware = createRateLimitMiddleware(config, limiter);
  const request = {
    ip: '198.51.100.10',
    method: 'GET',
    originalUrl: '/api/lead-desk/organizations/org-1/leads?status=new',
    headers: {},
  };
  const nextCalls: string[] = [];

  middleware(request, createResponse(), () => nextCalls.push('first'));
  middleware(request, createResponse(), () => nextCalls.push('second'));

  const limitedResponse = createResponse();
  middleware(request, limitedResponse, () => nextCalls.push('third'));

  assert.deepEqual(nextCalls, ['first', 'second']);
  assert.equal(limitedResponse.statusCode, 429);
  assert.deepEqual(limitedResponse.body, {
    error: 'rate_limited',
    retry_after_seconds: 10,
    limit: 2,
    window_ms: 10_000,
  });
  assert.equal(limitedResponse.headers['Retry-After'], 10);
  assert.equal(limitedResponse.headers['X-RateLimit-Remaining'], 0);

  nowMs = 11_001;
  const resetResponse = createResponse();
  middleware(request, resetResponse, () => nextCalls.push('after-reset'));

  assert.equal(resetResponse.statusCode, null);
  assert.deepEqual(nextCalls, ['first', 'second', 'after-reset']);
}

function testRateLimitSeparatesClientsButNotDynamicRoutes() {
  const config = { windowMs: 10_000, maxRequests: 1, trustProxyHeaders: false };
  const limiter = new InMemoryRateLimiter(config, () => 1_000);
  const middleware = createRateLimitMiddleware(config, limiter);
  const nextCalls: string[] = [];

  middleware(
    {
      ip: '198.51.100.10',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {},
    },
    createResponse(),
    () => nextCalls.push('first-route'),
  );

  const secondRouteResponse = createResponse();
  middleware(
    {
      ip: '198.51.100.10',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/groups',
      headers: {},
    },
    secondRouteResponse,
    () => nextCalls.push('second-route'),
  );

  middleware(
    {
      ip: '203.0.113.20',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {},
    },
    createResponse(),
    () => nextCalls.push('second-client'),
  );

  assert.deepEqual(nextCalls, ['first-route', 'second-client']);
  assert.equal(secondRouteResponse.statusCode, 429);
}

function testRateLimitDoesNotTrustForwardedForByDefault() {
  const config = { windowMs: 10_000, maxRequests: 1, trustProxyHeaders: false };
  const limiter = new InMemoryRateLimiter(config, () => 1_000);
  const middleware = createRateLimitMiddleware(config, limiter);
  const nextCalls: string[] = [];

  middleware(
    {
      ip: '198.51.100.10',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {
        'x-forwarded-for': '203.0.113.20, 10.0.0.1',
      },
    },
    createResponse(),
    () => nextCalls.push('first'),
  );

  const spoofedForwardedResponse = createResponse();
  middleware(
    {
      ip: '198.51.100.10',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {
        'x-forwarded-for': '203.0.113.21, 10.0.0.1',
      },
    },
    spoofedForwardedResponse,
    () => nextCalls.push('spoofed-forwarded'),
  );

  assert.deepEqual(nextCalls, ['first']);
  assert.equal(spoofedForwardedResponse.statusCode, 429);
}

function testRateLimitTrustsFirstForwardedForOnlyWhenExplicitlyEnabled() {
  const config = { windowMs: 10_000, maxRequests: 1, trustProxyHeaders: true };
  const limiter = new InMemoryRateLimiter(config, () => 1_000);
  const middleware = createRateLimitMiddleware(config, limiter);
  const nextCalls: string[] = [];

  middleware(
    {
      ip: '10.0.0.10',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {
        'x-forwarded-for': '198.51.100.10, 10.0.0.1',
      },
    },
    createResponse(),
    () => nextCalls.push('first-forwarded-client'),
  );

  middleware(
    {
      ip: '10.0.0.10',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {
        'x-forwarded-for': '203.0.113.20, 198.51.100.10',
      },
    },
    createResponse(),
    () => nextCalls.push('second-forwarded-client'),
  );

  const repeatedForwardedResponse = createResponse();
  middleware(
    {
      ip: '10.0.0.11',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {
        'x-forwarded-for': '198.51.100.10, 203.0.113.20',
      },
    },
    repeatedForwardedResponse,
    () => nextCalls.push('repeated-forwarded-client'),
  );

  assert.deepEqual(nextCalls, ['first-forwarded-client', 'second-forwarded-client']);
  assert.equal(repeatedForwardedResponse.statusCode, 429);
}

function testInvalidTrustProxyConfigFallsBackSafely() {
  const config = readRateLimitConfig({
    AKTI_RATE_LIMIT_WINDOW_MS: '10000',
    AKTI_RATE_LIMIT_MAX_REQUESTS: '1',
    AKTI_TRUST_PROXY_HEADERS: 'yes',
  });
  const limiter = new InMemoryRateLimiter(config, () => 1_000);
  const middleware = createRateLimitMiddleware(config, limiter);
  const nextCalls: string[] = [];

  middleware(
    {
      ip: '198.51.100.10',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {
        'x-forwarded-for': '203.0.113.20',
      },
    },
    createResponse(),
    () => nextCalls.push('first'),
  );

  const invalidTrustProxyResponse = createResponse();
  middleware(
    {
      ip: '198.51.100.10',
      method: 'GET',
      originalUrl: '/platform/access/organizations/org-1/users',
      headers: {
        'x-forwarded-for': '203.0.113.21',
      },
    },
    invalidTrustProxyResponse,
    () => nextCalls.push('invalid-trust-proxy'),
  );

  assert.deepEqual(nextCalls, ['first']);
  assert.equal(invalidTrustProxyResponse.statusCode, 429);
}

function testRateLimitDynamicPathAndQueryVariationCannotBypass() {
  const config = { windowMs: 10_000, maxRequests: 1, trustProxyHeaders: false };

  for (const [firstUrl, secondUrl] of [
    ['/platform/access/organizations/org-1/users', '/platform/access/organizations/org-2/users'],
    ['/api/lead-desk/organizations/org-1/leads/lead-1', '/api/lead-desk/organizations/org-1/leads/lead-2'],
    ['/api/lead-desk/organizations/org-1/leads?status=new', '/api/lead-desk/organizations/org-1/leads?status=closed'],
  ]) {
    const limiter = new InMemoryRateLimiter(config, () => 1_000);
    const middleware = createRateLimitMiddleware(config, limiter);
    const nextCalls: string[] = [];

    middleware(
      {
        ip: '198.51.100.10',
        method: 'GET',
        originalUrl: firstUrl,
        headers: {},
      },
      createResponse(),
      () => nextCalls.push(firstUrl),
    );

    const variedPathResponse = createResponse();
    middleware(
      {
        ip: '198.51.100.10',
        method: 'GET',
        originalUrl: secondUrl,
        headers: {},
      },
      variedPathResponse,
      () => nextCalls.push(secondUrl),
    );

    assert.deepEqual(nextCalls, [firstUrl]);
    assert.equal(variedPathResponse.statusCode, 429);
  }
}

function testRateLimitConfigUsesSafeDefaultsAndRejectsInvalidValues() {
  assert.deepEqual(readRateLimitConfig({}), {
    windowMs: 60_000,
    maxRequests: 120,
    trustProxyHeaders: false,
  });

  assert.deepEqual(
    readRateLimitConfig({
      AKTI_RATE_LIMIT_WINDOW_MS: '5000',
      AKTI_RATE_LIMIT_MAX_REQUESTS: '10',
    }),
    {
      windowMs: 5_000,
      maxRequests: 10,
      trustProxyHeaders: false,
    },
  );

  assert.deepEqual(
    readRateLimitConfig({
      AKTI_RATE_LIMIT_WINDOW_MS: '5000',
      AKTI_RATE_LIMIT_MAX_REQUESTS: '10',
      AKTI_TRUST_PROXY_HEADERS: 'true',
    }),
    {
      windowMs: 5_000,
      maxRequests: 10,
      trustProxyHeaders: true,
    },
  );

  assert.deepEqual(
    readRateLimitConfig({
      AKTI_RATE_LIMIT_WINDOW_MS: '5000',
      AKTI_RATE_LIMIT_MAX_REQUESTS: '10',
      AKTI_TRUST_PROXY_HEADERS: 'yes',
    }),
    {
      windowMs: 5_000,
      maxRequests: 10,
      trustProxyHeaders: false,
    },
  );

  assert.throws(
    () =>
      readRateLimitConfig({
        AKTI_RATE_LIMIT_WINDOW_MS: '0',
        AKTI_RATE_LIMIT_MAX_REQUESTS: '10',
      }),
    /AKTI_RATE_LIMIT_WINDOW_MS must be a positive integer/,
  );
  assert.throws(
    () =>
      readRateLimitConfig({
        AKTI_RATE_LIMIT_WINDOW_MS: '5000',
        AKTI_RATE_LIMIT_MAX_REQUESTS: '1.5',
      }),
    /AKTI_RATE_LIMIT_MAX_REQUESTS must be a positive integer/,
  );
}

function runtimeEnv(overrides?: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return {
    AKTI_AUTH_SESSION_SECRET: 'phase3-runtime-secret-value',
    ...(overrides ?? {}),
  };
}

function testRuntimeEnvironmentRequiresSecretAndParsesApprovedEnv() {
  assert.throws(
    () => readApiRuntimeEnvironment({}),
    /AKTI_AUTH_SESSION_SECRET must be configured outside source control/,
  );

  const env = readApiRuntimeEnvironment(
    runtimeEnv({
      PORT: '4001',
      AKTI_AUTH_SESSION_MAX_AGE_SECONDS: '1800',
      AKTI_CORS_ALLOWED_ORIGINS: 'http://localhost:3000,https://example.org',
      AKTI_SECURITY_HEADERS_ENABLED: 'false',
      AKTI_RATE_LIMIT_WINDOW_MS: '5000',
      AKTI_RATE_LIMIT_MAX_REQUESTS: '10',
      AKTI_TRUST_PROXY_HEADERS: 'true',
    }),
  );

  assert.deepEqual(env, {
    port: 4001,
    authSessionSecret: 'phase3-runtime-secret-value',
    authSessionMaxAgeSeconds: 1800,
    corsAllowedOrigins: ['http://localhost:3000', 'https://example.org'],
    securityHeadersEnabled: false,
    rateLimit: {
      windowMs: 5_000,
      maxRequests: 10,
      trustProxyHeaders: true,
    },
  });

  assert.throws(
    () => readApiRuntimeEnvironment(runtimeEnv({ AKTI_SECURITY_HEADERS_ENABLED: 'yes' })),
    /AKTI_SECURITY_HEADERS_ENABLED must be true or false/,
  );
  assert.throws(
    () => readApiRuntimeEnvironment(runtimeEnv({ AKTI_CORS_ALLOWED_ORIGINS: '*' })),
    /AKTI_CORS_ALLOWED_ORIGINS must not contain wildcard/,
  );
  assert.throws(
    () => readApiRuntimeEnvironment(runtimeEnv({ AKTI_AUTH_SESSION_MAX_AGE_SECONDS: '0' })),
    /AKTI_AUTH_SESSION_MAX_AGE_SECONDS must be a positive integer/,
  );
}

function testSecurityHeadersMiddleware() {
  const response = createResponse();
  const nextCalls: string[] = [];

  createSecurityHeadersMiddleware(true)({}, response, () => nextCalls.push('enabled'));

  for (const [name, value] of API_SECURITY_HEADERS) {
    assert.equal(response.headers[name], value);
  }
  assert.deepEqual(nextCalls, ['enabled']);

  const disabledResponse = createResponse();
  createSecurityHeadersMiddleware(false)({}, disabledResponse, () => nextCalls.push('disabled'));
  assert.deepEqual(disabledResponse.headers, {});
  assert.deepEqual(nextCalls, ['enabled', 'disabled']);
}

function testCorsAllowListValidatorAndConfiguration() {
  const validator = createCorsOriginValidator(['http://localhost:3000']);

  validator('http://localhost:3000', (error, allowed) => {
    assert.equal(error, null);
    assert.equal(allowed, true);
  });

  validator('http://unknown.example', (error, allowed) => {
    assert.ok(error instanceof Error);
    assert.equal(allowed, false);
  });

  validator(undefined, (error, allowed) => {
    assert.equal(error, null);
    assert.equal(allowed, false);
  });

  const corsCalls: unknown[] = [];
  configureCors(
    {
      enableCors(options: unknown) {
        corsCalls.push(options);
      },
    },
    [],
  );
  assert.equal(corsCalls.length, 0);

  configureCors(
    {
      enableCors(options: unknown) {
        corsCalls.push(options);
      },
    },
    ['http://localhost:3000'],
  );
  assert.equal(corsCalls.length, 1);
}

function run() {
  testValidTokenResolvesTrustedContext();
  testMissingBearerFailsClosed();
  testLegacyActorHeaderIsNotSessionFallback();
  testMalformedAuthorizationFailsClosed();
  testTamperedTokenFailsClosed();
  testExpiredTokenFailsClosed();
  testTokenWithinConfiguredMaxAgePasses();
  testTokenExceedingConfiguredMaxAgeFailsClosed();
  testInvalidSessionMaxAgeFailsClosed();
  testFutureIssuedAtFailsClosed();
  testMissingRequiredPayloadContextFailsClosed();
  testShortSessionSecretFailsClosed();
  testRouteOrganizationMismatchFailsClosed();
  testBodyContextMismatchFailsClosed();
  testRateLimitAllowsWithinWindowAndFailsClosedAfterLimit();
  testRateLimitSeparatesClientsButNotDynamicRoutes();
  testRateLimitDoesNotTrustForwardedForByDefault();
  testRateLimitTrustsFirstForwardedForOnlyWhenExplicitlyEnabled();
  testInvalidTrustProxyConfigFallsBackSafely();
  testRateLimitDynamicPathAndQueryVariationCannotBypass();
  testRateLimitConfigUsesSafeDefaultsAndRejectsInvalidValues();
  testRuntimeEnvironmentRequiresSecretAndParsesApprovedEnv();
  testSecurityHeadersMiddleware();
  testCorsAllowListValidatorAndConfiguration();

  console.log('request-context tests passed');
}

run();
