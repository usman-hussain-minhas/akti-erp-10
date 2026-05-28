import assert from 'node:assert/strict';

import { BadRequestException, ForbiddenException, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { GatekeeperController } from './gatekeeper.controller';
import { type GatekeeperPreflightInput } from './gatekeeper-preflight.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-gatekeeper-preflight-api-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

type ServiceCall = {
  input: GatekeeperPreflightInput;
};

function trustedHeaders(organizationId = 'org-1', actorUserId = 'actor-1'): HeaderRecord {
  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        issued_at: new Date(Date.now() - 60_000).toISOString(),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      AUTH_SECRET,
    )}`,
  };
}

function validBody(overrides?: Record<string, unknown>) {
  return {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    active_group_ids: ['group-1'],
    entity_type: 'access.group',
    entity_id: 'group-1',
    action_key: 'access.group.updated',
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    scope_unit_id: 'scope-1',
    payload: {
      correlation_id: 'corr-007d',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    reauth_status: 'not_required',
    ...overrides,
  };
}

function createController() {
  const calls: ServiceCall[] = [];
  const service = {
    requireAllow: async (input: GatekeeperPreflightInput) => {
      calls.push({ input });
      return {
        decision: 'ALLOW',
        request_id: 'gk_req_test',
        capability_key: input.capability_key ?? 'access.policy.manage',
        actor_user_id: input.actor_user_id,
        organization_id: input.organization_id,
        reasons: [],
        checks: [
          {
            check_key: 'gatekeeper.preflight.api',
            status: 'passed',
            reason: null,
            evidence_required: [],
            evidence_present: [],
          },
        ],
        required_evidence: [],
        missing_evidence: [],
        reauth_required: false,
        decision_token: 'gk_decision_test',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      };
    },
  };

  return {
    calls,
    controller: new GatekeeperController(service as never),
  };
}

function testGatekeeperPreflightRouteMetadataIsExplicit() {
  const descriptor = Object.getOwnPropertyDescriptor(GatekeeperController.prototype, 'preflight');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, GatekeeperController), 'platform/gatekeeper');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'preflight');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.POST);
}

async function testGatekeeperPreflightApiUsesTrustedTenantAndActorContext() {
  const { controller, calls } = createController();

  const result = await controller.preflight(validBody(), trustedHeaders());

  assert.equal(result.decision, 'ALLOW');
  assert.equal(result.capability_key, 'access.policy.manage');
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].input, {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    active_group_ids: ['group-1'],
    entity_type: 'access.group',
    entity_id: 'group-1',
    action_key: 'access.group.updated',
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    scope_unit_id: 'scope-1',
    payload: {
      correlation_id: 'corr-007d',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    reauth_status: 'not_required',
  });
}

function testGatekeeperPreflightApiRejectsInvalidAndMismatchedContext() {
  const { controller } = createController();

  assert.throws(
    () => controller.preflight(validBody({ organization_id: ' ' }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.preflight(validBody({ active_group_ids: [] }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.preflight(validBody({ module_health: { 'core.access': 'offline' } }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.preflight(validBody(), trustedHeaders('org-2')),
    ForbiddenException,
  );
  assert.throws(
    () => controller.preflight(validBody({ actor_user_id: 'actor-2' }), trustedHeaders()),
    ForbiddenException,
  );
}

async function run() {
  testGatekeeperPreflightRouteMetadataIsExplicit();
  await testGatekeeperPreflightApiUsesTrustedTenantAndActorContext();
  testGatekeeperPreflightApiRejectsInvalidAndMismatchedContext();

  console.log('P5B-007d gatekeeper preflight API tests passed.');
}

void run();
