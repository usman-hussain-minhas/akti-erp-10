import assert from 'node:assert/strict';
import { recordApiLeadIntake, type ApiLeadIntakeInput } from './api_lead_intake.service';

const baseInput: ApiLeadIntakeInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_api_001',
  person_identity_graph_id: 'person_graph_api_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_api_001',
  api_key_scope_registry_id: 'api_scope_crm_lead_intake_write',
  api_client_id: 'api_client_partner_portal',
  visual_workflow_definition_id: 'workflow_api_lead_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_api_to_lead',
  consent_basis_id: 'consent_basis_api_capture',
  assignment_state_id: 'assignment_state_new',
  api_request_id: 'api_request_20260608_001',
  api_endpoint_id: 'endpoint_public_lead_capture_v1',
  request_method: 'POST',
  external_source_reference: 'partner_portal_submission_001',
  received_at: '2026-06-08T08:15:00.000Z',
  payload_fields: {
    full_name: 'API Student Six',
    phone: '+923334444444',
    program_interest: 'Admissions',
  },
  source_metadata: {
    partner_source: 'partner_portal',
    campaign_code: 'summer_2026',
  },
};

const receipt = recordApiLeadIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_api_lead_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.api_lead_intake.recorded');
assert.equal(receipt.source_system, 'API_LEAD_INTAKE');
assert.equal(receipt.lead_record_id, 'lead_record_api_001');
assert.equal(receipt.api_key_scope_registry_id, 'api_scope_crm_lead_intake_write');
assert.equal(receipt.api_client_id, 'api_client_partner_portal');
assert.equal(receipt.request_method, 'POST');
assert.equal(receipt.external_source_reference, 'partner_portal_submission_001');
assert.equal(receipt.normalized_payload_field_count, 3);
assert.deepEqual(receipt.normalized_payload_fields, {
  full_name: 'API Student Six',
  phone: '+923334444444',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_source_metadata, {
  partner_source: 'partner_portal',
  campaign_code: 'summer_2026',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.api_key_scope_dependency_enforced, true);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordApiLeadIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const patchReceipt = recordApiLeadIntake({
  ...baseInput,
  api_request_id: 'api_request_20260608_002',
  request_method: 'PATCH',
  source_metadata: undefined,
});
assert.equal(patchReceipt.request_method, 'PATCH');
assert.deepEqual(patchReceipt.normalized_source_metadata, {});

assert.throws(
  () => recordApiLeadIntake({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, service_manifest_contract_id: '' }),
  /service_manifest_contract_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, access_gatekeeper_decision_id: '' }),
  /access_gatekeeper_decision_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, api_key_scope_registry_id: '' }),
  /api_key_scope_registry_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, api_client_id: '' }),
  /api_client_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, visual_workflow_definition_id: '' }),
  /visual_workflow_definition_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, api_request_id: '' }),
  /api_request_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, api_endpoint_id: '' }),
  /api_endpoint_id is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, external_source_reference: '' }),
  /external_source_reference is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, received_at: 'not-a-date' }),
  /received_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, request_method: 'GET' as never }),
  /request_method is not supported/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, payload_fields: {} }),
  /payload_fields must contain at least one API lead intake field/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, payload_fields: { ' ': 'value' } }),
  /payload_fields key is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, payload_fields: { full_name: ' ' } }),
  /payload_fields.full_name is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, source_metadata: { ' ': 'partner' } }),
  /source_metadata key is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, source_metadata: { partner_source: ' ' } }),
  /source_metadata.partner_source is required/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, credential_material_included: true }),
  /must not include credential material/,
);
assert.throws(
  () => recordApiLeadIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-032 api lead intake service test passed.');
