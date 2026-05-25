import assert from 'node:assert/strict';

import {
  EventOutboxService,
  PLATFORM_MUTATION_RECORDED_EVENT_TYPE,
  PLATFORM_MUTATION_RECORDED_EVENT_VERSION,
} from './event-outbox.service';

type MockState = {
  calls: Array<{ fn: string; args: unknown }>;
  writes: Array<Record<string, unknown>>;
  updates: Array<Record<string, unknown>>;
};

function createMockDb() {
  const state: MockState = {
    calls: [],
    writes: [],
    updates: [],
  };

  const db = {
    eventOutbox: {
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: Record<string, unknown>;
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        state.calls.push({ fn: 'eventOutbox.upsert', args: { where, create, update } });
        state.writes.push(create);
        return create;
      },
      update: async ({
        where,
        data,
      }: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => {
        state.calls.push({ fn: 'eventOutbox.update', args: { where, data } });
        state.updates.push(data);
        return data;
      },
    },
  };

  return { db, state };
}

async function testWritesGenericOutboxEvent() {
  const { db, state } = createMockDb();
  const service = new EventOutboxService();

  const occurredAt = new Date('2026-05-23T12:00:00.000Z');
  const result = await service.recordMutation(db as never, {
    organization_id: 'org-1',
    action_key: 'access.user.created',
    entity_type: 'access.user',
    entity_id: 'user-10',
    actor_user_id: ' actor-1 ',
    occurred_at: occurredAt,
  });

  assert.deepEqual(result, { written: true });
  assert.equal(state.writes.length, 1);
  assert.equal(state.calls[0]?.fn, 'eventOutbox.upsert');
  assert.equal(state.writes[0].event_type, PLATFORM_MUTATION_RECORDED_EVENT_TYPE);
  assert.equal(state.writes[0].version, PLATFORM_MUTATION_RECORDED_EVENT_VERSION);
  assert.equal(state.writes[0].status, 'pending');
  assert.equal(state.writes[0].attempt_count, 0);
  assert.equal(state.writes[0].next_attempt_at, null);
  assert.equal(state.writes[0].last_error, null);
  assert.equal(state.writes[0].dead_lettered_at, null);
  assert.equal(state.writes[0].locked_at, null);
  assert.equal(state.writes[0].locked_by, null);
  assert.equal(state.writes[0].processed_at, null);
  assert.equal(typeof state.writes[0].idempotency_key, 'string');

  const payload = state.writes[0].payload as Record<string, unknown>;
  assert.equal(payload.action_key, 'access.user.created');
  assert.equal(payload.entity_type, 'access.user');
  assert.equal(payload.entity_id, 'user-10');
  assert.equal(payload.actor_user_id, 'actor-1');
  assert.equal(payload.occurred_at, '2026-05-23T12:00:00.000Z');
}

function testPhase1EventContractConstants() {
  assert.equal(PLATFORM_MUTATION_RECORDED_EVENT_TYPE, 'platform.mutation.recorded');
  assert.equal(PLATFORM_MUTATION_RECORDED_EVENT_VERSION, '0.1.0');
}

async function testNormalizesMissingActorToNull() {
  const { db, state } = createMockDb();
  const service = new EventOutboxService();

  await service.recordMutation(db as never, {
    organization_id: 'org-1',
    action_key: 'access.user.updated',
    entity_type: 'access.user',
    entity_id: 'user-10',
    actor_user_id: undefined,
  });

  const payload = state.writes[0].payload as Record<string, unknown>;
  assert.equal(payload.actor_user_id, null);
}

async function testUsesProvidedIdempotencyKey() {
  const { db, state } = createMockDb();
  const service = new EventOutboxService();

  await service.recordMutation(db as never, {
    organization_id: 'org-1',
    action_key: 'lead.desk.lead.created',
    entity_type: 'lead.record',
    entity_id: 'lead-1',
    actor_user_id: 'actor-1',
    idempotency_key: ' lead-create-org-1-lead-1 ',
  });

  assert.equal(state.writes.length, 1);
  assert.equal(state.writes[0].idempotency_key, 'lead-create-org-1-lead-1');
}

async function testRecordsFailureMetadataAndAttemptIncrement() {
  const { db, state } = createMockDb();
  const service = new EventOutboxService();

  const result = await service.recordAttemptFailure(db as never, {
    organization_id: 'org-1',
    idempotency_key: 'event-1',
    failed_at: new Date('2026-05-25T10:00:00.000Z'),
    retry_after_ms: 120000,
    error_message: 'temporary delivery failure',
    locked_by: ' worker-1 ',
  });

  assert.deepEqual(result, { written: true });
  assert.equal(state.updates.length, 1);
  assert.equal(state.updates[0].status, 'pending');
  assert.deepEqual(state.updates[0].attempt_count, { increment: 1 });
  assert.equal((state.updates[0].next_attempt_at as Date).toISOString(), '2026-05-25T10:02:00.000Z');
  assert.equal(state.updates[0].last_error, 'temporary delivery failure');
  assert.equal(state.updates[0].locked_at, null);
  assert.equal(state.updates[0].locked_by, 'worker-1');
}

async function testCanMarkDeliveredAndDeadLettered() {
  const { db, state } = createMockDb();
  const service = new EventOutboxService();

  const deliveredAt = new Date('2026-05-25T10:03:00.000Z');
  const deliveredResult = await service.markDelivered(db as never, {
    organization_id: 'org-1',
    idempotency_key: 'event-1',
    delivered_at: deliveredAt,
  });
  assert.deepEqual(deliveredResult, { written: true });
  assert.equal(state.updates.length, 1);
  assert.equal(state.updates[0].status, 'processed');
  assert.equal((state.updates[0].processed_at as Date).toISOString(), '2026-05-25T10:03:00.000Z');

  const deadLetterAt = new Date('2026-05-25T10:04:00.000Z');
  const deadLetterResult = await service.markDeadLettered(db as never, {
    organization_id: 'org-1',
    idempotency_key: 'event-1',
    dead_lettered_at: deadLetterAt,
    error_message: 'exhausted retries',
  });
  assert.deepEqual(deadLetterResult, { written: true });
  assert.equal(state.updates.length, 2);
  assert.equal(state.updates[1].status, 'dead_lettered');
  assert.equal((state.updates[1].dead_lettered_at as Date).toISOString(), '2026-05-25T10:04:00.000Z');
  assert.equal(state.updates[1].last_error, 'exhausted retries');
}

async function run() {
  testPhase1EventContractConstants();
  await testWritesGenericOutboxEvent();
  await testNormalizesMissingActorToNull();
  await testUsesProvidedIdempotencyKey();
  await testRecordsFailureMetadataAndAttemptIncrement();
  await testCanMarkDeliveredAndDeadLettered();

  console.log('event-outbox.service tests passed');
}

void run();
