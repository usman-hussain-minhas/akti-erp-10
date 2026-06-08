export const PHASE_6B_PAYROLL_TAX_SLAB_CALCULATOR_SEED_ID = 'seed_6b_14_payroll_tax_slab_calculator' as const;
export const PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID = '6B.14' as const;

export const PAYROLL_TAX_SLAB_CALCULATOR_EVENT = 'phase_6b.finance_payroll.tax_slab_calculated' as const;

export type PayrollTaxSlabInput = {
  slab_ref: string;
  lower_bound_minor: number;
  upper_bound_minor?: number;
  fixed_tax_minor: number;
  marginal_rate_bps: number;
};

export type PayrollPayeeTaxInput = {
  payee_ref: string;
  person_identity_ref: string;
  gross_pay_minor: number;
  pre_tax_deduction_minor: number;
  currency_code: string;
  payment_allocation_balance_ref: string;
  chart_account_ref: string;
};

export type PayrollPayeeTaxResult = {
  payee_ref: string;
  person_identity_ref: string;
  taxable_pay_minor: number;
  tax_amount_minor: number;
  net_pay_after_tax_minor: number;
  applied_slab_ref: string;
  payroll_tax_evidence_ref: string;
};

export type PayrollTaxSlabCalculationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_PAYROLL_TAX_SLAB_CALCULATOR_SEED_ID;
  payroll_batch_ref: string;
  tax_table_ref: string;
  payroll_period_start_at: string;
  payroll_period_end_at: string;
  base_currency_code: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  slabs: PayrollTaxSlabInput[];
  payees: PayrollPayeeTaxInput[];
  calculated_by_user_id: string;
  calculated_at: string;
  payout_creation_requested?: boolean;
  disbursement_file_requested?: boolean;
  journal_posting_requested?: boolean;
  hr_record_mutation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PayrollTaxSlabCalculationReceipt = {
  seed_id: typeof PHASE_6B_PAYROLL_TAX_SLAB_CALCULATOR_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID;
  event_name: typeof PAYROLL_TAX_SLAB_CALCULATOR_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_payee_model: 'Phase6BPayee';
  phase_6b_payroll_batch_model: 'Phase6BPayrollBatch';
  phase_6b_payroll_payout_model: 'Phase6BPayrollPayout';
  source_seed_id: typeof PHASE_6B_PAYROLL_TAX_SLAB_CALCULATOR_SEED_ID;
  payroll_batch_ref: string;
  tax_table_ref: string;
  payroll_period_start_at: string;
  payroll_period_end_at: string;
  base_currency_code: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  payee_results: PayrollPayeeTaxResult[];
  payee_count: number;
  total_tax_minor: number;
  total_net_pay_after_tax_minor: number;
  payout_created: false;
  disbursement_file_generated: false;
  journal_posted: false;
  hr_record_mutated: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  payroll_tax_evidence_ref: string;
  payroll_tax_digest: string;
  calculated_by_user_id: string;
  calculated_at: string;
};
