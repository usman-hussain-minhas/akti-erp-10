import assert from 'node:assert/strict';

import { evaluateApplicantSourceLinkageRuntime, type ApplicantSourceLinkageRuntimeInput } from './applicant_source_linkage.service';

const directInput: ApplicantSourceLinkageRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_applicant_source_linkage',
  source_record_ref: 'applicant_source_linkage_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  applicant_ref: 'applicant_001',
  applicant_person_anchor_ref: 'person_anchor_applicant_001',
  source_type: 'DIRECT_HR_FORM',
  direct_hr_form_ref: 'hr_form_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const directReceipt = evaluateApplicantSourceLinkageRuntime(directInput);
assert.equal(directReceipt.seed_id, 'seed_6c_011_applicant_source_linkage');
assert.equal(directReceipt.component_id, '6C.02');
assert.equal(directReceipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(directReceipt.model_name, 'Phase6CApplicantSourceLinkage');
assert.equal(directReceipt.runtime_status, 'DIRECT_SOURCE_LINKED');
assert.equal(directReceipt.capability_implementation_allowed, true);
assert.equal(directReceipt.business_behavior_allowed, true);
assert.equal(directReceipt.crm_dependency_condition, 'not_applicable');
assert.equal(directReceipt.crm_mutation_allowed, false);
assert.equal(directReceipt.employee_creation_allowed, false);
assert.equal(directReceipt.runtime_adapter_allowed, false);
assert.deepEqual(directReceipt.decision_refs, ['6C-RECRUIT-001', '6C-RECRUIT-002', '6C-SCHEMA-006', '6C-NON-007']);
assert.match(directReceipt.linkage_evidence_ref, /^applicant_source_linkage_[a-f0-9]{24}$/);
assert.match(directReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const crmReceipt = evaluateApplicantSourceLinkageRuntime({
  ...directInput,
  source_type: 'CRM_LEAD',
  direct_hr_form_ref: undefined,
  crm_lead_ref: 'crm_lead_001',
  crm_pipeline_ref: 'crm_pipeline_recruiting',
});
assert.equal(crmReceipt.runtime_status, 'CRM_SOURCE_LINKED');
assert.equal(crmReceipt.crm_dependency_condition, 'lead_sourced_applicant_active');
assert.equal(crmReceipt.crm_lead_ref, 'crm_lead_001');

const repeatedReceipt = evaluateApplicantSourceLinkageRuntime(directInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, directReceipt.runtime_evidence_digest);

assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, source_type: 'UNKNOWN' as never }), /source_type must be DIRECT_HR_FORM or CRM_LEAD/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, direct_hr_form_ref: undefined }), /direct_hr_form_ref is required/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, crm_lead_ref: 'crm_lead_001' }), /DIRECT_HR_FORM applicant source must not carry CRM references/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, source_type: 'CRM_LEAD', direct_hr_form_ref: undefined, crm_lead_ref: undefined, crm_pipeline_ref: 'crm_pipeline_recruiting' }), /crm_lead_ref is required/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, source_type: 'CRM_LEAD', crm_lead_ref: 'crm_lead_001', crm_pipeline_ref: 'crm_pipeline_recruiting' }), /CRM_LEAD applicant source must not carry direct HR form references/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, crm_lead_creation_requested: true }), /must not create CRM leads/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, crm_lead_mutation_requested: true }), /must not mutate CRM leads/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, employee_creation_requested: true }), /must not create employees/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B records/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateApplicantSourceLinkageRuntime({ ...directInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime applicant_source_linkage test passed.');
