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
      correlation_id: 'corr-007e',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function reason(code: string, message: string) {
  return {
    code,
    message,
    severity: 'error' as const,
  };
}

function failedCheck(
  checkKey: string,
  checkReason: ReturnType<typeof reason>,
): GatekeeperDecisionResult['checks'][number] {
  return {
    check_key: checkKey,
    status: 'failed',
    reason: checkReason,
    evidence_required: [],
    evidence_present: [],
  };
}

function warningCheck(
  checkKey: string,
  checkReason: ReturnType<typeof reason>,
): GatekeeperDecisionResult['checks'][number] {
  return {
    check_key: checkKey,
    status: 'warning',
    reason: checkReason,
    evidence_required: [
      {
        evidence_key: 'gatekeeper.test.approval-evidence',
        label: 'Approval evidence',
        required: true,
      },
    ],
    evidence_present: [],
  };
}

function decisionFor(
  request: GatekeeperRequest,
  overrides: Partial<GatekeeperDecisionResult>,
): GatekeeperDecisionResult {
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

  return {
    ...baseDecision,
    ...overrides,
  };
}

async function assertDecisionIsRecordedBeforeFailure(
  outcome: 'DENY' | 'APPROVAL_REQUIRED' | 'STOP_FOR_REVIEW',
  expectedError: typeof ForbiddenException | typeof ServiceUnavailableException,
  decisionFactory: (request: GatekeeperRequest) => GatekeeperDecisionResult,
) {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService(decisionFactory, prisma);

  await assert.rejects(service.requireAllow(preflightInput()), expectedError);

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, outcome);
  assert.equal(prisma.storedDecisions[0].data.organization_id, 'org-1');
  assert.equal(prisma.storedDecisions[0].data.actor_user_id, 'actor-1');
  assert.equal(prisma.storedDecisions[0].data.action_key, 'access.group.updated');
  assert.equal(prisma.storedDecisions[0].data.correlation_id, 'corr-007e');
}

async function testDenyOutcomeIsPersistedThenRejected() {
  const deniedReason = reason('gatekeeper.test.denied', 'Gatekeeper test denied the action.');

  await assertDecisionIsRecordedBeforeFailure('DENY', ForbiddenException, (request) =>
    decisionFor(request, {
      decision: 'DENY',
      reasons: [deniedReason],
      checks: [failedCheck('gatekeeper.test.denied', deniedReason)],
      decision_token: undefined,
      expires_at: null,
    }),
  );
}

async function testApprovalRequiredOutcomeIsPersistedThenRejected() {
  const approvalReason = reason(
    'gatekeeper.test.approval-required',
    'Gatekeeper test requires approval evidence.',
  );

  await assertDecisionIsRecordedBeforeFailure('APPROVAL_REQUIRED', ForbiddenException, (request) =>
    decisionFor(request, {
      decision: 'APPROVAL_REQUIRED',
      reasons: [approvalReason],
      checks: [warningCheck('gatekeeper.test.approval-required', approvalReason)],
      required_evidence: [
        {
          evidence_key: 'gatekeeper.test.approval-evidence',
          label: 'Approval evidence',
          required: true,
        },
      ],
      missing_evidence: ['gatekeeper.test.approval-evidence'],
      approval_chain_key: 'gatekeeper.test.approval-chain',
      approval_request_id: 'approval-request-007e',
      decision_token: undefined,
      expires_at: null,
    }),
  );
}

async function testStopForReviewOutcomeIsPersistedThenStopped() {
  const stopReason = reason(
    'gatekeeper.test.stop-for-review',
    'Gatekeeper test requires platform review.',
  );

  await assertDecisionIsRecordedBeforeFailure('STOP_FOR_REVIEW', ServiceUnavailableException, (request) =>
    decisionFor(request, {
      decision: 'STOP_FOR_REVIEW',
      reasons: [stopReason],
      checks: [failedCheck('gatekeeper.test.stop-for-review', stopReason)],
      missing_evidence: ['gatekeeper.test.platform-review'],
      decision_token: undefined,
      expires_at: null,
    }),
  );
}

async function run() {
  await testDenyOutcomeIsPersistedThenRejected();
  await testApprovalRequiredOutcomeIsPersistedThenRejected();
  await testStopForReviewOutcomeIsPersistedThenStopped();

  console.log('P5B-007e gatekeeper negative outcome tests passed.');
}

void run();
