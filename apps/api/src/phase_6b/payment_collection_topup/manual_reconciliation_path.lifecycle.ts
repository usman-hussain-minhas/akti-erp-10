export const PHASE_6B_MANUAL_RECONCILIATION_PATH_SEED_ID = 'seed_6b_10_manual_reconciliation_path' as const;
export const PHASE_6B_MANUAL_RECONCILIATION_PATH_COMPONENT_ID = '6B.10' as const;

export const MANUAL_RECONCILIATION_PATH_EVENT = 'phase_6b.payment_collection_topup.manual_reconciliation.review_recorded' as const;

export type ManualReconciliationCandidateType = 'BANK_STATEMENT_IMPORT' | 'PROVIDER_REFERENCE' | 'CASH_COUNTER' | 'ADJUSTMENT_REVIEW';
export type ManualReconciliationDecision = 'OPEN_REVIEW' | 'MATCHED_PENDING_ALLOCATION' | 'UNMATCHED' | 'ESCALATED';
export type ManualReconciliationStatus = 'OPEN_MANUAL_REVIEW' | 'MATCHED_PENDING_ALLOCATION' | 'UNMATCHED' | 'ESCALATED';

export type ManualReconciliationCandidate = {
  reconciliation_candidate_ref: string;
  candidate_type: ManualReconciliationCandidateType;
  candidate_source_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_evidence_ref: string;
  provider_transaction_evidence_ref?: string;
  amount_minor: number;
  currency_code: string;
  observed_at: string;
  candidate_reason: string;
  confidence_score: number;
};

export type ManualReconciliationReviewInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  reviewer_user_id: string;
  reviewed_at: string;
  candidate: ManualReconciliationCandidate;
  decision: ManualReconciliationDecision;
  decision_reason: string;
  api_key_scope_registry_ref?: string;
  provider_callback_processing_requested?: boolean;
  payment_allocation_requested?: boolean;
  auto_reconciliation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ManualReconciliationPathReceipt = {
  seed_id: typeof PHASE_6B_MANUAL_RECONCILIATION_PATH_SEED_ID;
  component_id: typeof PHASE_6B_MANUAL_RECONCILIATION_PATH_COMPONENT_ID;
  event_name: typeof MANUAL_RECONCILIATION_PATH_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  reviewer_user_id: string;
  reviewed_at: string;
  reconciliation_candidate_ref: string;
  candidate_type: ManualReconciliationCandidateType;
  candidate_source_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_evidence_ref: string;
  provider_transaction_evidence_ref?: string;
  amount_minor: number;
  currency_code: string;
  observed_at: string;
  confidence_score: number;
  status: ManualReconciliationStatus;
  decision: ManualReconciliationDecision;
  decision_reason: string;
  provider_neutral: true;
  api_key_scope_consumed: false;
  provider_callback_processed: false;
  payment_allocation_performed: false;
  auto_reconciliation_performed: false;
  irreversible_action_allowed: false;
};

const CANDIDATE_TYPES: readonly ManualReconciliationCandidateType[] = [
  'BANK_STATEMENT_IMPORT',
  'PROVIDER_REFERENCE',
  'CASH_COUNTER',
  'ADJUSTMENT_REVIEW',
] as const;
const DECISIONS: readonly ManualReconciliationDecision[] = ['OPEN_REVIEW', 'MATCHED_PENDING_ALLOCATION', 'UNMATCHED', 'ESCALATED'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for manual reconciliation path.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for manual reconciliation path.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for manual reconciliation path.');
  }
  return currency;
}

function normalizeAmount(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('amount_minor must be a positive integer for manual reconciliation path.');
  }
  return value;
}

function normalizeConfidence(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error('confidence_score must be an integer between 0 and 100 for manual reconciliation path.');
  }
  return value;
}

function requireCandidateType(value: ManualReconciliationCandidateType): ManualReconciliationCandidateType {
  if (!CANDIDATE_TYPES.includes(value)) {
    throw new Error('candidate_type is not supported for manual reconciliation path.');
  }
  return value;
}

function requireDecision(value: ManualReconciliationDecision): ManualReconciliationDecision {
  if (!DECISIONS.includes(value)) {
    throw new Error('decision is not supported for manual reconciliation path.');
  }
  return value;
}

function statusFor(decision: ManualReconciliationDecision): ManualReconciliationStatus {
  if (decision === 'OPEN_REVIEW') return 'OPEN_MANUAL_REVIEW';
  return decision;
}

export function recordManualReconciliationPathReview(input: ManualReconciliationReviewInput): ManualReconciliationPathReceipt {
  if (input.api_key_scope_registry_ref !== undefined && input.api_key_scope_registry_ref.trim().length > 0) {
    throw new Error('manual reconciliation path must remain provider-neutral and must not consume API-key scope.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('manual reconciliation path must not process provider callbacks.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('manual reconciliation path must not perform payment allocation math.');
  }
  if (input.auto_reconciliation_requested === true) {
    throw new Error('manual reconciliation path must not perform automatic reconciliation.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('manual reconciliation path must not perform irreversible actions.');
  }
  if (!input.candidate) {
    throw new Error('candidate is required for manual reconciliation path.');
  }

  const reviewedAt = requireTimestamp(input.reviewed_at, 'reviewed_at');
  const observedAt = requireTimestamp(input.candidate.observed_at, 'candidate.observed_at');
  if (Date.parse(reviewedAt) < Date.parse(observedAt)) {
    throw new Error('reviewed_at must not be earlier than candidate.observed_at for manual reconciliation path.');
  }
  const decision = requireDecision(input.decision);
  const providerTransactionEvidenceRef = input.candidate.provider_transaction_evidence_ref?.trim();

  return {
    seed_id: PHASE_6B_MANUAL_RECONCILIATION_PATH_SEED_ID,
    component_id: PHASE_6B_MANUAL_RECONCILIATION_PATH_COMPONENT_ID,
    event_name: MANUAL_RECONCILIATION_PATH_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    reviewer_user_id: requireNonEmpty(input.reviewer_user_id, 'reviewer_user_id'),
    reviewed_at: reviewedAt,
    reconciliation_candidate_ref: requireNonEmpty(input.candidate.reconciliation_candidate_ref, 'candidate.reconciliation_candidate_ref'),
    candidate_type: requireCandidateType(input.candidate.candidate_type),
    candidate_source_ref: requireNonEmpty(input.candidate.candidate_source_ref, 'candidate.candidate_source_ref'),
    invoice_record_ref: requireNonEmpty(input.candidate.invoice_record_ref, 'candidate.invoice_record_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(input.candidate.pricing_table_effective_date_ref, 'candidate.pricing_table_effective_date_ref'),
    payment_evidence_ref: requireNonEmpty(input.candidate.payment_evidence_ref, 'candidate.payment_evidence_ref'),
    provider_transaction_evidence_ref: providerTransactionEvidenceRef && providerTransactionEvidenceRef.length > 0 ? providerTransactionEvidenceRef : undefined,
    amount_minor: normalizeAmount(input.candidate.amount_minor),
    currency_code: normalizeCurrency(input.candidate.currency_code),
    observed_at: observedAt,
    confidence_score: normalizeConfidence(input.candidate.confidence_score),
    status: statusFor(decision),
    decision,
    decision_reason: requireNonEmpty(input.decision_reason, 'decision_reason'),
    provider_neutral: true,
    api_key_scope_consumed: false,
    provider_callback_processed: false,
    payment_allocation_performed: false,
    auto_reconciliation_performed: false,
    irreversible_action_allowed: false,
  };
}
