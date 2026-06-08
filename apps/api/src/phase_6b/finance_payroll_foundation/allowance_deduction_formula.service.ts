import { createHash } from 'node:crypto';

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

const FORMULA_KINDS: readonly PayrollFormulaKind[] = ['ALLOWANCE', 'DEDUCTION'] as const;
const FORMULA_METHODS: readonly PayrollFormulaMethod[] = ['FIXED_AMOUNT', 'PERCENT_OF_GROSS', 'PERCENT_OF_BASE', 'CAPPED_PERCENT_OF_GROSS'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for allowance deduction formula.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for allowance deduction formula.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_ALLOWANCE_DEDUCTION_FORMULA_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_ALLOWANCE_DEDUCTION_FORMULA_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_14_allowance_deduction_formula.');
  }
  return PHASE_6B_ALLOWANCE_DEDUCTION_FORMULA_SEED_ID;
}

function normalizeCurrency(value: string, field: string): string {
  const currency = requireNonEmpty(value, field).toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error(`${field} must be a three-letter ISO-style code for allowance deduction formula.`);
  }
  return currency;
}

function requireNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for allowance deduction formula.`);
  }
  return value;
}

function optionalNonNegativeInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  return requireNonNegativeInteger(value, field);
}

function normalizeRate(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new Error(`${field} must be an integer between 0 and 10000 for allowance deduction formula.`);
  }
  return value;
}

function requireFormulaKind(value: PayrollFormulaKind): PayrollFormulaKind {
  if (!FORMULA_KINDS.includes(value)) {
    throw new Error('formula_kind is not supported for allowance deduction formula.');
  }
  return value;
}

function requireFormulaMethod(value: PayrollFormulaMethod): PayrollFormulaMethod {
  if (!FORMULA_METHODS.includes(value)) {
    throw new Error('formula_method is not supported for allowance deduction formula.');
  }
  return value;
}

function normalizeFormula(formula: AllowanceDeductionFormulaInput): AllowanceDeductionFormulaInput {
  const method = requireFormulaMethod(formula.formula_method);
  const fixedAmount = optionalNonNegativeInteger(formula.fixed_amount_minor, 'fixed_amount_minor');
  const rateBps = normalizeRate(formula.rate_bps, 'rate_bps');
  const capAmount = optionalNonNegativeInteger(formula.cap_amount_minor, 'cap_amount_minor');
  if (method === 'FIXED_AMOUNT' && fixedAmount === undefined) {
    throw new Error('fixed_amount_minor is required for FIXED_AMOUNT allowance deduction formula.');
  }
  if (method !== 'FIXED_AMOUNT' && rateBps === undefined) {
    throw new Error('rate_bps is required for percent allowance deduction formula.');
  }
  if (method === 'CAPPED_PERCENT_OF_GROSS' && capAmount === undefined) {
    throw new Error('cap_amount_minor is required for capped allowance deduction formula.');
  }
  return {
    formula_ref: requireNonEmpty(formula.formula_ref, 'formula_ref'),
    formula_kind: requireFormulaKind(formula.formula_kind),
    formula_method: method,
    fixed_amount_minor: fixedAmount,
    rate_bps: rateBps,
    cap_amount_minor: capAmount,
    chart_account_ref: requireNonEmpty(formula.chart_account_ref, 'chart_account_ref'),
    taxable: Boolean(formula.taxable),
  };
}

function normalizeFormulas(formulas: AllowanceDeductionFormulaInput[]): AllowanceDeductionFormulaInput[] {
  if (!Array.isArray(formulas) || formulas.length === 0) {
    throw new Error('formulas must include at least one formula for allowance deduction formula.');
  }
  const normalized = formulas.map(normalizeFormula);
  const refs = normalized.map((formula) => formula.formula_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('formulas must not repeat formula_ref for allowance deduction formula.');
  }
  return normalized;
}

function normalizePayee(payee: PayrollFormulaPayeeInput, expectedCurrency: string, expectedAllocationBalanceRef: string, formulaRefs: Set<string>): PayrollFormulaPayeeInput {
  const currency = normalizeCurrency(payee.currency_code, 'payees.currency_code');
  if (currency !== expectedCurrency) {
    throw new Error('payees.currency_code must match base_currency_code for allowance deduction formula.');
  }
  const allocationBalanceRef = requireNonEmpty(payee.payment_allocation_balance_ref, 'payees.payment_allocation_balance_ref');
  if (allocationBalanceRef !== expectedAllocationBalanceRef) {
    throw new Error('payees.payment_allocation_balance_ref must match payment_allocation_balance_ref for allowance deduction formula.');
  }
  if (!Array.isArray(payee.formula_refs) || payee.formula_refs.length === 0) {
    throw new Error('payees.formula_refs must include at least one formula for allowance deduction formula.');
  }
  for (const formulaRef of payee.formula_refs) {
    if (!formulaRefs.has(requireNonEmpty(formulaRef, 'payees.formula_refs'))) {
      throw new Error('payees.formula_refs must reference formulas in the same formula set.');
    }
  }
  return {
    payee_ref: requireNonEmpty(payee.payee_ref, 'payees.payee_ref'),
    person_identity_ref: requireNonEmpty(payee.person_identity_ref, 'payees.person_identity_ref'),
    gross_pay_minor: requireNonNegativeInteger(payee.gross_pay_minor, 'payees.gross_pay_minor'),
    base_pay_minor: requireNonNegativeInteger(payee.base_pay_minor, 'payees.base_pay_minor'),
    currency_code: currency,
    payment_allocation_balance_ref: allocationBalanceRef,
    formula_refs: [...payee.formula_refs],
  };
}

function normalizePayees(payees: PayrollFormulaPayeeInput[], expectedCurrency: string, expectedAllocationBalanceRef: string, formulas: AllowanceDeductionFormulaInput[]): PayrollFormulaPayeeInput[] {
  if (!Array.isArray(payees) || payees.length === 0) {
    throw new Error('payees must include at least one payee for allowance deduction formula.');
  }
  const formulaRefs = new Set(formulas.map((formula) => formula.formula_ref));
  const normalized = payees.map((payee) => normalizePayee(payee, expectedCurrency, expectedAllocationBalanceRef, formulaRefs));
  const payeeRefs = normalized.map((payee) => payee.payee_ref);
  if (new Set(payeeRefs).size !== payeeRefs.length) {
    throw new Error('payees must not repeat payee_ref for allowance deduction formula.');
  }
  return normalized;
}

function formulaAmount(formula: AllowanceDeductionFormulaInput, payee: PayrollFormulaPayeeInput): number {
  if (formula.formula_method === 'FIXED_AMOUNT') return formula.fixed_amount_minor ?? 0;
  const baseAmount = formula.formula_method === 'PERCENT_OF_BASE' ? payee.base_pay_minor : payee.gross_pay_minor;
  const calculated = Math.floor((baseAmount * (formula.rate_bps ?? 0)) / 10_000);
  if (formula.formula_method === 'CAPPED_PERCENT_OF_GROSS') {
    return Math.min(calculated, formula.cap_amount_minor ?? calculated);
  }
  return calculated;
}

function calculatePayeeFormula(payee: PayrollFormulaPayeeInput, formulas: AllowanceDeductionFormulaInput[], payrollBatchRef: string): PayrollFormulaPayeeResult {
  if (payee.base_pay_minor > payee.gross_pay_minor) {
    throw new Error('payees.base_pay_minor must not exceed gross_pay_minor for allowance deduction formula.');
  }
  const selected = payee.formula_refs.map((formulaRef) => formulas.find((formula) => formula.formula_ref === formulaRef)!);
  const allowanceTotal = selected.filter((formula) => formula.formula_kind === 'ALLOWANCE').reduce((total, formula) => total + formulaAmount(formula, payee), 0);
  const deductionTotal = selected.filter((formula) => formula.formula_kind === 'DEDUCTION').reduce((total, formula) => total + formulaAmount(formula, payee), 0);
  const taxableAllowanceTotal = selected.filter((formula) => formula.formula_kind === 'ALLOWANCE' && formula.taxable).reduce((total, formula) => total + formulaAmount(formula, payee), 0);
  return {
    payee_ref: payee.payee_ref,
    person_identity_ref: payee.person_identity_ref,
    allowance_total_minor: allowanceTotal,
    deduction_total_minor: deductionTotal,
    taxable_allowance_total_minor: taxableAllowanceTotal,
    net_adjustment_minor: allowanceTotal - deductionTotal,
    applied_formula_refs: [...payee.formula_refs].sort(),
    formula_evidence_ref: `allowance_deduction_formula:${payrollBatchRef}:${payee.payee_ref}:calculated`,
  };
}

function digestFormula(receiptWithoutDigest: Omit<AllowanceDeductionFormulaCalculationReceipt, 'formula_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function calculateAllowanceDeductionFormulas(input: AllowanceDeductionFormulaCalculationInput): AllowanceDeductionFormulaCalculationReceipt {
  if (input.payout_creation_requested === true) throw new Error('allowance deduction formula must not create payroll payouts.');
  if (input.tax_calculation_requested === true) throw new Error('allowance deduction formula must not calculate payroll tax.');
  if (input.disbursement_file_requested === true) throw new Error('allowance deduction formula must not generate disbursement files.');
  if (input.journal_posting_requested === true) throw new Error('allowance deduction formula must not post journals.');
  if (input.hr_record_mutation_requested === true) throw new Error('allowance deduction formula must not mutate HR records.');
  if (input.payment_allocation_requested === true) throw new Error('allowance deduction formula must not perform payment allocation math.');
  if (input.irreversible_action_requested === true) throw new Error('allowance deduction formula must not perform irreversible actions.');

  const payrollBatchRef = requireNonEmpty(input.payroll_batch_ref, 'payroll_batch_ref');
  const baseCurrencyCode = normalizeCurrency(input.base_currency_code, 'base_currency_code');
  const paymentAllocationBalanceRef = requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref');
  const formulas = normalizeFormulas(input.formulas);
  const payees = normalizePayees(input.payees, baseCurrencyCode, paymentAllocationBalanceRef, formulas);
  const payeeResults = payees.map((payee) => calculatePayeeFormula(payee, formulas, payrollBatchRef));

  const receiptWithoutDigest: Omit<AllowanceDeductionFormulaCalculationReceipt, 'formula_digest'> = {
    seed_id: PHASE_6B_ALLOWANCE_DEDUCTION_FORMULA_SEED_ID,
    component_id: PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID,
    event_name: ALLOWANCE_DEDUCTION_FORMULA_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_payee_model: 'Phase6BPayee',
    phase_6b_payroll_batch_model: 'Phase6BPayrollBatch',
    phase_6b_payroll_payout_model: 'Phase6BPayrollPayout',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    payroll_batch_ref: payrollBatchRef,
    formula_set_ref: requireNonEmpty(input.formula_set_ref, 'formula_set_ref'),
    base_currency_code: baseCurrencyCode,
    payment_allocation_balance_ref: paymentAllocationBalanceRef,
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    payee_results: payeeResults,
    payee_count: payeeResults.length,
    formula_count: formulas.length,
    total_allowance_minor: payeeResults.reduce((total, result) => total + result.allowance_total_minor, 0),
    total_deduction_minor: payeeResults.reduce((total, result) => total + result.deduction_total_minor, 0),
    total_net_adjustment_minor: payeeResults.reduce((total, result) => total + result.net_adjustment_minor, 0),
    payout_created: false,
    tax_calculated: false,
    disbursement_file_generated: false,
    journal_posted: false,
    hr_record_mutated: false,
    payment_allocation_performed: false,
    irreversible_action_allowed: false,
    formula_evidence_ref: `allowance_deduction_formula:${payrollBatchRef}:calculated`,
    calculated_by_user_id: requireNonEmpty(input.calculated_by_user_id, 'calculated_by_user_id'),
    calculated_at: requireTimestamp(input.calculated_at, 'calculated_at'),
  };

  return {
    ...receiptWithoutDigest,
    formula_digest: digestFormula(receiptWithoutDigest),
  };
}
