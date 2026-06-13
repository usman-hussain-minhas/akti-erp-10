import assert from 'node:assert/strict';
import { recordGoogleBusinessConnectorIntake } from './google_business_connector.service';

const baseInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_google_business_001',
  person_identity_graph_id: 'person_graph_google_business_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  api_key_scope_registry_id: 'api_scope_google_business',
  visual_workflow_definition_id: 'workflow_google_business',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_google_business_to_lead',
  consent_basis_id: 'consent_basis_google_business_inquiry',
  assignment_state_id: 'assignment_state_new',
  google_business_profile_id: 'gbp_profile_001',
  google_business_location_id: 'gbp_location_001',
  google_business_inquiry_id: 'gbp_inquiry_998',
  source_interaction_ref: 'gbp_message_thread_001',
  captured_at: '2026-06-07T14:45:00.000Z',
  field_values: {
    inquiry_text: 'Do you offer admissions counseling?',
    contact_name: 'Parent One',
  },
};

const receipt = recordGoogleBusinessConnectorIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_google_business_connector');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.google_business_connector.intake_recorded');
assert.equal(receipt.source_system, 'GOOGLE_BUSINESS');
assert.equal(receipt.lead_record_id, 'lead_record_google_business_001');
assert.equal(receipt.api_key_scope_registry_id, 'api_scope_google_business');
assert.equal(receipt.normalized_field_count, 2);
assert.deepEqual(receipt.normalized_fields, {
  inquiry_text: 'Do you offer admissions counseling?',
  contact_name: 'Parent One',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordGoogleBusinessConnectorIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, api_key_scope_registry_id: '' }),
  /api_key_scope_registry_id is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, google_business_profile_id: '' }),
  /google_business_profile_id is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, google_business_location_id: '' }),
  /google_business_location_id is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, google_business_inquiry_id: '' }),
  /google_business_inquiry_id is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, source_interaction_ref: '' }),
  /source_interaction_ref is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, captured_at: 'not-a-date' }),
  /captured_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, field_values: {} }),
  /field_values must contain at least one mapped Google Business inquiry field/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, field_values: { ' ': 'value' } }),
  /field_values key is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, field_values: { inquiry_text: ' ' } }),
  /field_values.inquiry_text is required/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, credential_material_included: true }),
  /must reference API-key scope registry entries/,
);
assert.throws(
  () => recordGoogleBusinessConnectorIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-027 google business connector service test passed.');
