import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ServiceUnavailableException } from '@nestjs/common';
import type {
  GatekeeperDecisionResult,
  GatekeeperRequest,
} from '@akti/contracts/gatekeeper-contract';

import {
  GatekeeperPreflightService,
  type GatekeeperPreflightInput,
} from './gatekeeper-preflight.service';
import type { PrismaService } from '../prisma/prisma.service';

type StoredDecision = {
  data: Record<string, unknown>;
};

type MockPrisma = PrismaService & {
  storedDecisions: StoredDecision[];
};

function createMockPrisma(): MockPrisma {
  const storedDecisions: StoredDecision[] = [];

  return {
    storedDecisions,
    gatekeeperDecisionRecord: {
      create: async (input: StoredDecision) => {
        storedDecisions.push(input);
        return { id: `decision-${storedDecisions.length}` };
      },
    },
  } as unknown as MockPrisma;
}

class TestGatekeeperPreflightService extends GatekeeperPreflightService {
  constructor(
    private readonly handler: (request: GatekeeperRequest) => Promise<unknown> | unknown,
    prisma: PrismaService,
  ) {
    super(prisma);
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
    entity_id: 'group-1',
    action_key: 'access.group.updated',
    payload: {
      correlation_id: 'corr-007b',
      risk_level: 'high',
    },
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

  return {
    ...baseDecision,
    ...overrides,
  };
}

function assertGatekeeperDecisionRecordSchema() {
  const schema = readFileSync('../../prisma/schema.prisma', 'utf8');
  const modelMatches = schema.match(/model GatekeeperDecisionRecord\s+\{/g) ?? [];
  assert.equal(modelMatches.length, 1, 'GatekeeperDecisionRecord must be defined exactly once');
  assert.match(schema, /enum GatekeeperDecisionOutcome\s+\{[\s\S]*ALLOW[\s\S]*DENY[\s\S]*APPROVAL_REQUIRED[\s\S]*STOP_FOR_REVIEW[\s\S]*\}/);
  assert.match(schema, /organization_id\s+String/);
  assert.match(schema, /actor_user_id\s+String/);
  assert.match(schema, /outcome\s+GatekeeperDecisionOutcome/);
  assert.match(schema, /@@unique\(\[organization_id, request_id\]\)/);
  assert.match(schema, /@@index\(\[organization_id, outcome, recorded_at\]\)/);
}

async function testPersistAllowDecision() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService((request) => decisionFor(request), prisma);

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(prisma.storedDecisions.length, 1);
  const storedDecision = prisma.storedDecisions[0].data;
  assert.ok(storedDecision.requested_at instanceof Date);
  assert.ok(storedDecision.expires_at instanceof Date);
  assert.deepEqual(
    {
      ...storedDecision,
      requested_at: '<date>',
      expires_at: '<date>',
    },
    {
      organization_id: 'org-1',
      actor_user_id: 'actor-1',
      request_id: decision.request_id,
      capability_key: 'access.policy.manage',
      module_key: 'core.access',
      entity_type: 'access.group',
      entity_id: 'group-1',
      scope_unit_id: null,
      action_key: 'access.group.updated',
      outcome: 'ALLOW',
      reason_summary: [],
      check_results: decision.checks,
      required_evidence: [],
      missing_evidence: [],
      approval_chain_key: null,
      approval_request_id: null,
      decision_token: decision.decision_token,
      correlation_id: 'corr-007b',
      requested_at: '<date>',
      expires_at: '<date>',
      payload: {
        action_key: 'access.group.updated',
        correlation_id: 'corr-007b',
        risk_level: 'high',
      },
    },
  );
}

async function testPersistStopForReviewDecisionBeforeBlocking() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService(
    (request) => decisionFor(request, { decision: 'STOP_FOR_REVIEW' }),
    prisma,
  );

  await assert.rejects(service.requireAllow(preflightInput()), ServiceUnavailableException);

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'STOP_FOR_REVIEW');
  assert.equal(prisma.storedDecisions[0].data.decision_token, null);
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, []);
}

async function run() {
  assertGatekeeperDecisionRecordSchema();
  await testPersistAllowDecision();
  await testPersistStopForReviewDecisionBeforeBlocking();

  console.log('P5B-007b gatekeeper decision persistence tests passed.');
}

void run();
