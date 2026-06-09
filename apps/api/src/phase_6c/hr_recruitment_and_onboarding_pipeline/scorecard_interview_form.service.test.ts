import assert from 'node:assert/strict';

import { evaluateScorecardInterviewFormRuntime, type ScorecardInterviewFormRuntimeInput } from './scorecard_interview_form.service';

const baseInput: ScorecardInterviewFormRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_scorecard_interview_form',
  source_record_ref: 'applicant_interview_form_001',
  configuration_engine_form_ref: 'configuration_engine:interview_scorecard:v1',
  form_code: 'engineering_interview_scorecard',
  form_label: 'Engineering interview scorecard',
  form_version: '2026.06.09',
  interview_stage_code: 'technical_review',
  candidate_source: 'CRM_LINKED',
  crm_lead_ref: 'crm_lead_123',
  configured_by_user_id: 'user_phase_6c_recruiter',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  sections: [
    {
      section_code: 'technical_depth',
      label: 'Technical depth',
      order: 2,
      weight: 2,
      questions: [
        {
          question_code: 'system_design',
          label: 'System design assessment',
          question_type: 'RATING',
          required: true,
          weight: 2,
          max_score: 5,
          competency_code: 'technical_architecture',
          evidence_required: true,
        },
        {
          question_code: 'language_experience',
          label: 'Language experience',
          question_type: 'MULTI_SELECT',
          required: false,
          weight: 1,
          max_score: 3,
          options: [
            { option_code: 'typescript', label: 'TypeScript', score_value: 1 },
            { option_code: 'postgres', label: 'PostgreSQL', score_value: 1 },
          ],
        },
      ],
    },
    {
      section_code: 'values_alignment',
      label: 'Values alignment',
      order: 1,
      weight: 1,
      questions: [
        {
          question_code: 'collaboration_example',
          label: 'Collaboration example',
          question_type: 'TEXT',
          required: true,
          weight: 1,
          max_score: 4,
          competency_code: 'collaboration',
        },
      ],
    },
  ],
  score_bands: [
    { band_code: 'reject', label: 'Reject', min_score: 0, max_score: 10, outcome: 'REJECT' },
    { band_code: 'hold', label: 'Hold', min_score: 11, max_score: 20, outcome: 'HOLD' },
    { band_code: 'advance', label: 'Advance', min_score: 21, max_score: 30, outcome: 'ADVANCE' },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateScorecardInterviewFormRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_013_scorecard_interview_form');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CScorecardInterviewForm');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.scorecard_interview_form.configuration_validated');
assert.equal(receipt.runtime_status, 'CONFIGURATION_ENGINE_SCORECARD_READY');
assert.equal(receipt.configuration_engine_required, true);
assert.equal(receipt.hardcoded_form_allowed, false);
assert.equal(receipt.crm_stage_mutation_allowed, false);
assert.equal(receipt.schema_mutation_allowed, false);
assert.equal(receipt.phase_6a_mutation_allowed, false);
assert.equal(receipt.phase_6b_mutation_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.candidate_source, 'CRM_LINKED');
assert.equal(receipt.crm_lead_ref, 'crm_lead_123');
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-004']);
assert.deepEqual(receipt.external_dependency_conditions, ['lead_sourced_applicant_active']);
assert.equal(receipt.section_count, 2);
assert.equal(receipt.question_count, 3);
assert.equal(receipt.scored_question_count, 3);
assert.equal(receipt.required_question_count, 2);
assert.equal(receipt.total_available_score, 30);
assert.equal(receipt.normalized_sections[0]?.section_code, 'values_alignment');
assert.equal(receipt.normalized_sections[1]?.section_code, 'technical_depth');
assert.equal(receipt.score_band_count, 3);
assert.match(receipt.scorecard_interview_form_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateScorecardInterviewFormRuntime(baseInput);
assert.equal(repeatedReceipt.scorecard_interview_form_evidence_digest, receipt.scorecard_interview_form_evidence_digest);

const directFormReceipt = evaluateScorecardInterviewFormRuntime({
  ...baseInput,
  candidate_source: 'DIRECT_FORM',
  crm_lead_ref: undefined,
});
assert.equal(directFormReceipt.candidate_source, 'DIRECT_FORM');
assert.equal(directFormReceipt.crm_lead_ref, undefined);

assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, configuration_engine_form_ref: 'local-form:v1' }), /must identify a Configuration Engine form/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, candidate_source: 'DIRECT_FORM', crm_lead_ref: 'crm_lead_123' }), /crm_lead_ref is only allowed/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, candidate_source: 'CRM_LINKED', crm_lead_ref: '' }), /crm_lead_ref is required/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, sections: [] }), /at least one configurable section/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({
  ...baseInput,
  sections: [
    baseInput.sections[0]!,
    { ...baseInput.sections[1]!, section_code: baseInput.sections[0]!.section_code },
  ],
}), /section_code must be unique/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({
  ...baseInput,
  sections: [{ ...baseInput.sections[0]!, questions: [] }],
}), /section requires at least one configurable question/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({
  ...baseInput,
  sections: [
    {
      ...baseInput.sections[0]!,
      questions: [
        baseInput.sections[0]!.questions[0]!,
        { ...baseInput.sections[0]!.questions[0]!, label: 'Duplicate question label' },
      ],
    },
  ],
}), /question_code must be unique/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({
  ...baseInput,
  sections: [
    {
      ...baseInput.sections[0]!,
      questions: [{ ...baseInput.sections[0]!.questions[0]!, question_type: 'VOICE' as never }],
    },
  ],
}), /question_type is not supported/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({
  ...baseInput,
  sections: [
    {
      ...baseInput.sections[0]!,
      questions: [{ ...baseInput.sections[0]!.questions[1]!, options: [{ option_code: 'typescript', label: 'TypeScript' }] }],
    },
  ],
}), /select question requires at least two configurable options/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({
  ...baseInput,
  sections: [
    {
      ...baseInput.sections[0]!,
      questions: [{ ...baseInput.sections[0]!.questions[0]!, max_score: undefined }],
    },
  ],
}), /at least one scored question is required/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, score_bands: [] }), /at least one score band/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({
  ...baseInput,
  score_bands: [
    { band_code: 'low', label: 'Low', min_score: 0, max_score: 20, outcome: 'REJECT' },
    { band_code: 'overlap', label: 'Overlap', min_score: 20, max_score: 30, outcome: 'ADVANCE' },
  ],
}), /score bands must not overlap/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, hardcoded_form_requested: true }), /not hardcoded form definitions/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, crm_stage_mutation_requested: true }), /must not mutate CRM stages/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateScorecardInterviewFormRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime scorecard_interview_form test passed.');
