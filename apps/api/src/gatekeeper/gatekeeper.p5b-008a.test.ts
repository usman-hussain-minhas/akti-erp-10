import assert from 'node:assert/strict';

import { ForbiddenException } from '@nestjs/common';

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
    entity_type: 'access.group',
    entity_id: 'group-1',
    action_key: 'access.group.updated',
    payload: {
      correlation_id: 'corr-008a',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function storedCheckKeys(prisma: MockPrisma): string[] {
  const stored = prisma.storedDecisions[0].data;
  const checks = stored.check_results as Array<{ check_key: string }>;
  return checks.map((check) => check.check_key);
}

function storedReasonCodes(prisma: MockPrisma): string[] {
  const stored = prisma.storedDecisions[0].data;
  const reasons = stored.reason_summary as Array<{ code: string }>;
  return reasons.map((reason) => reason.code);
}

async function testUnsupportedCapabilityProducesCapabilityChecklistDeny() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        capability_key: 'access.unknown',
      }),
    ),
    ForbiddenException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'DENY');
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.capability.supported']);
  assert.deepEqual(storedReasonCodes(prisma), ['gatekeeper.capability.unsupported']);
}

async function testCapabilityModuleMismatchProducesCapabilityBoundaryDeny() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  await assert.rejects(
    service.requireAllow(
      preflightInput({
        capability_key: 'lead.intake.create',
        module_key: 'engagement.gateway',
      }),
    ),
    ForbiddenException,
  );

  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'DENY');
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.capability.module-boundary']);
  assert.deepEqual(storedReasonCodes(prisma), ['gatekeeper.module.unsupported']);
}

async function testValidCapabilityStillAllowsWithoutCapabilityChecklistDeny() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedDecisions[0].data.outcome, 'ALLOW');
  assert.deepEqual(storedCheckKeys(prisma), ['gatekeeper.phase1.preflight']);
}

async function run() {
  await testUnsupportedCapabilityProducesCapabilityChecklistDeny();
  await testCapabilityModuleMismatchProducesCapabilityBoundaryDeny();
  await testValidCapabilityStillAllowsWithoutCapabilityChecklistDeny();

  console.log('P5B-008a gatekeeper capability checklist tests passed.');
}

void run();
