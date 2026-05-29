import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  EventOutboxService,
  assertComplianceEventContext,
  buildEventEnvelope,
} from './event-outbox.service';

function testComplianceEventRequiresActorAndCorrelationContext() {
  const envelope = buildEventEnvelope({
    organization_id: 'org-017d',
    event_type: 'gatekeeper.preflight.decided',
    idempotency_key: 'gatekeeper-017d',
    source_module: 'gatekeeper',
    subject: {
      entity_type: 'gatekeeper.decision',
      entity_id: 'decision-017d',
    },
    payload: {
      outcome: 'STOP_FOR_REVIEW',
    },
    compliance: {
      privacy_class: 'restricted',
      retention_class: 'audit',
      redaction_policy: 'strict',
      audit_required: true,
      replay_allowed: false,
    },
    context: {
      actor_user_id: 'actor-017d',
      correlation_id: 'corr-017d',
      request_id: 'req-017d',
    },
  });

  assert.equal(assertComplianceEventContext(envelope), envelope);
  assert.equal(envelope.context.actor_user_id, 'actor-017d');
  assert.equal(envelope.context.correlation_id, 'corr-017d');
  assert.equal(envelope.context.request_id, 'req-017d');
}

function testComplianceEventRejectsMissingActorOrCorrelationContext() {
  const missingActor = buildEventEnvelope({
    organization_id: 'org-017d',
    event_type: 'gatekeeper.preflight.decided',
    idempotency_key: 'missing-actor-017d',
    payload: {},
    compliance: {
      retention_class: 'audit',
      audit_required: true,
    },
    context: {
      correlation_id: 'corr-017d',
    },
  });

  assert.throws(() => assertComplianceEventContext(missingActor), BadRequestException);

  const missingCorrelation = buildEventEnvelope({
    organization_id: 'org-017d',
    event_type: 'gatekeeper.preflight.decided',
    idempotency_key: 'missing-correlation-017d',
    payload: {},
    compliance: {
      retention_class: 'audit',
      audit_required: true,
    },
    context: {
      actor_user_id: 'actor-017d',
    },
  });

  assert.throws(() => assertComplianceEventContext(missingCorrelation), BadRequestException);
}

function testComplianceEventRejectsNonAuditRetentionContext() {
  const envelope = buildEventEnvelope({
    organization_id: 'org-017d',
    event_type: 'gatekeeper.preflight.decided',
    idempotency_key: 'standard-retention-017d',
    payload: {},
    compliance: {
      retention_class: 'standard',
      audit_required: true,
    },
    context: {
      actor_user_id: 'actor-017d',
      correlation_id: 'corr-017d',
    },
  });

  assert.throws(() => assertComplianceEventContext(envelope), BadRequestException);
}

async function testRecordEventCanRequireComplianceContextBeforeWriting() {
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
    organization_id: 'org-017d',
    event_type: 'gatekeeper.preflight.decided',
    version: '0.1.0',
    idempotency_key: 'write-017d',
    source_module: 'gatekeeper',
    subject: {
      entity_type: 'gatekeeper.decision',
      entity_id: 'decision-017d',
    },
    payload: {
      outcome: 'STOP_FOR_REVIEW',
    },
    compliance: {
      privacy_class: 'restricted',
      retention_class: 'audit',
      redaction_policy: 'strict',
      audit_required: true,
      replay_allowed: false,
    },
    context: {
      actor_user_id: 'actor-017d',
      correlation_id: 'corr-017d',
    },
    requires_compliance_context: true,
  });

  assert.equal(writes.length, 1);
  assert.equal(writes[0].event_type, 'gatekeeper.preflight.decided');
  assert.equal(writes[0].retention_class, 'audit');

  await assert.rejects(
    () =>
      service.recordEvent(db as never, {
        organization_id: 'org-017d',
        event_type: 'gatekeeper.preflight.decided',
        version: '0.1.0',
        idempotency_key: 'reject-017d',
        payload: {},
        compliance: {
          retention_class: 'audit',
          audit_required: true,
        },
        context: {
          actor_user_id: 'actor-017d',
        },
        requires_compliance_context: true,
      }),
    BadRequestException,
  );
  assert.equal(writes.length, 1);
}

async function run() {
  testComplianceEventRequiresActorAndCorrelationContext();
  testComplianceEventRejectsMissingActorOrCorrelationContext();
  testComplianceEventRejectsNonAuditRetentionContext();
  await testRecordEventCanRequireComplianceContextBeforeWriting();

  console.log('P5B-017d compliance-class event context tests passed.');
}

void run();
