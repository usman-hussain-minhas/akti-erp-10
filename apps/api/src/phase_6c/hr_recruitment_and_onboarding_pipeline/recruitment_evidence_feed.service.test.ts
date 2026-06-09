import assert from 'node:assert/strict';

import { evaluateRecruitmentEvidenceFeedRuntime, type RecruitmentEvidenceFeedInput } from './recruitment_evidence_feed.service';

const baseInput: RecruitmentEvidenceFeedInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_recruitment_evidence_feed',
  source_record_ref: 'recruitment_pipeline:engineering_2026',
  feed_ref: 'recruitment_evidence_feed:engineering_2026',
  emitted_by_user_id: 'user_phase_6c_recruiter',
  emitted_at: '2026-06-09T09:00:00.000Z',
  events: [
    {
      evidence_ref: 'recruitment_evidence:application_created_001',
      evidence_type: 'APPLICATION_CREATED',
      subject_ref: 'applicant:001',
      source_seed_id: 'seed_6c_011_applicant_source_linkage',
      occurred_at: '2026-06-08T09:00:00.000Z',
      outcome_code: 'created',
    },
    {
      evidence_ref: 'recruitment_evidence:interview_completed_001',
      evidence_type: 'INTERVIEW_COMPLETED',
      subject_ref: 'applicant:001',
      source_seed_id: 'seed_6c_013_scorecard_interview_form',
      occurred_at: '2026-06-08T12:00:00.000Z',
      outcome_code: 'recommended',
      evidence_value: 'scorecard:recommended',
    },
    {
      evidence_ref: 'recruitment_evidence:offer_accepted_001',
      evidence_type: 'OFFER_ACCEPTED',
      subject_ref: 'applicant:002',
      source_seed_id: 'seed_6c_016_offer_acceptance_employee_creation_request',
      occurred_at: '2026-06-09T08:00:00.000Z',
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateRecruitmentEvidenceFeedRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_023_recruitment_evidence_feed');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CRecruitmentEvidenceFeed');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.recruitment_evidence_feed.emitted');
assert.equal(receipt.runtime_status, 'RECRUITMENT_EVIDENCE_FEED_READY');
assert.equal(receipt.event_feed_only, true);
assert.equal(receipt.performance_calculation_executed, false);
assert.equal(receipt.optimization_execution_allowed, false);
assert.equal(receipt.phase_6d_dependency_allowed, false);
assert.equal(receipt.direct_crm_mutation_allowed, false);
assert.equal(receipt.event_count, 3);
assert.equal(receipt.subject_count, 2);
assert.deepEqual(receipt.evidence_refs, [
  'recruitment_evidence:application_created_001',
  'recruitment_evidence:interview_completed_001',
  'recruitment_evidence:offer_accepted_001',
]);
assert.deepEqual(receipt.type_counts, [
  { evidence_type: 'APPLICATION_CREATED', count: 1 },
  { evidence_type: 'INTERVIEW_COMPLETED', count: 1 },
  { evidence_type: 'OFFER_ACCEPTED', count: 1 },
]);
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-015']);
assert.deepEqual(receipt.evidence_artifacts, [
  'recruitment_evidence_feed_runtime_receipt',
  'recruitment_evidence_feed_validation_result',
  'recruitment_evidence_feed_forbidden_behavior_rejection_evidence',
]);
assert.match(receipt.recruitment_evidence_feed_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateRecruitmentEvidenceFeedRuntime(baseInput);
assert.equal(repeatedReceipt.recruitment_evidence_feed_digest, receipt.recruitment_evidence_feed_digest);

assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, emitted_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, feed_ref: 'feed:wrong' }), /feed_ref must use recruitment_evidence_feed:/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, events: [] }), /at least one recruitment evidence event/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({
  ...baseInput,
  events: [baseInput.events[0]!, { ...baseInput.events[1]!, evidence_ref: baseInput.events[0]!.evidence_ref }],
}), /evidence_ref must be unique/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({
  ...baseInput,
  events: [{ ...baseInput.events[0]!, evidence_ref: 'evidence:wrong' }],
}), /evidence_ref must use recruitment_evidence:/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({
  ...baseInput,
  events: [{ ...baseInput.events[0]!, evidence_type: 'MODEL_TRAINED' as never }],
}), /unsupported evidence_type/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({
  ...baseInput,
  events: [{ ...baseInput.events[0]!, source_seed_id: 'seed_6d_lms_certificate' }],
}), /source_seed_id must reference a Phase 6C seed/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, performance_calculation_requested: true }), /not calculate performance/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, optimization_execution_requested: true }), /must not execute optimization/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, direct_6d_write_requested: true }), /must not write to or depend on Phase 6D/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, direct_crm_mutation_requested: true }), /must not mutate CRM records/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateRecruitmentEvidenceFeedRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime recruitment_evidence_feed test passed.');
