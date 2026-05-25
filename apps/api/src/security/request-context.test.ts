import assert from 'node:assert/strict';

import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

import {
  createPhase3SessionToken,
  requireContextBodyMatch,
  resolveTrustedRequestContext,
  verifyPhase3SessionToken,
} from './request-context';

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

function run() {
  testValidTokenResolvesTrustedContext();
  testMissingBearerFailsClosed();
  testTamperedTokenFailsClosed();
  testExpiredTokenFailsClosed();
  testRouteOrganizationMismatchFailsClosed();
  testBodyContextMismatchFailsClosed();

  console.log('request-context tests passed');
}

run();
