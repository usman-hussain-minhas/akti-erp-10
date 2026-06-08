export const PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID = 'seed_6b_12_tax_mapping_reporting' as const;
export const PHASE_6B_TAX_MAPPING_REPORTING_COMPONENT_ID = '6B.12' as const;

export const TAX_MAPPING_REPORTING_EVENT = 'phase_6b.general_ledger_accounting.tax_report.generated' as const;

export type TaxRoundingMode = 'ROUND_HALF_UP' | 'ROUND_HALF_EVEN' | 'TRUNCATE';
export type TaxSourceEvent = 'invoice.issued' | 'payment.verified' | 'expense.created';

export type TaxMappingInput = {
  tax_mapping_ref: string;
  tax_code_ref: string;
  source_event_name: TaxSourceEvent;
  chart_of_account_ref: string;
  tax_rate_basis_points: number;
  rounding_mode: TaxRoundingMode;
  mapping_evidence_ref: string;
};

export type TaxableLineInput = {
  taxable_line_ref: string;
  source_event_name: TaxSourceEvent;
  source_document_ref: string;
  tax_mapping_ref: string;
  net_amount_minor: number;
  currency_code: string;
};

export type TaxMappingReportingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID;
  tax_report_ref: string;
  accounting_period_ref: string;
  chart_version_ref: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  base_currency_code: string;
  regional_compliance_pack_ref?: string;
  tax_mappings: TaxMappingInput[];
  taxable_lines: TaxableLineInput[];
  generated_by_user_id: string;
  generated_at: string;
  journal_posting_requested?: boolean;
  period_close_requested?: boolean;
  external_tax_filing_requested?: boolean;
  payment_allocation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type TaxReportLine = {
  taxable_line_ref: string;
  tax_mapping_ref: string;
  tax_code_ref: string;
  source_event_name: TaxSourceEvent;
  source_document_ref: string;
  net_amount_minor: number;
  tax_amount_minor: number;
  currency_code: string;
  rounding_mode: TaxRoundingMode;
};

export type TaxMappingReportingReceipt = {
  seed_id: typeof PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID;
  component_id: typeof PHASE_6B_TAX_MAPPING_REPORTING_COMPONENT_ID;
  event_name: typeof TAX_MAPPING_REPORTING_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_tax_mapping_model: 'Phase6BTaxMapping';
  source_seed_id: typeof PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID;
  tax_report_ref: string;
  accounting_period_ref: string;
  chart_version_ref: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  base_currency_code: string;
  regional_compliance_pack_ref?: string;
  tax_mappings: TaxMappingInput[];
  report_lines: TaxReportLine[];
  mapping_count: number;
  taxable_line_count: number;
  total_net_amount_minor: number;
  total_tax_amount_minor: number;
  adl_refs: readonly string[];
  tax_report_generated: true;
  external_tax_filing_submitted: false;
  journal_posting_performed: false;
  period_closed: false;
  payment_allocation_performed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  tax_report_evidence_ref: string;
  tax_report_digest: string;
  generated_by_user_id: string;
  generated_at: string;
};
