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

function preflightInput(payload: Record<string, unknown>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-027b',
    actor_user_id: 'actor-027b',
    active_group_ids: ['group-027b'],
    entity_type: 'module.migration',
    entity_id: 'module-change-027b',
    action_key: 'module.migration.apply',
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    payload: {
      correlation_id: 'corr-027b',
      risk_surface: 'migration',
      ...payload,
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
  };
}

function assertStopForReview(stored: Record<string, unknown>, expectedCheckKey: string) {
  assert.equal(stored.outcome, 'STOP_FOR_REVIEW');
  assert.equal(stored.decision_token, null);
  assert.equal(stored.approval_chain_key, null);
  assert.equal(stored.approval_request_id, null);
  assert.deepEqual(stored.missing_evidence, ['gatekeeper.platform-architect.review']);

  const checks = stored.check_results as Array<{ check_key: string }>;
  assert.deepEqual(
    checks.map((check) => check.check_key),
    [expectedCheckKey],
  );
}

async function assertMigrationRequestStops(payload: Record<string, unknown>, expectedCheckKey: string) {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(service.requireAllow(preflightInput(payload)), ServiceUnavailableException);

  assert.equal(prisma.storedDecisions.length, 1);
  assertStopForReview(prisma.storedDecisions[0].data, expectedCheckKey);
}

async function testDestructiveMigrationStopsForReview() {
  await assertMigrationRequestStops(
    {
      migration_risk: 'destructive',
      destructive_migration: true,
    },
    'gatekeeper.migration.stop-for-review',
  );
}

async function testModuleBypassAttemptStopsForReview() {
  await assertMigrationRequestStops(
    {
      migration_risk: 'approval_required',
      module_override_requested: true,
    },
    'gatekeeper.migration.override-stop-for-review',
  );
}

async function testTenantAdminBypassAttemptStopsForReview() {
  await assertMigrationRequestStops(
    {
      migration_risk: 'approval_required',
      tenant_admin_override_requested: true,
    },
    'gatekeeper.migration.override-stop-for-review',
  );
}

async function testAutomationBypassAttemptStopsForReview() {
  await assertMigrationRequestStops(
    {
      migration_risk: 'approval_required',
      automation_override_requested: true,
    },
    'gatekeeper.migration.override-stop-for-review',
  );
}

async function run() {
  await testDestructiveMigrationStopsForReview();
  await testModuleBypassAttemptStopsForReview();
  await testTenantAdminBypassAttemptStopsForReview();
  await testAutomationBypassAttemptStopsForReview();

  console.log('P5B-027b destructive migration STOP_FOR_REVIEW tests passed.');
}

void run();
