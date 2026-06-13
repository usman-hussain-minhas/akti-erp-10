import assert from 'node:assert/strict';
import { recordInboundSmsIntake, type InboundSmsIntakeInput } from './inbound_sms_intake.service';

const baseInput: InboundSmsIntakeInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_sms_001',
  person_identity_graph_id: 'person_graph_sms_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_sms_001',
  visual_workflow_definition_id: 'workflow_inbound_sms_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_sms_to_lead',
  consent_basis_id: 'consent_basis_inbound_sms',
  assignment_state_id: 'assignment_state_new',
  inbound_channel_id: 'sms_channel_admissions_001',
  sms_sender_ref: 'sms_sender_hash_001',
  sms_thread_ref: 'sms_thread_001',
  inbound_message_ref: 'sms_message_inbound_001',
  message_type: 'TEXT',
  received_at: '2026-06-08T11:10:00.000Z',
  lead_fields: {
    full_name: 'SMS Student Six',
    phone: '+923337777777',
    program_interest: 'Admissions',
  },
  source_metadata: {
    inbound_keyword: 'apply',
    short_code_ref: 'short_code_001',
  },
};

const receipt = recordInboundSmsIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_inbound_sms_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.inbound_sms_intake.recorded');
assert.equal(receipt.source_system, 'INBOUND_SMS_INTAKE');
assert.equal(receipt.lead_record_id, 'lead_record_sms_001');
assert.equal(receipt.inbound_channel_id, 'sms_channel_admissions_001');
assert.equal(receipt.sms_sender_ref, 'sms_sender_hash_001');
assert.equal(receipt.sms_thread_ref, 'sms_thread_001');
assert.equal(receipt.inbound_message_ref, 'sms_message_inbound_001');
assert.equal(receipt.message_type, 'TEXT');
assert.equal(receipt.normalized_lead_field_count, 3);
assert.deepEqual(receipt.normalized_lead_fields, {
  full_name: 'SMS Student Six',
  phone: '+923337777777',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_source_metadata, {
  inbound_keyword: 'apply',
  short_code_ref: 'short_code_001',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordInboundSmsIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const mmsReceipt = recordInboundSmsIntake({
  ...baseInput,
  inbound_message_ref: 'sms_message_inbound_002',
  message_type: 'MMS',
  source_metadata: undefined,
});
assert.equal(mmsReceipt.message_type, 'MMS');
assert.deepEqual(mmsReceipt.normalized_source_metadata, {});

assert.throws(() => recordInboundSmsIntake({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, person_identity_graph_id: '' }), /person_identity_graph_id is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, access_gatekeeper_decision_id: '' }), /access_gatekeeper_decision_id is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, visual_workflow_definition_id: '' }), /visual_workflow_definition_id is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, inbound_channel_id: '' }), /inbound_channel_id is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, sms_sender_ref: '' }), /sms_sender_ref is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, sms_thread_ref: '' }), /sms_thread_ref is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, inbound_message_ref: '' }), /inbound_message_ref is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, received_at: 'not-a-date' }), /received_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, message_type: 'INTERACTIVE' as never }), /message_type is not supported/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, lead_fields: {} }), /lead_fields must contain at least one inbound SMS intake field/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, lead_fields: { ' ': 'value' } }), /lead_fields key is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, lead_fields: { full_name: ' ' } }), /lead_fields.full_name is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, source_metadata: { ' ': 'value' } }), /source_metadata key is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, source_metadata: { inbound_keyword: ' ' } }), /source_metadata.inbound_keyword is required/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, outbound_send_requested: true }), /must not perform outbound sends/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, provider_callback_processing_requested: true }), /does not process provider callbacks/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, credential_material_included: true }), /must not include credential material/);
assert.throws(() => recordInboundSmsIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }), /opt_out_observation is not supported/);

console.log('P6B-FFET-035 inbound SMS intake service test passed.');
