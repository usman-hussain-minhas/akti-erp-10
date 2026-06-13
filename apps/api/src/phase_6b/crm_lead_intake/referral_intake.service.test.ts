import assert from 'node:assert/strict';
import { recordReferralIntake, type ReferralIntakeInput } from './referral_intake.service';

const baseInput: ReferralIntakeInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_referral_001',
  person_identity_graph_id: 'person_graph_referral_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_referral_001',
  visual_workflow_definition_id: 'workflow_referral_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_referral_to_lead',
  consent_basis_id: 'consent_basis_referral_capture',
  assignment_state_id: 'assignment_state_new',
  referral_source_id: 'referral_source_alumni_network',
  referrer_person_identity_graph_id: 'person_graph_referrer_001',
  referrer_relationship: 'ALUMNI',
  referral_reference: 'referral_alumni_network_20260608_001',
  referred_at: '2026-06-08T09:30:00.000Z',
  lead_fields: {
    full_name: 'Referral Student Six',
    phone: '+923335555555',
    program_interest: 'Admissions',
  },
  referral_context: {
    referrer_note: 'Interested in evening classes',
    referral_campaign: 'alumni_summer_2026',
  },
};

const receipt = recordReferralIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_referral_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.referral_intake.recorded');
assert.equal(receipt.source_system, 'REFERRAL_INTAKE');
assert.equal(receipt.lead_record_id, 'lead_record_referral_001');
assert.equal(receipt.referral_source_id, 'referral_source_alumni_network');
assert.equal(receipt.referrer_person_identity_graph_id, 'person_graph_referrer_001');
assert.equal(receipt.referrer_relationship, 'ALUMNI');
assert.equal(receipt.referral_reference, 'referral_alumni_network_20260608_001');
assert.equal(receipt.normalized_lead_field_count, 3);
assert.deepEqual(receipt.normalized_lead_fields, {
  full_name: 'Referral Student Six',
  phone: '+923335555555',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_referral_context, {
  referrer_note: 'Interested in evening classes',
  referral_campaign: 'alumni_summer_2026',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordReferralIntake({
  ...baseInput,
  opt_out_observation: 'OBSERVED_OPTED_OUT',
});
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const noContext = recordReferralIntake({
  ...baseInput,
  referral_reference: 'referral_no_context_001',
  referral_context: undefined,
});
assert.deepEqual(noContext.normalized_referral_context, {});

assert.throws(
  () => recordReferralIntake({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, service_manifest_contract_id: '' }),
  /service_manifest_contract_id is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, lead_record_id: '' }),
  /lead_record_id is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, person_identity_graph_id: '' }),
  /person_identity_graph_id is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, access_gatekeeper_decision_id: '' }),
  /access_gatekeeper_decision_id is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, visual_workflow_definition_id: '' }),
  /visual_workflow_definition_id is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, referral_source_id: '' }),
  /referral_source_id is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, referrer_person_identity_graph_id: '' }),
  /referrer_person_identity_graph_id is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, referral_reference: '' }),
  /referral_reference is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, referred_at: 'not-a-date' }),
  /referred_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, referrer_relationship: 'VENDOR' as never }),
  /referrer_relationship is not supported/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, lead_fields: {} }),
  /lead_fields must contain at least one referral intake field/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, lead_fields: { ' ': 'value' } }),
  /lead_fields key is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, lead_fields: { full_name: ' ' } }),
  /lead_fields.full_name is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, referral_context: { ' ': 'value' } }),
  /referral_context key is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, referral_context: { referrer_note: ' ' } }),
  /referral_context.referrer_note is required/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, credential_material_included: true }),
  /must not include credential material/,
);
assert.throws(
  () => recordReferralIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }),
  /opt_out_observation is not supported/,
);

console.log('P6B-FFET-033 referral intake service test passed.');
