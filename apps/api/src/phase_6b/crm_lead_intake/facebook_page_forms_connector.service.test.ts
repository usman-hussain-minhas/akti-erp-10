import assert from 'node:assert/strict';
import { recordFacebookPageFormsConnectorIntake } from './facebook_page_forms_connector.service';

const baseInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_facebook_page_001',
  person_identity_graph_id: 'person_graph_facebook_page_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  api_key_scope_registry_id: 'api_scope_facebook_page_forms',
  visual_workflow_definition_id: 'workflow_facebook_page_forms',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_facebook_page_forms_to_lead',
  consent_basis_id: 'consent_basis_facebook_page_form_submit',
  assignment_state_id: 'assignment_state_new',
  facebook_page_id: 'fb_page_001',
  facebook_form_id: 'fb_form_223',
  facebook_lead_id: 'fb_lead_998',
  captured_at: '2026-06-07T15:00:00.000Z',
  field_values: {
    full_name: 'Student Four',
    phone: '+922222222222',
    program_interest: 'Admissions',
  },
};

const receipt = recordFacebookPageFormsConnectorIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_facebook_page_forms_connector');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.facebook_page_forms_connector.intake_recorded');
assert.equal(receipt.source_system, 'FACEBOOK_PAGE_FORMS');
assert.equal(receipt.lead_record_id, 'lead_record_facebook_page_001');
assert.equal(receipt.api_key_scope_registry_id, 'api_scope_facebook_page_forms');
assert.equal(receipt.normalized_field_count, 3);
assert.deepEqual(receipt.normalized_fields, {
  full_name: 'Student Four',
  phone: '+922222222222',
  program_interest: 'Admissions',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordFacebookPageFormsConnectorIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, api_key_scope_registry_id: '' }),
  /api_key_scope_registry_id is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, facebook_page_id: '' }),
  /facebook_page_id is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, facebook_form_id: '' }),
  /facebook_form_id is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, facebook_lead_id: '' }),
  /facebook_lead_id is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, captured_at: 'not-a-date' }),
  /captured_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, field_values: {} }),
  /field_values must contain at least one mapped Facebook page form field/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, field_values: { ' ': 'value' } }),
  /field_values key is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, field_values: { full_name: ' ' } }),
  /field_values.full_name is required/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, credential_material_included: true }),
  /must reference API-key scope registry entries/,
);
assert.throws(
  () => recordFacebookPageFormsConnectorIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-028 facebook page forms connector service test passed.');
