import assert from 'node:assert/strict';
import { recordInboundWhatsappIntake, type InboundWhatsappIntakeInput } from './inbound_whatsapp_intake.service';

const baseInput: InboundWhatsappIntakeInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_whatsapp_001',
  person_identity_graph_id: 'person_graph_whatsapp_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_whatsapp_001',
  visual_workflow_definition_id: 'workflow_inbound_whatsapp_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_whatsapp_to_lead',
  consent_basis_id: 'consent_basis_inbound_whatsapp',
  assignment_state_id: 'assignment_state_new',
  inbound_channel_id: 'whatsapp_channel_admissions_001',
  whatsapp_sender_ref: 'whatsapp_sender_hash_001',
  whatsapp_conversation_ref: 'whatsapp_conversation_001',
  inbound_message_ref: 'whatsapp_message_inbound_001',
  message_type: 'TEXT',
  received_at: '2026-06-08T10:20:00.000Z',
  lead_fields: {
    full_name: 'WhatsApp Student Six',
    phone: '+923336666666',
    program_interest: 'Admissions',
  },
  source_metadata: {
    inbound_keyword: 'admissions',
    language_hint: 'en',
  },
};

const receipt = recordInboundWhatsappIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_inbound_whatsapp_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.inbound_whatsapp_intake.recorded');
assert.equal(receipt.source_system, 'INBOUND_WHATSAPP_INTAKE');
assert.equal(receipt.lead_record_id, 'lead_record_whatsapp_001');
assert.equal(receipt.inbound_channel_id, 'whatsapp_channel_admissions_001');
assert.equal(receipt.whatsapp_sender_ref, 'whatsapp_sender_hash_001');
assert.equal(receipt.whatsapp_conversation_ref, 'whatsapp_conversation_001');
assert.equal(receipt.inbound_message_ref, 'whatsapp_message_inbound_001');
assert.equal(receipt.message_type, 'TEXT');
assert.equal(receipt.normalized_lead_field_count, 3);
assert.deepEqual(receipt.normalized_lead_fields, {
  full_name: 'WhatsApp Student Six',
  phone: '+923336666666',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_source_metadata, {
  inbound_keyword: 'admissions',
  language_hint: 'en',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordInboundWhatsappIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const mediaReceipt = recordInboundWhatsappIntake({
  ...baseInput,
  inbound_message_ref: 'whatsapp_message_inbound_002',
  message_type: 'MEDIA',
  source_metadata: undefined,
});
assert.equal(mediaReceipt.message_type, 'MEDIA');
assert.deepEqual(mediaReceipt.normalized_source_metadata, {});

assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, service_manifest_contract_id: '' }),
  /service_manifest_contract_id is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, access_gatekeeper_decision_id: '' }),
  /access_gatekeeper_decision_id is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, visual_workflow_definition_id: '' }),
  /visual_workflow_definition_id is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, inbound_channel_id: '' }),
  /inbound_channel_id is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, whatsapp_sender_ref: '' }),
  /whatsapp_sender_ref is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, whatsapp_conversation_ref: '' }),
  /whatsapp_conversation_ref is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, inbound_message_ref: '' }),
  /inbound_message_ref is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, received_at: 'not-a-date' }),
  /received_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, message_type: 'VOICE' as never }),
  /message_type is not supported/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, lead_fields: {} }),
  /lead_fields must contain at least one inbound WhatsApp intake field/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, lead_fields: { ' ': 'value' } }),
  /lead_fields key is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, lead_fields: { full_name: ' ' } }),
  /lead_fields.full_name is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, source_metadata: { ' ': 'value' } }),
  /source_metadata key is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, source_metadata: { inbound_keyword: ' ' } }),
  /source_metadata.inbound_keyword is required/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, outbound_send_requested: true }),
  /must not perform outbound sends/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, credential_material_included: true }),
  /must not include credential material/,
);
assert.throws(
  () => recordInboundWhatsappIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-034 inbound WhatsApp intake service test passed.');
