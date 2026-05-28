import assert from 'node:assert/strict';

import { UnauthorizedException } from '@nestjs/common';

import { CurrentUserController } from './current-user.controller';
import { CurrentUserProfile, CurrentUserService } from './current-user.service';
import { HeaderRecord, createPhase3SessionToken } from './request-context';

const AUTH_SECRET = 'phase5b-current-user-controller-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-1', actorUserId = 'user-1'): HeaderRecord {
  const issuedAt = new Date(Date.now() - 60_000).toISOString();
  const expiresAt = new Date(Date.now() + 60_000).toISOString();

  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        issued_at: issuedAt,
        expires_at: expiresAt,
      },
      AUTH_SECRET,
    )}`,
  };
}

function profile(): CurrentUserProfile {
  return {
    organization_id: 'org-1',
    user: {
      id: 'user-1',
      email: 'user@example.org',
      display_name: 'User One',
      status: 'active',
      primary_unit_id: 'unit-1',
      primary_unit: {
        id: 'unit-1',
        key: 'main-campus',
        name: 'Main Campus',
        status: 'active',
      },
    },
    active_group_ids: ['group-1'],
    groups: [
      {
        id: 'group-1',
        key: 'platform.admin',
        label: 'Platform Admin',
        status: 'active',
      },
    ],
    capabilities: [
      {
        capability_key: 'platform.shell.access',
        module_key: 'core.platform',
        scope_type: 'organization',
        scope_unit_id: null,
        risk_level: 'low',
        gatekeeper_required: false,
        approval_chain_required: false,
        source_group_ids: ['group-1'],
      },
    ],
  };
}

function createController() {
  const calls: Array<{ organization_id: string; actor_user_id: string }> = [];
  const service = {
    getCurrentUserProfile: async (context: { organization_id: string; actor_user_id: string }) => {
      calls.push(context);
      return profile();
    },
  };

  return {
    calls,
    controller: new CurrentUserController(service as CurrentUserService),
  };
}

async function testGetCurrentUserUsesTrustedBearerContext() {
  const { controller, calls } = createController();

  const result = await controller.getCurrentUser(trustedHeaders());

  assert.equal(result.organization_id, 'org-1');
  assert.equal(result.user.id, 'user-1');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].organization_id, 'org-1');
  assert.equal(calls[0].actor_user_id, 'user-1');
}

function testGetCurrentUserRejectsMissingBearerAndLegacyActorHeader() {
  const { controller } = createController();

  assert.throws(() => controller.getCurrentUser({}), UnauthorizedException);
  assert.throws(() => controller.getCurrentUser({ 'x-actor-user-id': 'user-1' }), UnauthorizedException);
}

async function run() {
  await testGetCurrentUserUsesTrustedBearerContext();
  testGetCurrentUserRejectsMissingBearerAndLegacyActorHeader();

  console.log('current-user controller tests passed');
}

void run();
