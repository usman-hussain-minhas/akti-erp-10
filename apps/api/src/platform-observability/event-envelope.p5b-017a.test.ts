import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { buildAuditEventEnvelopeContext } from './audit-log.service';
import {
  EVENT_ENVELOPE_SCHEMA_VERSION,
  EventOutboxService,
  assertEventEnvelope,
  buildEventEnvelope,
} from './event-outbox.service';

function testBuildsPhase5ARequiredEnvelopeFields() {
  const envelope = buildEventEnvelope({
    organization_id: 'org-017a',
    event_type: 'platform.mutation.recorded',
    idempotency_key: 'idem-017a',
    occurred_at: new Date('2026-05-29T00:00:00.000Z'),
    source_module: 'platform.observability',
    subject: {
      entity_type: 'platform.control',
      entity_id: 'control-017a',
    },
    payload: {
      action_key: 'platform.control.validated',
    },
    compliance: {
      privacy_class: 'confidential',
      retention_class: 'audit',
      redaction_policy: 'strict',
      audit_required: true,
      replay_allowed: false,
    },
  });

  assert.equal(envelope.event_id.startsWith('evt_'), true);
  assert.equal(envelope.event_type, 'platform.mutation.recorded');
  assert.equal(envelope.producer, 'akti-api');
  assert.equal(envelope.occurred_at, '2026-05-29T00:00:00.000Z');
  assert.equal(envelope.schema_version, EVENT_ENVELOPE_SCHEMA_VERSION);
  assert.equal(envelope.organization_id, 'org-017a');
  assert.equal(envelope.source_module, 'platform.observability');
  assert.deepEqual(envelope.subject, {
    entity_type: 'platform.control',
    entity_id: 'control-017a',
  });
  assert.deepEqual(envelope.payload, {
    action_key: 'platform.control.validated',
  });
  assert.deepEqual(envelope.compliance, {
    privacy_class: 'confidential',
    retention_class: 'audit',
    redaction_policy: 'strict',
    audit_required: true,
    replay_allowed: false,
  });
}

function testRejectsMissingEnvelopeFieldsAndInvalidCompliance() {
  assert.throws(
    () =>
      buildEventEnvelope({
        organization_id: '',
        event_type: 'platform.mutation.recorded',
        idempotency_key: 'idem-017a',
        payload: {},
      }),
    BadRequestException,
  );

  assert.throws(
    () =>
      assertEventEnvelope({
        event_id: 'evt-017a',
        event_type: 'platform.mutation.recorded',
        producer: 'akti-api',
        occurred_at: 'not-a-timestamp',
        schema_version: EVENT_ENVELOPE_SCHEMA_VERSION,
        organization_id: 'org-017a',
        source_module: 'platform.observability',
        subject: {
          entity_type: 'platform.control',
          entity_id: 'control-017a',
        },
        payload: {},
        idempotency_key: 'idem-017a',
        compliance: {
          privacy_class: 'internal',
          retention_class: 'standard',
          redaction_policy: 'standard',
          audit_required: true,
          replay_allowed: true,
        },
      }),
    BadRequestException,
  );

  assert.throws(
    () =>
      buildEventEnvelope({
        organization_id: 'org-017a',
        event_type: 'platform.mutation.recorded',
        idempotency_key: 'idem-017a',
        payload: {},
        compliance: {
          audit_required: 'yes' as never,
        },
      }),
    BadRequestException,
  );
}

async function testRecordEventValidatesEnvelopeWithoutChangingLegacyPayloadShape() {
  const writes: Array<Record<string, unknown>> = [];
  const db = {
    eventOutbox: {
      upsert: async ({ create }: { create: Record<string, unknown> }) => {
        writes.push(create);
        return create;
      },
    },
  };
  const service = new EventOutboxService();

  await service.recordEvent(db as never, {
    organization_id: 'org-017a',
    event_type: 'platform.mutation.recorded',
    version: '0.1.0',
    idempotency_key: 'idem-017a',
    source_module: 'platform.observability',
    subject: {
      entity_type: 'platform.control',
      entity_id: 'control-017a',
    },
    payload: {
      action_key: 'platform.control.validated',
    },
  });

  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0].payload, {
    action_key: 'platform.control.validated',
  });
  assert.equal(writes[0].event_type, 'platform.mutation.recorded');
  assert.equal(writes[0].idempotency_key, 'idem-017a');
}

function testAuditLogBuildsEnvelopeContextForAuditEvents() {
  const context = buildAuditEventEnvelopeContext({
    actor_user_id: 'actor-017a',
    action_key: 'platform.audit.recorded',
    entity_type: 'audit.log',
    entity_id: 'audit-017a',
  });

  assert.deepEqual(context, {
    source_module: 'platform.audit',
    producer: 'akti-api',
    subject: {
      entity_type: 'audit.log',
      entity_id: 'audit-017a',
    },
    actor_user_id: 'actor-017a',
    action_key: 'platform.audit.recorded',
  });
}

async function run() {
  testBuildsPhase5ARequiredEnvelopeFields();
  testRejectsMissingEnvelopeFieldsAndInvalidCompliance();
  await testRecordEventValidatesEnvelopeWithoutChangingLegacyPayloadShape();
  testAuditLogBuildsEnvelopeContextForAuditEvents();

  console.log('P5B-017a event envelope contract/validator tests passed.');
}

void run();
