import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  CommunicationService,
  type CommunicationChannel,
  type CommunicationGatewayHandoff,
  type CommunicationIntentInput,
} from './communication.service';

function validIntent(overrides?: Partial<CommunicationIntentInput>): CommunicationIntentInput {
  return {
    organization_id: 'org-021c',
    actor_user_id: 'actor-021c',
    source_module: 'core.workflow',
    intent_key: 'workflow.approval.notify',
    recipient_ref: 'user:workflow-reviewer',
    channel: 'email_stub',
    template_key: 'workflow.approval.requested',
    payload: {
      workflow_key: 'platform.approval_flow',
    },
    idempotency_key: 'comm-intent-021c',
    requested_at: '2026-05-29T00:00:00.000Z',
    consent_ref: 'consent:workflow-notification',
    retention_policy: 'per_communication_policy',
    risk_classification: 'medium',
    priority: 'normal',
    ...overrides,
  };
}

function handoffFor(channel: CommunicationChannel): CommunicationGatewayHandoff {
  const service = new CommunicationService();
  const intent = service.declareIntent(
    validIntent({
      channel,
      idempotency_key: `comm-intent-021c-${channel}`,
    }),
  );

  return service.buildEngagementGatewayHandoff(intent);
}

function testLocalStubDeliveryProofRecordsAllApprovedStubChannelsWithoutProviderCalls() {
  const service = new CommunicationService();

  for (const channel of ['email_stub', 'sms_stub', 'push_stub', 'whatsapp_stub'] as CommunicationChannel[]) {
    const proof = service.recordLocalStubDelivery(handoffFor(channel), '2026-05-29T01:00:00.000Z');

    assert.equal(proof.delivery_mode, 'local_stub');
    assert.equal(proof.status, 'stub_recorded');
    assert.equal(proof.handoff_type, 'engagement_gateway_request_intent');
    assert.equal(proof.transport_recorded_by, 'engagement.gateway.local_stub');
    assert.equal(proof.transport_channel, channel);
    assert.equal(proof.organization_id, 'org-021c');
    assert.equal(proof.actor_user_id, 'actor-021c');
    assert.equal(proof.provider_message_id, null);
    assert.equal(proof.stub_delivery_recorded, true);
    assert.equal(proof.delivery_executed, false);
    assert.equal(proof.live_dispatch, false);
    assert.equal(proof.production_provider_calls, false);
    assert.equal(proof.stub_delivery_id, `local-stub:org-021c:comm-intent-021c-${channel}:${channel}`);
  }
}

function testLocalStubDeliveryRejectsProductionProviderOrNonGatewayHandoffs() {
  const service = new CommunicationService();
  const handoff = handoffFor('whatsapp_stub');

  assert.throws(
    () =>
      service.recordLocalStubDelivery(
        {
          ...handoff,
          target_service: 'whatsapp.production.provider' as CommunicationGatewayHandoff['target_service'],
        },
        '2026-05-29T01:00:00.000Z',
      ),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.recordLocalStubDelivery(
        {
          ...handoff,
          production_provider_calls: true as false,
        },
        '2026-05-29T01:00:00.000Z',
      ),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.recordLocalStubDelivery(
        {
          ...handoff,
          delivery_executed: true as false,
        },
        '2026-05-29T01:00:00.000Z',
      ),
    BadRequestException,
  );
}

function testLocalStubDeliveryRejectsLiveChannelMarkersAndInvalidTimestamps() {
  const service = new CommunicationService();
  const handoff = handoffFor('email_stub');

  assert.throws(
    () =>
      service.recordLocalStubDelivery(
        {
          ...handoff,
          transport_channel: 'sendgrid_live_provider' as CommunicationChannel,
        },
        '2026-05-29T01:00:00.000Z',
      ),
    BadRequestException,
  );
  assert.throws(() => service.recordLocalStubDelivery(handoff, 'not-a-date'), BadRequestException);
}

function run() {
  testLocalStubDeliveryProofRecordsAllApprovedStubChannelsWithoutProviderCalls();
  testLocalStubDeliveryRejectsProductionProviderOrNonGatewayHandoffs();
  testLocalStubDeliveryRejectsLiveChannelMarkersAndInvalidTimestamps();

  console.log('P5B-021c Communication local/stub delivery proof tests passed.');
}

run();
