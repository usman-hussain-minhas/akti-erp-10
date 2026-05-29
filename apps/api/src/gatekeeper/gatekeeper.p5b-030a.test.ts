import assert from 'node:assert/strict';

import { ServiceUnavailableException } from '@nestjs/common';
import type { GatekeeperDecisionResult, GatekeeperRequest } from '@akti/contracts/gatekeeper-contract';

import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import {
  GatekeeperPreflightService,
  type GatekeeperPreflightInput,
} from './gatekeeper-preflight.service';
import type { PrismaService } from '../prisma/prisma.service';

type StoredDecision = {
  data: Record<string, unknown>;
};

type MockPrisma = PrismaService & {
  storedAudits: Array<Record<string, unknown>>;
  storedDecisions: StoredDecision[];
  outboxWrites: Array<Record<string, unknown>>;
};

function createMockPrisma(): MockPrisma {
  const storedAudits: Array<Record<string, unknown>> = [];
  const storedDecisions: StoredDecision[] = [];
  const outboxWrites: Array<Record<string, unknown>> = [];

  return {
    storedAudits,
    storedDecisions,
    outboxWrites,
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        if (where.organization_id === 'org-030a' && where.id === 'actor-030a') {
          return { id: 'actor-030a' };
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
      create: async ({ data }: { data: Record<string, unknown> }) => {
        storedAudits.push(data);
        return { id: `audit-${storedAudits.length}`, ...data };
      },
    },
    eventOutbox: {
      upsert: async ({ create }: { create: Record<string, unknown> }) => {
        outboxWrites.push(create);
        return create;
      },
    },
  } as unknown as MockPrisma;
}

class TestGatekeeperPreflightService extends GatekeeperPreflightService {
  constructor(
    private readonly handler: (request: GatekeeperRequest) => Promise<unknown> | unknown,
    prisma: PrismaService,
  ) {
    super(prisma, new AuditLogService(), new EventOutboxService());
  }

  protected override async provideDecision(request: GatekeeperRequest): Promise<unknown> {
    return this.handler(request);
  }
}

function preflightInput(overrides?: Partial<GatekeeperPreflightInput>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-030a',
    actor_user_id: 'actor-030a',
    active_group_ids: ['group-030a'],
    entity_type: 'access.group',
    entity_id: 'group-030a',
    action_key: 'access.group.updated',
    payload: {
      correlation_id: 'corr-030a',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function stopDecision(request: GatekeeperRequest): GatekeeperDecisionResult {
  const reason = {
    code: 'gatekeeper.p5b-030a.stop',
    message: 'Gatekeeper stopped for audit completeness proof.',
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
        check_key: 'gatekeeper.p5b-030a.stop',
        status: 'failed',
        reason,
        evidence_required: [],
        evidence_present: [],
      },
    ],
    required_evidence: [],
    missing_evidence: [],
    reauth_required: false,
    expires_at: null,
  };
}

function assertAuditCompleteness(metadata: Record<string, unknown>, expectedOutcome: string) {
  const completeness = metadata.audit_completeness as Record<string, unknown>;

  assert.equal(completeness.record_key, 'gatekeeper.audit-completeness');
  assert.equal(completeness.decision_recorded, true);
  assert.equal(completeness.audit_recorded, true);
  assert.equal(completeness.event_envelope_configured, true);
  assert.equal(completeness.organization_id_present, true);
  assert.equal(completeness.actor_user_id_present, true);
  assert.equal(completeness.request_id_present, true);
  assert.equal(completeness.correlation_id_present, true);
  assert.equal(completeness.action_key_present, true);
  assert.equal(completeness.outcome_present, true);
  assert.equal(metadata.outcome, expectedOutcome);
  assert.equal(metadata.correlation_id, 'corr-030a');
}

async function testAllowActionWritesCompleteDecisionAuditAndEvent() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma, new AuditLogService(), new EventOutboxService());

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedAudits.length, 1);
  assert.equal(prisma.outboxWrites.length, 1);
  assertAuditCompleteness(prisma.storedAudits[0].metadata as Record<string, unknown>, 'ALLOW');
}

async function testStopForReviewActionWritesCompleteAuditBeforeBlocking() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService(stopDecision, prisma);

  await assert.rejects(service.requireAllow(preflightInput()), ServiceUnavailableException);

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedAudits.length, 1);
  assert.equal(prisma.outboxWrites.length, 1);
  assertAuditCompleteness(prisma.storedAudits[0].metadata as Record<string, unknown>, 'STOP_FOR_REVIEW');

  const eventPayload = prisma.outboxWrites[0].payload as Record<string, unknown>;
  assert.equal(eventPayload.outcome, 'STOP_FOR_REVIEW');
  assert.equal(eventPayload.correlation_id, 'corr-030a');
}

async function run() {
  await testAllowActionWritesCompleteDecisionAuditAndEvent();
  await testStopForReviewActionWritesCompleteAuditBeforeBlocking();

  console.log('P5B-030a Gatekeeper audit completeness tests passed.');
}

void run();
