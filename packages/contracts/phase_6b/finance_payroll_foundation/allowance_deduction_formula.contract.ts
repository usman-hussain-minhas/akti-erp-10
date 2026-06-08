export const PHASE_6B_ALLOWANCE_DEDUCTION_FORMULA_SEED_ID = 'seed_6b_14_allowance_deduction_formula' as const;
export const PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID = '6B.14' as const;

export const ALLOWANCE_DEDUCTION_FORMULA_EVENT = 'phase_6b.finance_payroll.allowance_deduction_calculated' as const;

export type PayrollFormulaKind = 'ALLOWANCE' | 'DEDUCTION';
export type PayrollFormulaMethod = 'FIXED_AMOUNT' | 'PERCENT_OF_GROSS' | 'PERCENT_OF_BASE' | 'CAPPED_PERCENT_OF_GROSS';

export type AllowanceDeductionFormulaInput = {
  formula_ref: string;
  formula_kind: PayrollFormulaKind;
  formula_method: PayrollFormulaMethod;
  fixed_amount_minor?: number;
  rate_bps?: number;
  cap_amount_minor?: number;
  chart_account_ref: string;
  taxable: boolean;
};

export type PayrollFormulaPayeeInput = {
  payee_ref: string;
  person_identity_ref: string;
  gross_pay_minor: number;
  base_pay_minor: number;
  currency_code: string;
  payment_allocation_balance_ref: string;
  formula_refs: string[];
};

export type PayrollFormulaPayeeResult = {
  payee_ref: string;
  person_identity_ref: string;
  allowance_total_minor: number;
  deduction_total_minor: number;
  taxable_allowance_total_minor: number;
  net_adjustment_minor: number;
  applied_formula_refs: string[];
  formula_evidence_ref: string;
};

export type AllowanceDeductionFormulaCalculationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_ALLOWANCE_DEDUCTION_FORMULA_SEED_ID;
  payroll_batch_ref: string;
  formula_set_ref: string;
  base_currency_code: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  formulas: AllowanceDeductionFormulaInput[];
  payees: PayrollFormulaPayeeInput[];
  calculated_by_user_id: string;
  calculated_at: string;
  payout_creation_requested?: boolean;
  tax_calculation_requested?: boolean;
  disbursement_file_requested?: boolean;
  journal_posting_requested?: boolean;
  hr_record_mutation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type AllowanceDeductionFormulaCalculationReceipt = {
  seed_id: typeof PHASE_6B_ALLOWANCE_DEDUCTION_FORMULA_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID;
  event_name: typeof ALLOWANCE_DEDUCTION_FORMULA_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_payee_model: 'Phase6BPayee';
  phase_6b_payroll_batch_model: 'Phase6BPayrollBatch';
  phase_6b_payroll_payout_model: 'Phase6BPayrollPayout';
  source_seed_id: typeof PHASE_6B_ALLOWANCE_DEDUCTION_FORMULA_SEED_ID;
  payroll_batch_ref: string;
  formula_set_ref: string;
  base_currency_code: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  payee_results: PayrollFormulaPayeeResult[];
  payee_count: number;
  formula_count: number;
  total_allowance_minor: number;
  total_deduction_minor: number;
  total_net_adjustment_minor: number;
  payout_created: false;
  tax_calculated: false;
  disbursement_file_generated: false;
  journal_posted: false;
  hr_record_mutated: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  formula_evidence_ref: string;
  formula_digest: string;
  calculated_by_user_id: string;
  calculated_at: string;
};
