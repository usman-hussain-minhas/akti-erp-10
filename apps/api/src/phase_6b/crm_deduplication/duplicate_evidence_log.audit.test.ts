import assert from 'node:assert/strict';
import { recordDuplicateEvidenceLog, type DuplicateEvidenceLogInput } from './duplicate_evidence_log.audit';

const baseInput: DuplicateEvidenceLogInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_deduplication',
  duplicate_evidence_log_id: 'duplicate_evidence_log_001',
  dedup_run_id: 'dedup_run_001',
  subject_lead_record_id: 'lead_subject_001',
  subject_lead_record_authority_id: 'lead_authority_subject_001',
  subject_person_identity_graph_id: 'person_graph_subject_001',
  recorded_by_user_id: 'user_dedup_reviewer_001',
  recorded_at: '2026-06-08T17:00:00.000Z',
  audit_reason: 'Preserve dedup evidence trail for candidate and identity-link decisions.',
  evidence_items: [
    {
      evidence_item_id: 'duplicate_evidence_item_001',
      evidence_kind: 'MATCH_CANDIDATE_EVIDENCE',
      evidence_source: 'MATCH_CANDIDATE_GENERATION',
      lead_record_id: 'lead_candidate_001',
      lead_record_authority_id: 'lead_authority_candidate_001',
      person_identity_graph_id: 'person_graph_candidate_001',
      evidence_ref: 'match_candidate_receipt_001',
      confidence_score: 91,
      reason_codes: ['email_exact_match', 'phone_normalized_match'],
    },
    {
      evidence_item_id: 'duplicate_evidence_item_002',
      evidence_kind: 'IDENTITY_LINK_EVIDENCE',
      evidence_source: 'IDENTITY_RESOLUTION_LINKING',
      lead_record_id: 'lead_subject_001',
      lead_record_authority_id: 'lead_authority_subject_001',
      person_identity_graph_id: 'person_graph_subject_001',
      evidence_ref: 'identity_resolution_link_001',
      reason_codes: ['person_graph_anchor_confirmed'],
    },
  ],
};

const receipt = recordDuplicateEvidenceLog(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_05_duplicate_evidence_log');
assert.equal(receipt.component_id, '6B.05');
assert.equal(receipt.event_name, 'phase_6b.crm_deduplication.duplicate_evidence_log.recorded');
assert.equal(receipt.duplicate_evidence_log_id, 'duplicate_evidence_log_001');
assert.equal(receipt.dedup_run_id, 'dedup_run_001');
assert.equal(receipt.subject_lead_record_authority_id, 'lead_authority_subject_001');
assert.equal(receipt.subject_person_identity_graph_id, 'person_graph_subject_001');
assert.equal(receipt.recorded_by_user_id, 'user_dedup_reviewer_001');
assert.equal(receipt.evidence_count, 2);
assert.equal(receipt.evidence_items[0]?.evidence_kind, 'MATCH_CANDIDATE_EVIDENCE');
assert.equal(receipt.evidence_items[0]?.evidence_source, 'MATCH_CANDIDATE_GENERATION');
assert.deepEqual(receipt.evidence_items[0]?.reason_codes, ['email_exact_match', 'phone_normalized_match']);
assert.equal(receipt.evidence_items[0]?.confidence_score, 91);
assert.equal(receipt.append_only_audit_log_enforced, true);
assert.equal(receipt.lead_record_authority_dependency_confirmed, true);
assert.equal(receipt.person_identity_graph_dependency_confirmed, true);
assert.equal(receipt.merge_execution_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const rejectionReceipt = recordDuplicateEvidenceLog({
  ...baseInput,
  duplicate_evidence_log_id: 'duplicate_evidence_log_002',
  evidence_items: [
    {
      ...baseInput.evidence_items[0]!,
      evidence_item_id: 'duplicate_evidence_item_003',
      evidence_kind: 'DUPLICATE_REJECTION_EVIDENCE',
      evidence_source: 'OPERATOR_REVIEW',
      evidence_ref: 'operator_review_rejection_001',
      confidence_score: undefined,
      reason_codes: ['conflicting_identity_graph_signal'],
    },
  ],
});
assert.equal(rejectionReceipt.evidence_items[0]?.evidence_kind, 'DUPLICATE_REJECTION_EVIDENCE');
assert.equal(rejectionReceipt.evidence_items[0]?.confidence_score, undefined);

assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, duplicate_evidence_log_id: '' }), /duplicate_evidence_log_id is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, dedup_run_id: '' }), /dedup_run_id is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, subject_lead_record_id: '' }), /subject_lead_record_id is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, subject_lead_record_authority_id: '' }), /subject_lead_record_authority_id is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, subject_person_identity_graph_id: '' }), /subject_person_identity_graph_id is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, recorded_by_user_id: '' }), /recorded_by_user_id is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, recorded_at: 'not-a-date' }), /recorded_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, audit_reason: '' }), /audit_reason is required/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, evidence_items: [] }), /evidence_items must contain at least one evidence item/);
assert.throws(
  () => recordDuplicateEvidenceLog({
    ...baseInput,
    evidence_items: [{ ...baseInput.evidence_items[0]!, evidence_kind: 'AUTO_MERGE_SIGNAL' as never }],
  }),
  /evidence_kind is not supported/,
);
assert.throws(
  () => recordDuplicateEvidenceLog({
    ...baseInput,
    evidence_items: [{ ...baseInput.evidence_items[0]!, evidence_source: 'UNDECLARED_SOURCE' as never }],
  }),
  /evidence_source is not supported/,
);
assert.throws(
  () => recordDuplicateEvidenceLog({
    ...baseInput,
    evidence_items: [{ ...baseInput.evidence_items[0]!, lead_record_authority_id: '' }],
  }),
  /evidence_item.lead_record_authority_id is required/,
);
assert.throws(
  () => recordDuplicateEvidenceLog({
    ...baseInput,
    evidence_items: [{ ...baseInput.evidence_items[0]!, person_identity_graph_id: '' }],
  }),
  /evidence_item.person_identity_graph_id is required/,
);
assert.throws(
  () => recordDuplicateEvidenceLog({
    ...baseInput,
    evidence_items: [{ ...baseInput.evidence_items[0]!, evidence_ref: '' }],
  }),
  /evidence_ref is required/,
);
assert.throws(
  () => recordDuplicateEvidenceLog({
    ...baseInput,
    evidence_items: [{ ...baseInput.evidence_items[0]!, confidence_score: -1 }],
  }),
  /confidence_score must be between 0 and 100/,
);
assert.throws(
  () => recordDuplicateEvidenceLog({
    ...baseInput,
    evidence_items: [{ ...baseInput.evidence_items[0]!, reason_codes: [] }],
  }),
  /reason_codes must contain at least one reason code/,
);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, merge_execution_requested: true }), /must not execute a merge/);
assert.throws(() => recordDuplicateEvidenceLog({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-044 duplicate evidence log audit test passed.');
