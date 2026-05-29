import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { CommunicationService, type CommunicationIntentInput } from './communication.service';

function validIntent(overrides?: Partial<CommunicationIntentInput>): CommunicationIntentInput {
  return {
    organization_id: 'org-021d',
    actor_user_id: 'actor-021d',
    source_module: 'core.workflow',
    intent_key: 'workflow.approval.notify',
    recipient_ref: 'user:workflow-reviewer',
    channel: 'push_stub',
    template_key: 'workflow.approval.requested',
    payload: {
      workflow_key: 'platform.approval_flow',
      escalation_level: 'platform_review',
    },
    idempotency_key: 'comm-intent-021d',
    requested_at: '2026-05-29T00:00:00.000Z',
    consent_ref: 'consent:workflow-notification',
    retention_policy: 'per_communication_policy',
    risk_classification: 'high',
    priority: 'high',
    ...overrides,
  };
}

function testCommunicationIntentPreservesAuditConsentAndRiskMetadata() {
  const declaration = new CommunicationService().declareIntent(validIntent());

  assert.equal(declaration.organization_id, 'org-021d');
  assert.equal(declaration.consent_ref, 'consent:workflow-notification');
  assert.equal(declaration.retention_policy, 'per_communication_policy');
  assert.equal(declaration.risk_classification, 'high');
  assert.equal(declaration.priority, 'high');
  assert.equal(declaration.gatekeeper.risk_check_required, true);
  assert.equal(declaration.gatekeeper.consent_check_required, true);
  assert.equal(declaration.gatekeeper.capability_key, 'platform.communication.send');
  assert.equal(declaration.audit.event_type, 'communication.intent.declared');
  assert.equal(declaration.audit.audit_required, true);
  assert.equal(declaration.delivery_executed, false);
  assert.equal(declaration.production_provider_calls, false);
}

function testGatewayHandoffAndStubProofPreserveTenantAuditBoundaryWithoutProviderCalls() {
  const service = new CommunicationService();
  const declaration = service.declareIntent(validIntent());
  const handoff = service.buildEngagementGatewayHandoff(declaration);
  const proof = service.recordLocalStubDelivery(handoff, '2026-05-29T01:00:00.000Z');

  assert.equal(handoff.organization_id, declaration.organization_id);
  assert.equal(handoff.actor_user_id, declaration.actor_user_id);
  assert.equal(handoff.capability_key, declaration.gatekeeper.capability_key);
  assert.equal(proof.organization_id, declaration.organization_id);
  assert.equal(proof.actor_user_id, declaration.actor_user_id);
  assert.equal(proof.source_module, declaration.source_module);
  assert.equal(proof.provider_message_id, null);
  assert.equal(proof.delivery_executed, false);
  assert.equal(proof.live_dispatch, false);
  assert.equal(proof.production_provider_calls, false);
}

function testCommunicationRejectsMissingOrInvalidConsentRiskAndAuditInputs() {
  const service = new CommunicationService();

  assert.throws(() => service.declareIntent(validIntent({ consent_ref: '' })), BadRequestException);
  assert.throws(() => service.declareIntent(validIntent({ retention_policy: ' ' })), BadRequestException);
  assert.throws(
    () => service.declareIntent(validIntent({ risk_classification: 'critical' as CommunicationIntentInput['risk_classification'] })),
    BadRequestException,
  );
  assert.throws(() => service.declareIntent(validIntent({ actor_user_id: '' })), BadRequestException);
  assert.throws(() => service.declareIntent(validIntent({ organization_id: '' })), BadRequestException);
}

function testCommunicationRiskLevelsRemainExplicitlyBounded() {
  const service = new CommunicationService();

  assert.equal(service.declareIntent(validIntent({ risk_classification: 'low' })).risk_classification, 'low');
  assert.equal(service.declareIntent(validIntent({ risk_classification: 'medium' })).risk_classification, 'medium');
  assert.equal(service.declareIntent(validIntent({ risk_classification: 'high' })).risk_classification, 'high');
}

function run() {
  testCommunicationIntentPreservesAuditConsentAndRiskMetadata();
  testGatewayHandoffAndStubProofPreserveTenantAuditBoundaryWithoutProviderCalls();
  testCommunicationRejectsMissingOrInvalidConsentRiskAndAuditInputs();
  testCommunicationRiskLevelsRemainExplicitlyBounded();

  console.log('P5B-021d Communication audit/consent/risk tests passed.');
}

run();
