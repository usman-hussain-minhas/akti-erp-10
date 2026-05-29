import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  CommunicationService,
  type CommunicationIntentDeclaration,
  type CommunicationIntentInput,
} from './communication.service';

function validIntent(overrides?: Partial<CommunicationIntentInput>): CommunicationIntentInput {
  return {
    organization_id: 'org-021b',
    actor_user_id: 'actor-021b',
    source_module: 'core.workflow',
    intent_key: 'workflow.approval.notify',
    recipient_ref: 'user:actor-reviewer',
    channel: 'whatsapp_stub',
    template_key: 'workflow.approval.requested',
    payload: {
      workflow_key: 'platform.approval_flow',
    },
    idempotency_key: 'comm-intent-021b',
    requested_at: '2026-05-29T00:00:00.000Z',
    consent_ref: 'consent:workflow-notification',
    retention_policy: 'per_communication_policy',
    risk_classification: 'medium',
    priority: 'normal',
    ...overrides,
  };
}

function testCommunicationAndEngagementGatewayOwnershipBoundaryIsExplicit() {
  const boundary = new CommunicationService().gatewayBoundary();

  assert.equal(boundary.communication_service_owns, 'intent_semantics_consent_risk_retention');
  assert.equal(boundary.engagement_gateway_owns, 'transport_request_recording_and_stub_adapter_boundary');
  assert.equal(boundary.communication_executes_transport, false);
  assert.equal(boundary.gateway_bypasses_communication_intent, false);
}

function testDeclaredCommunicationIntentBuildsGatewayHandoffWithoutDispatch() {
  const service = new CommunicationService();
  const intent = service.declareIntent(validIntent());
  const handoff = service.buildEngagementGatewayHandoff(intent);

  assert.equal(handoff.handoff_type, 'engagement_gateway_request_intent');
  assert.equal(handoff.source_service, 'communication.service');
  assert.equal(handoff.target_service, 'engagement.gateway');
  assert.equal(handoff.request_kind, 'communication.delivery.requested');
  assert.equal(handoff.transport_channel, 'whatsapp_stub');
  assert.equal(handoff.organization_id, 'org-021b');
  assert.equal(handoff.actor_user_id, 'actor-021b');
  assert.equal(handoff.source_module, 'core.workflow');
  assert.equal(handoff.recipient_ref, 'user:actor-reviewer');
  assert.equal(handoff.idempotency_key, 'comm-intent-021b');
  assert.equal(handoff.capability_key, 'platform.communication.send');
  assert.equal(handoff.delivery_executed, false);
  assert.equal(handoff.production_provider_calls, false);
}

function testGatewayHandoffRejectsExecutedOrUndeclaredIntent() {
  const service = new CommunicationService();
  const intent = service.declareIntent(validIntent());

  assert.throws(
    () =>
      service.buildEngagementGatewayHandoff({
        ...intent,
        status: 'sent' as CommunicationIntentDeclaration['status'],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.buildEngagementGatewayHandoff({
        ...intent,
        delivery_executed: true as false,
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.buildEngagementGatewayHandoff({
        ...intent,
        production_provider_calls: true as false,
      }),
    BadRequestException,
  );
}

function run() {
  testCommunicationAndEngagementGatewayOwnershipBoundaryIsExplicit();
  testDeclaredCommunicationIntentBuildsGatewayHandoffWithoutDispatch();
  testGatewayHandoffRejectsExecutedOrUndeclaredIntent();

  console.log('P5B-021b Communication vs Engagement Gateway boundary alignment tests passed.');
}

run();
