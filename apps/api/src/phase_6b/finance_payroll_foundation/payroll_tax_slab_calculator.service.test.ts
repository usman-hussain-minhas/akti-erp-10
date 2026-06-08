import assert from 'node:assert/strict';
import { calculatePayrollTaxSlabs, type PayrollTaxSlabCalculationInput } from './payroll_tax_slab_calculator.service';

const baseInput: PayrollTaxSlabCalculationInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_finance_payroll_foundation',
  source_seed_id: 'seed_6b_14_payroll_tax_slab_calculator',
  payroll_batch_ref: 'payroll_batch_2026_06',
  tax_table_ref: 'tax_table_2026_v1',
  payroll_period_start_at: '2026-06-01T00:00:00.000Z',
  payroll_period_end_at: '2026-06-30T23:59:59.000Z',
  base_currency_code: 'usd',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  slabs: [
    { slab_ref: 'slab_zero', lower_bound_minor: 0, upper_bound_minor: 100000, fixed_tax_minor: 0, marginal_rate_bps: 0 },
    { slab_ref: 'slab_standard', lower_bound_minor: 100000, upper_bound_minor: 300000, fixed_tax_minor: 0, marginal_rate_bps: 1000 },
    { slab_ref: 'slab_upper', lower_bound_minor: 300000, fixed_tax_minor: 20000, marginal_rate_bps: 2000 },
  ],
  payees: [
    {
      payee_ref: 'payee_001',
      person_identity_ref: 'person_001',
      gross_pay_minor: 250000,
      pre_tax_deduction_minor: 50000,
      currency_code: 'USD',
      payment_allocation_balance_ref: 'payment_allocation_balance_001',
      chart_account_ref: 'acct_payroll_tax',
    },
    {
      payee_ref: 'payee_002',
      person_identity_ref: 'person_002',
      gross_pay_minor: 500000,
      pre_tax_deduction_minor: 100000,
      currency_code: 'usd',
      payment_allocation_balance_ref: 'payment_allocation_balance_001',
      chart_account_ref: 'acct_payroll_tax',
    },
  ],
  calculated_by_user_id: 'user_payroll_controller_001',
  calculated_at: '2026-06-08T00:00:00.000Z',
};

const receipt = calculatePayrollTaxSlabs(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_14_payroll_tax_slab_calculator');
assert.equal(receipt.component_id, '6B.14');
assert.equal(receipt.event_name, 'phase_6b.finance_payroll.tax_slab_calculated');
assert.equal(receipt.phase_6b_payee_model, 'Phase6BPayee');
assert.equal(receipt.phase_6b_payroll_batch_model, 'Phase6BPayrollBatch');
assert.equal(receipt.phase_6b_payroll_payout_model, 'Phase6BPayrollPayout');
assert.equal(receipt.source_seed_id, 'seed_6b_14_payroll_tax_slab_calculator');
assert.equal(receipt.base_currency_code, 'USD');
assert.equal(receipt.payee_count, 2);
assert.equal(receipt.payee_results[0].taxable_pay_minor, 200000);
assert.equal(receipt.payee_results[0].tax_amount_minor, 10000);
assert.equal(receipt.payee_results[0].net_pay_after_tax_minor, 190000);
assert.equal(receipt.payee_results[0].applied_slab_ref, 'slab_standard');
assert.equal(receipt.payee_results[1].tax_amount_minor, 40000);
assert.equal(receipt.total_tax_minor, 50000);
assert.equal(receipt.payout_created, false);
assert.equal(receipt.disbursement_file_generated, false);
assert.equal(receipt.journal_posted, false);
assert.equal(receipt.hr_record_mutated, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.payroll_tax_evidence_ref, 'payroll_tax_slab_calculator:payroll_batch_2026_06:calculated');
assert.equal(receipt.payroll_tax_digest.length, 64);

assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payroll_batch_ref: '' }), /payroll_batch_ref is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, tax_table_ref: '' }), /tax_table_ref is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payroll_period_start_at: 'not-a-date' }), /payroll_period_start_at must be a valid ISO-compatible timestamp/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payroll_period_end_at: '2026-05-31T00:00:00.000Z' }), /payroll_period_end_at must not be earlier/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, base_currency_code: 'US' }), /base_currency_code must be a three-letter/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, slabs: [] }), /slabs must include at least one slab/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, slabs: [{ ...baseInput.slabs[0], slab_ref: '' }] }), /slabs.slab_ref is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, slabs: [{ ...baseInput.slabs[0], lower_bound_minor: -1 }] }), /slabs.lower_bound_minor must be a non-negative integer/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, slabs: [{ ...baseInput.slabs[0], upper_bound_minor: 0 }] }), /slabs.upper_bound_minor must be greater/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, slabs: [{ ...baseInput.slabs[0], marginal_rate_bps: 10001 }] }), /marginal_rate_bps must be an integer/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, slabs: [{ ...baseInput.slabs[0], lower_bound_minor: 1 }] }), /first slab must start at 0/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, slabs: [{ ...baseInput.slabs[0], upper_bound_minor: 100000 }, { ...baseInput.slabs[1], lower_bound_minor: 200000 }] }), /slabs must be contiguous/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, slabs: [baseInput.slabs[0]] }), /last slab must be open-ended/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [] }), /payees must include at least one payee/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [{ ...baseInput.payees[0], payee_ref: '' }] }), /payees.payee_ref is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [{ ...baseInput.payees[0], person_identity_ref: '' }] }), /payees.person_identity_ref is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [{ ...baseInput.payees[0], gross_pay_minor: -1 }] }), /payees.gross_pay_minor must be a non-negative integer/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [{ ...baseInput.payees[0], pre_tax_deduction_minor: 999999 }] }), /pre_tax_deduction_minor must not exceed/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [{ ...baseInput.payees[0], currency_code: 'EUR' }] }), /payees.currency_code must match/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [{ ...baseInput.payees[0], payment_allocation_balance_ref: 'other_balance' }] }), /payees.payment_allocation_balance_ref must match/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [{ ...baseInput.payees[0], chart_account_ref: '' }] }), /payees.chart_account_ref is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payees: [baseInput.payees[0], baseInput.payees[0]] }), /payees must not repeat payee_ref/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, calculated_by_user_id: '' }), /calculated_by_user_id is required/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, calculated_at: 'not-a-date' }), /calculated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payout_creation_requested: true }), /must not create payroll payouts/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, disbursement_file_requested: true }), /must not generate disbursement files/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, hr_record_mutation_requested: true }), /must not mutate HR records/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => calculatePayrollTaxSlabs({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-094 payroll tax slab calculator service test passed.');
