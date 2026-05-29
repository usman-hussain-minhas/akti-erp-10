import assert from 'node:assert/strict';

import { ServiceUnavailableException } from '@nestjs/common';
import type { GatekeeperDecisionResult, GatekeeperRequest } from '@akti/contracts/gatekeeper-contract';

import { GatekeeperPreflightService, type GatekeeperPreflightInput } from './gatekeeper-preflight.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import type { PrismaService } from '../prisma/prisma.service';

type MockPrisma = PrismaService & {
  storedDecisions: Array<{ data: Record<string, unknown> }>;
  outboxWrites: Array<Record<string, unknown>>;
};

function createMockPrisma(): MockPrisma {
  const storedDecisions: Array<{ data: Record<string, unknown> }> = [];
  const outboxWrites: Array<Record<string, unknown>> = [];

  return {
    storedDecisions,
    outboxWrites,
    gatekeeperDecisionRecord: {
      create: async (input: { data: Record<string, unknown> }) => {
        storedDecisions.push(input);
        return { id: `decision-${storedDecisions.length}` };
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
    super(prisma, undefined, new EventOutboxService());
  }

  protected override async provideDecision(request: GatekeeperRequest): Promise<unknown> {
    return this.handler(request);
  }
}

function preflightInput(overrides?: Partial<GatekeeperPreflightInput>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-017e',
    actor_user_id: 'actor-017e',
    active_group_ids: ['group-017e'],
    entity_type: 'access.group',
    entity_id: 'group-017e',
    action_key: 'access.group.updated',
    payload: {
      correlation_id: 'corr-017e',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function decisionFor(
  request: GatekeeperRequest,
  overrides?: Partial<GatekeeperDecisionResult>,
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
        check_key: 'gatekeeper.p5b-017e.preflight',
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

async function testAllowDecisionEmitsComplianceEventEnvelope() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService((request) => decisionFor(request), prisma);

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(prisma.outboxWrites.length, 1);
  const event = prisma.outboxWrites[0];

  assert.equal(event.event_type, 'gatekeeper.preflight.decided');
  assert.equal(event.version, '0.1.0');
  assert.equal(event.source_module, 'gatekeeper');
  assert.deepEqual(event.subject, {
    entity_type: 'gatekeeper.decision',
    entity_id: decision.request_id,
  });
  assert.equal(event.privacy_class, 'restricted');
  assert.equal(event.retention_class, 'audit');
  assert.equal(event.redaction_policy, 'strict');
  assert.equal(event.audit_required, true);
  assert.equal(event.replay_allowed, false);

  const payload = event.payload as Record<string, unknown>;
  assert.equal(payload.request_id, decision.request_id);
  assert.equal(payload.outcome, 'ALLOW');
  assert.equal(payload.correlation_id, 'corr-017e');
}

async function testStopForReviewEmitsEnvelopeBeforeBlocking() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService(
    (request) =>
      decisionFor(request, {
        decision: 'STOP_FOR_REVIEW',
        reasons: [
          {
            code: 'gatekeeper.p5b-017e.stop',
            message: 'Gatekeeper requires platform review.',
            severity: 'error',
          },
        ],
        checks: [
          {
            check_key: 'gatekeeper.p5b-017e.stop',
            status: 'failed',
            reason: {
              code: 'gatekeeper.p5b-017e.stop',
              message: 'Gatekeeper requires platform review.',
              severity: 'error',
            },
            evidence_required: [],
            evidence_present: [],
          },
        ],
        decision_token: undefined,
        expires_at: null,
      }),
    prisma,
  );

  await assert.rejects(service.requireAllow(preflightInput()), ServiceUnavailableException);

  assert.equal(prisma.outboxWrites.length, 1);
  const payload = prisma.outboxWrites[0].payload as Record<string, unknown>;
  assert.equal(payload.outcome, 'STOP_FOR_REVIEW');
  assert.deepEqual(payload.reason_codes, ['gatekeeper.p5b-017e.stop']);
}

async function testMissingCorrelationFallsBackToGatekeeperRequestId() {
  const prisma = createMockPrisma();
  const service = new TestGatekeeperPreflightService((request) => decisionFor(request), prisma);

  const decision = await service.requireAllow(
    preflightInput({
      payload: {},
    }),
  );

  const payload = prisma.outboxWrites[0].payload as Record<string, unknown>;
  assert.equal(payload.request_id, decision.request_id);
  assert.equal(payload.correlation_id, decision.request_id);
}

async function run() {
  await testAllowDecisionEmitsComplianceEventEnvelope();
  await testStopForReviewEmitsEnvelopeBeforeBlocking();
  await testMissingCorrelationFallsBackToGatekeeperRequestId();

  console.log('P5B-017e gatekeeper event-envelope retrofit tests passed.');
}

void run();
