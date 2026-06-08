export const PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_SEED_ID = 'seed_6b_09_receivable_balance_computation' as const;
export const PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_COMPONENT_ID = '6B.09' as const;

export const RECEIVABLE_BALANCE_COMPUTATION_EVENT = 'phase_6b.finance_invoice_receivables.receivable_balance.computed' as const;

export type ReceivablePaymentTermBasis = 'DUE_ON_RECEIPT' | 'NET_DAYS';
export type ReceivableBalanceStatus = 'OPEN' | 'SETTLED' | 'OVERDUE';

export type ReceivablePaymentTerms = {
  basis: ReceivablePaymentTermBasis;
  net_days?: number;
};

export type ReceivableBalanceComputationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  receivable_id: string;
  invoice_record_ref: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  currency_code: string;
  invoice_total_minor: number;
  debit_note_total_minor: number;
  credit_note_total_minor: number;
  applied_payment_total_minor: number;
  invoice_issued_at: string;
  as_of: string;
  payment_terms: ReceivablePaymentTerms;
  computed_by_user_id: string;
  payment_allocation_requested?: boolean;
  provider_callback_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ReceivableBalanceComputationReceipt = {
  seed_id: typeof PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_SEED_ID;
  component_id: typeof PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_COMPONENT_ID;
  event_name: typeof RECEIVABLE_BALANCE_COMPUTATION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  receivable_id: string;
  invoice_record_ref: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  currency_code: string;
  invoice_total_minor: number;
  debit_note_total_minor: number;
  credit_note_total_minor: number;
  applied_payment_total_minor: number;
  receivable_balance_minor: number;
  status: ReceivableBalanceStatus;
  due_at: string;
  days_past_due: number;
  payment_allocation_performed: false;
  provider_callback_processing_allowed: false;
  irreversible_action_allowed: false;
  computed_by_user_id: string;
  computed_at: string;
};

const TERM_BASES: readonly ReceivablePaymentTermBasis[] = ['DUE_ON_RECEIPT', 'NET_DAYS'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for receivable balance computation.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for receivable balance computation.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for receivable balance computation.');
  }
  return currency;
}

function normalizeMinorAmount(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for receivable balance computation.`);
  }
  return value;
}

function normalizePaymentTerms(terms: ReceivablePaymentTerms): ReceivablePaymentTerms {
  if (!terms || !TERM_BASES.includes(terms.basis)) {
    throw new Error('payment_terms.basis is not supported for receivable balance computation.');
  }
  if (terms.basis === 'DUE_ON_RECEIPT') {
    if (terms.net_days !== undefined) {
      throw new Error('DUE_ON_RECEIPT payment terms must not carry net_days for receivable balance computation.');
    }
    return { basis: terms.basis };
  }
  const netDays = terms.net_days;
  if (typeof netDays !== 'number' || !Number.isInteger(netDays) || netDays < 1) {
    throw new Error('NET_DAYS payment terms require positive net_days for receivable balance computation.');
  }
  return { basis: terms.basis, net_days: netDays };
}

function dueAt(invoiceIssuedAt: string, terms: ReceivablePaymentTerms): string {
  const issuedMs = Date.parse(invoiceIssuedAt);
  const offsetDays = terms.basis === 'NET_DAYS' ? terms.net_days ?? 0 : 0;
  return new Date(issuedMs + offsetDays * DAY_MS).toISOString();
}

function balanceStatus(balanceMinor: number, dueAtValue: string, asOf: string): { status: ReceivableBalanceStatus; daysPastDue: number } {
  if (balanceMinor === 0) return { status: 'SETTLED', daysPastDue: 0 };
  const dueMs = Date.parse(dueAtValue);
  const asOfMs = Date.parse(asOf);
  if (asOfMs > dueMs) {
    return { status: 'OVERDUE', daysPastDue: Math.floor((asOfMs - dueMs) / DAY_MS) };
  }
  return { status: 'OPEN', daysPastDue: 0 };
}

export function computeReceivableBalance(input: ReceivableBalanceComputationInput): ReceivableBalanceComputationReceipt {
  if (input.payment_allocation_requested === true) {
    throw new Error('receivable balance computation must not perform payment allocation math.');
  }
  if (input.provider_callback_requested === true) {
    throw new Error('receivable balance computation must not process provider callbacks.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('receivable balance computation must not perform irreversible actions.');
  }

  const invoiceIssuedAt = requireTimestamp(input.invoice_issued_at, 'invoice_issued_at');
  const asOf = requireTimestamp(input.as_of, 'as_of');
  if (Date.parse(asOf) < Date.parse(invoiceIssuedAt)) {
    throw new Error('as_of must not be earlier than invoice_issued_at for receivable balance computation.');
  }

  const invoiceTotalMinor = normalizeMinorAmount(input.invoice_total_minor, 'invoice_total_minor');
  const debitNoteTotalMinor = normalizeMinorAmount(input.debit_note_total_minor, 'debit_note_total_minor');
  const creditNoteTotalMinor = normalizeMinorAmount(input.credit_note_total_minor, 'credit_note_total_minor');
  const appliedPaymentTotalMinor = normalizeMinorAmount(input.applied_payment_total_minor, 'applied_payment_total_minor');
  const grossReceivableMinor = invoiceTotalMinor + debitNoteTotalMinor;
  if (creditNoteTotalMinor + appliedPaymentTotalMinor > grossReceivableMinor) {
    throw new Error('credits plus applied payments must not exceed gross receivable for receivable balance computation.');
  }
  const paymentTerms = normalizePaymentTerms(input.payment_terms);
  const dueAtValue = dueAt(invoiceIssuedAt, paymentTerms);
  const receivableBalanceMinor = grossReceivableMinor - creditNoteTotalMinor - appliedPaymentTotalMinor;
  const status = balanceStatus(receivableBalanceMinor, dueAtValue, asOf);

  return {
    seed_id: PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_SEED_ID,
    component_id: PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_COMPONENT_ID,
    event_name: RECEIVABLE_BALANCE_COMPUTATION_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    receivable_id: requireNonEmpty(input.receivable_id, 'receivable_id'),
    invoice_record_ref: requireNonEmpty(input.invoice_record_ref, 'invoice_record_ref'),
    product_record_authority_ref: requireNonEmpty(input.product_record_authority_ref, 'product_record_authority_ref'),
    product_price_history_ref: requireNonEmpty(input.product_price_history_ref, 'product_price_history_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    currency_code: normalizeCurrency(input.currency_code),
    invoice_total_minor: invoiceTotalMinor,
    debit_note_total_minor: debitNoteTotalMinor,
    credit_note_total_minor: creditNoteTotalMinor,
    applied_payment_total_minor: appliedPaymentTotalMinor,
    receivable_balance_minor: receivableBalanceMinor,
    status: status.status,
    due_at: dueAtValue,
    days_past_due: status.daysPastDue,
    payment_allocation_performed: false,
    provider_callback_processing_allowed: false,
    irreversible_action_allowed: false,
    computed_by_user_id: requireNonEmpty(input.computed_by_user_id, 'computed_by_user_id'),
    computed_at: asOf,
  };
}
