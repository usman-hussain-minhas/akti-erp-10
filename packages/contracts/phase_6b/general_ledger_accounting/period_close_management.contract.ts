export const PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID = 'seed_6b_12_period_close_management' as const;
export const PHASE_6B_PERIOD_CLOSE_MANAGEMENT_COMPONENT_ID = '6B.12' as const;

export const PERIOD_CLOSE_MANAGEMENT_EVENT = 'phase_6b.general_ledger_accounting.period.closed' as const;

export type PeriodCloseAction = 'CLOSE_PERIOD';

export type PeriodCloseManagementInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID;
  accounting_period_ref: string;
  period_start_at: string;
  period_end_at: string;
  close_action: PeriodCloseAction;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  journal_entry_evidence_refs: string[];
  period_close_evidence_refs: string[];
  unposted_journal_count: number;
  unresolved_invoice_count: number;
  unresolved_payment_allocation_count: number;
  unresolved_expense_count: number;
  close_authorized_by_user_id: string;
  close_authorized_at: string;
  journal_posting_requested?: boolean;
  tax_report_generation_requested?: boolean;
  payment_allocation_requested?: boolean;
  retrospective_mutation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PeriodCloseManagementReceipt = {
  seed_id: typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID;
  component_id: typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_COMPONENT_ID;
  event_name: typeof PERIOD_CLOSE_MANAGEMENT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_accounting_period_model: 'Phase6BAccountingPeriod';
  source_seed_id: typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID;
  accounting_period_ref: string;
  period_start_at: string;
  period_end_at: string;
  close_action: PeriodCloseAction;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  journal_entry_evidence_refs: string[];
  journal_entry_evidence_count: number;
  period_close_evidence_refs: string[];
  period_close_evidence_count: number;
  unposted_journal_count: 0;
  unresolved_invoice_count: 0;
  unresolved_payment_allocation_count: 0;
  unresolved_expense_count: 0;
  period_protection_enforced: true;
  period_closed: true;
  reopen_performed: false;
  journal_posting_performed: false;
  tax_report_generated: false;
  payment_allocation_performed: false;
  retrospective_mutation_performed: false;
  irreversible_action_allowed: false;
  period_close_evidence_ref: string;
  period_close_digest: string;
  close_authorized_by_user_id: string;
  close_authorized_at: string;
};
