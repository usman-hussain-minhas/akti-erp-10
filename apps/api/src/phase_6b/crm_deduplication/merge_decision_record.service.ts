export const PHASE_6B_MERGE_DECISION_RECORD_SEED_ID = 'seed_6b_05_merge_decision_record' as const;
export const PHASE_6B_MERGE_DECISION_RECORD_COMPONENT_ID = '6B.05' as const;

export const MERGE_DECISION_RECORD_EVENT = 'phase_6b.crm_deduplication.merge_decision_record.recorded' as const;

export type MergeDecisionOutcome = 'MERGE_APPROVED' | 'MERGE_REJECTED' | 'MANUAL_REVIEW_REQUIRED';
export type MergeDecisionBasis = 'MATCH_SCORE' | 'IDENTITY_GRAPH_MATCH' | 'OPERATOR_REVIEW' | 'CONFLICTING_EVIDENCE';

export type MergeDecisionCandidate = {
  candidate_lead_record_id: string;
  candidate_lead_record_authority_id: string;
  candidate_person_identity_graph_id: string;
  candidate_score: number;
  evidence_refs: string[];
};

export type MergeDecisionRecordInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  merge_decision_id: string;
  dedup_run_id: string;
  source_lead_record_id: string;
  source_lead_record_authority_id: string;
  source_person_identity_graph_id: string;
  decided_by_user_id: string;
  decided_at: string;
  decision_outcome: MergeDecisionOutcome;
  decision_basis: MergeDecisionBasis;
  rationale: string;
  candidates: MergeDecisionCandidate[];
  merge_execution_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type MergeDecisionRecordReceipt = {
  seed_id: typeof PHASE_6B_MERGE_DECISION_RECORD_SEED_ID;
  component_id: typeof PHASE_6B_MERGE_DECISION_RECORD_COMPONENT_ID;
  event_name: typeof MERGE_DECISION_RECORD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  merge_decision_id: string;
  dedup_run_id: string;
  source_lead_record_id: string;
  source_lead_record_authority_id: string;
  source_person_identity_graph_id: string;
  decided_by_user_id: string;
  decided_at: string;
  decision_outcome: MergeDecisionOutcome;
  decision_basis: MergeDecisionBasis;
  rationale: string;
  candidate_count: number;
  candidates: readonly MergeDecisionCandidate[];
  merge_execution_allowed: false;
  irreversible_action_allowed: false;
};

const OUTCOMES: readonly MergeDecisionOutcome[] = ['MERGE_APPROVED', 'MERGE_REJECTED', 'MANUAL_REVIEW_REQUIRED'] as const;
const BASES: readonly MergeDecisionBasis[] = ['MATCH_SCORE', 'IDENTITY_GRAPH_MATCH', 'OPERATOR_REVIEW', 'CONFLICTING_EVIDENCE'] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for merge decision record.`);
  }
  return value.trim();
}

function requireDecidedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'decided_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('decided_at must be a valid ISO-compatible timestamp for merge decision record.');
  }
  return normalized;
}

function normalizeOutcome(value: MergeDecisionOutcome): MergeDecisionOutcome {
  if (!OUTCOMES.includes(value)) {
    throw new Error('decision_outcome is not supported for merge decision record.');
  }
  return value;
}

function normalizeBasis(value: MergeDecisionBasis): MergeDecisionBasis {
  if (!BASES.includes(value)) {
    throw new Error('decision_basis is not supported for merge decision record.');
  }
  return value;
}

function requireScore(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error('candidate_score must be between 0 and 100 for merge decision record.');
  }
  return value;
}

function normalizeEvidenceRefs(evidenceRefs: string[]): readonly string[] {
  if (!Array.isArray(evidenceRefs) || evidenceRefs.length === 0) {
    throw new Error('candidate evidence_refs must contain at least one evidence reference for merge decision record.');
  }
  return Object.freeze(evidenceRefs.map((ref, index) => requireNonEmpty(ref, `candidate.evidence_refs.${index}`)));
}

function normalizeCandidate(candidate: MergeDecisionCandidate): MergeDecisionCandidate {
  return {
    candidate_lead_record_id: requireNonEmpty(candidate.candidate_lead_record_id, 'candidate.candidate_lead_record_id'),
    candidate_lead_record_authority_id: requireNonEmpty(candidate.candidate_lead_record_authority_id, 'candidate.candidate_lead_record_authority_id'),
    candidate_person_identity_graph_id: requireNonEmpty(candidate.candidate_person_identity_graph_id, 'candidate.candidate_person_identity_graph_id'),
    candidate_score: requireScore(candidate.candidate_score),
    evidence_refs: [...normalizeEvidenceRefs(candidate.evidence_refs)],
  };
}

export function recordMergeDecision(input: MergeDecisionRecordInput): MergeDecisionRecordReceipt {
  if (input.merge_execution_requested === true) {
    throw new Error('merge decision record must not execute a merge.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('merge decision record must not perform irreversible actions.');
  }
  if (!Array.isArray(input.candidates) || input.candidates.length === 0) {
    throw new Error('candidates must contain at least one candidate for merge decision record.');
  }

  const normalizedCandidates = input.candidates.map(normalizeCandidate);

  return {
    seed_id: PHASE_6B_MERGE_DECISION_RECORD_SEED_ID,
    component_id: PHASE_6B_MERGE_DECISION_RECORD_COMPONENT_ID,
    event_name: MERGE_DECISION_RECORD_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    merge_decision_id: requireNonEmpty(input.merge_decision_id, 'merge_decision_id'),
    dedup_run_id: requireNonEmpty(input.dedup_run_id, 'dedup_run_id'),
    source_lead_record_id: requireNonEmpty(input.source_lead_record_id, 'source_lead_record_id'),
    source_lead_record_authority_id: requireNonEmpty(input.source_lead_record_authority_id, 'source_lead_record_authority_id'),
    source_person_identity_graph_id: requireNonEmpty(input.source_person_identity_graph_id, 'source_person_identity_graph_id'),
    decided_by_user_id: requireNonEmpty(input.decided_by_user_id, 'decided_by_user_id'),
    decided_at: requireDecidedAt(input.decided_at),
    decision_outcome: normalizeOutcome(input.decision_outcome),
    decision_basis: normalizeBasis(input.decision_basis),
    rationale: requireNonEmpty(input.rationale, 'rationale'),
    candidate_count: normalizedCandidates.length,
    candidates: Object.freeze(normalizedCandidates),
    merge_execution_allowed: false,
    irreversible_action_allowed: false,
  };
}
