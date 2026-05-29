import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { CommunicationService, type CommunicationIntentInput } from './communication.service';

function validIntent(overrides?: Partial<CommunicationIntentInput>): CommunicationIntentInput {
  return {
    organization_id: 'org-021a',
    actor_user_id: 'actor-021a',
    source_module: 'core.workflow',
    intent_key: 'workflow.approval.notify',
    recipient_ref: 'user:actor-reviewer',
    channel: 'email_stub',
    template_key: 'workflow.approval.requested',
    payload: {
      workflow_key: 'platform.approval_flow',
    },
    idempotency_key: 'comm-intent-021a',
    requested_at: '2026-05-29T00:00:00.000Z',
    consent_ref: 'consent:file-notification',
    retention_policy: 'per_communication_policy',
    risk_classification: 'medium',
    priority: 'normal',
    ...overrides,
  };
}

function testCommunicationIntentDeclarationCapturesGovernedMetadataWithoutDelivery() {
  const declaration = new CommunicationService().declareIntent(validIntent());

  assert.equal(declaration.organization_id, 'org-021a');
  assert.equal(declaration.actor_user_id, 'actor-021a');
  assert.equal(declaration.source_module, 'core.workflow');
  assert.equal(declaration.intent_key, 'workflow.approval.notify');
  assert.equal(declaration.channel, 'email_stub');
  assert.equal(declaration.status, 'declared');
  assert.equal(declaration.delivery_executed, false);
  assert.equal(declaration.production_provider_calls, false);
  assert.equal(declaration.gatekeeper.risk_check_required, true);
  assert.equal(declaration.gatekeeper.capability_key, 'platform.communication.send');
  assert.equal(declaration.gatekeeper.consent_check_required, true);
  assert.equal(declaration.audit.event_type, 'communication.intent.declared');
  assert.equal(declaration.audit.audit_required, true);
}

function testCommunicationIntentAllowsOnlyApprovedStubChannels() {
  const service = new CommunicationService();

  assert.equal(service.declareIntent(validIntent({ channel: 'sms_stub' })).channel, 'sms_stub');
  assert.equal(service.declareIntent(validIntent({ channel: 'push_stub' })).channel, 'push_stub');
  assert.equal(service.declareIntent(validIntent({ channel: 'whatsapp_stub' })).channel, 'whatsapp_stub');
  assert.throws(
    () => service.declareIntent(validIntent({ channel: 'email_live_provider' as CommunicationIntentInput['channel'] })),
    BadRequestException,
  );
  assert.throws(
    () => service.declareIntent(validIntent({ channel: 'whatsapp_business' as CommunicationIntentInput['channel'] })),
    BadRequestException,
  );
}

function testCommunicationIntentRejectsMissingConsentRiskPayloadAndTimestamp() {
  const service = new CommunicationService();

  assert.throws(() => service.declareIntent(validIntent({ organization_id: ' ' })), BadRequestException);
  assert.throws(() => service.declareIntent(validIntent({ consent_ref: '' })), BadRequestException);
  assert.throws(
    () => service.declareIntent(validIntent({ risk_classification: 'critical' as CommunicationIntentInput['risk_classification'] })),
    BadRequestException,
  );
  assert.throws(() => service.declareIntent(validIntent({ payload: [] as never })), BadRequestException);
  assert.throws(() => service.declareIntent(validIntent({ requested_at: 'not-a-date' })), BadRequestException);
  assert.throws(() => service.declareIntent(validIntent({ priority: 'urgent' as CommunicationIntentInput['priority'] })), BadRequestException);
}

function run() {
  testCommunicationIntentDeclarationCapturesGovernedMetadataWithoutDelivery();
  testCommunicationIntentAllowsOnlyApprovedStubChannels();
  testCommunicationIntentRejectsMissingConsentRiskPayloadAndTimestamp();

  console.log('P5B-021a Communication intent declaration service tests passed.');
}

run();
