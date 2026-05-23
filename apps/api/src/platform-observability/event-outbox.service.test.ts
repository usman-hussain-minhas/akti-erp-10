import assert from 'node:assert/strict';

import {
  EventOutboxService,
  PLATFORM_MUTATION_RECORDED_EVENT_TYPE,
  PLATFORM_MUTATION_RECORDED_EVENT_VERSION,
} from './event-outbox.service';

type MockState = {
  calls: Array<{ fn: string; args: unknown }>;
  writes: Array<Record<string, unknown>>;
};

function createMockDb() {
  const state: MockState = {
    calls: [],
    writes: [],
  };

  const db = {
    eventOutbox: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'eventOutbox.create', args: data });
        state.writes.push(data);
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
  assert.equal(state.writes[0].event_type, PLATFORM_MUTATION_RECORDED_EVENT_TYPE);
  assert.equal(state.writes[0].version, PLATFORM_MUTATION_RECORDED_EVENT_VERSION);
  assert.equal(state.writes[0].status, 'pending');
  assert.equal(state.writes[0].processed_at, null);

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

async function run() {
  testPhase1EventContractConstants();
  await testWritesGenericOutboxEvent();
  await testNormalizesMissingActorToNull();

  console.log('event-outbox.service tests passed');
}

void run();
