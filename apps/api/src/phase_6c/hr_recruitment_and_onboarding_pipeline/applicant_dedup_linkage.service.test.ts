import assert from 'node:assert/strict';

import { evaluateApplicantDedupLinkageRuntime, type ApplicantDedupLinkageInput } from './applicant_dedup_linkage.service';

const baseInput: ApplicantDedupLinkageInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_applicant_dedup_linkage',
  source_record_ref: 'applicant_dedup_linkage_record_001',
  applicant_ref: 'applicant:app_001',
  dedup_pattern: {
    pattern_ref: 'crm_dedup_pattern:email_phone_identity',
    threshold_score: 80,
    signal_weights: [
      { signal_type: 'EMAIL_HASH', weight: 50 },
      { signal_type: 'PHONE_HASH', weight: 30 },
      { signal_type: 'PERSON_IDENTITY_REF', weight: 70 },
    ],
  },
  applicant_signals: [
    { signal_type: 'EMAIL_HASH', signal_value: 'EMAILHASH001' },
    { signal_type: 'PHONE_HASH', signal_value: 'PHONEHASH001' },
    { signal_type: 'PERSON_IDENTITY_REF', signal_value: 'person:001' },
  ],
  candidates: [
    {
      candidate_ref: 'crm_lead:lead_001',
      source: 'CRM_LEAD',
      active: true,
      signals: [
        { signal_type: 'EMAIL_HASH', signal_value: 'emailhash001' },
        { signal_type: 'PHONE_HASH', signal_value: 'phonehash001' },
      ],
    },
    {
      candidate_ref: 'applicant:app_old',
      source: 'APPLICANT',
      active: true,
      signals: [{ signal_type: 'EMAIL_HASH', signal_value: 'other' }],
    },
    {
      candidate_ref: 'crm_lead:inactive',
      source: 'CRM_LEAD',
      active: false,
      signals: [
        { signal_type: 'EMAIL_HASH', signal_value: 'emailhash001' },
        { signal_type: 'PHONE_HASH', signal_value: 'phonehash001' },
      ],
    },
  ],
  evaluated_by_user_id: 'user_phase_6c_recruiter',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateApplicantDedupLinkageRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_022_applicant_dedup_linkage');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CApplicantDedupLinkage');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.applicant_dedup_linkage.evaluated');
assert.equal(receipt.runtime_status, 'APPLICANT_DEDUP_LINKAGE_EVALUATED');
assert.equal(receipt.crm_patterns_reused, true);
assert.equal(receipt.retain_and_link_only, true);
assert.equal(receipt.destructive_merge_allowed, false);
assert.equal(receipt.direct_crm_mutation_allowed, false);
assert.equal(receipt.applicant_record_mutation_allowed, false);
assert.equal(receipt.person_identity_graph_mutation_allowed, false);
assert.equal(receipt.outcome, 'POTENTIAL_DUPLICATE_LINKS_FOUND');
assert.equal(receipt.candidate_count, 3);
assert.equal(receipt.active_candidate_count, 2);
assert.equal(receipt.match_count, 1);
assert.equal(receipt.matches[0]?.candidate_ref, 'crm_lead:lead_001');
assert.equal(receipt.matches[0]?.score, 80);
assert.deepEqual(receipt.matches[0]?.matched_signal_types, ['EMAIL_HASH', 'PHONE_HASH']);
assert.match(receipt.matches[0]?.recommended_linkage_ref ?? '', /^dedup_linkage:[a-f0-9]{24}$/);
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-014', '6C-RECRUIT-002']);
assert.deepEqual(receipt.evidence_artifacts, [
  'applicant_dedup_linkage_runtime_receipt',
  'applicant_dedup_linkage_validation_result',
  'applicant_dedup_linkage_forbidden_behavior_rejection_evidence',
]);
assert.match(receipt.applicant_dedup_linkage_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateApplicantDedupLinkageRuntime(baseInput);
assert.equal(repeatedReceipt.applicant_dedup_linkage_evidence_digest, receipt.applicant_dedup_linkage_evidence_digest);

const noMatchReceipt = evaluateApplicantDedupLinkageRuntime({
  ...baseInput,
  dedup_pattern: { ...baseInput.dedup_pattern, threshold_score: 90 },
});
assert.equal(noMatchReceipt.outcome, 'NO_DUPLICATE_MATCH');
assert.equal(noMatchReceipt.match_count, 0);

assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({
  ...baseInput,
  dedup_pattern: { ...baseInput.dedup_pattern, pattern_ref: 'local_pattern:email' },
}), /must reuse a CRM dedup pattern reference/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({
  ...baseInput,
  dedup_pattern: { ...baseInput.dedup_pattern, threshold_score: 0 },
}), /threshold_score must be a positive number/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({
  ...baseInput,
  dedup_pattern: {
    ...baseInput.dedup_pattern,
    signal_weights: [
      { signal_type: 'EMAIL_HASH', weight: 50 },
      { signal_type: 'EMAIL_HASH', weight: 10 },
    ],
  },
}), /signal_type weight must be unique/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, applicant_signals: [] }), /applicant_signals must include at least one/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({
  ...baseInput,
  candidates: [{ ...baseInput.candidates[0]!, source: 'PAYROLL' as never }],
}), /unsupported candidate source/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, destructive_merge_requested: true }), /retain and link, not destructively merge/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, direct_crm_mutation_requested: true }), /must not mutate CRM records/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, applicant_record_mutation_requested: true }), /must not mutate applicant records/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, person_identity_graph_mutation_requested: true }), /must not mutate the Person\/Identity Graph/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateApplicantDedupLinkageRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime applicant_dedup_linkage test passed.');
