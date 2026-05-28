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
      correlation_id: 'corr-008c',
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

async function testInvalidMigrationSafetyCheckDenies() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        risk_surface: 'migration',
        migration_risk: 'validation_failed',
        migration_validation_passed: false,
      }),
    ),
    ForbiddenException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'DENY');
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.migration.validation']);
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, []);
}

async function testMigrationApprovalRequiredCheckRequiresApproval() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        risk_surface: 'migration',
        migration_risk: 'approval_required',
        migration_approval_required: true,
      }),
    ),
    ForbiddenException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'APPROVAL_REQUIRED');
  assert.equal(prisma.storedDecisions[0].data.approval_chain_key, 'gatekeeper.migration.approval');
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, ['gatekeeper.migration.evidence']);
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.migration.approval-required']);
}

async function testUnsafeMigrationSafetyCheckStopsForReview() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        risk_surface: 'migration',
        migration_risk: 'unsafe',
        tenant_isolation_risk: true,
      }),
    ),
    ServiceUnavailableException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'STOP_FOR_REVIEW');
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.migration.stop-for-review']);
  assert.deepEqual(prisma.storedDecisions[0].data.missing_evidence, [
    'gatekeeper.platform-architect.review',
  ]);
}

async function run() {
  await testInvalidMigrationSafetyCheckDenies();
  await testMigrationApprovalRequiredCheckRequiresApproval();
  await testUnsafeMigrationSafetyCheckStopsForReview();

  console.log('P5B-008c gatekeeper migration-safety checklist tests passed.');
}

void run();
