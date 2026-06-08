import assert from 'node:assert/strict';
import { recordCommunicationAttemptEvidence, type CommunicationAttemptEvidenceInput } from './communication_attempt_evidence.evidence';

const baseInput: CommunicationAttemptEvidenceInput = {
  organization_id: 'org_akti_demo',
  attempt_evidence_id: 'communication_attempt_evidence_001',
  conversation_ref: 'conversation_thread_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  channel: 'EMAIL',
  direction: 'OUTBOUND',
  attempt_status: 'GATEWAY_ACCEPTED',
  billing_class: 'BILLABLE_MESSAGE_USAGE',
  billable_unit_count: 1,
  message_usage_evidence_ref: 'message_usage_evidence_001',
  attempted_at: '2026-06-08T21:00:00.000Z',
  recorded_by_surface: 'email_sequences',
  global_opt_out_registry_ref: 'global_opt_out_registry_001',
};

const receipt = recordCommunicationAttemptEvidence(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_communication_attempt_evidence');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.communication_attempt_evidence.recorded');
assert.equal(receipt.channel, 'EMAIL');
assert.equal(receipt.direction, 'OUTBOUND');
assert.equal(receipt.attempt_status, 'GATEWAY_ACCEPTED');
assert.equal(receipt.billing_class, 'BILLABLE_MESSAGE_USAGE');
assert.equal(receipt.billable, true);
assert.equal(receipt.billable_unit_count, 1);
assert.equal(receipt.opt_out_dependency_tier, 'CONDITIONAL_EVIDENCE_REFERENCE');
assert.match(receipt.evidence_digest, /^[a-f0-9]{64}$/);
assert.equal(receipt.send_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const sameReceipt = recordCommunicationAttemptEvidence(baseInput);
assert.equal(sameReceipt.evidence_digest, receipt.evidence_digest);

const zeroRatedReceipt = recordCommunicationAttemptEvidence({
  ...baseInput,
  attempt_evidence_id: 'communication_attempt_evidence_002',
  channel: 'WHATSAPP',
  direction: 'INBOUND',
  attempt_status: 'SKIPPED_OPT_OUT',
  billing_class: 'ZERO_RATED',
  billable_unit_count: 0,
  global_opt_out_registry_ref: undefined,
});
assert.equal(zeroRatedReceipt.channel, 'WHATSAPP');
assert.equal(zeroRatedReceipt.direction, 'INBOUND');
assert.equal(zeroRatedReceipt.billable, false);
assert.equal(zeroRatedReceipt.global_opt_out_registry_ref, undefined);

assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, attempt_evidence_id: '' }), /attempt_evidence_id is required/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, conversation_ref: '' }), /conversation_ref is required/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, channel: 'SMS' as never }), /channel is not supported/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, direction: 'SIDEWAYS' as never }), /direction is not supported/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, attempt_status: 'DELIVERED' as never }), /attempt_status is not supported/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, billing_class: 'FREE' as never }), /billing_class is not supported/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, billing_class: 'ZERO_RATED', billable_unit_count: 1 }), /ZERO_RATED communication attempt evidence must have zero billable units/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, billing_class: 'BILLABLE_MESSAGE_USAGE', billable_unit_count: 0 }), /BILLABLE_MESSAGE_USAGE communication attempt evidence must have at least one billable unit/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, billable_unit_count: -1 }), /billable_unit_count must be a non-negative integer/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, message_usage_evidence_ref: '' }), /message_usage_evidence_ref is required/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, attempted_at: 'not-a-date' }), /attempted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, recorded_by_surface: '' }), /recorded_by_surface is required/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, send_requested: true }), /must not send messages/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => recordCommunicationAttemptEvidence({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-059 communication attempt evidence test passed.');
