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
