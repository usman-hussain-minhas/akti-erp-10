import assert from 'node:assert/strict';

import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import type {
  GatekeeperDecisionResult,
  GatekeeperRequest,
} from '@akti/contracts/gatekeeper-contract';

import {
  GatekeeperPreflightService,
  type GatekeeperPreflightInput,
} from './gatekeeper-preflight.service';

type GatekeeperContractsRuntime = {
  GatekeeperCanonicalOutcomeSchema: {
    options: string[];
  };
  GatekeeperDecisionResultSchema: {
    parse(input: unknown): unknown;
  };
  normalizeGatekeeperDecisionOutcome(decision: GatekeeperDecisionResult['decision']): string;
};

const nativeImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>;

async function loadGatekeeperContractsRuntime(): Promise<GatekeeperContractsRuntime> {
  const contracts = (await nativeImport('@akti/contracts/gatekeeper-contract')) as Partial<GatekeeperContractsRuntime>;

  assert.ok(contracts.GatekeeperCanonicalOutcomeSchema);
  assert.ok(contracts.GatekeeperDecisionResultSchema);
  assert.equal(typeof contracts.normalizeGatekeeperDecisionOutcome, 'function');

  return contracts as GatekeeperContractsRuntime;
}

class TestGatekeeperPreflightService extends GatekeeperPreflightService {
  constructor(private readonly handler: (request: GatekeeperRequest) => Promise<unknown> | unknown) {
    super();
  }

  protected override async provideDecision(request: GatekeeperRequest): Promise<unknown> {
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

function failedReason() {
  return {
    code: 'gatekeeper.test.stop-for-review',
    message: 'Gatekeeper test requires platform review.',
    severity: 'error' as const,
  };
}

function failedCheck(reason: ReturnType<typeof failedReason>): GatekeeperDecisionResult['checks'][number] {
  return {
    check_key: 'gatekeeper.test.preflight',
    status: 'failed',
    reason,
    evidence_required: [],
    evidence_present: [],
  };
}

function decisionFor(
  request: GatekeeperRequest,
  overrides?: Partial<GatekeeperDecisionResult>,
): GatekeeperDecisionResult {
  const reason = failedReason();
  const baseDecision: GatekeeperDecisionResult = {
    decision: 'ALLOW',
    request_id: request.request_id,
    capability_key: request.capability_key,
    actor_user_id: request.actor_user_id,
    organization_id: request.organization_id,
    reasons: [],
    checks: [
      {
        check_key: 'gatekeeper.test.preflight',
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

  if (overrides?.decision === 'STOP_FOR_REVIEW') {
    return {
      ...baseDecision,
      ...overrides,
      decision_token: undefined,
      reasons: overrides.reasons ?? [reason],
      checks: overrides.checks ?? [failedCheck(reason)],
      expires_at: null,
    };
  }

  if (overrides?.decision === 'DENY') {
    return {
      ...baseDecision,
      ...overrides,
      decision_token: undefined,
      reasons: overrides.reasons ?? [reason],
      checks: overrides.checks ?? [failedCheck(reason)],
      expires_at: null,
    };
  }

  if (overrides?.decision === 'APPROVAL_REQUIRED') {
    return {
      ...baseDecision,
      ...overrides,
      decision_token: undefined,
      reasons: overrides.reasons ?? [
        {
          code: 'gatekeeper.test.approval-required',
          message: 'Gatekeeper test requires an approval chain.',
          severity: 'warning',
        },
      ],
      missing_evidence: overrides.missing_evidence ?? ['gatekeeper.test.evidence'],
      approval_chain_key: overrides.approval_chain_key ?? 'gatekeeper.test.approval',
      expires_at: null,
    };
  }

  return {
    ...baseDecision,
    ...overrides,
  };
}

async function testGatekeeperContractDeclaresCanonicalOutcomes() {
  const contracts = await loadGatekeeperContractsRuntime();

  assert.deepEqual(contracts.GatekeeperCanonicalOutcomeSchema.options, [
    'ALLOW',
    'DENY',
    'APPROVAL_REQUIRED',
    'STOP_FOR_REVIEW',
  ]);
}

async function testGatekeeperLegacyOutcomesNormalizeToCanonicalContractOutcomes() {
  const contracts = await loadGatekeeperContractsRuntime();

  assert.equal(contracts.normalizeGatekeeperDecisionOutcome('allow'), 'ALLOW');
  assert.equal(contracts.normalizeGatekeeperDecisionOutcome('deny'), 'DENY');
  assert.equal(contracts.normalizeGatekeeperDecisionOutcome('approval_required'), 'APPROVAL_REQUIRED');
  assert.equal(contracts.normalizeGatekeeperDecisionOutcome('degraded_block'), 'STOP_FOR_REVIEW');
}

async function testGatekeeperContractParsesCanonicalDecisionResults() {
  const contracts = await loadGatekeeperContractsRuntime();
  const allow = contracts.GatekeeperDecisionResultSchema.parse(
    decisionFor({
      request_id: 'req-allow',
      organization_id: 'org-1',
      actor_user_id: 'actor-1',
      capability_key: 'access.policy.manage',
    } as GatekeeperRequest),
  );
  assert.equal((allow as GatekeeperDecisionResult).decision, 'ALLOW');

  const stopReason = failedReason();
  const stopForReview = contracts.GatekeeperDecisionResultSchema.parse(
    decisionFor(
      {
        request_id: 'req-stop',
        organization_id: 'org-1',
        actor_user_id: 'actor-1',
        capability_key: 'access.policy.manage',
      } as GatekeeperRequest,
      {
        decision: 'STOP_FOR_REVIEW',
        reasons: [stopReason],
        checks: [failedCheck(stopReason)],
      },
    ),
  );
  assert.equal((stopForReview as GatekeeperDecisionResult).decision, 'STOP_FOR_REVIEW');
}

async function testGatekeeperRuntimeAcceptsCanonicalAllowOutcome() {
  const service = new TestGatekeeperPreflightService((request) => decisionFor(request));

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
}

async function testGatekeeperRuntimeBlocksCanonicalNonAllowOutcomes() {
  const stopForReviewService = new TestGatekeeperPreflightService((request) =>
    decisionFor(request, { decision: 'STOP_FOR_REVIEW' }),
  );
  await assert.rejects(stopForReviewService.requireAllow(preflightInput()), ServiceUnavailableException);

  const denyService = new TestGatekeeperPreflightService((request) =>
    decisionFor(request, { decision: 'DENY' }),
  );
  await assert.rejects(denyService.requireAllow(preflightInput()), ForbiddenException);

  const approvalRequiredService = new TestGatekeeperPreflightService((request) =>
    decisionFor(request, { decision: 'APPROVAL_REQUIRED' }),
  );
  await assert.rejects(approvalRequiredService.requireAllow(preflightInput()), ForbiddenException);
}

async function run() {
  await testGatekeeperContractDeclaresCanonicalOutcomes();
  await testGatekeeperLegacyOutcomesNormalizeToCanonicalContractOutcomes();
  await testGatekeeperContractParsesCanonicalDecisionResults();
  await testGatekeeperRuntimeAcceptsCanonicalAllowOutcome();
  await testGatekeeperRuntimeBlocksCanonicalNonAllowOutcomes();

  console.log('P5B-007a gatekeeper contract outcome alignment tests passed.');
}

void run();
