import assert from 'node:assert/strict';
import { recordWebFormIntakeConnector } from './web_form_intake_connector.service';

const baseInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_web_form_001',
  person_identity_graph_id: 'person_graph_web_form_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  visual_workflow_definition_id: 'workflow_web_form_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_web_form_to_lead',
  consent_basis_id: 'consent_basis_web_form_submit',
  assignment_state_id: 'assignment_state_new',
  web_form_id: 'web_form_admissions_001',
  web_form_submission_id: 'web_submission_998',
  form_origin_ref: 'public-admissions-form',
  submitted_at: '2026-06-07T15:20:00.000Z',
  field_values: {
    full_name: 'Student Five',
    email: 'student5@example.test',
    program_interest: 'Admissions',
  },
};

const receipt = recordWebFormIntakeConnector(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_web_form_intake_connector');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.web_form_intake_connector.intake_recorded');
assert.equal(receipt.source_system, 'WEB_FORM_INTAKE');
assert.equal(receipt.lead_record_id, 'lead_record_web_form_001');
assert.equal(receipt.normalized_field_count, 3);
assert.deepEqual(receipt.normalized_fields, {
  full_name: 'Student Five',
  email: 'student5@example.test',
  program_interest: 'Admissions',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordWebFormIntakeConnector({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, access_gatekeeper_decision_id: '' }),
  /access_gatekeeper_decision_id is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, visual_workflow_definition_id: '' }),
  /visual_workflow_definition_id is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, web_form_id: '' }),
  /web_form_id is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, web_form_submission_id: '' }),
  /web_form_submission_id is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, submitted_at: 'not-a-date' }),
  /submitted_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, field_values: {} }),
  /field_values must contain at least one mapped web form intake field/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, field_values: { ' ': 'value' } }),
  /field_values key is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, field_values: { full_name: ' ' } }),
  /field_values.full_name is required/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, credential_material_included: true }),
  /must not include credential material/,
);
assert.throws(
  () => recordWebFormIntakeConnector({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-029 web form intake connector service test passed.');
