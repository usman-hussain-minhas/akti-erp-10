import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import type {
  GatekeeperDecisionResult,
  GatekeeperRequest,
} from '@akti/contracts/gatekeeper-contract';

import {
  GatekeeperPreflightService,
  type GatekeeperPreflightInput,
} from './gatekeeper-preflight.service';

class TestGatekeeperPreflightService extends GatekeeperPreflightService {
  readonly requests: GatekeeperRequest[] = [];

  constructor(private readonly handler: (request: GatekeeperRequest) => Promise<unknown> | unknown) {
    super();
  }

  protected override async provideDecision(request: GatekeeperRequest): Promise<unknown> {
    this.requests.push(request);
    return this.handler(request);
  }
}

function preflightInput(overrides?: Partial<GatekeeperPreflightInput>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    active_group_ids: ['group-1'],
    entity_type: 'access.group',
    entity_id: null,
    action_key: 'access.group.created',
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function reason(code: string, message: string): GatekeeperDecisionResult['reasons'][number] {
  return {
    code,
    message,
    severity: 'error',
  };
}

function failedCheck(
  checkKey: string,
  checkReason: GatekeeperDecisionResult['reasons'][number],
): GatekeeperDecisionResult['checks'][number] {
  return {
    check_key: checkKey,
    status: 'failed',
    reason: checkReason,
    evidence_required: [],
    evidence_present: [],
  };
}

function decisionFor(
  request: GatekeeperRequest,
  overrides?: Partial<GatekeeperDecisionResult>,
): GatekeeperDecisionResult {
  const deniedReason = reason('gatekeeper.test.denied', 'Gatekeeper test decision denied the mutation.');
  const checks =
    overrides?.decision === 'degraded_block'
      ? [failedCheck('gatekeeper.test.degraded', deniedReason)]
      : (overrides?.checks ?? [
          {
            check_key: 'gatekeeper.test.preflight',
            status: 'passed' as const,
            reason: null,
            evidence_required: [],
            evidence_present: [],
          },
        ]);
  const reasons =
    overrides?.decision === 'deny' || overrides?.decision === 'degraded_block'
      ? (overrides.reasons ?? [deniedReason])
      : (overrides?.reasons ?? []);

  const baseDecision: GatekeeperDecisionResult = {
    decision: 'allow',
    request_id: request.request_id,
    capability_key: request.capability_key,
    actor_user_id: request.actor_user_id,
    organization_id: request.organization_id,
    reasons: [],
    checks: [],
    required_evidence: [],
    missing_evidence: [],
    reauth_required: false,
    decision_token: `decision-${request.request_id}`,
    expires_at: new Date(Date.now() + 60_000).toISOString(),
  };

  return {
    ...baseDecision,
    ...overrides,
    reasons,
    checks,
  };
}

async function testDefaultProviderAllowsValidAccessCorePreflight() {
  const service = new GatekeeperPreflightService();

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'allow');
  assert.equal(decision.capability_key, 'access.policy.manage');
  assert.equal(decision.actor_user_id, 'actor-1');
  assert.ok(decision.decision_token);
}

async function testDefaultProviderAllowsValidPhase2Preflights() {
  const service = new GatekeeperPreflightService();
  const capabilities = [
    {
      capability_key: 'engagement.gateway.request.create',
      module_key: 'engagement.gateway',
      entity_type: 'engagement.gateway.request',
      action_key: 'engagement.gateway.request.recorded',
      module_health: {
        'engagement.gateway': 'healthy',
      },
      dependency_health: {
        'core.access': 'healthy',
      },
    },
    {
      capability_key: 'lead.intake.create',
      module_key: 'lead.desk',
      entity_type: 'lead.record',
      action_key: 'lead.desk.lead.created',
      module_health: {
        'lead.desk': 'healthy',
      },
      dependency_health: {
        'core.access': 'healthy',
        'engagement.gateway': 'healthy',
      },
    },
    {
      capability_key: 'lead.status.update',
      module_key: 'lead.desk',
      entity_type: 'lead.record',
      action_key: 'lead.desk.lead.status.updated',
      module_health: {
        'lead.desk': 'healthy',
      },
      dependency_health: {
        'core.access': 'healthy',
        'engagement.gateway': 'healthy',
      },
    },
    {
      capability_key: 'lead.inbox.assign',
      module_key: 'lead.desk',
      entity_type: 'lead.record',
      action_key: 'lead.desk.lead.assigned',
      module_health: {
        'lead.desk': 'healthy',
      },
      dependency_health: {
        'core.access': 'healthy',
        'engagement.gateway': 'healthy',
      },
    },
  ] as const;

  for (const capability of capabilities) {
    const decision = await service.requireAllow(
      preflightInput({
        ...capability,
      }),
    );

    assert.equal(decision.decision, 'allow');
    assert.equal(decision.capability_key, capability.capability_key);
    assert.equal(decision.actor_user_id, 'actor-1');
    assert.ok(decision.decision_token);
  }
}

async function testDefaultProviderDeniesInvalidContext() {
  const service = new GatekeeperPreflightService();

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        module_health: {
          'core.access': 'degraded',
        },
      }),
    ),
    (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      return true;
    },
  );

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        capability_key: 'access.unknown',
      }),
    ),
    (error: unknown) => {
      assert.ok(error instanceof ForbiddenException);
      return true;
    },
  );

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        active_group_ids: [],
      }),
    ),
    (error: unknown) => {
      assert.ok(error instanceof ForbiddenException);
      return true;
    },
  );

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        capability_key: 'lead.intake.create',
        module_key: 'lead.desk',
        module_health: {
          'core.access': 'healthy',
        },
      }),
    ),
    (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      return true;
    },
  );

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        capability_key: 'lead.intake.create',
        module_key: 'lead.desk',
        dependency_health: {
          'core.access': 'healthy',
        },
      }),
    ),
    (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      return true;
    },
  );

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        capability_key: 'lead.intake.create',
        module_key: 'lead.desk',
        dependency_health: {
          'core.access': 'healthy',
          'engagement.gateway': 'degraded',
        },
      }),
    ),
    (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      return true;
    },
  );

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        capability_key: 'lead.intake.create',
        module_key: 'engagement.gateway',
      }),
    ),
    (error: unknown) => {
      assert.ok(error instanceof ForbiddenException);
      return true;
    },
  );
}

async function testDefaultProviderRequiresExplicitHealthContext() {
  const service = new GatekeeperPreflightService();

  await assert.rejects(
    service.requireAllow({
      ...preflightInput(),
      module_health: undefined,
      dependency_health: undefined,
    }),
    (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      return true;
    },
  );
}

async function testDenyApprovalAndInvalidDecisionsFailClosed() {
  const denyService = new TestGatekeeperPreflightService((request) =>
    decisionFor(request, {
      decision: 'deny',
      decision_token: undefined,
      expires_at: null,
    }),
  );

  await assert.rejects(denyService.requireAllow(preflightInput()), ForbiddenException);

  const approvalRequiredService = new TestGatekeeperPreflightService((request) =>
    decisionFor(request, {
      decision: 'approval_required',
      decision_token: undefined,
      approval_chain_key: 'access.policy.approval',
      reasons: [
        {
          code: 'gatekeeper.test.approval-required',
          message: 'Approval runtime is not available in Phase 1.',
          severity: 'warning',
        },
      ],
      missing_evidence: ['gatekeeper.test.evidence'],
      expires_at: null,
    }),
  );

  await assert.rejects(approvalRequiredService.requireAllow(preflightInput()), ForbiddenException);

  const invalidDecisionService = new TestGatekeeperPreflightService((request) => ({
    ...decisionFor(request),
    decision: 'allow',
    decision_token: undefined,
  }));

  await assert.rejects(invalidDecisionService.requireAllow(preflightInput()), ForbiddenException);
}

async function testInvalidRequestFailsClosedBeforeProvider() {
  const service = new TestGatekeeperPreflightService(() => {
    throw new Error('provider should not be called for invalid requests');
  });

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        entity_type: 'Invalid Entity Type',
      }),
    ),
    ForbiddenException,
  );

  assert.equal(service.requests.length, 0);
}

async function testDegradedAndProviderErrorsFailClosed() {
  const degradedService = new TestGatekeeperPreflightService((request) =>
    decisionFor(request, {
      decision: 'degraded_block',
      decision_token: undefined,
      expires_at: null,
    }),
  );

  await assert.rejects(degradedService.requireAllow(preflightInput()), ServiceUnavailableException);

  const throwingService = new TestGatekeeperPreflightService(() => {
    throw new Error('provider unavailable');
  });

  await assert.rejects(throwingService.requireAllow(preflightInput()), ForbiddenException);
}

async function testMismatchedDecisionFailsClosed() {
  const mismatches: Array<Partial<GatekeeperDecisionResult>> = [
    { request_id: 'wrong-request' },
    { actor_user_id: 'wrong-actor' },
    { organization_id: 'wrong-org' },
    { capability_key: 'access.wrong' },
  ];

  for (const mismatch of mismatches) {
    const service = new TestGatekeeperPreflightService((request) => decisionFor(request, mismatch));

    await assert.rejects(service.requireAllow(preflightInput()), ForbiddenException);
  }
}

function testGatekeeperSchemasAreNotDuplicatedInApi() {
  const source = readFileSync('src/gatekeeper/gatekeeper-preflight.service.ts', 'utf8');

  assert.equal(source.includes('from \'zod\''), false);
  assert.equal(source.includes('from "zod"'), false);
  assert.equal(source.includes('z.object'), false);
  assert.equal(source.includes('GatekeeperRequestSchema ='), false);
  assert.equal(source.includes('GatekeeperDecisionResultSchema ='), false);
  assert.equal(source.includes('new Function(\'specifier\', \'return import(specifier)\')'), true);
  assert.equal(source.includes('approval-engine'), false);
}

async function run() {
  await testDefaultProviderAllowsValidAccessCorePreflight();
  await testDefaultProviderAllowsValidPhase2Preflights();
  await testDefaultProviderDeniesInvalidContext();
  await testDefaultProviderRequiresExplicitHealthContext();
  await testDenyApprovalAndInvalidDecisionsFailClosed();
  await testInvalidRequestFailsClosedBeforeProvider();
  await testDegradedAndProviderErrorsFailClosed();
  await testMismatchedDecisionFailsClosed();
  testGatekeeperSchemasAreNotDuplicatedInApi();

  console.log('gatekeeper-preflight.service tests passed');
}

void run();
