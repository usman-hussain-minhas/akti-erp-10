import { createHash } from 'node:crypto';

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

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for payroll tax slab calculator.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for payroll tax slab calculator.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_PAYROLL_TAX_SLAB_CALCULATOR_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_PAYROLL_TAX_SLAB_CALCULATOR_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_14_payroll_tax_slab_calculator.');
  }
  return PHASE_6B_PAYROLL_TAX_SLAB_CALCULATOR_SEED_ID;
}

function normalizeCurrency(value: string, field: string): string {
  const currency = requireNonEmpty(value, field).toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error(`${field} must be a three-letter ISO-style code for payroll tax slab calculator.`);
  }
  return currency;
}

function requireNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for payroll tax slab calculator.`);
  }
  return value;
}

function normalizeRate(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new Error('marginal_rate_bps must be an integer between 0 and 10000 for payroll tax slab calculator.');
  }
  return value;
}

function normalizeSlab(slab: PayrollTaxSlabInput): PayrollTaxSlabInput {
  const lowerBound = requireNonNegativeInteger(slab.lower_bound_minor, 'slabs.lower_bound_minor');
  const upperBound = slab.upper_bound_minor === undefined ? undefined : requireNonNegativeInteger(slab.upper_bound_minor, 'slabs.upper_bound_minor');
  if (upperBound !== undefined && upperBound <= lowerBound) {
    throw new Error('slabs.upper_bound_minor must be greater than lower_bound_minor for payroll tax slab calculator.');
  }
  return {
    slab_ref: requireNonEmpty(slab.slab_ref, 'slabs.slab_ref'),
    lower_bound_minor: lowerBound,
    upper_bound_minor: upperBound,
    fixed_tax_minor: requireNonNegativeInteger(slab.fixed_tax_minor, 'slabs.fixed_tax_minor'),
    marginal_rate_bps: normalizeRate(slab.marginal_rate_bps),
  };
}

function normalizeSlabs(slabs: PayrollTaxSlabInput[]): PayrollTaxSlabInput[] {
  if (!Array.isArray(slabs) || slabs.length === 0) {
    throw new Error('slabs must include at least one slab for payroll tax slab calculator.');
  }
  const normalized = slabs.map(normalizeSlab).sort((left, right) => left.lower_bound_minor - right.lower_bound_minor);
  const slabRefs = normalized.map((slab) => slab.slab_ref);
  if (new Set(slabRefs).size !== slabRefs.length) {
    throw new Error('slabs must not repeat slab_ref for payroll tax slab calculator.');
  }
  if (normalized[0].lower_bound_minor !== 0) {
    throw new Error('first slab must start at 0 for payroll tax slab calculator.');
  }
  for (let index = 0; index < normalized.length - 1; index += 1) {
    if (normalized[index].upper_bound_minor !== normalized[index + 1].lower_bound_minor) {
      throw new Error('slabs must be contiguous for payroll tax slab calculator.');
    }
  }
  if (normalized[normalized.length - 1].upper_bound_minor !== undefined) {
    throw new Error('last slab must be open-ended for payroll tax slab calculator.');
  }
  return normalized;
}

function normalizePayee(payee: PayrollPayeeTaxInput, expectedCurrency: string, expectedAllocationBalanceRef: string): PayrollPayeeTaxInput {
  const paymentAllocationBalanceRef = requireNonEmpty(payee.payment_allocation_balance_ref, 'payees.payment_allocation_balance_ref');
  if (paymentAllocationBalanceRef !== expectedAllocationBalanceRef) {
    throw new Error('payees.payment_allocation_balance_ref must match payment_allocation_balance_ref for payroll tax slab calculator.');
  }
  const currency = normalizeCurrency(payee.currency_code, 'payees.currency_code');
  if (currency !== expectedCurrency) {
    throw new Error('payees.currency_code must match base_currency_code for payroll tax slab calculator.');
  }
  return {
    payee_ref: requireNonEmpty(payee.payee_ref, 'payees.payee_ref'),
    person_identity_ref: requireNonEmpty(payee.person_identity_ref, 'payees.person_identity_ref'),
    gross_pay_minor: requireNonNegativeInteger(payee.gross_pay_minor, 'payees.gross_pay_minor'),
    pre_tax_deduction_minor: requireNonNegativeInteger(payee.pre_tax_deduction_minor, 'payees.pre_tax_deduction_minor'),
    currency_code: currency,
    payment_allocation_balance_ref: paymentAllocationBalanceRef,
    chart_account_ref: requireNonEmpty(payee.chart_account_ref, 'payees.chart_account_ref'),
  };
}

function normalizePayees(payees: PayrollPayeeTaxInput[], expectedCurrency: string, expectedAllocationBalanceRef: string): PayrollPayeeTaxInput[] {
  if (!Array.isArray(payees) || payees.length === 0) {
    throw new Error('payees must include at least one payee for payroll tax slab calculator.');
  }
  const normalized = payees.map((payee) => normalizePayee(payee, expectedCurrency, expectedAllocationBalanceRef));
  const payeeRefs = normalized.map((payee) => payee.payee_ref);
  if (new Set(payeeRefs).size !== payeeRefs.length) {
    throw new Error('payees must not repeat payee_ref for payroll tax slab calculator.');
  }
  return normalized;
}

function findSlab(taxablePayMinor: number, slabs: PayrollTaxSlabInput[]): PayrollTaxSlabInput {
  const slab = slabs.find((candidate) => taxablePayMinor >= candidate.lower_bound_minor && (candidate.upper_bound_minor === undefined || taxablePayMinor < candidate.upper_bound_minor));
  if (slab === undefined) {
    throw new Error('no slab covers taxable pay for payroll tax slab calculator.');
  }
  return slab;
}

function calculatePayeeTax(payee: PayrollPayeeTaxInput, slabs: PayrollTaxSlabInput[], payrollBatchRef: string): PayrollPayeeTaxResult {
  if (payee.pre_tax_deduction_minor > payee.gross_pay_minor) {
    throw new Error('payees.pre_tax_deduction_minor must not exceed gross_pay_minor for payroll tax slab calculator.');
  }
  const taxablePayMinor = payee.gross_pay_minor - payee.pre_tax_deduction_minor;
  const slab = findSlab(taxablePayMinor, slabs);
  const marginalBaseMinor = Math.max(0, taxablePayMinor - slab.lower_bound_minor);
  const taxAmountMinor = slab.fixed_tax_minor + Math.floor((marginalBaseMinor * slab.marginal_rate_bps) / 10_000);
  return {
    payee_ref: payee.payee_ref,
    person_identity_ref: payee.person_identity_ref,
    taxable_pay_minor: taxablePayMinor,
    tax_amount_minor: taxAmountMinor,
    net_pay_after_tax_minor: taxablePayMinor - taxAmountMinor,
    applied_slab_ref: slab.slab_ref,
    payroll_tax_evidence_ref: `payroll_tax_slab_calculator:${payrollBatchRef}:${payee.payee_ref}:tax`,
  };
}

function digestPayrollTax(receiptWithoutDigest: Omit<PayrollTaxSlabCalculationReceipt, 'payroll_tax_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function calculatePayrollTaxSlabs(input: PayrollTaxSlabCalculationInput): PayrollTaxSlabCalculationReceipt {
  if (input.payout_creation_requested === true) {
    throw new Error('payroll tax slab calculator must not create payroll payouts.');
  }
  if (input.disbursement_file_requested === true) {
    throw new Error('payroll tax slab calculator must not generate disbursement files.');
  }
  if (input.journal_posting_requested === true) {
    throw new Error('payroll tax slab calculator must not post journals.');
  }
  if (input.hr_record_mutation_requested === true) {
    throw new Error('payroll tax slab calculator must not mutate HR records.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('payroll tax slab calculator must not perform payment allocation math.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('payroll tax slab calculator must not perform irreversible actions.');
  }

  const payrollBatchRef = requireNonEmpty(input.payroll_batch_ref, 'payroll_batch_ref');
  const periodStart = requireTimestamp(input.payroll_period_start_at, 'payroll_period_start_at');
  const periodEnd = requireTimestamp(input.payroll_period_end_at, 'payroll_period_end_at');
  if (Date.parse(periodEnd) < Date.parse(periodStart)) {
    throw new Error('payroll_period_end_at must not be earlier than payroll_period_start_at.');
  }
  const baseCurrencyCode = normalizeCurrency(input.base_currency_code, 'base_currency_code');
  const paymentAllocationBalanceRef = requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref');
  const slabs = normalizeSlabs(input.slabs);
  const payees = normalizePayees(input.payees, baseCurrencyCode, paymentAllocationBalanceRef);
  const payeeResults = payees.map((payee) => calculatePayeeTax(payee, slabs, payrollBatchRef));

  const receiptWithoutDigest: Omit<PayrollTaxSlabCalculationReceipt, 'payroll_tax_digest'> = {
    seed_id: PHASE_6B_PAYROLL_TAX_SLAB_CALCULATOR_SEED_ID,
    component_id: PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID,
    event_name: PAYROLL_TAX_SLAB_CALCULATOR_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_payee_model: 'Phase6BPayee',
    phase_6b_payroll_batch_model: 'Phase6BPayrollBatch',
    phase_6b_payroll_payout_model: 'Phase6BPayrollPayout',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    payroll_batch_ref: payrollBatchRef,
    tax_table_ref: requireNonEmpty(input.tax_table_ref, 'tax_table_ref'),
    payroll_period_start_at: periodStart,
    payroll_period_end_at: periodEnd,
    base_currency_code: baseCurrencyCode,
    payment_allocation_balance_ref: paymentAllocationBalanceRef,
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    payee_results: payeeResults,
    payee_count: payeeResults.length,
    total_tax_minor: payeeResults.reduce((total, result) => total + result.tax_amount_minor, 0),
    total_net_pay_after_tax_minor: payeeResults.reduce((total, result) => total + result.net_pay_after_tax_minor, 0),
    payout_created: false,
    disbursement_file_generated: false,
    journal_posted: false,
    hr_record_mutated: false,
    payment_allocation_performed: false,
    irreversible_action_allowed: false,
    payroll_tax_evidence_ref: `payroll_tax_slab_calculator:${payrollBatchRef}:calculated`,
    calculated_by_user_id: requireNonEmpty(input.calculated_by_user_id, 'calculated_by_user_id'),
    calculated_at: requireTimestamp(input.calculated_at, 'calculated_at'),
  };

  return {
    ...receiptWithoutDigest,
    payroll_tax_digest: digestPayrollTax(receiptWithoutDigest),
  };
}
