export const PHASE_6B_DUPLICATE_EVIDENCE_LOG_SEED_ID = 'seed_6b_05_duplicate_evidence_log' as const;
export const PHASE_6B_DUPLICATE_EVIDENCE_LOG_COMPONENT_ID = '6B.05' as const;

export const DUPLICATE_EVIDENCE_LOG_EVENT = 'phase_6b.crm_deduplication.duplicate_evidence_log.recorded' as const;

export type DuplicateEvidenceKind =
  | 'MATCH_CANDIDATE_EVIDENCE'
  | 'MERGE_DECISION_EVIDENCE'
  | 'IDENTITY_LINK_EVIDENCE'
  | 'DUPLICATE_REJECTION_EVIDENCE'
  | 'OPERATOR_REVIEW_EVIDENCE';

export type DuplicateEvidenceSource =
  | 'UNIFIED_LEAD_RECORD_AUTHORITY'
  | 'PERSON_IDENTITY_GRAPH'
  | 'MATCH_CANDIDATE_GENERATION'
  | 'MERGE_DECISION_RECORD'
  | 'IDENTITY_RESOLUTION_LINKING'
  | 'OPERATOR_REVIEW';

export type DuplicateEvidenceItem = {
  evidence_item_id: string;
  evidence_kind: DuplicateEvidenceKind;
  evidence_source: DuplicateEvidenceSource;
  lead_record_id: string;
  lead_record_authority_id: string;
  person_identity_graph_id: string;
  evidence_ref: string;
  confidence_score?: number;
  reason_codes: string[];
};

export type DuplicateEvidenceLogInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  duplicate_evidence_log_id: string;
  dedup_run_id: string;
  subject_lead_record_id: string;
  subject_lead_record_authority_id: string;
  subject_person_identity_graph_id: string;
  recorded_by_user_id: string;
  recorded_at: string;
  audit_reason: string;
  evidence_items: DuplicateEvidenceItem[];
  merge_execution_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type DuplicateEvidenceLogReceipt = {
  seed_id: typeof PHASE_6B_DUPLICATE_EVIDENCE_LOG_SEED_ID;
  component_id: typeof PHASE_6B_DUPLICATE_EVIDENCE_LOG_COMPONENT_ID;
  event_name: typeof DUPLICATE_EVIDENCE_LOG_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  duplicate_evidence_log_id: string;
  dedup_run_id: string;
  subject_lead_record_id: string;
  subject_lead_record_authority_id: string;
  subject_person_identity_graph_id: string;
  recorded_by_user_id: string;
  recorded_at: string;
  audit_reason: string;
  evidence_count: number;
  evidence_items: readonly DuplicateEvidenceItem[];
  append_only_audit_log_enforced: true;
  lead_record_authority_dependency_confirmed: true;
  person_identity_graph_dependency_confirmed: true;
  merge_execution_allowed: false;
  irreversible_action_allowed: false;
};

const EVIDENCE_KINDS: readonly DuplicateEvidenceKind[] = [
  'MATCH_CANDIDATE_EVIDENCE',
  'MERGE_DECISION_EVIDENCE',
  'IDENTITY_LINK_EVIDENCE',
  'DUPLICATE_REJECTION_EVIDENCE',
  'OPERATOR_REVIEW_EVIDENCE',
] as const;

const EVIDENCE_SOURCES: readonly DuplicateEvidenceSource[] = [
  'UNIFIED_LEAD_RECORD_AUTHORITY',
  'PERSON_IDENTITY_GRAPH',
  'MATCH_CANDIDATE_GENERATION',
  'MERGE_DECISION_RECORD',
  'IDENTITY_RESOLUTION_LINKING',
  'OPERATOR_REVIEW',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for duplicate evidence log.`);
  }
  return value.trim();
}

function requireRecordedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'recorded_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('recorded_at must be a valid ISO-compatible timestamp for duplicate evidence log.');
  }
  return normalized;
}

function normalizeEvidenceKind(value: DuplicateEvidenceKind): DuplicateEvidenceKind {
  if (!EVIDENCE_KINDS.includes(value)) {
    throw new Error('evidence_kind is not supported for duplicate evidence log.');
  }
  return value;
}

function normalizeEvidenceSource(value: DuplicateEvidenceSource): DuplicateEvidenceSource {
  if (!EVIDENCE_SOURCES.includes(value)) {
    throw new Error('evidence_source is not supported for duplicate evidence log.');
  }
  return value;
}

function normalizeConfidenceScore(value: number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error('confidence_score must be between 0 and 100 for duplicate evidence log.');
  }
  return value;
}

function normalizeReasonCodes(reasonCodes: string[]): readonly string[] {
  if (!Array.isArray(reasonCodes) || reasonCodes.length === 0) {
    throw new Error('reason_codes must contain at least one reason code for duplicate evidence log.');
  }
  return Object.freeze(reasonCodes.map((reasonCode, index) => requireNonEmpty(reasonCode, `reason_codes.${index}`)));
}

function normalizeEvidenceItem(item: DuplicateEvidenceItem): DuplicateEvidenceItem {
  return {
    evidence_item_id: requireNonEmpty(item.evidence_item_id, 'evidence_item_id'),
    evidence_kind: normalizeEvidenceKind(item.evidence_kind),
    evidence_source: normalizeEvidenceSource(item.evidence_source),
    lead_record_id: requireNonEmpty(item.lead_record_id, 'evidence_item.lead_record_id'),
    lead_record_authority_id: requireNonEmpty(item.lead_record_authority_id, 'evidence_item.lead_record_authority_id'),
    person_identity_graph_id: requireNonEmpty(item.person_identity_graph_id, 'evidence_item.person_identity_graph_id'),
    evidence_ref: requireNonEmpty(item.evidence_ref, 'evidence_ref'),
    confidence_score: normalizeConfidenceScore(item.confidence_score),
    reason_codes: [...normalizeReasonCodes(item.reason_codes)],
  };
}

export function recordDuplicateEvidenceLog(input: DuplicateEvidenceLogInput): DuplicateEvidenceLogReceipt {
  if (input.merge_execution_requested === true) {
    throw new Error('duplicate evidence log must not execute a merge.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('duplicate evidence log must not perform irreversible actions.');
  }
  if (!Array.isArray(input.evidence_items) || input.evidence_items.length === 0) {
    throw new Error('evidence_items must contain at least one evidence item for duplicate evidence log.');
  }

  const normalizedItems = input.evidence_items.map(normalizeEvidenceItem);

  return {
    seed_id: PHASE_6B_DUPLICATE_EVIDENCE_LOG_SEED_ID,
    component_id: PHASE_6B_DUPLICATE_EVIDENCE_LOG_COMPONENT_ID,
    event_name: DUPLICATE_EVIDENCE_LOG_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    duplicate_evidence_log_id: requireNonEmpty(input.duplicate_evidence_log_id, 'duplicate_evidence_log_id'),
    dedup_run_id: requireNonEmpty(input.dedup_run_id, 'dedup_run_id'),
    subject_lead_record_id: requireNonEmpty(input.subject_lead_record_id, 'subject_lead_record_id'),
    subject_lead_record_authority_id: requireNonEmpty(input.subject_lead_record_authority_id, 'subject_lead_record_authority_id'),
    subject_person_identity_graph_id: requireNonEmpty(input.subject_person_identity_graph_id, 'subject_person_identity_graph_id'),
    recorded_by_user_id: requireNonEmpty(input.recorded_by_user_id, 'recorded_by_user_id'),
    recorded_at: requireRecordedAt(input.recorded_at),
    audit_reason: requireNonEmpty(input.audit_reason, 'audit_reason'),
    evidence_count: normalizedItems.length,
    evidence_items: Object.freeze(normalizedItems),
    append_only_audit_log_enforced: true,
    lead_record_authority_dependency_confirmed: true,
    person_identity_graph_dependency_confirmed: true,
    merge_execution_allowed: false,
    irreversible_action_allowed: false,
  };
}
