import assert from 'node:assert/strict';
import { closeAccountingPeriod, type PeriodCloseManagementInput } from './period_close_management.service';

const baseInput: PeriodCloseManagementInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_general_ledger_accounting',
  source_seed_id: 'seed_6b_12_period_close_management',
  accounting_period_ref: 'period_2026_06',
  period_start_at: '2026-06-01T00:00:00.000Z',
  period_end_at: '2026-06-30T23:59:59.000Z',
  close_action: 'CLOSE_PERIOD',
  invoice_record_authority_ref: 'invoice_record_authority_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  expense_record_authority_ref: 'expense_record_authority_001',
  journal_entry_evidence_refs: ['journal_entry_evidence_invoice_001', 'journal_entry_evidence_expense_001'],
  period_close_evidence_refs: ['period_close_review_evidence_001', 'period_close_authorization_evidence_001'],
  unposted_journal_count: 0,
  unresolved_invoice_count: 0,
  unresolved_payment_allocation_count: 0,
  unresolved_expense_count: 0,
  close_authorized_by_user_id: 'user_gl_controller_001',
  close_authorized_at: '2026-07-01T00:00:00.000Z',
};

const receipt = closeAccountingPeriod(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_12_period_close_management');
assert.equal(receipt.component_id, '6B.12');
assert.equal(receipt.event_name, 'phase_6b.general_ledger_accounting.period.closed');
assert.equal(receipt.phase_6b_accounting_period_model, 'Phase6BAccountingPeriod');
assert.equal(receipt.source_seed_id, 'seed_6b_12_period_close_management');
assert.equal(receipt.accounting_period_ref, 'period_2026_06');
assert.equal(receipt.close_action, 'CLOSE_PERIOD');
assert.equal(receipt.journal_entry_evidence_count, 2);
assert.equal(receipt.period_close_evidence_count, 2);
assert.equal(receipt.unposted_journal_count, 0);
assert.equal(receipt.unresolved_invoice_count, 0);
assert.equal(receipt.unresolved_payment_allocation_count, 0);
assert.equal(receipt.unresolved_expense_count, 0);
assert.equal(receipt.period_protection_enforced, true);
assert.equal(receipt.period_closed, true);
assert.equal(receipt.reopen_performed, false);
assert.equal(receipt.journal_posting_performed, false);
assert.equal(receipt.tax_report_generated, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.retrospective_mutation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.period_close_evidence_ref, 'period_close:period_2026_06:closed');
assert.equal(receipt.period_close_digest.length, 64);

assert.throws(() => closeAccountingPeriod({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, accounting_period_ref: '' }), /accounting_period_ref is required/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, period_start_at: 'not-a-date' }), /period_start_at must be a valid ISO-compatible timestamp/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, period_end_at: 'not-a-date' }), /period_end_at must be a valid ISO-compatible timestamp/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, period_end_at: '2026-05-31T00:00:00.000Z' }), /period_end_at must be later/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, close_action: 'KEEP_OPEN' as never }), /close_action must be CLOSE_PERIOD/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, invoice_record_authority_ref: '' }), /invoice_record_authority_ref is required/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, expense_record_authority_ref: '' }), /expense_record_authority_ref is required/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, journal_entry_evidence_refs: [] }), /journal_entry_evidence_refs must include at least one/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, journal_entry_evidence_refs: ['evidence_a', 'evidence_a'] }), /journal_entry_evidence_refs must not contain duplicates/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, journal_entry_evidence_refs: [' '] }), /journal_entry_evidence_refs\[0\] is required/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, period_close_evidence_refs: [] }), /period_close_evidence_refs must include at least one/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, period_close_evidence_refs: ['evidence_a', 'evidence_a'] }), /period_close_evidence_refs must not contain duplicates/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, unposted_journal_count: 1 }), /unposted_journal_count must be 0/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, unresolved_invoice_count: 1 }), /unresolved_invoice_count must be 0/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, unresolved_payment_allocation_count: 1 }), /unresolved_payment_allocation_count must be 0/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, unresolved_expense_count: 1 }), /unresolved_expense_count must be 0/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, close_authorized_by_user_id: '' }), /close_authorized_by_user_id is required/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, close_authorized_at: 'not-a-date' }), /close_authorized_at must be a valid ISO-compatible timestamp/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, tax_report_generation_requested: true }), /must not generate tax reports/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, retrospective_mutation_requested: true }), /must not perform retrospective mutation/);
assert.throws(() => closeAccountingPeriod({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-086 period close management service test passed.');
