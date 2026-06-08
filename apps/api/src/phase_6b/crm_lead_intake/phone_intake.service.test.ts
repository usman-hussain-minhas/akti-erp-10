import assert from 'node:assert/strict';
import { recordPhoneIntake, type PhoneIntakeInput } from './phone_intake.service';

const baseInput: PhoneIntakeInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_phone_001',
  person_identity_graph_id: 'person_graph_phone_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_phone_001',
  visual_workflow_definition_id: 'workflow_phone_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_phone_to_lead',
  consent_basis_id: 'consent_basis_phone_capture',
  assignment_state_id: 'assignment_state_new',
  phone_channel_id: 'phone_channel_admissions_001',
  caller_phone_ref: 'caller_phone_hash_001',
  call_reference_id: 'call_reference_001',
  operator_user_id: 'user_phone_agent_001',
  call_direction: 'INBOUND_CALL',
  call_outcome: 'FOLLOW_UP_REQUIRED',
  captured_at: '2026-06-08T13:45:00.000Z',
  lead_fields: {
    full_name: 'Phone Student Six',
    phone: '+923330000000',
    program_interest: 'Admissions',
  },
  call_evidence: {
    call_duration_seconds: '180',
    operator_note: 'asked about scholarship options',
  },
};

const receipt = recordPhoneIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_phone_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.phone_intake.recorded');
assert.equal(receipt.source_system, 'PHONE_INTAKE');
assert.equal(receipt.phone_channel_id, 'phone_channel_admissions_001');
assert.equal(receipt.caller_phone_ref, 'caller_phone_hash_001');
assert.equal(receipt.call_reference_id, 'call_reference_001');
assert.equal(receipt.operator_user_id, 'user_phone_agent_001');
assert.equal(receipt.call_direction, 'INBOUND_CALL');
assert.equal(receipt.call_outcome, 'FOLLOW_UP_REQUIRED');
assert.equal(receipt.normalized_lead_field_count, 3);
assert.deepEqual(receipt.normalized_lead_fields, {
  full_name: 'Phone Student Six',
  phone: '+923330000000',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_call_evidence, {
  call_duration_seconds: '180',
  operator_note: 'asked about scholarship options',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.outbound_call_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordPhoneIntake({ ...baseInput, opt_out_observation: 'OBSERVED_OPTED_OUT' });
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const walkInNoEvidence = recordPhoneIntake({
  ...baseInput,
  call_reference_id: 'call_reference_002',
  call_direction: 'WALK_IN_PHONE_CAPTURE',
  call_outcome: 'LEAD_CAPTURED',
  call_evidence: undefined,
});
assert.equal(walkInNoEvidence.call_direction, 'WALK_IN_PHONE_CAPTURE');
assert.equal(walkInNoEvidence.call_outcome, 'LEAD_CAPTURED');
assert.deepEqual(walkInNoEvidence.normalized_call_evidence, {});

assert.throws(() => recordPhoneIntake({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, person_identity_graph_id: '' }), /person_identity_graph_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, access_gatekeeper_decision_id: '' }), /access_gatekeeper_decision_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, visual_workflow_definition_id: '' }), /visual_workflow_definition_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, phone_channel_id: '' }), /phone_channel_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, caller_phone_ref: '' }), /caller_phone_ref is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, call_reference_id: '' }), /call_reference_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, operator_user_id: '' }), /operator_user_id is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, captured_at: 'not-a-date' }), /captured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordPhoneIntake({ ...baseInput, call_direction: 'OUTBOUND_CALL' as never }), /call_direction is not supported/);
assert.throws(() => recordPhoneIntake({ ...baseInput, call_outcome: 'AUTO_APPROVED' as never }), /call_outcome is not supported/);
assert.throws(() => recordPhoneIntake({ ...baseInput, lead_fields: {} }), /lead_fields must contain at least one phone intake field/);
assert.throws(() => recordPhoneIntake({ ...baseInput, lead_fields: { ' ': 'value' } }), /lead_fields key is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, lead_fields: { phone: ' ' } }), /lead_fields.phone is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, call_evidence: { ' ': 'value' } }), /call_evidence key is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, call_evidence: { operator_note: ' ' } }), /call_evidence.operator_note is required/);
assert.throws(() => recordPhoneIntake({ ...baseInput, outbound_call_requested: true }), /must not perform outbound calls/);
assert.throws(() => recordPhoneIntake({ ...baseInput, provider_callback_processing_requested: true }), /does not process provider callbacks/);
assert.throws(() => recordPhoneIntake({ ...baseInput, credential_material_included: true }), /must not include credential material/);
assert.throws(() => recordPhoneIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }), /opt_out_observation is not supported/);

console.log('P6B-FFET-039 phone intake service test passed.');
