export const PHASE_6B_PAYMENT_ALLOCATION_BALANCE_SEED_ID = 'seed_6b_10_payment_allocation_balance' as const;
export const PHASE_6B_PAYMENT_ALLOCATION_BALANCE_COMPONENT_ID = '6B.10' as const;

export const PAYMENT_ALLOCATION_BALANCE_EVENT = 'phase_6b.payment_collection_topup.payment_allocation.balance_computed' as const;
export const PAYMENT_ALLOCATION_BALANCE_INVOICE_ADL_REF = 'ADL-013' as const;

export type PaymentAllocationStatus = 'UNALLOCATED' | 'PARTIALLY_ALLOCATED' | 'FULLY_ALLOCATED';

export type PaymentAllocationLineInput = {
  allocation_line_ref: string;
  invoice_record_ref: string;
  receivable_ref: string;
  invoice_total_minor: number;
  existing_allocated_minor: number;
  allocation_amount_minor: number;
  payment_evidence_ref: string;
};

export type PaymentAllocationBalanceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  currency_code: string;
  payment_amount_minor: number;
  allocated_by_user_id: string;
  allocated_at: string;
  allocation_lines: PaymentAllocationLineInput[];
  api_key_scope_registry_ref?: string;
  provider_callback_processing_requested?: boolean;
  reconciliation_requested?: boolean;
  refund_requested?: boolean;
  top_up_requested?: boolean;
  invoice_mutation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PaymentAllocationBalanceEntry = {
  allocation_line_ref: string;
  invoice_record_ref: string;
  receivable_ref: string;
  invoice_total_minor: number;
  existing_allocated_minor: number;
  allocation_amount_minor: number;
  invoice_remaining_balance_minor: number;
  payment_evidence_ref: string;
  status: PaymentAllocationStatus;
};

export type PaymentAllocationBalanceReceipt = {
  seed_id: typeof PHASE_6B_PAYMENT_ALLOCATION_BALANCE_SEED_ID;
  component_id: typeof PHASE_6B_PAYMENT_ALLOCATION_BALANCE_COMPONENT_ID;
  event_name: typeof PAYMENT_ALLOCATION_BALANCE_EVENT;
  invoice_record_authority_adl_ref: typeof PAYMENT_ALLOCATION_BALANCE_INVOICE_ADL_REF;
  organization_id: string;
  service_manifest_contract_id: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  currency_code: string;
  payment_amount_minor: number;
  total_newly_allocated_minor: number;
  unallocated_payment_balance_minor: number;
  allocation_entries: PaymentAllocationBalanceEntry[];
  provider_neutral: true;
  api_key_scope_consumed: false;
  provider_callback_processed: false;
  reconciliation_performed: false;
  refund_performed: false;
  top_up_performed: false;
  invoice_mutation_performed: false;
  irreversible_action_allowed: false;
  allocated_by_user_id: string;
  allocated_at: string;
};

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for payment allocation balance.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for payment allocation balance.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for payment allocation balance.');
  }
  return currency;
}

function normalizePositiveAmount(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer for payment allocation balance.`);
  }
  return value;
}

function normalizeNonNegativeAmount(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for payment allocation balance.`);
  }
  return value;
}

function statusFor(invoiceRemainingBalanceMinor: number, invoiceTotalMinor: number): PaymentAllocationStatus {
  if (invoiceRemainingBalanceMinor === invoiceTotalMinor) return 'UNALLOCATED';
  if (invoiceRemainingBalanceMinor === 0) return 'FULLY_ALLOCATED';
  return 'PARTIALLY_ALLOCATED';
}

function normalizeLine(line: PaymentAllocationLineInput): PaymentAllocationBalanceEntry {
  const invoiceTotalMinor = normalizePositiveAmount(line.invoice_total_minor, 'allocation_lines.invoice_total_minor');
  const existingAllocatedMinor = normalizeNonNegativeAmount(line.existing_allocated_minor, 'allocation_lines.existing_allocated_minor');
  const allocationAmountMinor = normalizeNonNegativeAmount(line.allocation_amount_minor, 'allocation_lines.allocation_amount_minor');
  if (existingAllocatedMinor > invoiceTotalMinor) {
    throw new Error('existing_allocated_minor must not exceed invoice_total_minor for payment allocation balance.');
  }
  const availableInvoiceBalanceMinor = invoiceTotalMinor - existingAllocatedMinor;
  if (allocationAmountMinor > availableInvoiceBalanceMinor) {
    throw new Error('allocation_amount_minor must not exceed available invoice balance for payment allocation balance.');
  }
  const invoiceRemainingBalanceMinor = availableInvoiceBalanceMinor - allocationAmountMinor;
  return {
    allocation_line_ref: requireNonEmpty(line.allocation_line_ref, 'allocation_lines.allocation_line_ref'),
    invoice_record_ref: requireNonEmpty(line.invoice_record_ref, 'allocation_lines.invoice_record_ref'),
    receivable_ref: requireNonEmpty(line.receivable_ref, 'allocation_lines.receivable_ref'),
    invoice_total_minor: invoiceTotalMinor,
    existing_allocated_minor: existingAllocatedMinor,
    allocation_amount_minor: allocationAmountMinor,
    invoice_remaining_balance_minor: invoiceRemainingBalanceMinor,
    payment_evidence_ref: requireNonEmpty(line.payment_evidence_ref, 'allocation_lines.payment_evidence_ref'),
    status: statusFor(invoiceRemainingBalanceMinor, invoiceTotalMinor),
  };
}

function normalizeLines(lines: PaymentAllocationLineInput[]): PaymentAllocationBalanceEntry[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('allocation_lines must include at least one line for payment allocation balance.');
  }
  const entries = lines.map((line) => normalizeLine(line));
  const refs = entries.map((entry) => entry.allocation_line_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('allocation_lines must not repeat allocation_line_ref for payment allocation balance.');
  }
  return entries;
}

export function computePaymentAllocationBalance(input: PaymentAllocationBalanceInput): PaymentAllocationBalanceReceipt {
  if (input.api_key_scope_registry_ref !== undefined && input.api_key_scope_registry_ref.trim().length > 0) {
    throw new Error('payment allocation balance must remain provider-neutral and must not consume API-key scope.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('payment allocation balance must not process provider callbacks.');
  }
  if (input.reconciliation_requested === true) {
    throw new Error('payment allocation balance must not perform reconciliation behavior.');
  }
  if (input.refund_requested === true) {
    throw new Error('payment allocation balance must not execute refunds.');
  }
  if (input.top_up_requested === true) {
    throw new Error('payment allocation balance must not execute top-ups.');
  }
  if (input.invoice_mutation_requested === true) {
    throw new Error('payment allocation balance must not mutate invoice records.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('payment allocation balance must not perform irreversible actions.');
  }

  const paymentAmountMinor = normalizePositiveAmount(input.payment_amount_minor, 'payment_amount_minor');
  const entries = normalizeLines(input.allocation_lines);
  const totalNewlyAllocatedMinor = entries.reduce((total, entry) => total + entry.allocation_amount_minor, 0);
  if (totalNewlyAllocatedMinor > paymentAmountMinor) {
    throw new Error('total allocation_amount_minor must not exceed payment_amount_minor for payment allocation balance.');
  }

  return {
    seed_id: PHASE_6B_PAYMENT_ALLOCATION_BALANCE_SEED_ID,
    component_id: PHASE_6B_PAYMENT_ALLOCATION_BALANCE_COMPONENT_ID,
    event_name: PAYMENT_ALLOCATION_BALANCE_EVENT,
    invoice_record_authority_adl_ref: PAYMENT_ALLOCATION_BALANCE_INVOICE_ADL_REF,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    pricing_table_effective_date_ref: requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref'),
    payment_receipt_ref: requireNonEmpty(input.payment_receipt_ref, 'payment_receipt_ref'),
    payment_evidence_ref: requireNonEmpty(input.payment_evidence_ref, 'payment_evidence_ref'),
    currency_code: normalizeCurrency(input.currency_code),
    payment_amount_minor: paymentAmountMinor,
    total_newly_allocated_minor: totalNewlyAllocatedMinor,
    unallocated_payment_balance_minor: paymentAmountMinor - totalNewlyAllocatedMinor,
    allocation_entries: entries,
    provider_neutral: true,
    api_key_scope_consumed: false,
    provider_callback_processed: false,
    reconciliation_performed: false,
    refund_performed: false,
    top_up_performed: false,
    invoice_mutation_performed: false,
    irreversible_action_allowed: false,
    allocated_by_user_id: requireNonEmpty(input.allocated_by_user_id, 'allocated_by_user_id'),
    allocated_at: requireTimestamp(input.allocated_at, 'allocated_at'),
  };
}
