import assert from 'node:assert/strict';
import { recordMetaWhatsAppIntakeConnector } from './meta_whatsapp_intake_connector.service';

const baseInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_whatsapp_001',
  person_identity_graph_id: 'person_graph_whatsapp_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  api_key_scope_registry_id: 'api_scope_meta_whatsapp_intake',
  visual_workflow_definition_id: 'workflow_whatsapp_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_whatsapp_to_lead',
  consent_basis_id: 'consent_basis_inbound_whatsapp',
  assignment_state_id: 'assignment_state_new',
  whatsapp_business_account_id: 'waba_001',
  whatsapp_phone_number_id: 'wa_phone_001',
  inbound_message_id: 'wamid_001',
  sender_contact_ref: 'wa_contact_hash_001',
  received_at: '2026-06-07T13:00:00.000Z',
  inbound_payload_fields: {
    message_text: 'I am interested in admissions',
    sender_locale: 'en',
  },
};

const receipt = recordMetaWhatsAppIntakeConnector(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_meta_whatsapp_intake_connector');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.meta_whatsapp_intake_connector.intake_recorded');
assert.equal(receipt.source_system, 'META_WHATSAPP_INTAKE');
assert.equal(receipt.lead_record_id, 'lead_record_whatsapp_001');
assert.equal(receipt.api_key_scope_registry_id, 'api_scope_meta_whatsapp_intake');
assert.equal(receipt.normalized_payload_field_count, 2);
assert.deepEqual(receipt.normalized_payload_fields, {
  message_text: 'I am interested in admissions',
  sender_locale: 'en',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.outbound_message_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordMetaWhatsAppIntakeConnector({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, api_key_scope_registry_id: '' }),
  /api_key_scope_registry_id is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, whatsapp_business_account_id: '' }),
  /whatsapp_business_account_id is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, whatsapp_phone_number_id: '' }),
  /whatsapp_phone_number_id is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, inbound_message_id: '' }),
  /inbound_message_id is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, sender_contact_ref: '' }),
  /sender_contact_ref is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, received_at: 'not-a-date' }),
  /received_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, inbound_payload_fields: {} }),
  /inbound_payload_fields must contain at least one mapped WhatsApp intake field/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, inbound_payload_fields: { ' ': 'value' } }),
  /inbound_payload_fields key is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, inbound_payload_fields: { message_text: ' ' } }),
  /inbound_payload_fields.message_text is required/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, outbound_message_requested: true }),
  /must not send outbound WhatsApp messages/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, credential_material_included: true }),
  /must reference API-key scope registry entries/,
);
assert.throws(
  () => recordMetaWhatsAppIntakeConnector({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-024 meta whatsapp intake connector service test passed.');
