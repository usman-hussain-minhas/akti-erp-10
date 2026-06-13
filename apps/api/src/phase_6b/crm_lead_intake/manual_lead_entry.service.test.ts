import assert from 'node:assert/strict';
import { recordManualLeadEntry } from './manual_lead_entry.service';

const baseInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_manual_001',
  person_identity_graph_id: 'person_graph_manual_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  visual_workflow_definition_id: 'workflow_manual_lead_entry',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_manual_to_lead',
  consent_basis_id: 'consent_basis_manual_entry',
  assignment_state_id: 'assignment_state_new',
  entered_by_user_id: 'user_admissions_operator',
  manual_entry_reason: 'walk-in inquiry captured at front desk',
  entered_at: '2026-06-07T15:45:00.000Z',
  field_values: {
    full_name: 'Student Six',
    phone: '+923333333333',
    program_interest: 'Admissions',
  },
};

const receipt = recordManualLeadEntry(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_manual_lead_entry');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.manual_lead_entry.recorded');
assert.equal(receipt.source_system, 'MANUAL_LEAD_ENTRY');
assert.equal(receipt.lead_record_id, 'lead_record_manual_001');
assert.equal(receipt.entered_by_user_id, 'user_admissions_operator');
assert.equal(receipt.normalized_field_count, 3);
assert.deepEqual(receipt.normalized_fields, {
  full_name: 'Student Six',
  phone: '+923333333333',
  program_interest: 'Admissions',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordManualLeadEntry({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

assert.throws(
  () => recordManualLeadEntry({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, access_gatekeeper_decision_id: '' }),
  /access_gatekeeper_decision_id is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, visual_workflow_definition_id: '' }),
  /visual_workflow_definition_id is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, entered_by_user_id: '' }),
  /entered_by_user_id is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, manual_entry_reason: '' }),
  /manual_entry_reason is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, entered_at: 'not-a-date' }),
  /entered_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, field_values: {} }),
  /field_values must contain at least one manual lead field/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, field_values: { ' ': 'value' } }),
  /field_values key is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, field_values: { full_name: ' ' } }),
  /field_values.full_name is required/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, credential_material_included: true }),
  /must not include credential material/,
);
assert.throws(
  () => recordManualLeadEntry({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-030 manual lead entry service test passed.');
