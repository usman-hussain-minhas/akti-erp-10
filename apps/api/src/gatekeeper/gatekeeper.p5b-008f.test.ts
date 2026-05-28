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
    prisma: PrismaService,
  ) {
    super(prisma);
  }

  protected override async provideDecision(request: GatekeeperRequest): Promise<unknown> {
    return this.handler(request);
  }
}

function preflightInput(): GatekeeperPreflightInput {
  return {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    active_group_ids: ['group-1'],
    entity_type: 'module.migration',
    entity_id: 'module-change-1',
    action_key: 'module.migration.apply',
    payload: {
      correlation_id: 'corr-008f',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
  };
}

function softenedStopForReviewDecision(request: GatekeeperRequest): GatekeeperDecisionResult {
  const reason = {
    code: 'gatekeeper.test.stop-for-review',
    message: 'Gatekeeper test requires platform review.',
    severity: 'error' as const,
  };

  return {
    decision: 'STOP_FOR_REVIEW',
    request_id: request.request_id,
    capability_key: request.capability_key,
    actor_user_id: request.actor_user_id,
    organization_id: request.organization_id,
    reasons: [reason],
    checks: [
      {
        check_key: 'gatekeeper.test.stop-for-review',
        status: 'failed',
        reason,
        evidence_required: [],
        evidence_present: ['gatekeeper.test.partial-evidence'],
      },
    ],
    required_evidence: [],
    missing_evidence: [],
    approval_chain_key: 'gatekeeper.test.non-architect-approval',
    approval_request_id: 'approval-request-008f',
    reauth_required: true,
    decision_token: `softened_${request.request_id}`,
    expires_at: new Date(Date.now() + 60_000).toISOString(),
  };
}

async function testStopForReviewCannotBeSoftenedByApprovalOrDecisionToken() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService(softenedStopForReviewDecision, prisma);

  await assert.rejects(service.requireAllow(preflightInput()), ServiceUnavailableException);

  assert.equal(prisma.storedDecisions.length, 1);

  const stored = prisma.storedDecisions[0].data;
  assert.equal(stored.outcome, 'STOP_FOR_REVIEW');
  assert.equal(stored.decision_token, null);
  assert.equal(stored.approval_chain_key, null);
  assert.equal(stored.approval_request_id, null);
  assert.equal(stored.expires_at, null);
  assert.deepEqual(stored.missing_evidence, ['gatekeeper.platform-architect.review']);

  const requiredEvidence = stored.required_evidence as Array<{ evidence_key: string }>;
  assert.deepEqual(
    requiredEvidence.map((evidence) => evidence.evidence_key),
    ['gatekeeper.platform-architect.review'],
  );
}

async function testDefaultStopForReviewStillFailsClosed() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow({
      ...preflightInput(),
      payload: {
        correlation_id: 'corr-008f-default',
        risk_surface: 'migration',
        migration_risk: 'destructive',
        destructive_migration: true,
      },
    }),
    ServiceUnavailableException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'STOP_FOR_REVIEW');
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, [
    'gatekeeper.platform-architect.review',
  ]);
}

async function run() {
  await testStopForReviewCannotBeSoftenedByApprovalOrDecisionToken();
  await testDefaultStopForReviewStillFailsClosed();

  console.log('P5B-008f gatekeeper STOP_FOR_REVIEW immutability enforcement tests passed.');
}

void run();
