import assert from 'node:assert/strict';

import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';

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

function preflightInput(payload: Record<string, unknown>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    active_group_ids: ['group-1'],
    entity_type: 'module.migration',
    entity_id: 'module-change-1',
    action_key: String(payload.action_key ?? 'module.migration.apply'),
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    payload: {
      correlation_id: 'corr-007f',
      ...payload,
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
  };
}

async function testPolicyViolationRiskProducesDeny() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        risk_surface: 'migration',
        migration_risk: 'policy_violation',
        policy_violation: true,
      }),
    ),
    ForbiddenException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'DENY');
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, []);
  assert.match(
    JSON.stringify(prisma.storedDecisions[0].data.reason_summary),
    /gatekeeper\.risk\.policy-violation/,
  );
}

async function testRollbackMissingEvidenceProducesApprovalRequired() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        action_key: 'module.rollback.execute',
        risk_surface: 'rollback',
        rollback_risk: 'missing_evidence',
        rollback_evidence_present: false,
      }),
    ),
    ForbiddenException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'APPROVAL_REQUIRED');
  assert.equal(prisma.storedDecisions[0].data.approval_chain_key, 'gatekeeper.rollback.approval');
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, ['gatekeeper.rollback.evidence']);
}

async function testDestructiveMigrationRiskProducesStopForReview() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        risk_surface: 'migration',
        migration_risk: 'destructive',
        destructive_migration: true,
      }),
    ),
    ServiceUnavailableException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'STOP_FOR_REVIEW');
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, [
    'gatekeeper.platform-architect.review',
  ]);
  assert.match(
    JSON.stringify(prisma.storedDecisions[0].data.reason_summary),
    /gatekeeper\.migration\.stop-for-review/,
  );
}

async function run() {
  await testPolicyViolationRiskProducesDeny();
  await testRollbackMissingEvidenceProducesApprovalRequired();
  await testDestructiveMigrationRiskProducesStopForReview();

  console.log('P5B-007f gatekeeper migration/rollback risk output tests passed.');
}

void run();
