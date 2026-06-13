import assert from 'node:assert/strict';
import { recordUnifiedLeadRecordAuthority } from './unified_lead_record_authority.service';

const baseInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_001',
  person_identity_graph_id: 'person_graph_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  api_key_scope_registry_id: 'api_scope_crm_lead_intake_001',
  visual_workflow_definition_id: 'workflow_lead_intake_001',
  product_record_authority_id: 'product_authority_001',
  lead_source_id: 'source_open_day_form',
  lead_source_record_id: 'source_record_445',
  intake_mapping_id: 'mapping_open_day_to_lead',
  consent_basis_id: 'consent_basis_admissions_followup',
  assignment_state_id: 'assignment_state_new',
};

const receipt = recordUnifiedLeadRecordAuthority(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_unified_lead_record_authority');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.unified_lead_record_authority.recorded');
assert.equal(receipt.canonical_authority, 'LEAD_RECORD');
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.deepEqual(receipt.dependency_basis, [
  'activation_lifecycle_required',
  'person_identity_graph_required',
  'access_core_gatekeeper_required',
  'api_key_scope_registry_required',
  'visual_workflow_builder_required',
  'product_record_authority_required',
]);

const optedOutObservation = recordUnifiedLeadRecordAuthority({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOutObservation.opt_out_observation, 'OBSERVED_OPTED_OUT');
assert.equal(optedOutObservation.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, service_manifest_contract_id: '' }),
  /service_manifest_contract_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, access_gatekeeper_decision_id: '' }),
  /access_gatekeeper_decision_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, api_key_scope_registry_id: '' }),
  /api_key_scope_registry_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, visual_workflow_definition_id: '' }),
  /visual_workflow_definition_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, product_record_authority_id: '' }),
  /product_record_authority_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, lead_source_id: '' }),
  /lead_source_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, lead_source_record_id: '' }),
  /lead_source_record_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, intake_mapping_id: '' }),
  /intake_mapping_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, consent_basis_id: '' }),
  /consent_basis_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, assignment_state_id: '' }),
  /assignment_state_id is required/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, duplicate_parallel_lead_requested: true }),
  /canonical LeadRecord/,
);
assert.throws(
  () => recordUnifiedLeadRecordAuthority({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-022 unified lead record authority service test passed.');
