import assert from 'node:assert/strict';

import { evaluateAnnouncementAckEvidence, type AnnouncementAckEvidenceInput } from './announcement_ack_evidence.service';

const baseInput: AnnouncementAckEvidenceInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_announcement_ack_evidence',
  announcement_id: 'announcement_001',
  delivery_intent_id: 'delivery_intent_001',
  recipient_user_id: 'user_ack_recipient',
  source_record_ref: 'announcement_ack_source_record_001',
  requested_by_user_id: 'user_announcement_admin',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  acknowledgement_required: true,
  acknowledgement_status: 'ACKNOWLEDGED',
  acknowledgement_method: 'USER_ACTION',
  acknowledged_at: '2026-06-09T09:05:00.000Z',
  source_ack_ref: 'ack_ref_001',
  gateway_policy_ref: 'communication_gateway_policy_adl_004',
};

const acknowledgedReceipt = evaluateAnnouncementAckEvidence(baseInput);
assert.equal(acknowledgedReceipt.seed_id, 'seed_6c_095_announcement_ack_evidence');
assert.equal(acknowledgedReceipt.component_id, '6C.07');
assert.equal(acknowledgedReceipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.announcement_ack_evidence.runtime_evaluated');
assert.equal(acknowledgedReceipt.decision, 'ACK_EVIDENCE_READY');
assert.equal(acknowledgedReceipt.gateway_route_required, true);
assert.equal(acknowledgedReceipt.refs_events_only, true);
assert.equal(acknowledgedReceipt.provider_callback_executed, false);
assert.equal(acknowledgedReceipt.gateway_send_executed, false);
assert.equal(acknowledgedReceipt.acknowledgement_mutation_executed, false);
assert.equal(acknowledgedReceipt.runtime_adapter_executed, false);
assert.equal(acknowledgedReceipt.persistence_executed, false);
assert.deepEqual(acknowledgedReceipt.adl_refs, ['ADL-004']);
assert.deepEqual(acknowledgedReceipt.decision_refs, ['6C-CAL-014', '6C-GLOBAL-013', '6C-ADL-008', '6C-GLOBAL-018']);
assert.equal(acknowledgedReceipt.ack_evidence.workspace_evidence_mode, 'EVENT_REFERENCE_ONLY');
assert.match(acknowledgedReceipt.ack_evidence.evidence_id, /^[a-f0-9]{64}$/);
assert.match(acknowledgedReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAnnouncementAckEvidence(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, acknowledgedReceipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.ack_evidence.evidence_id, acknowledgedReceipt.ack_evidence.evidence_id);

const pendingReceipt = evaluateAnnouncementAckEvidence({
  ...baseInput,
  acknowledgement_status: 'PENDING',
  acknowledgement_method: undefined,
  acknowledged_at: undefined,
  source_ack_ref: undefined,
});
assert.equal(pendingReceipt.decision, 'ACK_PENDING');
assert.equal(pendingReceipt.ack_evidence.acknowledged_at, null);

const notRequiredReceipt = evaluateAnnouncementAckEvidence({
  ...baseInput,
  acknowledgement_required: false,
  acknowledgement_status: 'NOT_REQUIRED',
  acknowledgement_method: undefined,
  acknowledged_at: undefined,
  source_ack_ref: undefined,
});
assert.equal(notRequiredReceipt.decision, 'ACK_NOT_REQUIRED');

const declinedReceipt = evaluateAnnouncementAckEvidence({
  ...baseInput,
  acknowledgement_status: 'DECLINED',
  acknowledgement_method: 'ADMIN_RECORDED',
  acknowledged_at: undefined,
  source_ack_ref: 'decline_ref_001',
});
assert.equal(declinedReceipt.decision, 'ACK_DECLINED_RECORDED');

assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, acknowledgement_status: 'UNKNOWN' as never }), /unsupported value UNKNOWN/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, acknowledgement_method: 'VOICE' as never }), /unsupported value VOICE/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, acknowledged_at: undefined }), /ACKNOWLEDGED evidence requires acknowledgement_method, acknowledged_at, and source_ack_ref/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, acknowledgement_required: false, acknowledgement_status: 'PENDING' }), /PENDING acknowledgement is valid only when acknowledgement_required is true/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, acknowledgement_required: true, acknowledgement_status: 'NOT_REQUIRED' }), /NOT_REQUIRED acknowledgement is invalid/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, provider_callback_requested: true }), /must not execute provider callbacks/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, gateway_send_requested: true }), /must not send through the gateway/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, acknowledgement_mutation_requested: true }), /must not mutate acknowledgement state/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, persistence_requested: true }), /must not persist acknowledgement evidence/);
assert.throws(() => evaluateAnnouncementAckEvidence({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);

console.log('P6C runtime announcement_ack_evidence test passed.');
