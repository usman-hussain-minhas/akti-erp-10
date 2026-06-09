import assert from 'node:assert/strict';

import { evaluateRecruitmentStageConfigRuntime, type RecruitmentStageConfigRuntimeInput } from './recruitment_stage_config.service';

const baseInput: RecruitmentStageConfigRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_recruitment_stage_config',
  source_record_ref: 'recruitment_stage_config_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  stages: [
    {
      stage_code: 'application',
      stage_label: 'Application Received',
      stage_order: 1,
      stage_kind: 'ENTRY',
      terminal_outcome: 'CONTINUE',
      allowed_next_stage_codes: ['technical_review'],
      active: true,
    },
    {
      stage_code: 'technical_review',
      stage_label: 'Technical Review',
      stage_order: 2,
      stage_kind: 'INTERMEDIATE',
      terminal_outcome: 'CONTINUE',
      allowed_next_stage_codes: ['hired', 'rejected'],
      active: true,
    },
    {
      stage_code: 'hired',
      stage_label: 'Selected',
      stage_order: 3,
      stage_kind: 'TERMINAL',
      terminal_outcome: 'HIRED',
      allowed_next_stage_codes: [],
      active: true,
    },
    {
      stage_code: 'rejected',
      stage_label: 'Not Selected',
      stage_order: 4,
      stage_kind: 'TERMINAL',
      terminal_outcome: 'REJECTED',
      allowed_next_stage_codes: [],
      active: true,
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateRecruitmentStageConfigRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_012_recruitment_stage_config');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CRecruitmentStageConfig');
assert.equal(receipt.runtime_status, 'RECRUITMENT_STAGE_CONFIG_VALIDATED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.fully_configurable_stages, true);
assert.equal(receipt.crm_stage_mutation_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-003', '6C-SCHEMA-006', '6C-NON-007']);
assert.deepEqual(receipt.stage_counts, {
  total_stages: 4,
  active_stages: 4,
  entry_stages: 1,
  terminal_stages: 2,
});
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateRecruitmentStageConfigRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: [{ ...baseInput.stages[0]!, stage_code: '' }] }), /stage_code is required/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: [{ ...baseInput.stages[0]!, stage_kind: 'UNKNOWN' as never }] }), /stage_kind must be ENTRY/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: [{ ...baseInput.stages[0]!, stage_order: 0 }] }), /stage_order must be a positive integer/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: [...baseInput.stages, { ...baseInput.stages[0]!, stage_code: 'application_duplicate', stage_order: 5 }] }), /stage_label must be unique/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: [{ ...baseInput.stages[0]!, allowed_next_stage_codes: ['unknown'] }, ...baseInput.stages.slice(1)] }), /allowed_next_stage_code must reference an existing stage/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: [{ ...baseInput.stages[0]!, allowed_next_stage_codes: ['application'] }, ...baseInput.stages.slice(1)] }), /must not transition to themselves/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: [{ ...baseInput.stages[0]!, allowed_next_stage_codes: [] }, ...baseInput.stages.slice(1)] }), /non-terminal recruitment stages require at least one next stage/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: [{ ...baseInput.stages[2]!, allowed_next_stage_codes: ['rejected'] }] }), /TERMINAL recruitment stages must not have next stages/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, stages: baseInput.stages.map((stage) => ({ ...stage, stage_kind: stage.stage_kind === 'ENTRY' ? 'INTERMEDIATE' : stage.stage_kind })) }), /requires exactly one ENTRY stage/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({
  ...baseInput,
  stages: [
    { ...baseInput.stages[0]!, allowed_next_stage_codes: ['technical_review'] },
    { ...baseInput.stages[1]!, allowed_next_stage_codes: ['application'] },
  ],
}), /requires at least one TERMINAL stage/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, hardcoded_stage_names_requested: true }), /must not force hardcoded stage names/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, crm_stage_mutation_requested: true }), /must not mutate CRM pipeline stages/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B records/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateRecruitmentStageConfigRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime recruitment_stage_config test passed.');
