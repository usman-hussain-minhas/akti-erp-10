import assert from 'node:assert/strict';
import { recordTikTokLeadGenConnectorIntake } from './tiktok_lead_gen_connector.service';

const baseInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_tiktok_001',
  person_identity_graph_id: 'person_graph_tiktok_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  api_key_scope_registry_id: 'api_scope_tiktok_lead_gen',
  visual_workflow_definition_id: 'workflow_tiktok_lead_gen',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_tiktok_to_lead',
  consent_basis_id: 'consent_basis_tiktok_form_submit',
  assignment_state_id: 'assignment_state_new',
  tiktok_advertiser_id: 'tt_adv_001',
  tiktok_form_id: 'tt_form_223',
  tiktok_lead_id: 'tt_lead_998',
  campaign_ref: 'tt_campaign_admissions',
  captured_at: '2026-06-07T14:10:00.000Z',
  field_values: {
    full_name: 'Student Two',
    phone: '+921111111111',
    program_interest: 'Admissions',
  },
};

const receipt = recordTikTokLeadGenConnectorIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_tiktok_lead_gen_connector');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.tiktok_lead_gen_connector.intake_recorded');
assert.equal(receipt.source_system, 'TIKTOK_LEAD_GEN');
assert.equal(receipt.lead_record_id, 'lead_record_tiktok_001');
assert.equal(receipt.api_key_scope_registry_id, 'api_scope_tiktok_lead_gen');
assert.equal(receipt.normalized_field_count, 3);
assert.deepEqual(receipt.normalized_fields, {
  full_name: 'Student Two',
  phone: '+921111111111',
  program_interest: 'Admissions',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordTikTokLeadGenConnectorIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, api_key_scope_registry_id: '' }),
  /api_key_scope_registry_id is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, tiktok_advertiser_id: '' }),
  /tiktok_advertiser_id is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, tiktok_form_id: '' }),
  /tiktok_form_id is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, tiktok_lead_id: '' }),
  /tiktok_lead_id is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, campaign_ref: '' }),
  /campaign_ref is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, captured_at: 'not-a-date' }),
  /captured_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, field_values: {} }),
  /field_values must contain at least one mapped TikTok lead field/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, field_values: { ' ': 'value' } }),
  /field_values key is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, field_values: { full_name: ' ' } }),
  /field_values.full_name is required/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, credential_material_included: true }),
  /must reference API-key scope registry entries/,
);
assert.throws(
  () => recordTikTokLeadGenConnectorIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-025 tiktok lead gen connector service test passed.');
