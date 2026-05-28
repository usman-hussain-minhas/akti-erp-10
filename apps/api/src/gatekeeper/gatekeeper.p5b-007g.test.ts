import assert from 'node:assert/strict';

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

function preflightInput(overrides?: Partial<GatekeeperPreflightInput>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    active_group_ids: ['group-1'],
    entity_type: 'access.group',
    entity_id: 'group-1',
    action_key: 'access.group.updated',
    payload: {
      correlation_id: 'corr-007g',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

async function testGatekeeperDecisionWritesAuditRecordWhenAuditServiceIsConfigured() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma, new AuditLogService());

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedAudits.length, 1);

  const audit = prisma.storedAudits[0];
  assert.equal(audit.organization_id, 'org-1');
  assert.equal(audit.actor_user_id, 'actor-1');
  assert.equal(audit.action_key, 'gatekeeper.preflight.decision.recorded');
  assert.equal(audit.entity_type, 'gatekeeper.decision');
  assert.equal(audit.entity_id, decision.request_id);

  const metadata = audit.metadata as Record<string, unknown>;
  assert.equal(metadata.request_id, decision.request_id);
  assert.equal(metadata.capability_key, 'access.policy.manage');
  assert.equal(metadata.module_key, 'core.access');
  assert.equal(metadata.entity_type, 'access.group');
  assert.equal(metadata.entity_id, 'group-1');
  assert.equal(metadata.action_key, 'access.group.updated');
  assert.equal(metadata.outcome, 'ALLOW');
  assert.equal(metadata.correlation_id, 'corr-007g');
  assert.deepEqual(metadata.reason_codes, []);
  assert.deepEqual(metadata.missing_evidence, []);
}

async function testGatekeeperDecisionDoesNotRequireAuditServiceForScopedServiceUse() {
  const prisma = createMockPrisma();
  const service = new GatekeeperPreflightService(prisma);

  const decision = await service.requireAllow(preflightInput());

  assert.equal(decision.decision, 'ALLOW');
  assert.equal(prisma.storedDecisions.length, 1);
  assert.equal(prisma.storedAudits.length, 0);
}

async function run() {
  await testGatekeeperDecisionWritesAuditRecordWhenAuditServiceIsConfigured();
  await testGatekeeperDecisionDoesNotRequireAuditServiceForScopedServiceUse();

  console.log('P5B-007g gatekeeper audit recording tests passed.');
}

void run();
