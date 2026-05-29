import assert from 'node:assert/strict';

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
    prisma?: PrismaService,
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
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function reason() {
  return {
    code: 'gatekeeper.test.stop-for-review',
    message: 'Gatekeeper test requires platform review.',
    severity: 'error' as const,
  };
}

function failedCheck(): GatekeeperDecisionResult['checks'][number] {
  return {
    check_key: 'gatekeeper.test.preflight',
    status: 'failed',
    reason: reason(),
    evidence_required: [],
    evidence_present: [],
  };
}

function decisionFor(
  request: GatekeeperRequest,
  overrides?: Partial<GatekeeperDecisionResult>,
): GatekeeperDecisionResult {
  const baseDecision: GatekeeperDecisionResult = {
    decision: 'allow',
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

  if (overrides?.decision === 'degraded_block') {
    return {
      ...baseDecision,
      ...overrides,
      decision_token: undefined,
      reasons: overrides.reasons ?? [reason()],
      checks: overrides.checks ?? [failedCheck()],
      expires_at: null,
    };
  }

  return {
    ...baseDecision,
    ...overrides,
  };
}

async function testDefaultProviderReturnsCanonicalAllow() {
  const service = new GatekeeperPreflightService();

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
}

async function testLegacyAllowProviderReturnsAndPersistsCanonicalAllow() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService((request) => decisionFor(request), prisma);

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'ALLOW');
}

async function testLegacyDegradedBlockPersistsStopForReview() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService(
    (request) => decisionFor(request, { decision: 'degraded_block' }),
    prisma,
  );

  await assert.rejects(service.requireAllow(preflightInput()), ServiceUnavailableException);

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'STOP_FOR_REVIEW');
}

async function run() {
  await testDefaultProviderReturnsCanonicalAllow();
  await testLegacyAllowProviderReturnsAndPersistsCanonicalAllow();
  await testLegacyDegradedBlockPersistsStopForReview();

  console.log('P5B-007c gatekeeper runtime outcome normalization tests passed.');
}

void run();
