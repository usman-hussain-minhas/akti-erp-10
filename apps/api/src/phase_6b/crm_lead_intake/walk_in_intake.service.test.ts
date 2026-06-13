import assert from 'node:assert/strict';
import { recordWalkInIntake, type WalkInIntakeInput } from './walk_in_intake.service';

const baseInput: WalkInIntakeInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_walk_in_001',
  person_identity_graph_id: 'person_graph_walk_in_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_walk_in_001',
  visual_workflow_definition_id: 'workflow_walk_in_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_walk_in_to_lead',
  consent_basis_id: 'consent_basis_walk_in_capture',
  assignment_state_id: 'assignment_state_new',
  walk_in_location_ref: 'front_desk_primary_location',
  visit_reference_id: 'visit_reference_001',
  captured_by_user_id: 'user_front_desk_001',
  visit_type: 'ADMISSIONS_DESK',
  visit_outcome: 'COUNSELLOR_ASSIGNED',
  captured_at: '2026-06-08T14:20:00.000Z',
  lead_fields: {
    full_name: 'Walk In Student Six',
    phone: '+923331111111',
    program_interest: 'Admissions',
  },
  visit_evidence: {
    queue_token_ref: 'token_042',
    visitor_note: 'requested fee plan details',
  },
};

const receipt = recordWalkInIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_walk_in_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.walk_in_intake.recorded');
assert.equal(receipt.source_system, 'WALK_IN_INTAKE');
assert.equal(receipt.walk_in_location_ref, 'front_desk_primary_location');
assert.equal(receipt.visit_reference_id, 'visit_reference_001');
assert.equal(receipt.captured_by_user_id, 'user_front_desk_001');
assert.equal(receipt.visit_type, 'ADMISSIONS_DESK');
assert.equal(receipt.visit_outcome, 'COUNSELLOR_ASSIGNED');
assert.equal(receipt.normalized_lead_field_count, 3);
assert.deepEqual(receipt.normalized_lead_fields, {
  full_name: 'Walk In Student Six',
  phone: '+923331111111',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_visit_evidence, {
  queue_token_ref: 'token_042',
  visitor_note: 'requested fee plan details',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordWalkInIntake({ ...baseInput, opt_out_observation: 'OBSERVED_OPTED_OUT' });
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const eventNoEvidence = recordWalkInIntake({
  ...baseInput,
  visit_reference_id: 'visit_reference_002',
  visit_type: 'EVENT_DESK',
  visit_outcome: 'LEAD_CAPTURED',
  visit_evidence: undefined,
});
assert.equal(eventNoEvidence.visit_type, 'EVENT_DESK');
assert.equal(eventNoEvidence.visit_outcome, 'LEAD_CAPTURED');
assert.deepEqual(eventNoEvidence.normalized_visit_evidence, {});

assert.throws(() => recordWalkInIntake({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, person_identity_graph_id: '' }), /person_identity_graph_id is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, access_gatekeeper_decision_id: '' }), /access_gatekeeper_decision_id is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, visual_workflow_definition_id: '' }), /visual_workflow_definition_id is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, walk_in_location_ref: '' }), /walk_in_location_ref is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, visit_reference_id: '' }), /visit_reference_id is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, captured_by_user_id: '' }), /captured_by_user_id is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, captured_at: 'not-a-date' }), /captured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordWalkInIntake({ ...baseInput, visit_type: 'ONLINE' as never }), /visit_type is not supported/);
assert.throws(() => recordWalkInIntake({ ...baseInput, visit_outcome: 'AUTO_APPROVED' as never }), /visit_outcome is not supported/);
assert.throws(() => recordWalkInIntake({ ...baseInput, lead_fields: {} }), /lead_fields must contain at least one walk-in intake field/);
assert.throws(() => recordWalkInIntake({ ...baseInput, lead_fields: { ' ': 'value' } }), /lead_fields key is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, lead_fields: { phone: ' ' } }), /lead_fields.phone is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, visit_evidence: { ' ': 'value' } }), /visit_evidence key is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, visit_evidence: { visitor_note: ' ' } }), /visit_evidence.visitor_note is required/);
assert.throws(() => recordWalkInIntake({ ...baseInput, outbound_send_requested: true }), /must not perform outbound sends/);
assert.throws(() => recordWalkInIntake({ ...baseInput, provider_callback_processing_requested: true }), /does not process provider callbacks/);
assert.throws(() => recordWalkInIntake({ ...baseInput, credential_material_included: true }), /must not include credential material/);
assert.throws(() => recordWalkInIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }), /opt_out_observation is not supported/);

console.log('P6B-FFET-040 walk-in intake service test passed.');
