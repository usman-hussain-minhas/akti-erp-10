import assert from 'node:assert/strict';
import { recordGoogleAdsConnectorIntake } from './google_ads_connector.service';

const baseInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_google_ads_001',
  person_identity_graph_id: 'person_graph_google_ads_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  api_key_scope_registry_id: 'api_scope_google_ads',
  visual_workflow_definition_id: 'workflow_google_ads',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_google_ads_to_lead',
  consent_basis_id: 'consent_basis_google_ads_form_submit',
  assignment_state_id: 'assignment_state_new',
  google_ads_customer_id: 'google_customer_001',
  google_ads_campaign_id: 'google_campaign_admissions',
  google_ads_lead_form_id: 'google_form_223',
  google_ads_lead_id: 'google_lead_998',
  captured_at: '2026-06-07T14:25:00.000Z',
  field_values: {
    full_name: 'Student Three',
    email: 'student3@example.test',
    program_interest: 'Admissions',
  },
};

const receipt = recordGoogleAdsConnectorIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_google_ads_connector');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.google_ads_connector.intake_recorded');
assert.equal(receipt.source_system, 'GOOGLE_ADS');
assert.equal(receipt.lead_record_id, 'lead_record_google_ads_001');
assert.equal(receipt.api_key_scope_registry_id, 'api_scope_google_ads');
assert.equal(receipt.normalized_field_count, 3);
assert.deepEqual(receipt.normalized_fields, {
  full_name: 'Student Three',
  email: 'student3@example.test',
  program_interest: 'Admissions',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordGoogleAdsConnectorIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, api_key_scope_registry_id: '' }),
  /api_key_scope_registry_id is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, google_ads_customer_id: '' }),
  /google_ads_customer_id is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, google_ads_campaign_id: '' }),
  /google_ads_campaign_id is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, google_ads_lead_form_id: '' }),
  /google_ads_lead_form_id is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, google_ads_lead_id: '' }),
  /google_ads_lead_id is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, captured_at: 'not-a-date' }),
  /captured_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, field_values: {} }),
  /field_values must contain at least one mapped Google Ads lead field/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, field_values: { ' ': 'value' } }),
  /field_values key is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, field_values: { full_name: ' ' } }),
  /field_values.full_name is required/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, credential_material_included: true }),
  /must reference API-key scope registry entries/,
);
assert.throws(
  () => recordGoogleAdsConnectorIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-026 google ads connector service test passed.');
