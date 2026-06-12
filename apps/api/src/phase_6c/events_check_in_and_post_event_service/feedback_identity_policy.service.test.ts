import assert from 'node:assert/strict';

import { evaluateFeedbackIdentityPolicy, type FeedbackIdentityPolicyInput } from './feedback_identity_policy.service';

const baseInput: FeedbackIdentityPolicyInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_feedback_identity_policy',
  event_ref: 'event_001',
  form_ref: 'feedback_form_001',
  source_record_ref: 'feedback_identity_case_001',
  identity_mode: 'mixed_allowed',
  response_is_anonymous: false,
  attendee_ref: 'attendee_001',
  registration_ref: 'registration_001',
  crm_lead_ref: 'lead_001',
  evaluated_by_user_id: 'operator_001',
  evaluated_at: '2026-06-10T10:00:00.000Z',
  control_metadata: { channel: 'post_event' },
};

const allowed = evaluateFeedbackIdentityPolicy(baseInput);
assert.equal(allowed.seed_id, 'seed_6c_121_feedback_identity_policy');
assert.equal(allowed.component_id, '6C.09');
assert.equal(allowed.component_slug, 'events_check_in_and_post_event_service');
assert.equal(allowed.model_name, 'Phase6CFeedbackIdentityPolicy');
assert.equal(allowed.event_name, 'phase_6c.events_check_in_and_post_event_service.feedback_identity_policy.runtime_evaluated');
assert.equal(allowed.decision, 'FEEDBACK_IDENTITY_POLICY_ALLOWED');
assert.equal(allowed.identity_required, false);
assert.equal(allowed.crm_handoff_allowed, true);
assert.deepEqual(allowed.rejection_reasons, []);
assert.deepEqual(allowed.decision_refs, ['6C-EVENT-CHECK-011', '6C-EVENT-CHECK-013', '6C-EVENT-CHECK-014']);
assert.deepEqual(allowed.dependency_refs, ['seed_6a_service_manifest_contract', '6C.08']);
assert.match(allowed.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeated = evaluateFeedbackIdentityPolicy(baseInput);
assert.equal(repeated.runtime_evidence_digest, allowed.runtime_evidence_digest);

const anonymousAllowed = evaluateFeedbackIdentityPolicy({
  ...baseInput,
  source_record_ref: 'feedback_identity_case_002',
  identity_mode: 'anonymous_allowed',
  response_is_anonymous: true,
  attendee_ref: undefined,
  registration_ref: undefined,
  crm_lead_ref: undefined,
});
assert.equal(anonymousAllowed.decision, 'FEEDBACK_IDENTITY_POLICY_ALLOWED');
assert.equal(anonymousAllowed.crm_handoff_allowed, false);

const identityRequired = evaluateFeedbackIdentityPolicy({
  ...baseInput,
  source_record_ref: 'feedback_identity_case_003',
  identity_mode: 'identified_required',
  response_is_anonymous: true,
  attendee_ref: undefined,
  registration_ref: undefined,
  crm_lead_ref: undefined,
});
assert.equal(identityRequired.decision, 'FEEDBACK_IDENTITY_REQUIRES_IDENTITY');
assert.deepEqual(identityRequired.rejection_reasons, ['identified_feedback_required_but_response_is_anonymous']);

const anonymousConflict = evaluateFeedbackIdentityPolicy({
  ...baseInput,
  source_record_ref: 'feedback_identity_case_004',
  response_is_anonymous: true,
  attendee_ref: 'attendee_002',
  registration_ref: undefined,
  crm_lead_ref: undefined,
});
assert.equal(anonymousConflict.decision, 'FEEDBACK_IDENTITY_REJECTED_POLICY_CONFLICT');
assert.deepEqual(anonymousConflict.rejection_reasons, ['anonymous_feedback_must_not_carry_identity_reference']);

const missingIdentity = evaluateFeedbackIdentityPolicy({
  ...baseInput,
  source_record_ref: 'feedback_identity_case_005',
  response_is_anonymous: false,
  attendee_ref: undefined,
  registration_ref: undefined,
  crm_lead_ref: undefined,
});
assert.equal(missingIdentity.decision, 'FEEDBACK_IDENTITY_REQUIRES_REVIEW');
assert.deepEqual(missingIdentity.rejection_reasons, ['identified_feedback_missing_identity_reference']);

assert.throws(() => evaluateFeedbackIdentityPolicy({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateFeedbackIdentityPolicy({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateFeedbackIdentityPolicy({ ...baseInput, attendee_ref: ' ' }), /attendee_ref must be non-empty/);
assert.throws(() => evaluateFeedbackIdentityPolicy({ ...baseInput, response_collection_requested: true }), /must not collect responses/);
assert.throws(() => evaluateFeedbackIdentityPolicy({ ...baseInput, identity_persistence_requested: true }), /must not persist identity records/);
assert.throws(() => evaluateFeedbackIdentityPolicy({ ...baseInput, crm_write_requested: true }), /must not write CRM records/);
assert.throws(() => evaluateFeedbackIdentityPolicy({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateFeedbackIdentityPolicy({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime feedback_identity_policy test passed.');
