import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  EVENT_ENVELOPE_SCHEMA_VERSION,
  EventOutboxService,
  PLATFORM_MUTATION_RECORDED_EVENT_TYPE,
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
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'eventOutbox.create', args: { data } });
        state.writes.push(data);
        return data;
      },
    },
  };

  return { db, state };
}

async function testMutationOutboxWritesPhase5AEnvelopeColumns() {
  const { db, state } = createMockDb();
  const service = new EventOutboxService();
  const occurredAt = new Date('2026-05-29T01:00:00.000Z');

  await service.recordMutation(db as never, {
    organization_id: 'org-017c',
    action_key: 'platform.control.validated',
    entity_type: 'platform.control',
    entity_id: 'control-017c',
    actor_user_id: 'actor-017c',
    occurred_at: occurredAt,
    idempotency_key: 'idem-017c',
  });

  assert.equal(state.writes.length, 1);
  const write = state.writes[0];

  assert.equal(write.organization_id, 'org-017c');
  assert.equal(String(write.event_id).startsWith('evt_'), true);
  assert.equal(write.event_type, PLATFORM_MUTATION_RECORDED_EVENT_TYPE);
  assert.equal(write.producer, 'akti-api');
  assert.equal((write.occurred_at as Date).toISOString(), '2026-05-29T01:00:00.000Z');
  assert.equal(write.schema_version, EVENT_ENVELOPE_SCHEMA_VERSION);
  assert.equal(write.source_module, 'platform.mutation');
  assert.deepEqual(write.subject, {
    entity_type: 'platform.control',
    entity_id: 'control-017c',
  });
  assert.deepEqual(write.payload, {
    action_key: 'platform.control.validated',
    entity_type: 'platform.control',
    entity_id: 'control-017c',
    actor_user_id: 'actor-017c',
    occurred_at: '2026-05-29T01:00:00.000Z',
  });
  assert.equal(write.privacy_class, 'internal');
  assert.equal(write.retention_class, 'standard');
  assert.equal(write.redaction_policy, 'standard');
  assert.equal(write.audit_required, true);
  assert.equal(write.replay_allowed, true);
}

async function testDirectOutboxEventPersistsExplicitEnvelopeContext() {
  const { db, state } = createMockDb();
  const service = new EventOutboxService();

  await service.recordEvent(db as never, {
    organization_id: 'org-017c',
    event_type: 'workflow.process.started',
    version: '0.1.0',
    idempotency_key: 'workflow-017c',
    source_module: 'workflow.engine',
    occurred_at: new Date('2026-05-29T01:05:00.000Z'),
    subject: {
      entity_type: 'workflow.process',
      entity_id: 'process-017c',
    },
    payload: {
      process_key: 'core.lifecycle',
    },
    compliance: {
      privacy_class: 'confidential',
      retention_class: 'audit',
      redaction_policy: 'strict',
      audit_required: true,
      replay_allowed: false,
    },
  });

  const write = state.writes[0];

  assert.equal(write.source_module, 'workflow.engine');
  assert.deepEqual(write.subject, {
    entity_type: 'workflow.process',
    entity_id: 'process-017c',
  });
  assert.equal(write.privacy_class, 'confidential');
  assert.equal(write.retention_class, 'audit');
  assert.equal(write.redaction_policy, 'strict');
  assert.equal(write.audit_required, true);
  assert.equal(write.replay_allowed, false);
}

async function testInvalidEnvelopeDoesNotWriteOutboxRow() {
  const { db, state } = createMockDb();
  const service = new EventOutboxService();

  await assert.rejects(
    () =>
      service.recordEvent(db as never, {
        organization_id: 'org-017c',
        event_type: '',
        version: '0.1.0',
        idempotency_key: 'invalid-017c',
        payload: {},
      }),
    BadRequestException,
  );

  assert.equal(state.writes.length, 0);
}

async function run() {
  await testMutationOutboxWritesPhase5AEnvelopeColumns();
  await testDirectOutboxEventPersistsExplicitEnvelopeContext();
  await testInvalidEnvelopeDoesNotWriteOutboxRow();

  console.log('P5B-017c event envelope outbox alignment tests passed.');
}

void run();
