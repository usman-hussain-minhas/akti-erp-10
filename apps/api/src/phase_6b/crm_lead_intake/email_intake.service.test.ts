import assert from 'node:assert/strict';
import { recordEmailIntake, type EmailIntakeInput } from './email_intake.service';

const baseInput: EmailIntakeInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_email_001',
  person_identity_graph_id: 'person_graph_email_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_email_001',
  visual_workflow_definition_id: 'workflow_email_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_email_to_lead',
  consent_basis_id: 'consent_basis_email_capture',
  assignment_state_id: 'assignment_state_new',
  inbound_mailbox_id: 'mailbox_admissions_001',
  email_message_ref: 'email_message_001',
  email_thread_ref: 'email_thread_001',
  sender_email_ref: 'sender_hash_001',
  subject_ref: 'subject_ref_001',
  message_type: 'INBOUND_EMAIL',
  received_at: '2026-06-08T13:05:00.000Z',
  lead_fields: {
    full_name: 'Email Student Six',
    email: 'student-six@example.test',
    program_interest: 'Admissions',
  },
  email_evidence: {
    attachment_count: '1',
    parser_rule_id: 'parser_rule_admissions_email',
  },
};

const receipt = recordEmailIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_email_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.email_intake.recorded');
assert.equal(receipt.source_system, 'EMAIL_INTAKE');
assert.equal(receipt.inbound_mailbox_id, 'mailbox_admissions_001');
assert.equal(receipt.email_message_ref, 'email_message_001');
assert.equal(receipt.email_thread_ref, 'email_thread_001');
assert.equal(receipt.sender_email_ref, 'sender_hash_001');
assert.equal(receipt.subject_ref, 'subject_ref_001');
assert.equal(receipt.message_type, 'INBOUND_EMAIL');
assert.equal(receipt.normalized_lead_field_count, 3);
assert.deepEqual(receipt.normalized_lead_fields, {
  full_name: 'Email Student Six',
  email: 'student-six@example.test',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_email_evidence, {
  attachment_count: '1',
  parser_rule_id: 'parser_rule_admissions_email',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordEmailIntake({ ...baseInput, opt_out_observation: 'OBSERVED_OPTED_OUT' });
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const parsedNoEvidence = recordEmailIntake({
  ...baseInput,
  email_message_ref: 'email_message_002',
  message_type: 'PARSED_FORM_EMAIL',
  email_evidence: undefined,
});
assert.equal(parsedNoEvidence.message_type, 'PARSED_FORM_EMAIL');
assert.deepEqual(parsedNoEvidence.normalized_email_evidence, {});

assert.throws(() => recordEmailIntake({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, person_identity_graph_id: '' }), /person_identity_graph_id is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, access_gatekeeper_decision_id: '' }), /access_gatekeeper_decision_id is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, visual_workflow_definition_id: '' }), /visual_workflow_definition_id is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, inbound_mailbox_id: '' }), /inbound_mailbox_id is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, email_message_ref: '' }), /email_message_ref is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, email_thread_ref: '' }), /email_thread_ref is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, sender_email_ref: '' }), /sender_email_ref is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, subject_ref: '' }), /subject_ref is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, received_at: 'not-a-date' }), /received_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordEmailIntake({ ...baseInput, message_type: 'OUTBOUND_EMAIL' as never }), /message_type is not supported/);
assert.throws(() => recordEmailIntake({ ...baseInput, lead_fields: {} }), /lead_fields must contain at least one email intake field/);
assert.throws(() => recordEmailIntake({ ...baseInput, lead_fields: { ' ': 'value' } }), /lead_fields key is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, lead_fields: { email: ' ' } }), /lead_fields.email is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, email_evidence: { ' ': 'value' } }), /email_evidence key is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, email_evidence: { parser_rule_id: ' ' } }), /email_evidence.parser_rule_id is required/);
assert.throws(() => recordEmailIntake({ ...baseInput, outbound_send_requested: true }), /must not perform outbound sends/);
assert.throws(() => recordEmailIntake({ ...baseInput, provider_callback_processing_requested: true }), /does not process provider callbacks/);
assert.throws(() => recordEmailIntake({ ...baseInput, credential_material_included: true }), /must not include credential material/);
assert.throws(() => recordEmailIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }), /opt_out_observation is not supported/);

console.log('P6B-FFET-038 email intake service test passed.');
