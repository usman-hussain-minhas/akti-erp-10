import { createHash } from 'node:crypto';

export const PHASE_6B_RECONCILIATION_MATCHING_SEED_ID = 'seed_6b_13_reconciliation_matching' as const;
export const PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID = '6B.13' as const;

export const RECONCILIATION_MATCHING_EVENT = 'phase_6b.banking_reconciliation.match_candidates.generated' as const;

export type ReconciliationTransactionDirection = 'INFLOW' | 'OUTFLOW';
export type ReconciliationMatchStatus = 'AUTO_MATCH_CANDIDATE' | 'REVIEW_REQUIRED' | 'REJECTED';

export type ReconciliationBankTransactionInput = {
  bank_transaction_ref: string;
  external_transaction_ref: string;
  bank_statement_import_ref: string;
  transaction_date: string;
  description: string;
  direction: ReconciliationTransactionDirection;
  amount_minor: number;
  currency_code: string;
  bank_transaction_evidence_ref: string;
};

export type ReconciliationAllocationTargetInput = {
  allocation_balance_ref: string;
  payment_ref: string;
  invoice_ref?: string;
  receivable_ref?: string;
  expected_direction: ReconciliationTransactionDirection;
  expected_amount_minor: number;
  currency_code: string;
  expected_settlement_at: string;
  chart_account_ref: string;
  allocation_evidence_ref: string;
};

export type ReconciliationMatchCandidate = {
  candidate_ref: string;
  bank_transaction_ref: string;
  allocation_balance_ref: string;
  payment_ref: string;
  invoice_ref?: string;
  receivable_ref?: string;
  chart_account_ref: string;
  status: ReconciliationMatchStatus;
  score: number;
  score_reasons: string[];
  amount_delta_minor: number;
  date_delta_days: number;
  currency_code: string;
  candidate_evidence_ref: string;
};

export type ReconciliationMatchingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_RECONCILIATION_MATCHING_SEED_ID;
  match_run_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  bank_transactions: ReconciliationBankTransactionInput[];
  allocation_targets: ReconciliationAllocationTargetInput[];
  generated_by_user_id: string;
  generated_at: string;
  auto_match_threshold?: number;
  review_threshold?: number;
  payment_allocation_requested?: boolean;
  journal_posting_requested?: boolean;
  statement_closure_requested?: boolean;
  manual_reconciliation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ReconciliationMatchingReceipt = {
  seed_id: typeof PHASE_6B_RECONCILIATION_MATCHING_SEED_ID;
  component_id: typeof PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID;
  event_name: typeof RECONCILIATION_MATCHING_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_reconciliation_candidate_model: 'Phase6BReconciliationCandidate';
  phase_6b_bank_transaction_model: 'Phase6BBankTransaction';
  source_seed_id: typeof PHASE_6B_RECONCILIATION_MATCHING_SEED_ID;
  match_run_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  candidate_count: number;
  auto_match_candidate_count: number;
  review_required_count: number;
  rejected_count: number;
  candidates: ReconciliationMatchCandidate[];
  payment_allocation_performed: false;
  journal_posting_performed: false;
  statement_closed: false;
  manual_reconciliation_performed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  reconciliation_matching_evidence_ref: string;
  reconciliation_matching_digest: string;
  generated_by_user_id: string;
  generated_at: string;
};

const DIRECTIONS: readonly ReconciliationTransactionDirection[] = ['INFLOW', 'OUTFLOW'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for reconciliation matching.`);
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for reconciliation matching.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_RECONCILIATION_MATCHING_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_RECONCILIATION_MATCHING_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_13_reconciliation_matching.');
  }
  return PHASE_6B_RECONCILIATION_MATCHING_SEED_ID;
}

function requireDirection(value: ReconciliationTransactionDirection, field: string): ReconciliationTransactionDirection {
  if (!DIRECTIONS.includes(value)) {
    throw new Error(`${field} is not supported for reconciliation matching.`);
  }
  return value;
}

function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer for reconciliation matching.`);
  }
  return value;
}

function normalizeCurrency(value: string, field: string): string {
  const currency = requireNonEmpty(value, field).toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error(`${field} must be a three-letter ISO-style code for reconciliation matching.`);
  }
  return currency;
}

function normalizeThreshold(value: number | undefined, fallback: number, field: string): number {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${field} must be an integer between 0 and 100 for reconciliation matching.`);
  }
  return value;
}

function uniqueBy<T>(items: T[], field: keyof T, label: string): void {
  const values = items.map((item) => String(item[field]));
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} must not repeat ${String(field)} for reconciliation matching.`);
  }
}

function normalizeTransaction(transaction: ReconciliationBankTransactionInput): ReconciliationBankTransactionInput {
  return {
    bank_transaction_ref: requireNonEmpty(transaction.bank_transaction_ref, 'bank_transactions.bank_transaction_ref'),
    external_transaction_ref: requireNonEmpty(transaction.external_transaction_ref, 'bank_transactions.external_transaction_ref'),
    bank_statement_import_ref: requireNonEmpty(transaction.bank_statement_import_ref, 'bank_transactions.bank_statement_import_ref'),
    transaction_date: requireTimestamp(transaction.transaction_date, 'bank_transactions.transaction_date'),
    description: requireNonEmpty(transaction.description, 'bank_transactions.description'),
    direction: requireDirection(transaction.direction, 'bank_transactions.direction'),
    amount_minor: requirePositiveInteger(transaction.amount_minor, 'bank_transactions.amount_minor'),
    currency_code: normalizeCurrency(transaction.currency_code, 'bank_transactions.currency_code'),
    bank_transaction_evidence_ref: requireNonEmpty(transaction.bank_transaction_evidence_ref, 'bank_transactions.bank_transaction_evidence_ref'),
  };
}

function normalizeTransactions(transactions: ReconciliationBankTransactionInput[]): ReconciliationBankTransactionInput[] {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error('bank_transactions must include at least one transaction for reconciliation matching.');
  }
  const normalized = transactions.map(normalizeTransaction);
  uniqueBy(normalized, 'bank_transaction_ref', 'bank_transactions');
  uniqueBy(normalized, 'external_transaction_ref', 'bank_transactions');
  return normalized;
}

function normalizeTarget(target: ReconciliationAllocationTargetInput): ReconciliationAllocationTargetInput {
  return {
    allocation_balance_ref: requireNonEmpty(target.allocation_balance_ref, 'allocation_targets.allocation_balance_ref'),
    payment_ref: requireNonEmpty(target.payment_ref, 'allocation_targets.payment_ref'),
    invoice_ref: optionalNonEmpty(target.invoice_ref, 'allocation_targets.invoice_ref'),
    receivable_ref: optionalNonEmpty(target.receivable_ref, 'allocation_targets.receivable_ref'),
    expected_direction: requireDirection(target.expected_direction, 'allocation_targets.expected_direction'),
    expected_amount_minor: requirePositiveInteger(target.expected_amount_minor, 'allocation_targets.expected_amount_minor'),
    currency_code: normalizeCurrency(target.currency_code, 'allocation_targets.currency_code'),
    expected_settlement_at: requireTimestamp(target.expected_settlement_at, 'allocation_targets.expected_settlement_at'),
    chart_account_ref: requireNonEmpty(target.chart_account_ref, 'allocation_targets.chart_account_ref'),
    allocation_evidence_ref: requireNonEmpty(target.allocation_evidence_ref, 'allocation_targets.allocation_evidence_ref'),
  };
}

function normalizeTargets(targets: ReconciliationAllocationTargetInput[], expectedAllocationBalanceRef: string): ReconciliationAllocationTargetInput[] {
  if (!Array.isArray(targets) || targets.length === 0) {
    throw new Error('allocation_targets must include at least one target for reconciliation matching.');
  }
  const normalized = targets.map(normalizeTarget);
  uniqueBy(normalized, 'payment_ref', 'allocation_targets');
  for (const target of normalized) {
    if (target.allocation_balance_ref !== expectedAllocationBalanceRef) {
      throw new Error('allocation_targets.allocation_balance_ref must match payment_allocation_balance_ref for reconciliation matching.');
    }
  }
  return normalized;
}

function dayDelta(left: string, right: string): number {
  const milliseconds = Math.abs(Date.parse(left) - Date.parse(right));
  return Math.floor(milliseconds / 86_400_000);
}

function scoreCandidate(transaction: ReconciliationBankTransactionInput, target: ReconciliationAllocationTargetInput): Omit<ReconciliationMatchCandidate, 'candidate_ref' | 'candidate_evidence_ref'> | null {
  if (transaction.currency_code !== target.currency_code || transaction.direction !== target.expected_direction) {
    return null;
  }
  const amountDelta = Math.abs(transaction.amount_minor - target.expected_amount_minor);
  const dateDelta = dayDelta(transaction.transaction_date, target.expected_settlement_at);
  const description = `${transaction.description} ${transaction.external_transaction_ref}`.toLowerCase();
  const scoreReasons: string[] = [];
  let score = 0;

  if (amountDelta === 0) {
    score += 55;
    scoreReasons.push('exact_amount_match');
  } else if (amountDelta <= Math.max(1, Math.round(target.expected_amount_minor * 0.01))) {
    score += 35;
    scoreReasons.push('amount_within_one_percent');
  }

  if (dateDelta === 0) {
    score += 25;
    scoreReasons.push('same_day_settlement');
  } else if (dateDelta <= 3) {
    score += 15;
    scoreReasons.push('settlement_within_three_days');
  }

  if (description.includes(target.payment_ref.toLowerCase())) {
    score += 20;
    scoreReasons.push('payment_reference_seen');
  } else if (target.invoice_ref !== undefined && description.includes(target.invoice_ref.toLowerCase())) {
    score += 15;
    scoreReasons.push('invoice_reference_seen');
  } else if (target.receivable_ref !== undefined && description.includes(target.receivable_ref.toLowerCase())) {
    score += 15;
    scoreReasons.push('receivable_reference_seen');
  }

  return {
    bank_transaction_ref: transaction.bank_transaction_ref,
    allocation_balance_ref: target.allocation_balance_ref,
    payment_ref: target.payment_ref,
    invoice_ref: target.invoice_ref,
    receivable_ref: target.receivable_ref,
    chart_account_ref: target.chart_account_ref,
    status: 'REJECTED',
    score: Math.min(100, score),
    score_reasons: scoreReasons.length > 0 ? scoreReasons : ['compatible_currency_and_direction_only'],
    amount_delta_minor: amountDelta,
    date_delta_days: dateDelta,
    currency_code: transaction.currency_code,
  };
}

function buildCandidates(
  transactions: ReconciliationBankTransactionInput[],
  targets: ReconciliationAllocationTargetInput[],
  matchRunRef: string,
  autoMatchThreshold: number,
  reviewThreshold: number,
): ReconciliationMatchCandidate[] {
  const candidates: ReconciliationMatchCandidate[] = [];
  for (const transaction of transactions) {
    for (const target of targets) {
      const scored = scoreCandidate(transaction, target);
      if (scored === null) continue;
      const status: ReconciliationMatchStatus = scored.score >= autoMatchThreshold ? 'AUTO_MATCH_CANDIDATE' : scored.score >= reviewThreshold ? 'REVIEW_REQUIRED' : 'REJECTED';
      const candidateRef = `${matchRunRef}:${transaction.bank_transaction_ref}:${target.payment_ref}`;
      candidates.push({
        ...scored,
        status,
        candidate_ref: candidateRef,
        candidate_evidence_ref: `reconciliation_matching:${candidateRef}:candidate`,
      });
    }
  }
  return candidates.sort((left, right) => right.score - left.score || left.candidate_ref.localeCompare(right.candidate_ref));
}

function digestReconciliationMatching(receiptWithoutDigest: Omit<ReconciliationMatchingReceipt, 'reconciliation_matching_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function generateReconciliationMatches(input: ReconciliationMatchingInput): ReconciliationMatchingReceipt {
  if (input.payment_allocation_requested === true) {
    throw new Error('reconciliation matching must not perform payment allocation math.');
  }
  if (input.journal_posting_requested === true) {
    throw new Error('reconciliation matching must not post journals.');
  }
  if (input.statement_closure_requested === true) {
    throw new Error('reconciliation matching must not close reconciliation statements.');
  }
  if (input.manual_reconciliation_requested === true) {
    throw new Error('reconciliation matching must not perform manual reconciliation resolution.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('reconciliation matching must not process provider callbacks.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('reconciliation matching must not perform irreversible actions.');
  }

  const paymentAllocationBalanceRef = requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref');
  const matchRunRef = requireNonEmpty(input.match_run_ref, 'match_run_ref');
  const autoMatchThreshold = normalizeThreshold(input.auto_match_threshold, 90, 'auto_match_threshold');
  const reviewThreshold = normalizeThreshold(input.review_threshold, 60, 'review_threshold');
  if (reviewThreshold > autoMatchThreshold) {
    throw new Error('review_threshold must not exceed auto_match_threshold for reconciliation matching.');
  }
  const transactions = normalizeTransactions(input.bank_transactions);
  const targets = normalizeTargets(input.allocation_targets, paymentAllocationBalanceRef);
  const candidates = buildCandidates(transactions, targets, matchRunRef, autoMatchThreshold, reviewThreshold);

  const receiptWithoutDigest: Omit<ReconciliationMatchingReceipt, 'reconciliation_matching_digest'> = {
    seed_id: PHASE_6B_RECONCILIATION_MATCHING_SEED_ID,
    component_id: PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID,
    event_name: RECONCILIATION_MATCHING_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_reconciliation_candidate_model: 'Phase6BReconciliationCandidate',
    phase_6b_bank_transaction_model: 'Phase6BBankTransaction',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    match_run_ref: matchRunRef,
    bank_account_ref: requireNonEmpty(input.bank_account_ref, 'bank_account_ref'),
    payment_allocation_balance_ref: paymentAllocationBalanceRef,
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    candidate_count: candidates.length,
    auto_match_candidate_count: candidates.filter((candidate) => candidate.status === 'AUTO_MATCH_CANDIDATE').length,
    review_required_count: candidates.filter((candidate) => candidate.status === 'REVIEW_REQUIRED').length,
    rejected_count: candidates.filter((candidate) => candidate.status === 'REJECTED').length,
    candidates,
    payment_allocation_performed: false,
    journal_posting_performed: false,
    statement_closed: false,
    manual_reconciliation_performed: false,
    provider_callback_processed: false,
    irreversible_action_allowed: false,
    reconciliation_matching_evidence_ref: `reconciliation_matching:${matchRunRef}:generated`,
    generated_by_user_id: requireNonEmpty(input.generated_by_user_id, 'generated_by_user_id'),
    generated_at: requireTimestamp(input.generated_at, 'generated_at'),
  };

  return {
    ...receiptWithoutDigest,
    reconciliation_matching_digest: digestReconciliationMatching(receiptWithoutDigest),
  };
}
