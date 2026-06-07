import assert from 'node:assert/strict';
import { recordMetaLeadFormsConnectorIntake } from './meta_lead_forms_connector.service';

const baseInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_meta_001',
  person_identity_graph_id: 'person_graph_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  api_key_scope_registry_id: 'api_scope_meta_lead_forms',
  visual_workflow_definition_id: 'workflow_meta_lead_form',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_meta_admissions_form',
  consent_basis_id: 'consent_basis_meta_form_submit',
  assignment_state_id: 'assignment_state_new',
  meta_form_id: 'meta_form_223',
  meta_lead_id: 'meta_lead_998',
  captured_at: '2026-06-07T12:45:00.000Z',
  field_values: {
    full_name: 'Student One',
    phone: '+920000000000',
    interested_product: 'Admissions',
  },
};

const receipt = recordMetaLeadFormsConnectorIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_meta_lead_forms_connector');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.meta_lead_forms_connector.intake_recorded');
assert.equal(receipt.source_system, 'META_LEAD_FORMS');
assert.equal(receipt.lead_record_id, 'lead_record_meta_001');
assert.equal(receipt.api_key_scope_registry_id, 'api_scope_meta_lead_forms');
assert.equal(receipt.normalized_field_count, 3);
assert.deepEqual(receipt.normalized_fields, {
  full_name: 'Student One',
  phone: '+920000000000',
  interested_product: 'Admissions',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordMetaLeadFormsConnectorIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, service_manifest_contract_id: '' }),
  /service_manifest_contract_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, access_gatekeeper_decision_id: '' }),
  /access_gatekeeper_decision_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, api_key_scope_registry_id: '' }),
  /api_key_scope_registry_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, visual_workflow_definition_id: '' }),
  /visual_workflow_definition_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, product_record_authority_id: '' }),
  /product_record_authority_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, meta_form_id: '' }),
  /meta_form_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, meta_lead_id: '' }),
  /meta_lead_id is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, captured_at: 'not-a-date' }),
  /captured_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, field_values: {} }),
  /field_values must contain at least one mapped Meta lead form field/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, field_values: { ' ': 'value' } }),
  /field_values key is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, field_values: { full_name: ' ' } }),
  /field_values.full_name is required/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, credential_material_included: true }),
  /must reference API-key scope registry entries/,
);
assert.throws(
  () => recordMetaLeadFormsConnectorIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-023 meta lead forms connector service test passed.');
