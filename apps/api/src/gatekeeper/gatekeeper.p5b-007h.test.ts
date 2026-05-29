import assert from 'node:assert/strict';

import { ForbiddenException } from '@nestjs/common';
import type {
  GatekeeperDecisionResult,
  GatekeeperRequest,
} from '@akti/contracts/gatekeeper-contract';

import { AuditLogService } from '../platform-observability/audit-log.service';
import {
  GatekeeperPreflightService,
  type GatekeeperPreflightInput,
} from './gatekeeper-preflight.service';
import type { PrismaService } from '../prisma/prisma.service';

type StoredDecision = {
  data: Record<string, unknown>;
};

type StoredAudit = Record<string, unknown>;

type MockPrisma = PrismaService & {
  storedAudits: StoredAudit[];
  storedDecisions: StoredDecision[];
};

function createMockPrisma(): MockPrisma {
  const storedAudits: StoredAudit[] = [];
  const storedDecisions: StoredDecision[] = [];

  return {
    storedAudits,
    storedDecisions,
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        if (where.organization_id === 'org-1' && where.id === 'actor-1') {
          return { id: 'actor-1' };
        }

        return null;
      },
    },
    gatekeeperDecisionRecord: {
      create: async (input: StoredDecision) => {
        storedDecisions.push(input);
        return { id: `decision-${storedDecisions.length}` };
      },
    },
    auditLog: {
      create: async ({ data }: { data: StoredAudit }) => {
        storedAudits.push(data);
        return { id: `audit-${storedAudits.length}`, ...data };
      },
    },
  } as unknown as MockPrisma;
}

class TestGatekeeperPreflightService extends GatekeeperPreflightService {
  constructor(
    private readonly handler: (request: GatekeeperRequest) => Promise<unknown> | unknown,
    prisma: PrismaService,
    auditLogService: AuditLogService,
  ) {
    super(prisma, auditLogService);
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
    entity_type: 'module.change',
    entity_id: 'module-change-1',
    action_key: 'module.change.review',
    payload: {
      correlation_id: 'corr-007h',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function approvalRequiredDecision(request: GatekeeperRequest): GatekeeperDecisionResult {
  const reason = {
    code: 'gatekeeper.test.evidence-required',
    message: 'Gatekeeper test requires evidence before allow.',
    severity: 'warning' as const,
  };
  const evidence = {
    evidence_key: 'gatekeeper.test.evidence',
    label: 'Gatekeeper test evidence',
    required: true,
  };

  return {
    decision: 'APPROVAL_REQUIRED',
    request_id: request.request_id,
    capability_key: request.capability_key,
    actor_user_id: request.actor_user_id,
    organization_id: request.organization_id,
    reasons: [reason],
    checks: [
      {
        check_key: 'gatekeeper.test.evidence-intent',
        status: 'warning',
        reason,
        evidence_required: [evidence],
        evidence_present: ['gatekeeper.test.partial-evidence'],
      },
    ],
    required_evidence: [evidence],
    missing_evidence: ['gatekeeper.test.evidence'],
    approval_chain_key: 'gatekeeper.test.approval',
    approval_request_id: 'approval-request-007h',
    reauth_required: false,
    expires_at: null,
  };
}

async function testGatekeeperAuditRecordsPreEnvelopeEvidenceIntent() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService(
    approvalRequiredDecision,
    prisma,
    new AuditLogService(),
  );

  await assert.rejects(service.requireAllow(preflightInput()), ForbiddenException);

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedAudits.length, 1);

  const metadata = prisma.storedAudits[0].metadata as Record<string, unknown>;
  const evidenceIntent = metadata.evidence_intent as Record<string, unknown>;
  assert.equal(evidenceIntent.intent_key, 'gatekeeper.pre-envelope.evidence-intent');
  assert.equal(evidenceIntent.event_envelope_status, 'pre-envelope-intent-only');
  assert.equal(evidenceIntent.producer, 'gatekeeper.preflight');
  assert.equal(evidenceIntent.request_id, prisma.storedDecisions[0].data.request_id);
  assert.equal(evidenceIntent.organization_id, 'org-1');
  assert.equal(evidenceIntent.actor_user_id, 'actor-1');
  assert.equal(evidenceIntent.outcome, 'APPROVAL_REQUIRED');
  assert.deepEqual(evidenceIntent.required_evidence_keys, ['gatekeeper.test.evidence']);
  assert.deepEqual(evidenceIntent.missing_evidence_keys, ['gatekeeper.test.evidence']);
  assert.deepEqual(evidenceIntent.check_keys, ['gatekeeper.test.evidence-intent']);
  assert.deepEqual(evidenceIntent.evidence_present_keys, ['gatekeeper.test.partial-evidence']);
  assert.equal(evidenceIntent.correlation_id, 'corr-007h');
}

async function run() {
  await testGatekeeperAuditRecordsPreEnvelopeEvidenceIntent();

  console.log('P5B-007h gatekeeper pre-envelope evidence intent tests passed.');
}

void run();
