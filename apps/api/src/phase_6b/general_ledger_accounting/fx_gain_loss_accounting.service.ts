import { createHash } from 'node:crypto';

export const PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_SEED_ID = 'seed_6b_12_fx_gain_loss_accounting' as const;
export const PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_COMPONENT_ID = '6B.12' as const;

export const FX_GAIN_LOSS_ACCOUNTING_EVENT = 'phase_6b.general_ledger_accounting.fx_gain_loss.accounted' as const;

export type FxSourceEvent = 'invoice.issued' | 'payment.verified' | 'expense.created';
export type FxPositionType = 'RECEIVABLE' | 'PAYABLE';
export type FxGainLossClassification = 'GAIN' | 'LOSS' | 'NEUTRAL';
export type FxJournalSide = 'DEBIT' | 'CREDIT';

export type FxAdjustmentLine = {
  adjustment_line_ref: string;
  chart_of_account_ref: string;
  side: FxJournalSide;
  amount_minor: number;
  line_evidence_ref: string;
};

export type FxGainLossAccountingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_SEED_ID;
  fx_event_ref: string;
  source_event_name: FxSourceEvent;
  source_document_ref: string;
  invoice_record_authority_ref?: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref?: string;
  journal_entry_engine_ref: string;
  chart_version_ref: string;
  accounting_period_ref: string;
  position_type: FxPositionType;
  base_currency_code: string;
  transaction_currency_code: string;
  original_base_amount_minor: number;
  settlement_base_amount_minor: number;
  exchange_rate_basis_ref: string;
  fx_gain_account_ref: string;
  fx_loss_account_ref: string;
  settlement_clearing_account_ref: string;
  accounted_by_user_id: string;
  accounted_at: string;
  journal_posting_requested?: boolean;
  payment_allocation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  tax_report_generation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type FxGainLossAccountingReceipt = {
  seed_id: typeof PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_SEED_ID;
  component_id: typeof PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_COMPONENT_ID;
  event_name: typeof FX_GAIN_LOSS_ACCOUNTING_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_SEED_ID;
  fx_event_ref: string;
  source_event_name: FxSourceEvent;
  source_document_ref: string;
  invoice_record_authority_ref?: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref?: string;
  journal_entry_engine_ref: string;
  chart_version_ref: string;
  accounting_period_ref: string;
  position_type: FxPositionType;
  base_currency_code: string;
  transaction_currency_code: string;
  original_base_amount_minor: number;
  settlement_base_amount_minor: number;
  signed_base_delta_minor: number;
  fx_gain_loss_amount_minor: number;
  fx_gain_loss_classification: FxGainLossClassification;
  exchange_rate_basis_ref: string;
  fx_gain_account_ref: string;
  fx_loss_account_ref: string;
  settlement_clearing_account_ref: string;
  fx_adjustment_lines: FxAdjustmentLine[];
  fx_adjustment_line_count: number;
  journal_balanced: true;
  fx_adjustment_journal_prepared: true;
  journal_posting_delegated_to_journal_entry_engine: true;
  journal_posting_performed: false;
  payment_allocation_performed: false;
  provider_callback_processed: false;
  tax_report_generated: false;
  irreversible_action_allowed: false;
  adl_refs: readonly string[];
  fx_gain_loss_evidence_ref: string;
  fx_gain_loss_digest: string;
  accounted_by_user_id: string;
  accounted_at: string;
};

const SOURCE_EVENTS: readonly FxSourceEvent[] = ['invoice.issued', 'payment.verified', 'expense.created'] as const;
const POSITION_TYPES: readonly FxPositionType[] = ['RECEIVABLE', 'PAYABLE'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for FX gain/loss accounting.`);
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
    throw new Error(`${field} must be a valid ISO-compatible timestamp for FX gain/loss accounting.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_12_fx_gain_loss_accounting.');
  }
  return PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_SEED_ID;
}

function normalizeCurrency(value: string, field: string): string {
  const currency = requireNonEmpty(value, field).toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error(`${field} must be a three-letter ISO-style code for FX gain/loss accounting.`);
  }
  return currency;
}

function requireSourceEvent(value: FxSourceEvent): FxSourceEvent {
  if (!SOURCE_EVENTS.includes(value)) {
    throw new Error('source_event_name is not supported for FX gain/loss accounting.');
  }
  return value;
}

function requirePositionType(value: FxPositionType): FxPositionType {
  if (!POSITION_TYPES.includes(value)) {
    throw new Error('position_type is not supported for FX gain/loss accounting.');
  }
  return value;
}

function requireNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for FX gain/loss accounting.`);
  }
  return value;
}

function requireSourceSpecificRef(input: FxGainLossAccountingInput, sourceEventName: FxSourceEvent): {
  invoice_record_authority_ref?: string;
  expense_record_authority_ref?: string;
} {
  const invoiceRecordAuthorityRef = optionalNonEmpty(input.invoice_record_authority_ref, 'invoice_record_authority_ref');
  const expenseRecordAuthorityRef = optionalNonEmpty(input.expense_record_authority_ref, 'expense_record_authority_ref');
  if (sourceEventName === 'invoice.issued' && invoiceRecordAuthorityRef === undefined) {
    throw new Error('invoice_record_authority_ref is required when source_event_name is invoice.issued.');
  }
  if (sourceEventName === 'expense.created' && expenseRecordAuthorityRef === undefined) {
    throw new Error('expense_record_authority_ref is required when source_event_name is expense.created.');
  }
  return { invoice_record_authority_ref: invoiceRecordAuthorityRef, expense_record_authority_ref: expenseRecordAuthorityRef };
}

function classifyFx(positionType: FxPositionType, signedBaseDeltaMinor: number): FxGainLossClassification {
  if (signedBaseDeltaMinor === 0) return 'NEUTRAL';
  if (positionType === 'RECEIVABLE') return signedBaseDeltaMinor > 0 ? 'GAIN' : 'LOSS';
  return signedBaseDeltaMinor < 0 ? 'GAIN' : 'LOSS';
}

function buildAdjustmentLines(input: {
  fxEventRef: string;
  classification: FxGainLossClassification;
  amountMinor: number;
  fxGainAccountRef: string;
  fxLossAccountRef: string;
  settlementClearingAccountRef: string;
}): FxAdjustmentLine[] {
  if (input.classification === 'NEUTRAL') return [];
  const gainOrLossLine: FxAdjustmentLine = {
    adjustment_line_ref: `${input.fxEventRef}:fx_${input.classification.toLowerCase()}`,
    chart_of_account_ref: input.classification === 'GAIN' ? input.fxGainAccountRef : input.fxLossAccountRef,
    side: input.classification === 'GAIN' ? 'CREDIT' : 'DEBIT',
    amount_minor: input.amountMinor,
    line_evidence_ref: `${input.fxEventRef}:fx_${input.classification.toLowerCase()}_evidence`,
  };
  const clearingLine: FxAdjustmentLine = {
    adjustment_line_ref: `${input.fxEventRef}:settlement_clearing`,
    chart_of_account_ref: input.settlementClearingAccountRef,
    side: input.classification === 'GAIN' ? 'DEBIT' : 'CREDIT',
    amount_minor: input.amountMinor,
    line_evidence_ref: `${input.fxEventRef}:settlement_clearing_evidence`,
  };
  return [gainOrLossLine, clearingLine];
}

function digestFxGainLoss(receiptWithoutDigest: Omit<FxGainLossAccountingReceipt, 'fx_gain_loss_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function accountForFxGainLoss(input: FxGainLossAccountingInput): FxGainLossAccountingReceipt {
  if (input.journal_posting_requested === true) {
    throw new Error('FX gain/loss accounting must prepare adjustment lines, not post journals directly.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('FX gain/loss accounting must not perform payment allocation math.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('FX gain/loss accounting must not process provider callbacks.');
  }
  if (input.tax_report_generation_requested === true) {
    throw new Error('FX gain/loss accounting must not generate tax reports.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('FX gain/loss accounting must not perform irreversible actions.');
  }

  const sourceEventName = requireSourceEvent(input.source_event_name);
  const sourceRefs = requireSourceSpecificRef(input, sourceEventName);
  const positionType = requirePositionType(input.position_type);
  const baseCurrencyCode = normalizeCurrency(input.base_currency_code, 'base_currency_code');
  const transactionCurrencyCode = normalizeCurrency(input.transaction_currency_code, 'transaction_currency_code');
  if (baseCurrencyCode === transactionCurrencyCode) {
    throw new Error('base_currency_code and transaction_currency_code must differ for ADL-016 FX gain/loss accounting.');
  }
  const originalBaseAmountMinor = requireNonNegativeInteger(input.original_base_amount_minor, 'original_base_amount_minor');
  const settlementBaseAmountMinor = requireNonNegativeInteger(input.settlement_base_amount_minor, 'settlement_base_amount_minor');
  const signedBaseDeltaMinor = settlementBaseAmountMinor - originalBaseAmountMinor;
  const classification = classifyFx(positionType, signedBaseDeltaMinor);
  const amountMinor = Math.abs(signedBaseDeltaMinor);
  const fxEventRef = requireNonEmpty(input.fx_event_ref, 'fx_event_ref');
  const fxGainAccountRef = requireNonEmpty(input.fx_gain_account_ref, 'fx_gain_account_ref');
  const fxLossAccountRef = requireNonEmpty(input.fx_loss_account_ref, 'fx_loss_account_ref');
  const settlementClearingAccountRef = requireNonEmpty(input.settlement_clearing_account_ref, 'settlement_clearing_account_ref');
  const adjustmentLines = buildAdjustmentLines({
    fxEventRef,
    classification,
    amountMinor,
    fxGainAccountRef,
    fxLossAccountRef,
    settlementClearingAccountRef,
  });

  const receiptWithoutDigest: Omit<FxGainLossAccountingReceipt, 'fx_gain_loss_digest'> = {
    seed_id: PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_SEED_ID,
    component_id: PHASE_6B_FX_GAIN_LOSS_ACCOUNTING_COMPONENT_ID,
    event_name: FX_GAIN_LOSS_ACCOUNTING_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_seed_id: requireSourceSeed(input.source_seed_id),
    fx_event_ref: fxEventRef,
    source_event_name: sourceEventName,
    source_document_ref: requireNonEmpty(input.source_document_ref, 'source_document_ref'),
    invoice_record_authority_ref: sourceRefs.invoice_record_authority_ref,
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    expense_record_authority_ref: sourceRefs.expense_record_authority_ref,
    journal_entry_engine_ref: requireNonEmpty(input.journal_entry_engine_ref, 'journal_entry_engine_ref'),
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    accounting_period_ref: requireNonEmpty(input.accounting_period_ref, 'accounting_period_ref'),
    position_type: positionType,
    base_currency_code: baseCurrencyCode,
    transaction_currency_code: transactionCurrencyCode,
    original_base_amount_minor: originalBaseAmountMinor,
    settlement_base_amount_minor: settlementBaseAmountMinor,
    signed_base_delta_minor: signedBaseDeltaMinor,
    fx_gain_loss_amount_minor: amountMinor,
    fx_gain_loss_classification: classification,
    exchange_rate_basis_ref: requireNonEmpty(input.exchange_rate_basis_ref, 'exchange_rate_basis_ref'),
    fx_gain_account_ref: fxGainAccountRef,
    fx_loss_account_ref: fxLossAccountRef,
    settlement_clearing_account_ref: settlementClearingAccountRef,
    fx_adjustment_lines: adjustmentLines,
    fx_adjustment_line_count: adjustmentLines.length,
    journal_balanced: true,
    fx_adjustment_journal_prepared: true,
    journal_posting_delegated_to_journal_entry_engine: true,
    journal_posting_performed: false,
    payment_allocation_performed: false,
    provider_callback_processed: false,
    tax_report_generated: false,
    irreversible_action_allowed: false,
    adl_refs: ['ADL-016'],
    fx_gain_loss_evidence_ref: `fx_gain_loss:${fxEventRef}:${classification.toLowerCase()}`,
    accounted_by_user_id: requireNonEmpty(input.accounted_by_user_id, 'accounted_by_user_id'),
    accounted_at: requireTimestamp(input.accounted_at, 'accounted_at'),
  };

  return {
    ...receiptWithoutDigest,
    fx_gain_loss_digest: digestFxGainLoss(receiptWithoutDigest),
  };
}
