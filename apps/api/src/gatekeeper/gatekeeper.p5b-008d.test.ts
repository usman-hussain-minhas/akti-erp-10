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
    entity_type: 'module.rollback',
    entity_id: 'module-change-1',
    action_key: String(payload.action_key ?? 'module.rollback.execute'),
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    payload: {
      correlation_id: 'corr-008d',
      ...payload,
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
  };
}

function storedCheckKeys(prisma: MockPrisma): string[] {
  const checks = prisma.storedDecisions[0].data.check_results as Array<{ check_key: string }>;
  return checks.map((check) => check.check_key);
}

async function testMissingRollbackEvidenceRequiresApproval() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
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
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.rollback.approval-required']);
}

async function testInvalidRollbackEvidenceDenies() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        risk_surface: 'rollback',
        rollback_risk: 'invalid_evidence',
        rollback_validation_passed: false,
      }),
    ),
    ForbiddenException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'DENY');
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, []);
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.rollback.evidence-valid']);
}

async function testUnsafeRollbackStopsForReview() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        risk_surface: 'rollback',
        rollback_risk: 'unsafe',
        rollback_integrity_risk: true,
      }),
    ),
    ServiceUnavailableException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'STOP_FOR_REVIEW');
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, [
    'gatekeeper.platform-architect.review',
  ]);
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.rollback.stop-for-review']);
}

async function testPresentRollbackEvidenceAllowsNormalPreflight() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  const decision = await service.requireAllow(
    preflightInput({
      risk_surface: 'rollback',
      rollback_evidence_present: true,
      rollback_validation_passed: true,
    }),
  );

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'ALLOW');
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.phase1.preflight']);
}

async function run() {
  await testMissingRollbackEvidenceRequiresApproval();
  await testInvalidRollbackEvidenceDenies();
  await testUnsafeRollbackStopsForReview();
  await testPresentRollbackEvidenceAllowsNormalPreflight();

  console.log('P5B-008d gatekeeper rollback evidence checklist tests passed.');
}

void run();
