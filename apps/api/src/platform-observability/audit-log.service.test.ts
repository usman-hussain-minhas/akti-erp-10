import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { AuditLogService } from './audit-log.service';

type MockState = {
  calls: Array<{ fn: string; args: unknown }>;
  auditWrites: Array<Record<string, unknown>>;
};

function createMockDb() {
  const state: MockState = {
    calls: [],
    auditWrites: [],
  };

  const db = {
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'user.findFirst', args: where });
        if (where.organization_id === 'org-1' && where.id === 'actor-1') {
          return { id: 'actor-1' };
        }
        return null;
      },
    },
    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'auditLog.create', args: data });
        state.auditWrites.push(data);
        return data;
      },
    },
  };

  return { db, state };
}

async function testWritesAuditWhenActorIsValid() {
  const { db, state } = createMockDb();
  const service = new AuditLogService();

  const result = await service.writeAuditLog(db as never, {
    organization_id: 'org-1',
    action_key: 'access.user.created',
    entity_type: 'access.user',
    entity_id: 'user-10',
    actor_user_id: ' actor-1 ',
    metadata: { source: 'test' },
  });

  assert.deepEqual(result, { written: true });
  assert.equal(state.auditWrites.length, 1);
  assert.equal(state.auditWrites[0].actor_user_id, 'actor-1');
}

async function testSkipsAuditWhenActorMissing() {
  const { db, state } = createMockDb();
  const service = new AuditLogService();

  const result = await service.writeAuditLog(db as never, {
    organization_id: 'org-1',
    action_key: 'access.user.updated',
    entity_type: 'access.user',
    entity_id: 'user-10',
    actor_user_id: '   ',
    metadata: { source: 'test' },
  });

  assert.deepEqual(result, { written: false, reason: 'missing_actor' });
  assert.equal(state.auditWrites.length, 0);
}

async function testFailsForInvalidOrCrossOrgActor() {
  const { db, state } = createMockDb();
  const service = new AuditLogService();

  await assert.rejects(
    service.writeAuditLog(db as never, {
      organization_id: 'org-1',
      action_key: 'access.user.deleted',
      entity_type: 'access.user',
      entity_id: 'user-10',
      actor_user_id: 'actor-foreign',
      metadata: { source: 'test' },
    }),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  assert.equal(state.auditWrites.length, 0);
}

async function run() {
  await testWritesAuditWhenActorIsValid();
  await testSkipsAuditWhenActorMissing();
  await testFailsForInvalidOrCrossOrgActor();

  console.log('audit-log.service tests passed');
}

void run();
