import assert from 'node:assert/strict';

import { ForbiddenException } from '@nestjs/common';
import type { GatekeeperDecisionResult, GatekeeperRequest } from '@akti/contracts/gatekeeper-contract';

import { GatekeeperPreflightService, type GatekeeperPreflightInput } from './gatekeeper-preflight.service';

class TestGatekeeperPreflightService extends GatekeeperPreflightService {
  readonly requests: GatekeeperRequest[] = [];

  protected override async provideDecision(request: GatekeeperRequest): Promise<unknown> {
    this.requests.push(request);
    return decisionFor(request);
  }
}

function preflightInput(overrides?: Partial<GatekeeperPreflightInput>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-026d',
    actor_user_id: 'actor-026d',
    active_group_ids: ['group-026d'],
    entity_type: 'foundry.module',
    entity_id: 'platform.fixture',
    action_key: 'module.install',
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    payload: {
      action_key: 'module.install',
      correlation_id: 'corr-p5b-026d',
      risk_surface: 'migration',
      migration_risk: 'non_destructive',
      rollback_risk: 'covered',
      migration_validation_passed: true,
      rollback_validation_passed: true,
      rollback_evidence_present: true,
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function decisionFor(request: GatekeeperRequest): GatekeeperDecisionResult {
  return {
    decision: 'ALLOW',
    request_id: request.request_id,
    capability_key: request.capability_key,
    actor_user_id: request.actor_user_id,
    organization_id: request.organization_id,
    reasons: [],
    checks: [
      {
        check_key: 'gatekeeper.p5b-026d.tenant-boundary',
        status: 'passed',
        reason: null,
        evidence_required: [],
        evidence_present: [],
      },
    ],
    required_evidence: [],
    missing_evidence: [],
    reauth_required: false,
    decision_token: `decision-${request.request_id}`,
    expires_at: new Date(Date.now() + 60_000).toISOString(),
  };
}

async function testRejectsPayloadOrganizationMismatchBeforeDecisionProvider() {
  const service = new TestGatekeeperPreflightService();

  await assert.rejects(
    () =>
      service.requireAllow(
        preflightInput({
          payload: {
            action_key: 'module.install',
            organization_id: 'org-foreign',
          },
        }),
      ),
    (error: unknown) => {
      assert.ok(error instanceof ForbiddenException);
      assert.match(error.message, /tenant boundary/);
      return true;
    },
  );

  assert.equal(service.requests.length, 0);
}

async function testRejectsFoundryTargetOrganizationMismatchBeforeDecisionProvider() {
  const service = new TestGatekeeperPreflightService();

  await assert.rejects(
    () =>
      service.requireAllow(
        preflightInput({
          payload: {
            action_key: 'module.install',
            target_organization_id: 'org-foreign',
          },
        }),
      ),
    (error: unknown) => {
      assert.ok(error instanceof ForbiddenException);
      assert.match(error.message, /tenant boundary/);
      return true;
    },
  );

  assert.equal(service.requests.length, 0);
}

async function testAllowsSameTenantFoundryGatekeeperPayload() {
  const service = new TestGatekeeperPreflightService();

  const decision = await service.requireAllow(
    preflightInput({
      payload: {
        action_key: 'module.install',
        organization_id: 'org-026d',
        target_organization_id: 'org-026d',
      },
    }),
  );

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(service.requests.length, 1);
  assert.equal(service.requests[0].organization_id, 'org-026d');
  assert.equal(service.requests[0].payload.organization_id, 'org-026d');
  assert.equal(service.requests[0].payload.target_organization_id, 'org-026d');
}

async function run() {
  await testRejectsPayloadOrganizationMismatchBeforeDecisionProvider();
  await testRejectsFoundryTargetOrganizationMismatchBeforeDecisionProvider();
  await testAllowsSameTenantFoundryGatekeeperPayload();

  console.log('P5B-026d Foundry/Gatekeeper cross-tenant negative tests passed.');
}

void run();
