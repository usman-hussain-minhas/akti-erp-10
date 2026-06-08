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
