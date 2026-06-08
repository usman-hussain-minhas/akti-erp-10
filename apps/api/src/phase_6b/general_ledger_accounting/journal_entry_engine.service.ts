import { createHash } from 'node:crypto';

export const PHASE_6B_JOURNAL_ENTRY_ENGINE_SEED_ID = 'seed_6b_12_journal_entry_engine' as const;
export const PHASE_6B_JOURNAL_ENTRY_ENGINE_COMPONENT_ID = '6B.12' as const;

export const JOURNAL_ENTRY_ENGINE_EVENT = 'phase_6b.general_ledger_accounting.journal.posted' as const;

export type JournalSourceEvent = 'invoice.issued' | 'payment.verified' | 'expense.created';
export type JournalEntrySide = 'DEBIT' | 'CREDIT';

export type JournalEntryLineInput = {
  journal_entry_line_ref: string;
  chart_of_account_ref: string;
  side: JournalEntrySide;
  amount_minor: number;
  line_evidence_ref: string;
};

export type JournalEntryEngineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_JOURNAL_ENTRY_ENGINE_SEED_ID;
  journal_entry_ref: string;
  chart_version_ref: string;
  accounting_period_ref: string;
  accounting_period_open: boolean;
  source_event_name: JournalSourceEvent;
  source_event_ref: string;
  invoice_record_authority_ref?: string;
  payment_allocation_balance_ref?: string;
  expense_record_authority_ref?: string;
  base_currency_code: string;
  transaction_currency_code: string;
  exchange_rate_basis_ref?: string;
  fx_gain_loss_amount_minor?: number;
  fx_gain_loss_account_ref?: string;
  journal_lines: JournalEntryLineInput[];
  posted_by_user_id: string;
  posted_at: string;
  period_close_requested?: boolean;
  tax_report_generation_requested?: boolean;
  payment_allocation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type JournalEntryEngineReceipt = {
  seed_id: typeof PHASE_6B_JOURNAL_ENTRY_ENGINE_SEED_ID;
  component_id: typeof PHASE_6B_JOURNAL_ENTRY_ENGINE_COMPONENT_ID;
  event_name: typeof JOURNAL_ENTRY_ENGINE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_journal_entry_model: 'Phase6BJournalEntry';
  phase_6b_journal_entry_line_model: 'Phase6BJournalEntryLine';
  source_seed_id: typeof PHASE_6B_JOURNAL_ENTRY_ENGINE_SEED_ID;
  journal_entry_ref: string;
  chart_version_ref: string;
  accounting_period_ref: string;
  accounting_period_open_confirmed: true;
  source_event_name: JournalSourceEvent;
  source_event_ref: string;
  invoice_record_authority_ref?: string;
  payment_allocation_balance_ref?: string;
  expense_record_authority_ref?: string;
  base_currency_code: string;
  transaction_currency_code: string;
  exchange_rate_basis_ref?: string;
  fx_gain_loss_amount_minor: number;
  fx_gain_loss_account_ref?: string;
  adl_refs: readonly string[];
  journal_lines: JournalEntryLineInput[];
  line_count: number;
  debit_total_minor: number;
  credit_total_minor: number;
  journal_balanced: true;
  journal_posted: true;
  journal_entry_evidence_ref: string;
  journal_entry_digest: string;
  period_closed: false;
  tax_report_generated: false;
  payment_allocation_performed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  posted_by_user_id: string;
  posted_at: string;
};

const SOURCE_EVENTS: readonly JournalSourceEvent[] = ['invoice.issued', 'payment.verified', 'expense.created'] as const;
const ENTRY_SIDES: readonly JournalEntrySide[] = ['DEBIT', 'CREDIT'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for journal entry engine.`);
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
    throw new Error(`${field} must be a valid ISO-compatible timestamp for journal entry engine.`);
  }
  return normalized;
}

function normalizeCurrency(value: string, field: string): string {
  const currency = requireNonEmpty(value, field).toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error(`${field} must be a three-letter ISO-style code for journal entry engine.`);
  }
  return currency;
}

function requireSourceSeed(value: string): typeof PHASE_6B_JOURNAL_ENTRY_ENGINE_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_JOURNAL_ENTRY_ENGINE_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_12_journal_entry_engine.');
  }
  return PHASE_6B_JOURNAL_ENTRY_ENGINE_SEED_ID;
}

function requireSourceEvent(value: JournalSourceEvent): JournalSourceEvent {
  if (!SOURCE_EVENTS.includes(value)) {
    throw new Error('source_event_name is not supported for journal entry engine.');
  }
  return value;
}

function requireEntrySide(value: JournalEntrySide): JournalEntrySide {
  if (!ENTRY_SIDES.includes(value)) {
    throw new Error('journal entry line side is not supported for journal entry engine.');
  }
  return value;
}

function requirePositiveAmount(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('journal entry line amount_minor must be a positive integer.');
  }
  return value;
}

function normalizeLine(line: JournalEntryLineInput, index: number): JournalEntryLineInput {
  return {
    journal_entry_line_ref: requireNonEmpty(line.journal_entry_line_ref, `journal_lines[${index}].journal_entry_line_ref`),
    chart_of_account_ref: requireNonEmpty(line.chart_of_account_ref, `journal_lines[${index}].chart_of_account_ref`),
    side: requireEntrySide(line.side),
    amount_minor: requirePositiveAmount(line.amount_minor),
    line_evidence_ref: requireNonEmpty(line.line_evidence_ref, `journal_lines[${index}].line_evidence_ref`),
  };
}

function normalizeLines(lines: JournalEntryLineInput[]): JournalEntryLineInput[] {
  if (!Array.isArray(lines) || lines.length < 2) {
    throw new Error('journal_lines must include at least two lines for journal entry engine.');
  }
  const normalized = lines.map((line, index) => normalizeLine(line, index));
  const refs = normalized.map((line) => line.journal_entry_line_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('journal_lines must not repeat journal_entry_line_ref.');
  }
  return normalized;
}

function requireSourceSpecificRef(input: JournalEntryEngineInput, sourceEventName: JournalSourceEvent): {
  invoice_record_authority_ref?: string;
  payment_allocation_balance_ref?: string;
  expense_record_authority_ref?: string;
} {
  const invoiceRecordAuthorityRef = optionalNonEmpty(input.invoice_record_authority_ref, 'invoice_record_authority_ref');
  const paymentAllocationBalanceRef = optionalNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref');
  const expenseRecordAuthorityRef = optionalNonEmpty(input.expense_record_authority_ref, 'expense_record_authority_ref');
  if (sourceEventName === 'invoice.issued' && invoiceRecordAuthorityRef === undefined) {
    throw new Error('invoice_record_authority_ref is required when source_event_name is invoice.issued.');
  }
  if (sourceEventName === 'payment.verified' && paymentAllocationBalanceRef === undefined) {
    throw new Error('payment_allocation_balance_ref is required when source_event_name is payment.verified.');
  }
  if (sourceEventName === 'expense.created' && expenseRecordAuthorityRef === undefined) {
    throw new Error('expense_record_authority_ref is required when source_event_name is expense.created.');
  }
  return {
    invoice_record_authority_ref: invoiceRecordAuthorityRef,
    payment_allocation_balance_ref: paymentAllocationBalanceRef,
    expense_record_authority_ref: expenseRecordAuthorityRef,
  };
}

function normalizeFx(input: JournalEntryEngineInput, baseCurrencyCode: string, transactionCurrencyCode: string): {
  exchange_rate_basis_ref?: string;
  fx_gain_loss_amount_minor: number;
  fx_gain_loss_account_ref?: string;
  adl_refs: readonly string[];
} {
  const fxGainLossAmountMinor = input.fx_gain_loss_amount_minor ?? 0;
  if (!Number.isInteger(fxGainLossAmountMinor)) {
    throw new Error('fx_gain_loss_amount_minor must be an integer for journal entry engine.');
  }
  const exchangeRateBasisRef = optionalNonEmpty(input.exchange_rate_basis_ref, 'exchange_rate_basis_ref');
  const fxGainLossAccountRef = optionalNonEmpty(input.fx_gain_loss_account_ref, 'fx_gain_loss_account_ref');
  if (baseCurrencyCode !== transactionCurrencyCode && exchangeRateBasisRef === undefined) {
    throw new Error('exchange_rate_basis_ref is required when currencies differ for ADL-016.');
  }
  if (fxGainLossAmountMinor !== 0 && fxGainLossAccountRef === undefined) {
    throw new Error('fx_gain_loss_account_ref is required when fx_gain_loss_amount_minor is non-zero for ADL-016.');
  }
  if (baseCurrencyCode === transactionCurrencyCode && (exchangeRateBasisRef !== undefined || fxGainLossAmountMinor !== 0 || fxGainLossAccountRef !== undefined)) {
    throw new Error('FX gain/loss fields are allowed only when base and transaction currencies differ.');
  }
  return {
    exchange_rate_basis_ref: exchangeRateBasisRef,
    fx_gain_loss_amount_minor: fxGainLossAmountMinor,
    fx_gain_loss_account_ref: fxGainLossAccountRef,
    adl_refs: baseCurrencyCode !== transactionCurrencyCode || fxGainLossAmountMinor !== 0 ? ['ADL-016'] : [],
  };
}

function digestJournalEntry(receiptWithoutDigest: Omit<JournalEntryEngineReceipt, 'journal_entry_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function postJournalEntry(input: JournalEntryEngineInput): JournalEntryEngineReceipt {
  if (input.period_close_requested === true) {
    throw new Error('journal entry engine must not close accounting periods.');
  }
  if (input.tax_report_generation_requested === true) {
    throw new Error('journal entry engine must not generate tax reports.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('journal entry engine must not perform payment allocation math.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('journal entry engine must not process provider callbacks.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('journal entry engine must not perform irreversible actions.');
  }
  if (input.accounting_period_open !== true) {
    throw new Error('accounting_period_open must be true before posting a journal entry.');
  }

  const sourceEventName = requireSourceEvent(input.source_event_name);
  const sourceRefs = requireSourceSpecificRef(input, sourceEventName);
  const journalLines = normalizeLines(input.journal_lines);
  const debitTotalMinor = journalLines.filter((line) => line.side === 'DEBIT').reduce((total, line) => total + line.amount_minor, 0);
  const creditTotalMinor = journalLines.filter((line) => line.side === 'CREDIT').reduce((total, line) => total + line.amount_minor, 0);
  if (debitTotalMinor !== creditTotalMinor) {
    throw new Error('journal entry must balance debit_total_minor and credit_total_minor.');
  }
  const baseCurrencyCode = normalizeCurrency(input.base_currency_code, 'base_currency_code');
  const transactionCurrencyCode = normalizeCurrency(input.transaction_currency_code, 'transaction_currency_code');
  const fx = normalizeFx(input, baseCurrencyCode, transactionCurrencyCode);
  const journalEntryRef = requireNonEmpty(input.journal_entry_ref, 'journal_entry_ref');

  const receiptWithoutDigest: Omit<JournalEntryEngineReceipt, 'journal_entry_digest'> = {
    seed_id: PHASE_6B_JOURNAL_ENTRY_ENGINE_SEED_ID,
    component_id: PHASE_6B_JOURNAL_ENTRY_ENGINE_COMPONENT_ID,
    event_name: JOURNAL_ENTRY_ENGINE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_journal_entry_model: 'Phase6BJournalEntry',
    phase_6b_journal_entry_line_model: 'Phase6BJournalEntryLine',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    journal_entry_ref: journalEntryRef,
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    accounting_period_ref: requireNonEmpty(input.accounting_period_ref, 'accounting_period_ref'),
    accounting_period_open_confirmed: true,
    source_event_name: sourceEventName,
    source_event_ref: requireNonEmpty(input.source_event_ref, 'source_event_ref'),
    invoice_record_authority_ref: sourceRefs.invoice_record_authority_ref,
    payment_allocation_balance_ref: sourceRefs.payment_allocation_balance_ref,
    expense_record_authority_ref: sourceRefs.expense_record_authority_ref,
    base_currency_code: baseCurrencyCode,
    transaction_currency_code: transactionCurrencyCode,
    exchange_rate_basis_ref: fx.exchange_rate_basis_ref,
    fx_gain_loss_amount_minor: fx.fx_gain_loss_amount_minor,
    fx_gain_loss_account_ref: fx.fx_gain_loss_account_ref,
    adl_refs: fx.adl_refs,
    journal_lines: journalLines,
    line_count: journalLines.length,
    debit_total_minor: debitTotalMinor,
    credit_total_minor: creditTotalMinor,
    journal_balanced: true,
    journal_posted: true,
    journal_entry_evidence_ref: `journal_entry:${journalEntryRef}:${sourceEventName}`,
    period_closed: false,
    tax_report_generated: false,
    payment_allocation_performed: false,
    provider_callback_processed: false,
    irreversible_action_allowed: false,
    posted_by_user_id: requireNonEmpty(input.posted_by_user_id, 'posted_by_user_id'),
    posted_at: requireTimestamp(input.posted_at, 'posted_at'),
  };

  return {
    ...receiptWithoutDigest,
    journal_entry_digest: digestJournalEntry(receiptWithoutDigest),
  };
}
