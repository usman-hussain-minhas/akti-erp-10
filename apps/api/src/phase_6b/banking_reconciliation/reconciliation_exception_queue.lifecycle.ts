import { createHash } from 'node:crypto';

export const PHASE_6B_RECONCILIATION_EXCEPTION_QUEUE_SEED_ID = 'seed_6b_13_reconciliation_exception_queue' as const;
export const PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID = '6B.13' as const;

export const RECONCILIATION_EXCEPTION_QUEUE_EVENT = 'phase_6b.banking_reconciliation.exception_queue.updated' as const;

export type ReconciliationExceptionReason = 'NO_MATCH' | 'MULTIPLE_MATCHES' | 'AMOUNT_VARIANCE' | 'DATE_VARIANCE' | 'CURRENCY_MISMATCH' | 'MISSING_EVIDENCE';
export type ReconciliationExceptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReconciliationExceptionStatus = 'OPEN' | 'ASSIGNED' | 'ESCALATED' | 'READY_FOR_MANUAL_REVIEW';

export type ReconciliationExceptionInput = {
  exception_ref: string;
  bank_transaction_ref: string;
  payment_allocation_balance_ref: string;
  chart_account_ref: string;
  candidate_ref?: string;
  reason: ReconciliationExceptionReason;
  amount_delta_minor?: number;
  date_delta_days?: number;
  currency_code: string;
  evidence_ref: string;
};

export type ReconciliationExceptionQueueInput = {
  organization_id: string;
  source_seed_id: typeof PHASE_6B_RECONCILIATION_EXCEPTION_QUEUE_SEED_ID;
  queue_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  exceptions: ReconciliationExceptionInput[];
  assigned_team_ref: string;
  queued_by_user_id: string;
  queued_at: string;
  manual_reconciliation_requested?: boolean;
  payment_allocation_requested?: boolean;
  journal_posting_requested?: boolean;
  statement_closure_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ReconciliationExceptionQueueItem = ReconciliationExceptionInput & {
  status: ReconciliationExceptionStatus;
  severity: ReconciliationExceptionSeverity;
  queue_item_ref: string;
  queue_evidence_ref: string;
};

export type ReconciliationExceptionQueueReceipt = {
  seed_id: typeof PHASE_6B_RECONCILIATION_EXCEPTION_QUEUE_SEED_ID;
  component_id: typeof PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID;
  event_name: typeof RECONCILIATION_EXCEPTION_QUEUE_EVENT;
  organization_id: string;
  source_seed_id: typeof PHASE_6B_RECONCILIATION_EXCEPTION_QUEUE_SEED_ID;
  queue_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  assigned_team_ref: string;
  phase_6b_reconciliation_candidate_model: 'Phase6BReconciliationCandidate';
  queue_item_count: number;
  high_or_critical_count: number;
  items: ReconciliationExceptionQueueItem[];
  manual_reconciliation_performed: false;
  payment_allocation_performed: false;
  journal_posting_performed: false;
  statement_closed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  queue_digest: string;
  queued_by_user_id: string;
  queued_at: string;
};

const REASONS: readonly ReconciliationExceptionReason[] = ['NO_MATCH', 'MULTIPLE_MATCHES', 'AMOUNT_VARIANCE', 'DATE_VARIANCE', 'CURRENCY_MISMATCH', 'MISSING_EVIDENCE'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for reconciliation exception queue.`);
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
    throw new Error(`${field} must be a valid ISO-compatible timestamp for reconciliation exception queue.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_RECONCILIATION_EXCEPTION_QUEUE_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_RECONCILIATION_EXCEPTION_QUEUE_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_13_reconciliation_exception_queue.');
  }
  return PHASE_6B_RECONCILIATION_EXCEPTION_QUEUE_SEED_ID;
}

function requireReason(value: ReconciliationExceptionReason): ReconciliationExceptionReason {
  if (!REASONS.includes(value)) {
    throw new Error('reason is not supported for reconciliation exception queue.');
  }
  return value;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'exceptions.currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('exceptions.currency_code must be a three-letter ISO-style code for reconciliation exception queue.');
  }
  return currency;
}

function optionalNonNegativeInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for reconciliation exception queue.`);
  }
  return value;
}

function classifySeverity(exception: ReconciliationExceptionInput): ReconciliationExceptionSeverity {
  if (exception.reason === 'CURRENCY_MISMATCH' || exception.reason === 'MISSING_EVIDENCE') return 'CRITICAL';
  if ((exception.amount_delta_minor ?? 0) > 100_000 || exception.reason === 'MULTIPLE_MATCHES') return 'HIGH';
  if ((exception.date_delta_days ?? 0) > 3 || exception.reason === 'AMOUNT_VARIANCE') return 'MEDIUM';
  return 'LOW';
}

function statusForSeverity(severity: ReconciliationExceptionSeverity): ReconciliationExceptionStatus {
  if (severity === 'CRITICAL') return 'ESCALATED';
  if (severity === 'HIGH') return 'READY_FOR_MANUAL_REVIEW';
  if (severity === 'MEDIUM') return 'ASSIGNED';
  return 'OPEN';
}

function normalizeException(exception: ReconciliationExceptionInput, queueRef: string, expectedAllocationBalanceRef: string): ReconciliationExceptionQueueItem {
  const exceptionRef = requireNonEmpty(exception.exception_ref, 'exceptions.exception_ref');
  const allocationBalanceRef = requireNonEmpty(exception.payment_allocation_balance_ref, 'exceptions.payment_allocation_balance_ref');
  if (allocationBalanceRef !== expectedAllocationBalanceRef) {
    throw new Error('exceptions.payment_allocation_balance_ref must match payment_allocation_balance_ref for reconciliation exception queue.');
  }
  const normalized: ReconciliationExceptionInput = {
    exception_ref: exceptionRef,
    bank_transaction_ref: requireNonEmpty(exception.bank_transaction_ref, 'exceptions.bank_transaction_ref'),
    payment_allocation_balance_ref: allocationBalanceRef,
    chart_account_ref: requireNonEmpty(exception.chart_account_ref, 'exceptions.chart_account_ref'),
    candidate_ref: optionalNonEmpty(exception.candidate_ref, 'exceptions.candidate_ref'),
    reason: requireReason(exception.reason),
    amount_delta_minor: optionalNonNegativeInteger(exception.amount_delta_minor, 'exceptions.amount_delta_minor'),
    date_delta_days: optionalNonNegativeInteger(exception.date_delta_days, 'exceptions.date_delta_days'),
    currency_code: normalizeCurrency(exception.currency_code),
    evidence_ref: requireNonEmpty(exception.evidence_ref, 'exceptions.evidence_ref'),
  };
  const severity = classifySeverity(normalized);
  return {
    ...normalized,
    severity,
    status: statusForSeverity(severity),
    queue_item_ref: `${queueRef}:${exceptionRef}`,
    queue_evidence_ref: `reconciliation_exception_queue:${queueRef}:${exceptionRef}`,
  };
}

function normalizeExceptions(exceptions: ReconciliationExceptionInput[], queueRef: string, expectedAllocationBalanceRef: string): ReconciliationExceptionQueueItem[] {
  if (!Array.isArray(exceptions) || exceptions.length === 0) {
    throw new Error('exceptions must include at least one item for reconciliation exception queue.');
  }
  const items = exceptions.map((exception) => normalizeException(exception, queueRef, expectedAllocationBalanceRef));
  const refs = items.map((item) => item.exception_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('exceptions must not repeat exception_ref for reconciliation exception queue.');
  }
  return items;
}

function digestExceptionQueue(receiptWithoutDigest: Omit<ReconciliationExceptionQueueReceipt, 'queue_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function queueReconciliationExceptions(input: ReconciliationExceptionQueueInput): ReconciliationExceptionQueueReceipt {
  if (input.manual_reconciliation_requested === true) {
    throw new Error('reconciliation exception queue must not perform manual reconciliation resolution.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('reconciliation exception queue must not perform payment allocation math.');
  }
  if (input.journal_posting_requested === true) {
    throw new Error('reconciliation exception queue must not post journals.');
  }
  if (input.statement_closure_requested === true) {
    throw new Error('reconciliation exception queue must not close reconciliation statements.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('reconciliation exception queue must not process provider callbacks.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('reconciliation exception queue must not perform irreversible actions.');
  }

  const queueRef = requireNonEmpty(input.queue_ref, 'queue_ref');
  const paymentAllocationBalanceRef = requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref');
  const items = normalizeExceptions(input.exceptions, queueRef, paymentAllocationBalanceRef);

  const receiptWithoutDigest: Omit<ReconciliationExceptionQueueReceipt, 'queue_digest'> = {
    seed_id: PHASE_6B_RECONCILIATION_EXCEPTION_QUEUE_SEED_ID,
    component_id: PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID,
    event_name: RECONCILIATION_EXCEPTION_QUEUE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    source_seed_id: requireSourceSeed(input.source_seed_id),
    queue_ref: queueRef,
    payment_allocation_balance_ref: paymentAllocationBalanceRef,
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    assigned_team_ref: requireNonEmpty(input.assigned_team_ref, 'assigned_team_ref'),
    phase_6b_reconciliation_candidate_model: 'Phase6BReconciliationCandidate',
    queue_item_count: items.length,
    high_or_critical_count: items.filter((item) => item.severity === 'HIGH' || item.severity === 'CRITICAL').length,
    items,
    manual_reconciliation_performed: false,
    payment_allocation_performed: false,
    journal_posting_performed: false,
    statement_closed: false,
    provider_callback_processed: false,
    irreversible_action_allowed: false,
    queued_by_user_id: requireNonEmpty(input.queued_by_user_id, 'queued_by_user_id'),
    queued_at: requireTimestamp(input.queued_at, 'queued_at'),
  };

  return {
    ...receiptWithoutDigest,
    queue_digest: digestExceptionQueue(receiptWithoutDigest),
  };
}
