import assert from 'node:assert/strict';

import type {
  GatekeeperDecisionResult,
  GatekeeperRequest,
} from '@akti/contracts/gatekeeper-contract';

import { GatekeeperPreflightService } from './gatekeeper-preflight.service';

type ProviderHarness = {
  phase1DecisionProvider: {
    decide(request: GatekeeperRequest): GatekeeperDecisionResult;
  };
};

function provider() {
  return (new GatekeeperPreflightService() as unknown as ProviderHarness).phase1DecisionProvider;
}

function gatekeeperRequest(overrides?: Partial<GatekeeperRequest>): GatekeeperRequest {
  return {
    request_id: 'gk_req_008b',
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    entity_type: 'access.group',
    entity_id: 'group-1',
    scope_unit_id: null,
    payload: {
      action_key: 'access.group.updated',
    },
    requested_at: new Date().toISOString(),
    context: {
      current_organization_id: 'org-1',
      current_user_id: 'actor-1',
      active_scope_unit_id: null,
      active_group_ids: ['group-1'],
      capabilities: ['access.policy.manage'],
      module_health: {
        'core.access': 'healthy',
      },
      dependency_health: {},
      reauth_status: 'not_required',
    },
    ...overrides,
  };
}

function assertDenyWithChecklistKey(
  decision: GatekeeperDecisionResult,
  reasonCode: string,
  checkKey: string,
) {
  assert.equal(decision.decision, 'deny');
  assert.deepEqual(
    decision.reasons.map((reason) => reason.code),
    [reasonCode],
  );
  assert.deepEqual(
    decision.checks.map((check) => check.check_key),
    [checkKey],
  );
}

function testTenantOrganizationMismatchProducesTenantChecklistDeny() {
  const decision = provider().decide(
    gatekeeperRequest({
      context: {
        ...gatekeeperRequest().context,
        current_organization_id: 'org-2',
      },
    }),
  );

  assertDenyWithChecklistKey(
    decision,
    'gatekeeper.organization.mismatch',
    'gatekeeper.tenant.organization-match',
  );
}

function testTenantActorMismatchProducesTenantChecklistDeny() {
  const decision = provider().decide(
    gatekeeperRequest({
      context: {
        ...gatekeeperRequest().context,
        current_user_id: 'actor-2',
      },
    }),
  );

  assertDenyWithChecklistKey(
    decision,
    'gatekeeper.actor.mismatch',
    'gatekeeper.tenant.actor-match',
  );
}

function testMissingActiveGroupsProducesTenantChecklistDeny() {
  const decision = provider().decide(
    gatekeeperRequest({
      context: {
        ...gatekeeperRequest().context,
        active_group_ids: [],
      },
    }),
  );

  assertDenyWithChecklistKey(
    decision,
    'gatekeeper.active-groups.missing',
    'gatekeeper.tenant.active-groups-present',
  );
}

function testValidTenantContextStillAllows() {
  const decision = provider().decide(gatekeeperRequest());

  assert.equal(decision.decision, 'allow');
  assert.equal(decision.organization_id, 'org-1');
  assert.equal(decision.actor_user_id, 'actor-1');
}

function run() {
  testTenantOrganizationMismatchProducesTenantChecklistDeny();
  testTenantActorMismatchProducesTenantChecklistDeny();
  testMissingActiveGroupsProducesTenantChecklistDeny();
  testValidTenantContextStillAllows();

  console.log('P5B-008b gatekeeper tenant-context checklist tests passed.');
}

run();
