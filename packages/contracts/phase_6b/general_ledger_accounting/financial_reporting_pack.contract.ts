export const PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID = 'seed_6b_12_financial_reporting_pack' as const;
export const PHASE_6B_FINANCIAL_REPORTING_PACK_COMPONENT_ID = '6B.12' as const;

export const FINANCIAL_REPORTING_PACK_EVENT = 'phase_6b.general_ledger_accounting.financial_reporting_pack.generated' as const;

export type ReportingAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type TrialBalanceLineInput = {
  account_ref: string;
  account_code: string;
  account_name: string;
  account_type: ReportingAccountType;
  debit_total_minor: number;
  credit_total_minor: number;
  line_evidence_ref: string;
};

export type FinancialReportingPackInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID;
  reporting_pack_ref: string;
  accounting_period_ref: string;
  chart_version_ref: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  report_currency_code: string;
  trial_balance_lines: TrialBalanceLineInput[];
  report_evidence_refs: string[];
  generated_by_user_id: string;
  generated_at: string;
  frontend_screen_requested?: boolean;
  external_publication_requested?: boolean;
  journal_posting_requested?: boolean;
  period_close_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type FinancialReportingPackReceipt = {
  seed_id: typeof PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID;
  component_id: typeof PHASE_6B_FINANCIAL_REPORTING_PACK_COMPONENT_ID;
  event_name: typeof FINANCIAL_REPORTING_PACK_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID;
  reporting_pack_ref: string;
  accounting_period_ref: string;
  chart_version_ref: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  report_currency_code: string;
  trial_balance_lines: TrialBalanceLineInput[];
  trial_balance_line_count: number;
  asset_total_minor: number;
  liability_total_minor: number;
  equity_total_minor: number;
  revenue_total_minor: number;
  expense_total_minor: number;
  net_income_minor: number;
  balance_sheet_check_minor: 0;
  trial_balance_balanced: true;
  report_evidence_refs: string[];
  report_evidence_count: number;
  financial_reporting_pack_generated: true;
  frontend_screen_created: false;
  external_publication_performed: false;
  journal_posting_performed: false;
  period_closed: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  reporting_pack_evidence_ref: string;
  reporting_pack_digest: string;
  generated_by_user_id: string;
  generated_at: string;
};
