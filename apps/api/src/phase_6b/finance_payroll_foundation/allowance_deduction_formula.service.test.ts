import assert from 'node:assert/strict';
import { calculateAllowanceDeductionFormulas, type AllowanceDeductionFormulaCalculationInput } from './allowance_deduction_formula.service';

const baseInput: AllowanceDeductionFormulaCalculationInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_finance_payroll_foundation',
  source_seed_id: 'seed_6b_14_allowance_deduction_formula',
  payroll_batch_ref: 'payroll_batch_2026_06',
  formula_set_ref: 'formula_set_2026_v1',
  base_currency_code: 'usd',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  formulas: [
    { formula_ref: 'housing_allowance', formula_kind: 'ALLOWANCE', formula_method: 'PERCENT_OF_BASE', rate_bps: 1500, chart_account_ref: 'acct_allowance', taxable: true },
    { formula_ref: 'transport_allowance', formula_kind: 'ALLOWANCE', formula_method: 'FIXED_AMOUNT', fixed_amount_minor: 10000, chart_account_ref: 'acct_allowance', taxable: false },
    { formula_ref: 'welfare_deduction', formula_kind: 'DEDUCTION', formula_method: 'CAPPED_PERCENT_OF_GROSS', rate_bps: 500, cap_amount_minor: 12000, chart_account_ref: 'acct_deduction', taxable: false },
  ],
  payees: [
    {
      payee_ref: 'payee_001',
      person_identity_ref: 'person_001',
      gross_pay_minor: 300000,
      base_pay_minor: 200000,
      currency_code: 'USD',
      payment_allocation_balance_ref: 'payment_allocation_balance_001',
      formula_refs: ['housing_allowance', 'transport_allowance', 'welfare_deduction'],
    },
  ],
  calculated_by_user_id: 'user_payroll_controller_001',
  calculated_at: '2026-06-08T00:00:00.000Z',
};

const receipt = calculateAllowanceDeductionFormulas(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_14_allowance_deduction_formula');
assert.equal(receipt.component_id, '6B.14');
assert.equal(receipt.event_name, 'phase_6b.finance_payroll.allowance_deduction_calculated');
assert.equal(receipt.phase_6b_payee_model, 'Phase6BPayee');
assert.equal(receipt.phase_6b_payroll_batch_model, 'Phase6BPayrollBatch');
assert.equal(receipt.phase_6b_payroll_payout_model, 'Phase6BPayrollPayout');
assert.equal(receipt.source_seed_id, 'seed_6b_14_allowance_deduction_formula');
assert.equal(receipt.base_currency_code, 'USD');
assert.equal(receipt.formula_count, 3);
assert.equal(receipt.payee_count, 1);
assert.equal(receipt.payee_results[0].allowance_total_minor, 40000);
assert.equal(receipt.payee_results[0].deduction_total_minor, 12000);
assert.equal(receipt.payee_results[0].taxable_allowance_total_minor, 30000);
assert.equal(receipt.payee_results[0].net_adjustment_minor, 28000);
assert.equal(receipt.total_allowance_minor, 40000);
assert.equal(receipt.total_deduction_minor, 12000);
assert.equal(receipt.total_net_adjustment_minor, 28000);
assert.equal(receipt.payout_created, false);
assert.equal(receipt.tax_calculated, false);
assert.equal(receipt.disbursement_file_generated, false);
assert.equal(receipt.journal_posted, false);
assert.equal(receipt.hr_record_mutated, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.formula_evidence_ref, 'allowance_deduction_formula:payroll_batch_2026_06:calculated');
assert.equal(receipt.formula_digest.length, 64);

assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payroll_batch_ref: '' }), /payroll_batch_ref is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formula_set_ref: '' }), /formula_set_ref is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, base_currency_code: 'US' }), /base_currency_code must be a three-letter/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [] }), /formulas must include at least one formula/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [{ ...baseInput.formulas[0], formula_ref: '' }] }), /formula_ref is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [{ ...baseInput.formulas[0], formula_kind: 'OTHER' as never }] }), /formula_kind is not supported/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [{ ...baseInput.formulas[0], formula_method: 'OTHER' as never }] }), /formula_method is not supported/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [{ ...baseInput.formulas[0], formula_method: 'FIXED_AMOUNT', fixed_amount_minor: undefined }] }), /fixed_amount_minor is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [{ ...baseInput.formulas[0], rate_bps: 10001 }] }), /rate_bps must be an integer/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [{ ...baseInput.formulas[2], cap_amount_minor: undefined }] }), /cap_amount_minor is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [{ ...baseInput.formulas[0], chart_account_ref: '' }] }), /chart_account_ref is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, formulas: [baseInput.formulas[0], baseInput.formulas[0]] }), /formulas must not repeat formula_ref/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [] }), /payees must include at least one payee/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [{ ...baseInput.payees[0], payee_ref: '' }] }), /payees.payee_ref is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [{ ...baseInput.payees[0], person_identity_ref: '' }] }), /payees.person_identity_ref is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [{ ...baseInput.payees[0], gross_pay_minor: -1 }] }), /payees.gross_pay_minor must be a non-negative integer/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [{ ...baseInput.payees[0], base_pay_minor: 999999 }] }), /base_pay_minor must not exceed/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [{ ...baseInput.payees[0], currency_code: 'EUR' }] }), /payees.currency_code must match/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [{ ...baseInput.payees[0], payment_allocation_balance_ref: 'other_balance' }] }), /payees.payment_allocation_balance_ref must match/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [{ ...baseInput.payees[0], formula_refs: [] }] }), /payees.formula_refs must include/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [{ ...baseInput.payees[0], formula_refs: ['missing_formula'] }] }), /payees.formula_refs must reference/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payees: [baseInput.payees[0], baseInput.payees[0]] }), /payees must not repeat payee_ref/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, calculated_by_user_id: '' }), /calculated_by_user_id is required/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, calculated_at: 'not-a-date' }), /calculated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payout_creation_requested: true }), /must not create payroll payouts/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, tax_calculation_requested: true }), /must not calculate payroll tax/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, disbursement_file_requested: true }), /must not generate disbursement files/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, hr_record_mutation_requested: true }), /must not mutate HR records/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => calculateAllowanceDeductionFormulas({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-095 allowance deduction formula service test passed.');
