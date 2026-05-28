import assert from 'node:assert/strict';

import { ServiceUnavailableException } from '@nestjs/common';

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

function preflightInput(overrides?: Partial<GatekeeperPreflightInput>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    active_group_ids: ['group-1'],
    entity_type: 'module.change',
    entity_id: 'module-change-1',
    action_key: 'module.change.review',
    payload: {
      correlation_id: 'corr-008g',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function assertImmutableStopForReview(stored: Record<string, unknown>) {
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

async function testDestructiveMigrationCannotBypassStopForReview() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        entity_type: 'module.migration',
        action_key: 'module.migration.apply',
        payload: {
          correlation_id: 'corr-008g-migration',
          risk_surface: 'migration',
          migration_risk: 'destructive',
          destructive_migration: true,
          actor_role: 'tenant-admin',
          non_architect_override_requested: true,
        },
      }),
    ),
    ServiceUnavailableException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assertImmutableStopForReview(prisma.storedDecisions[0].data);
}

async function testUnsafeRollbackCannotBypassStopForReview() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        entity_type: 'module.rollback',
        action_key: 'module.rollback.execute',
        payload: {
          correlation_id: 'corr-008g-rollback',
          risk_surface: 'rollback',
          rollback_risk: 'unsafe',
          rollback_boundary_unclear: true,
          automation_override_requested: true,
        },
      }),
    ),
    ServiceUnavailableException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assertImmutableStopForReview(prisma.storedDecisions[0].data);
}

async function testDegradedGatekeeperBlockIsCanonicalImmutableStopForReview() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        module_health: {
          'core.access': 'degraded',
        },
      }),
    ),
    ServiceUnavailableException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assertImmutableStopForReview(prisma.storedDecisions[0].data);
}

async function run() {
  await testDestructiveMigrationCannotBypassStopForReview();
  await testUnsafeRollbackCannotBypassStopForReview();
  await testDegradedGatekeeperBlockIsCanonicalImmutableStopForReview();

  console.log('P5B-008g gatekeeper STOP_FOR_REVIEW immutability negative tests passed.');
}

void run();
