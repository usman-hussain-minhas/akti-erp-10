export const PHASE_6B_REFUND_TO_ORIGINAL_METHOD_SEED_ID = 'seed_6b_10_refund_to_original_method' as const;
export const PHASE_6B_REFUND_TO_ORIGINAL_METHOD_COMPONENT_ID = '6B.10' as const;

export const REFUND_TO_ORIGINAL_METHOD_EVENT = 'phase_6b.payment_collection_topup.refund.original_method_intent_prepared' as const;

export type RefundToOriginalMethodReason = 'CUSTOMER_REQUEST' | 'DUPLICATE_PAYMENT' | 'SERVICE_CREDIT' | 'OVERPAYMENT';
export type RefundToOriginalMethodStatus = 'READY_FOR_PROVIDER_DISPATCH';

export type RefundToOriginalMethodInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  original_provider_ref: string;
  original_payment_method_ref: string;
  refund_request_ref: string;
  refund_reason: RefundToOriginalMethodReason;
  currency_code: string;
  original_payment_amount_minor: number;
  prior_refunded_minor: number;
  refund_amount_minor: number;
  requested_by_user_id: string;
  requested_at: string;
  alternate_refund_method_ref?: string;
  live_provider_dispatch_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  payment_allocation_requested?: boolean;
  reconciliation_requested?: boolean;
  top_up_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type RefundToOriginalMethodReceipt = {
  seed_id: typeof PHASE_6B_REFUND_TO_ORIGINAL_METHOD_SEED_ID;
  component_id: typeof PHASE_6B_REFUND_TO_ORIGINAL_METHOD_COMPONENT_ID;
  event_name: typeof REFUND_TO_ORIGINAL_METHOD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  original_provider_ref: string;
  original_payment_method_ref: string;
  refund_request_ref: string;
  refund_reason: RefundToOriginalMethodReason;
  currency_code: string;
  original_payment_amount_minor: number;
  prior_refunded_minor: number;
  refund_amount_minor: number;
  remaining_refundable_minor: number;
  status: RefundToOriginalMethodStatus;
  provider_refund_evidence_ref: string;
  original_method_enforced: true;
  live_provider_dispatch_performed: false;
  provider_callback_processed: false;
  payment_allocation_performed: false;
  reconciliation_performed: false;
  top_up_performed: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  prepared_at: string;
};

const REASONS: readonly RefundToOriginalMethodReason[] = ['CUSTOMER_REQUEST', 'DUPLICATE_PAYMENT', 'SERVICE_CREDIT', 'OVERPAYMENT'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for refund to original method.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for refund to original method.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for refund to original method.');
  }
  return currency;
}

function normalizePositiveAmount(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer for refund to original method.`);
  }
  return value;
}

function normalizeNonNegativeAmount(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for refund to original method.`);
  }
  return value;
}

function requireReason(value: RefundToOriginalMethodReason): RefundToOriginalMethodReason {
  if (!REASONS.includes(value)) {
    throw new Error('refund_reason is not supported for refund to original method.');
  }
  return value;
}

export function prepareRefundToOriginalMethod(input: RefundToOriginalMethodInput): RefundToOriginalMethodReceipt {
  if (input.alternate_refund_method_ref !== undefined && input.alternate_refund_method_ref.trim().length > 0) {
    throw new Error('refund to original method must not use an alternate refund method.');
  }
  if (input.live_provider_dispatch_requested === true) {
    throw new Error('refund to original method must not perform live provider dispatch.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('refund to original method must not process provider callbacks.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('refund to original method must not perform payment allocation math.');
  }
  if (input.reconciliation_requested === true) {
    throw new Error('refund to original method must not perform reconciliation behavior.');
  }
  if (input.top_up_requested === true) {
    throw new Error('refund to original method must not execute top-ups.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('refund to original method must not perform irreversible actions.');
  }

  const originalPaymentAmountMinor = normalizePositiveAmount(input.original_payment_amount_minor, 'original_payment_amount_minor');
  const priorRefundedMinor = normalizeNonNegativeAmount(input.prior_refunded_minor, 'prior_refunded_minor');
  const refundAmountMinor = normalizePositiveAmount(input.refund_amount_minor, 'refund_amount_minor');
  if (priorRefundedMinor > originalPaymentAmountMinor) {
    throw new Error('prior_refunded_minor must not exceed original_payment_amount_minor for refund to original method.');
  }
  const refundableBeforeRequest = originalPaymentAmountMinor - priorRefundedMinor;
  if (refundAmountMinor > refundableBeforeRequest) {
    throw new Error('refund_amount_minor must not exceed remaining refundable balance for refund to original method.');
  }

  const paymentReceiptRef = requireNonEmpty(input.payment_receipt_ref, 'payment_receipt_ref');
  const refundRequestRef = requireNonEmpty(input.refund_request_ref, 'refund_request_ref');
  const originalProviderRef = requireNonEmpty(input.original_provider_ref, 'original_provider_ref');
  const originalPaymentMethodRef = requireNonEmpty(input.original_payment_method_ref, 'original_payment_method_ref');

  return {
    seed_id: PHASE_6B_REFUND_TO_ORIGINAL_METHOD_SEED_ID,
    component_id: PHASE_6B_REFUND_TO_ORIGINAL_METHOD_COMPONENT_ID,
    event_name: REFUND_TO_ORIGINAL_METHOD_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    api_key_scope_registry_ref: requireNonEmpty(input.api_key_scope_registry_ref, 'api_key_scope_registry_ref'),
    invoice_record_ref: requireNonEmpty(input.invoice_record_ref, 'invoice_record_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref'),
    payment_receipt_ref: paymentReceiptRef,
    payment_evidence_ref: requireNonEmpty(input.payment_evidence_ref, 'payment_evidence_ref'),
    original_provider_ref: originalProviderRef,
    original_payment_method_ref: originalPaymentMethodRef,
    refund_request_ref: refundRequestRef,
    refund_reason: requireReason(input.refund_reason),
    currency_code: normalizeCurrency(input.currency_code),
    original_payment_amount_minor: originalPaymentAmountMinor,
    prior_refunded_minor: priorRefundedMinor,
    refund_amount_minor: refundAmountMinor,
    remaining_refundable_minor: refundableBeforeRequest - refundAmountMinor,
    status: 'READY_FOR_PROVIDER_DISPATCH',
    provider_refund_evidence_ref: `provider_refund_evidence:${originalProviderRef}:${paymentReceiptRef}:${refundRequestRef}`,
    original_method_enforced: true,
    live_provider_dispatch_performed: false,
    provider_callback_processed: false,
    payment_allocation_performed: false,
    reconciliation_performed: false,
    top_up_performed: false,
    irreversible_action_allowed: false,
    requested_by_user_id: requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id'),
    prepared_at: requireTimestamp(input.requested_at, 'requested_at'),
  };
}
