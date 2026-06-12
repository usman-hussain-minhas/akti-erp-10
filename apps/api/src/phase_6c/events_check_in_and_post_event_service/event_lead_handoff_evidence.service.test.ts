import assert from 'node:assert/strict';

import { evaluateEventLeadHandoffEvidence, type EventLeadHandoffEvidenceInput } from './event_lead_handoff_evidence.service';

const baseInput: EventLeadHandoffEvidenceInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_event_lead_handoff_evidence',
  event_ref: 'event_2026_founder_roundtable',
  source_record_ref: 'handoff_source_record_001',
  evaluated_by_user_id: 'user_event_ops',
  evaluated_at: '2026-06-12T12:00:00.000Z',
  handoff_source: 'feedback',
  identity_policy: 'identified',
  attendee_ref: 'attendee_001',
  registration_ref: 'registration_001',
  feedback_ref: 'feedback_001',
  person_ref: 'person_001',
  contact_ref: 'contact_001',
  handoff_reason: 'attendee requested commercial follow-up in post-event feedback',
  consent_basis_ref: 'consent_event_followup_001',
  evidence_payload: {
    interest_score: 87,
    requested_followup: true,
    topic: 'platform-demo',
  },
};

const receipt = evaluateEventLeadHandoffEvidence(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_123_event_lead_handoff_evidence');
assert.equal(receipt.component_id, '6C.09');
assert.equal(receipt.component_slug, 'events_check_in_and_post_event_service');
assert.equal(receipt.model_name, 'Phase6CEventLeadHandoffEvidence');
assert.equal(receipt.event_name, 'phase_6c.events_check_in_and_post_event_service.event_lead_handoff_evidence.runtime_evaluated');
assert.equal(receipt.decision, 'HANDOFF_EVIDENCE_READY');
assert.equal(receipt.crm_handoff_target_component, '6B.06');
assert.equal(receipt.crm_handoff_mode, 'EVENT_REF_ONLY_NO_DIRECT_WRITE');
assert.equal(receipt.direct_crm_write_performed, false);
assert.equal(receipt.outbound_communication_performed, false);
assert.equal(receipt.provider_adapter_invoked, false);
assert.deepEqual(receipt.lead_identity_refs, ['contact_001', 'person_001']);
assert.deepEqual(receipt.source_refs, ['attendee_001', 'feedback_001', 'registration_001']);
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.deepEqual(receipt.decision_refs, ['6C-EVENT-CHECK-013', '6C-EVENT-REG-012', '6C-GLOBAL-018', '6C-API-008']);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEventLeadHandoffEvidence({
  ...baseInput,
  evidence_payload: {
    requested_followup: true,
    topic: 'platform-demo',
    interest_score: 87,
  },
});
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

const reviewReceipt = evaluateEventLeadHandoffEvidence({
  ...baseInput,
  identity_policy: 'pseudonymous',
  person_ref: undefined,
  contact_ref: 'contact_pseudo_001',
  consent_basis_ref: undefined,
});
assert.equal(reviewReceipt.decision, 'HANDOFF_EVIDENCE_REVIEW_REQUIRED');
assert.deepEqual(reviewReceipt.review_reasons, ['CONSENT_BASIS_REF_NOT_PROVIDED', 'PSEUDONYMOUS_IDENTITY_REQUIRES_CRM_HANDLER_REVIEW']);
assert.equal(reviewReceipt.direct_crm_write_performed, false);

const anonymousReceipt = evaluateEventLeadHandoffEvidence({
  ...baseInput,
  identity_policy: 'anonymous',
});
assert.equal(anonymousReceipt.decision, 'HANDOFF_EVIDENCE_REJECTED');
assert.ok(anonymousReceipt.rejection_reasons.includes('ANONYMOUS_FEEDBACK_CANNOT_CREATE_LEAD_HANDOFF'));

const missingIdentityReceipt = evaluateEventLeadHandoffEvidence({
  ...baseInput,
  person_ref: undefined,
  contact_ref: undefined,
  crm_lead_ref: undefined,
});
assert.equal(missingIdentityReceipt.decision, 'HANDOFF_EVIDENCE_REJECTED');
assert.ok(missingIdentityReceipt.rejection_reasons.includes('EVENT_LEAD_HANDOFF_IDENTITY_OR_CONTACT_REF_REQUIRED'));

const missingSourceReceipt = evaluateEventLeadHandoffEvidence({
  ...baseInput,
  attendee_ref: undefined,
  registration_ref: undefined,
  feedback_ref: undefined,
});
assert.equal(missingSourceReceipt.decision, 'HANDOFF_EVIDENCE_REJECTED');
assert.ok(missingSourceReceipt.rejection_reasons.includes('EVENT_LEAD_HANDOFF_SOURCE_REF_REQUIRED'));

assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, event_ref: '' }), /event_ref is required/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, handoff_source: 'webhook' as EventLeadHandoffEvidenceInput['handoff_source'] }), /handoff_source is not supported/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, identity_policy: 'public' as EventLeadHandoffEvidenceInput['identity_policy'] }), /identity_policy is not supported/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, evidence_payload: { bad: Number.POSITIVE_INFINITY } }), /evidence_payload values must be finite primitive values/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, direct_crm_write_requested: true }), /must not write CRM directly/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, outbound_communication_requested: true }), /must not send outbound communications/);
assert.throws(() => evaluateEventLeadHandoffEvidence({ ...baseInput, provider_adapter_requested: true }), /must not invoke provider adapters/);

console.log('P6C runtime event_lead_handoff_evidence test passed.');
