import assert from 'node:assert/strict';

import { recordPolicyAcknowledgementEvidence, type PolicyAcknowledgementEvidenceInput } from './policy_acknowledgement_evidence.service';

const baseInput: PolicyAcknowledgementEvidenceInput = {
  organization_id: 'org_phase_6c_policy',
  service_manifest_contract_id: 'smc_phase_6c_policy_acknowledgement_evidence',
  source_record_ref: 'policy_acknowledgement_source_001',
  acknowledgement_ref: 'ack_policy_commission_v2_employee_001',
  employee_ref: 'employee_sales_001',
  policy_key: 'commission_policy',
  policy_version: 'v2',
  policy_hash: 'hash_commission_policy_v2',
  acknowledgement_channel: 'WEB_PORTAL',
  acknowledged_at: '2026-06-15T08:55:00.000Z',
  statement_text_hash: 'hash_statement_i_acknowledge_commission_policy_v2',
  evidence_refs: ['policy_version_library_receipt_001', 'user_session_evidence_001'],
  signer_ip_hash: 'hash_ip_001',
  user_agent_hash: 'hash_user_agent_001',
  evaluated_by_user_id: 'user_policy_controller',
  evaluated_at: '2026-06-15T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_050' },
};

const acceptedReceipt = recordPolicyAcknowledgementEvidence(baseInput);
assert.equal(acceptedReceipt.seed_id, 'seed_6c_050_policy_acknowledgement_evidence');
assert.equal(acceptedReceipt.component_id, '6C.04');
assert.equal(acceptedReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(acceptedReceipt.model_name, 'Phase6CPolicyAcknowledgementEvidence');
assert.equal(acceptedReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.policy_acknowledgement_evidence.recorded');
assert.equal(acceptedReceipt.acknowledgement_ref, 'ack_policy_commission_v2_employee_001');
assert.equal(acceptedReceipt.employee_ref, 'employee_sales_001');
assert.equal(acceptedReceipt.policy_key, 'commission_policy');
assert.equal(acceptedReceipt.policy_version, 'v2');
assert.equal(acceptedReceipt.policy_hash, 'hash_commission_policy_v2');
assert.equal(acceptedReceipt.acknowledgement_channel, 'WEB_PORTAL');
assert.equal(acceptedReceipt.decision, 'ACKNOWLEDGEMENT_EVIDENCE_ACCEPTED');
assert.match(acceptedReceipt.canonical_payload_hash, /^[a-f0-9]{64}$/);
assert.match(acceptedReceipt.acknowledgement_evidence_digest, /^[a-f0-9]{64}$/);
assert.equal(acceptedReceipt.policy_mutation_allowed, false);
assert.equal(acceptedReceipt.acknowledgement_overwrite_allowed, false);
assert.equal(acceptedReceipt.acknowledgement_delete_allowed, false);
assert.equal(acceptedReceipt.schema_mutation_allowed, false);
assert.equal(acceptedReceipt.phase_6a_mutation_allowed, false);
assert.equal(acceptedReceipt.phase_6b_mutation_allowed, false);
assert.equal(acceptedReceipt.runtime_adapter_allowed, false);
assert.equal(acceptedReceipt.ticket_flag_flip_allowed, false);
assert.deepEqual(acceptedReceipt.decision_refs, ['6C-HR-OPS-010']);

const repeatedReceipt = recordPolicyAcknowledgementEvidence(baseInput);
assert.equal(repeatedReceipt.canonical_payload_hash, acceptedReceipt.canonical_payload_hash);
assert.equal(repeatedReceipt.acknowledgement_evidence_digest, acceptedReceipt.acknowledgement_evidence_digest);

const reviewReceipt = recordPolicyAcknowledgementEvidence({
  ...baseInput,
  signer_ip_hash: undefined,
  user_agent_hash: undefined,
  acknowledgement_channel: 'IMPORTED_SIGNED_DOCUMENT',
});
assert.equal(reviewReceipt.decision, 'ACKNOWLEDGEMENT_EVIDENCE_REQUIRES_REVIEW');
assert.equal(reviewReceipt.signer_ip_hash, null);
assert.equal(reviewReceipt.user_agent_hash, null);

assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, acknowledgement_ref: '' }), /acknowledgement_ref is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, policy_key: '' }), /policy_key is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, policy_version: '' }), /policy_version is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, policy_hash: '' }), /policy_hash is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, acknowledgement_channel: 'SMS' as never }), /acknowledgement_channel must be a supported acknowledgement channel/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, acknowledged_at: 'not-a-date' }), /acknowledged_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, acknowledged_at: '2026-06-16T00:00:00.000Z' }), /acknowledged_at must not be after evaluated_at/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, statement_text_hash: '' }), /statement_text_hash is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, evidence_refs: [] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, policy_mutation_requested: true }), /must not perform policy mutation/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, acknowledgement_overwrite_requested: true }), /must not perform acknowledgement overwrite/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, acknowledgement_delete_requested: true }), /must not perform acknowledgement delete/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => recordPolicyAcknowledgementEvidence({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C policy_acknowledgement_evidence runtime FFET test passed.');
