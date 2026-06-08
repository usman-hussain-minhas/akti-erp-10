export const PHASE_6B_TOP_UP_PREPAID_CREDIT_SEED_ID = 'seed_6b_10_top_up_prepaid_credit' as const;
export const PHASE_6B_TOP_UP_PREPAID_CREDIT_COMPONENT_ID = '6B.10' as const;

export const TOP_UP_PREPAID_CREDIT_EVENT = 'phase_6b.payment_collection_topup.prepaid_credit.top_up_recorded' as const;

export type TopUpPrepaidCreditStatus = 'PREPAID_CREDIT_READY_TO_RECORD';

export type TopUpPrepaidCreditInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  provider_transaction_evidence_ref: string;
  prepaid_account_ref: string;
  currency_code: string;
  current_prepaid_balance_minor: number;
  top_up_amount_minor: number;
  requested_by_user_id: string;
  credited_at: string;
  live_provider_dispatch_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  payment_allocation_requested?: boolean;
  reconciliation_requested?: boolean;
  refund_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type TopUpPrepaidCreditReceipt = {
  seed_id: typeof PHASE_6B_TOP_UP_PREPAID_CREDIT_SEED_ID;
  component_id: typeof PHASE_6B_TOP_UP_PREPAID_CREDIT_COMPONENT_ID;
  event_name: typeof TOP_UP_PREPAID_CREDIT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  provider_transaction_evidence_ref: string;
  prepaid_account_ref: string;
  currency_code: string;
  previous_prepaid_balance_minor: number;
  top_up_amount_minor: number;
  new_prepaid_balance_minor: number;
  status: TopUpPrepaidCreditStatus;
  prepaid_balance_source_of_truth: true;
  top_up_credit_evidence_ref: string;
  live_provider_dispatch_performed: false;
  provider_callback_processed: false;
  payment_allocation_performed: false;
  reconciliation_performed: false;
  refund_performed: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  credited_at: string;
};

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for top up prepaid credit.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for top up prepaid credit.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for top up prepaid credit.');
  }
  return currency;
}

function normalizeNonNegativeAmount(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for top up prepaid credit.`);
  }
  return value;
}

function normalizePositiveAmount(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer for top up prepaid credit.`);
  }
  return value;
}

export function recordTopUpPrepaidCredit(input: TopUpPrepaidCreditInput): TopUpPrepaidCreditReceipt {
  if (input.live_provider_dispatch_requested === true) {
    throw new Error('top up prepaid credit must not perform live provider dispatch.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('top up prepaid credit must not process provider callbacks.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('top up prepaid credit must not perform payment allocation math.');
  }
  if (input.reconciliation_requested === true) {
    throw new Error('top up prepaid credit must not perform reconciliation behavior.');
  }
  if (input.refund_requested === true) {
    throw new Error('top up prepaid credit must not execute refunds.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('top up prepaid credit must not perform irreversible actions.');
  }

  const currentBalance = normalizeNonNegativeAmount(input.current_prepaid_balance_minor, 'current_prepaid_balance_minor');
  const topUpAmount = normalizePositiveAmount(input.top_up_amount_minor, 'top_up_amount_minor');
  const newBalance = currentBalance + topUpAmount;
  const prepaidAccountRef = requireNonEmpty(input.prepaid_account_ref, 'prepaid_account_ref');
  const paymentReceiptRef = requireNonEmpty(input.payment_receipt_ref, 'payment_receipt_ref');
  const paymentEvidenceRef = requireNonEmpty(input.payment_evidence_ref, 'payment_evidence_ref');

  return {
    seed_id: PHASE_6B_TOP_UP_PREPAID_CREDIT_SEED_ID,
    component_id: PHASE_6B_TOP_UP_PREPAID_CREDIT_COMPONENT_ID,
    event_name: TOP_UP_PREPAID_CREDIT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    api_key_scope_registry_ref: requireNonEmpty(input.api_key_scope_registry_ref, 'api_key_scope_registry_ref'),
    invoice_record_ref: requireNonEmpty(input.invoice_record_ref, 'invoice_record_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref'),
    payment_receipt_ref: paymentReceiptRef,
    payment_evidence_ref: paymentEvidenceRef,
    provider_transaction_evidence_ref: requireNonEmpty(input.provider_transaction_evidence_ref, 'provider_transaction_evidence_ref'),
    prepaid_account_ref: prepaidAccountRef,
    currency_code: normalizeCurrency(input.currency_code),
    previous_prepaid_balance_minor: currentBalance,
    top_up_amount_minor: topUpAmount,
    new_prepaid_balance_minor: newBalance,
    status: 'PREPAID_CREDIT_READY_TO_RECORD',
    prepaid_balance_source_of_truth: true,
    top_up_credit_evidence_ref: `top_up_credit:${prepaidAccountRef}:${paymentReceiptRef}:${paymentEvidenceRef}`,
    live_provider_dispatch_performed: false,
    provider_callback_processed: false,
    payment_allocation_performed: false,
    reconciliation_performed: false,
    refund_performed: false,
    irreversible_action_allowed: false,
    requested_by_user_id: requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id'),
    credited_at: requireTimestamp(input.credited_at, 'credited_at'),
  };
}
