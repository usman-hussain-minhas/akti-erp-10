import assert from 'node:assert/strict';
import { recordMergeDecision, type MergeDecisionRecordInput } from './merge_decision_record.service';

const baseInput: MergeDecisionRecordInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_deduplication',
  merge_decision_id: 'merge_decision_001',
  dedup_run_id: 'dedup_run_001',
  source_lead_record_id: 'lead_source_001',
  source_lead_record_authority_id: 'lead_authority_source_001',
  source_person_identity_graph_id: 'person_graph_source_001',
  decided_by_user_id: 'user_dedup_reviewer_001',
  decided_at: '2026-06-08T16:00:00.000Z',
  decision_outcome: 'MERGE_APPROVED',
  decision_basis: 'MATCH_SCORE',
  rationale: 'High-confidence duplicate based on phone and email match evidence.',
  candidates: [
    {
      candidate_lead_record_id: 'lead_candidate_001',
      candidate_lead_record_authority_id: 'lead_authority_candidate_001',
      candidate_person_identity_graph_id: 'person_graph_candidate_001',
      candidate_score: 95,
      evidence_refs: ['match_evidence_email_001', 'match_evidence_phone_001'],
    },
  ],
};

const receipt = recordMergeDecision(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_05_merge_decision_record');
assert.equal(receipt.component_id, '6B.05');
assert.equal(receipt.event_name, 'phase_6b.crm_deduplication.merge_decision_record.recorded');
assert.equal(receipt.merge_decision_id, 'merge_decision_001');
assert.equal(receipt.dedup_run_id, 'dedup_run_001');
assert.equal(receipt.source_lead_record_authority_id, 'lead_authority_source_001');
assert.equal(receipt.source_person_identity_graph_id, 'person_graph_source_001');
assert.equal(receipt.decided_by_user_id, 'user_dedup_reviewer_001');
assert.equal(receipt.decision_outcome, 'MERGE_APPROVED');
assert.equal(receipt.decision_basis, 'MATCH_SCORE');
assert.equal(receipt.candidate_count, 1);
assert.equal(receipt.candidates[0]?.candidate_score, 95);
assert.deepEqual(receipt.candidates[0]?.evidence_refs, ['match_evidence_email_001', 'match_evidence_phone_001']);
assert.equal(receipt.merge_execution_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const reviewReceipt = recordMergeDecision({
  ...baseInput,
  merge_decision_id: 'merge_decision_002',
  decision_outcome: 'MANUAL_REVIEW_REQUIRED',
  decision_basis: 'CONFLICTING_EVIDENCE',
});
assert.equal(reviewReceipt.decision_outcome, 'MANUAL_REVIEW_REQUIRED');
assert.equal(reviewReceipt.decision_basis, 'CONFLICTING_EVIDENCE');

assert.throws(() => recordMergeDecision({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, merge_decision_id: '' }), /merge_decision_id is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, dedup_run_id: '' }), /dedup_run_id is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, source_lead_record_id: '' }), /source_lead_record_id is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, source_lead_record_authority_id: '' }), /source_lead_record_authority_id is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, source_person_identity_graph_id: '' }), /source_person_identity_graph_id is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, decided_by_user_id: '' }), /decided_by_user_id is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, decided_at: 'not-a-date' }), /decided_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordMergeDecision({ ...baseInput, decision_outcome: 'AUTO_MERGED' as never }), /decision_outcome is not supported/);
assert.throws(() => recordMergeDecision({ ...baseInput, decision_basis: 'UNDECLARED_POLICY' as never }), /decision_basis is not supported/);
assert.throws(() => recordMergeDecision({ ...baseInput, rationale: '' }), /rationale is required/);
assert.throws(() => recordMergeDecision({ ...baseInput, candidates: [] }), /candidates must contain at least one candidate/);
assert.throws(
  () => recordMergeDecision({
    ...baseInput,
    candidates: [{ ...baseInput.candidates[0]!, candidate_score: 101 }],
  }),
  /candidate_score must be between 0 and 100/,
);
assert.throws(
  () => recordMergeDecision({
    ...baseInput,
    candidates: [{ ...baseInput.candidates[0]!, evidence_refs: [] }],
  }),
  /candidate evidence_refs must contain at least one evidence reference/,
);
assert.throws(
  () => recordMergeDecision({
    ...baseInput,
    candidates: [{ ...baseInput.candidates[0]!, candidate_lead_record_id: '' }],
  }),
  /candidate.candidate_lead_record_id is required/,
);
assert.throws(() => recordMergeDecision({ ...baseInput, merge_execution_requested: true }), /must not execute a merge/);
assert.throws(() => recordMergeDecision({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-042 merge decision record service test passed.');
