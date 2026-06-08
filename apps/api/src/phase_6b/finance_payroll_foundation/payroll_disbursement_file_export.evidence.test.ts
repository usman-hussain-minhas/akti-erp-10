import assert from 'node:assert/strict';
import { exportPayrollDisbursementFile, type PayrollDisbursementFileExportInput } from './payroll_disbursement_file_export.evidence';

const baseInput: PayrollDisbursementFileExportInput = {
  organization_id: 'org_demo',
  source_seed_id: 'seed_6b_14_payroll_disbursement_file_export',
  export_ref: 'payroll_disbursement_export_001',
  payroll_batch_ref: 'payroll_batch_2026_06',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  base_currency_code: 'usd',
  export_format: 'CSV',
  exported_by_user_id: 'user_payroll_controller_001',
  exported_at: '2026-06-08T00:00:00.000Z',
  lines: [
    { payout_ref: 'payout_001', payee_ref: 'payee_001', person_identity_ref: 'person_001', beneficiary_label: 'Amina Example', amount_minor: 190000, currency_code: 'USD', payment_allocation_balance_ref: 'payment_allocation_balance_001', chart_account_ref: 'acct_payroll_cash', payout_evidence_ref: 'payroll_run:payout_001:ready' },
    { payout_ref: 'payout_002', payee_ref: 'payee_002', person_identity_ref: 'person_002', beneficiary_label: 'Bilal Example', amount_minor: 260000, currency_code: 'usd', payment_allocation_balance_ref: 'payment_allocation_balance_001', chart_account_ref: 'acct_payroll_cash', payout_evidence_ref: 'payroll_run:payout_002:ready' },
  ],
};

const receipt = exportPayrollDisbursementFile(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_14_payroll_disbursement_file_export');
assert.equal(receipt.component_id, '6B.14');
assert.equal(receipt.event_name, 'phase_6b.finance_payroll.disbursement_file_exported');
assert.equal(receipt.source_seed_id, 'seed_6b_14_payroll_disbursement_file_export');
assert.equal(receipt.base_currency_code, 'USD');
assert.equal(receipt.line_count, 2);
assert.equal(receipt.total_amount_minor, 450000);
assert.match(receipt.file_payload, /payout_ref,payee_ref,person_identity_ref/);
assert.match(receipt.file_payload, /payout_001,payee_001,person_001,Amina Example,190000,USD/);
assert.equal(receipt.file_evidence_ref, 'payroll_disbursement_file_export:payroll_disbursement_export_001:generated');
assert.equal(receipt.bank_transmission_performed, false);
assert.equal(receipt.payout_created, false);
assert.equal(receipt.credential_handling_performed, false);
assert.equal(receipt.journal_posted, false);
assert.equal(receipt.hr_record_mutated, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.file_digest.length, 64);

assert.equal(exportPayrollDisbursementFile({ ...baseInput, export_format: 'BANK_STANDARD_TEXT' }).file_payload.split('\n')[0].includes('|'), true);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, export_ref: '' }), /export_ref is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, payroll_batch_ref: '' }), /payroll_batch_ref is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, base_currency_code: 'US' }), /base_currency_code must be a three-letter/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, export_format: 'XML' as never }), /export_format is not supported/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [] }), /lines must include at least one payout line/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [{ ...baseInput.lines[0], payout_ref: '' }] }), /lines.payout_ref is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [{ ...baseInput.lines[0], payee_ref: '' }] }), /lines.payee_ref is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [{ ...baseInput.lines[0], person_identity_ref: '' }] }), /lines.person_identity_ref is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [{ ...baseInput.lines[0], amount_minor: 0 }] }), /lines.amount_minor must be a positive integer/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [{ ...baseInput.lines[0], currency_code: 'EUR' }] }), /lines.currency_code must match/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [{ ...baseInput.lines[0], payment_allocation_balance_ref: 'other_balance' }] }), /lines.payment_allocation_balance_ref must match/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [{ ...baseInput.lines[0], chart_account_ref: '' }] }), /lines.chart_account_ref is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, lines: [baseInput.lines[0], baseInput.lines[0]] }), /lines must not repeat payout_ref/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, exported_by_user_id: '' }), /exported_by_user_id is required/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, exported_at: 'not-a-date' }), /exported_at must be a valid ISO-compatible timestamp/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, bank_transmission_requested: true }), /must not transmit to banks/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, payout_creation_requested: true }), /must not create payroll payouts/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, credential_handling_requested: true }), /must not handle credentials/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, hr_record_mutation_requested: true }), /must not mutate HR records/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => exportPayrollDisbursementFile({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-097 payroll disbursement file export evidence test passed.');
