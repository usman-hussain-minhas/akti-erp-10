export const PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID = 'seed_6b_12_chart_of_accounts' as const;
export const PHASE_6B_CHART_OF_ACCOUNTS_COMPONENT_ID = '6B.12' as const;

export const CHART_OF_ACCOUNTS_EVENT = 'phase_6b.general_ledger_accounting.chart_of_accounts.configured' as const;

export type ChartAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'TAX';
export type ChartNormalBalance = 'DEBIT' | 'CREDIT';
export type ChartPostingPolicy = 'POSTING_ALLOWED' | 'SUMMARY_ONLY';
export type ChartSourceFinanceEvent = 'invoice.issued' | 'payment.verified' | 'expense.created';

export type ChartAccountInput = {
  account_ref: string;
  account_code: string;
  account_name: string;
  account_type: ChartAccountType;
  normal_balance: ChartNormalBalance;
  posting_policy: ChartPostingPolicy;
  parent_account_ref?: string;
};

export type ChartFinanceEventMappingInput = {
  mapping_ref: string;
  source_event_name: ChartSourceFinanceEvent;
  account_ref: string;
  entry_side: ChartNormalBalance;
  mapping_evidence_ref: string;
};

export type ChartOfAccountsInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID;
  chart_version_ref: string;
  base_currency_code: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  accounts: ChartAccountInput[];
  finance_event_mappings: ChartFinanceEventMappingInput[];
  configured_by_user_id: string;
  configured_at: string;
  journal_posting_requested?: boolean;
  period_close_requested?: boolean;
  tax_report_generation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ChartOfAccountsReceipt = {
  seed_id: typeof PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID;
  component_id: typeof PHASE_6B_CHART_OF_ACCOUNTS_COMPONENT_ID;
  event_name: typeof CHART_OF_ACCOUNTS_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_chart_of_account_model: 'Phase6BChartOfAccount';
  source_seed_id: typeof PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID;
  chart_version_ref: string;
  base_currency_code: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  accounts: ChartAccountInput[];
  finance_event_mappings: ChartFinanceEventMappingInput[];
  account_count: number;
  finance_event_mapping_count: number;
  accounting_periods_protected: true;
  chart_configuration_evidence_ref: string;
  chart_of_accounts_digest: string;
  journal_posting_performed: false;
  period_closed: false;
  tax_report_generated: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};
