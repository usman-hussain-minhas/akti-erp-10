import assert from 'node:assert/strict';
import { authorizeExpenseRecord, type ExpenseRecordAuthorityInput } from './expense_record_authority.service';

const baseInput: ExpenseRecordAuthorityInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_expense_purchase_vendor',
  expense_record_ref: 'expense_001',
  expense_number: 'EXP-2026-0001',
  vendor_record_ref: 'vendor_001',
  requester_person_ref: 'person_requester_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  visual_workflow_builder_ref: 'workflow_expense_approval',
  approval_workflow_ref: 'approval_workflow_expense_001',
  pricing_table_effective_date_ref: 'pricing_effective_2026_06',
  status: 'APPROVED',
  currency_code: 'usd',
  incurred_at: '2026-06-01T00:00:00.000Z',
  submitted_at: '2026-06-02T00:00:00.000Z',
  approved_by_person_ref: 'person_approver_001',
  approved_at: '2026-06-03T00:00:00.000Z',
  expense_lines: [
    {
      expense_line_ref: 'expense_line_001',
      line_type: 'PURCHASE',
      description: 'Approved vendor purchase',
      quantity_units: 2,
      unit_amount_minor: 15000,
      line_total_minor: 30000,
      currency_code: 'USD',
      receipt_evidence_ref: 'receipt_evidence_001',
    },
    {
      expense_line_ref: 'expense_line_002',
      line_type: 'TAX',
      description: 'Tax evidence line',
      quantity_units: 1,
      unit_amount_minor: 3000,
      line_total_minor: 3000,
      currency_code: 'usd',
    },
  ],
  authorized_by_user_id: 'user_expense_controller_001',
  authorized_at: '2026-06-03T00:05:00.000Z',
};

const receipt = authorizeExpenseRecord(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_11_expense_record_authority');
assert.equal(receipt.component_id, '6B.11');
assert.equal(receipt.event_name, 'phase_6b.expense_purchase_vendor.expense_record.authorized');
assert.equal(receipt.status, 'APPROVED');
assert.equal(receipt.currency_code, 'USD');
assert.equal(receipt.line_count, 2);
assert.equal(receipt.expense_total_minor, 33000);
assert.equal(receipt.approval_capability_gated, true);
assert.equal(receipt.expense_record_digest.length, 64);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.vendor_payment_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.gl_posting_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const rejected = authorizeExpenseRecord({
  ...baseInput,
  expense_record_ref: 'expense_002',
  status: 'REJECTED',
  approved_by_person_ref: undefined,
  approved_at: undefined,
  rejection_reason: 'receipt evidence rejected by reviewer',
});
assert.equal(rejected.status, 'REJECTED');
assert.equal(rejected.rejection_reason, 'receipt evidence rejected by reviewer');

assert.throws(() => authorizeExpenseRecord({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_record_ref: '' }), /expense_record_ref is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_number: '' }), /expense_number is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, vendor_record_ref: '' }), /vendor_record_ref is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, requester_person_ref: '' }), /requester_person_ref is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, approval_workflow_ref: '' }), /approval_workflow_ref is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, status: 'PAID' as never }), /status is not supported/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, currency_code: 'US' }), /currency_code must be a three-letter/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, incurred_at: 'not-a-date' }), /incurred_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, status: 'SUBMITTED', submitted_at: undefined, approved_by_person_ref: undefined, approved_at: undefined }), /submitted_at is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, status: 'APPROVED', approved_by_person_ref: undefined }), /approved expenses require approved_by_person_ref and approved_at/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, status: 'DRAFT', submitted_at: undefined, approved_by_person_ref: 'person_approver_001' }), /approval fields are allowed only/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, status: 'REJECTED', approved_by_person_ref: undefined, approved_at: undefined, rejection_reason: undefined }), /rejected expenses require rejection_reason/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, rejection_reason: 'not allowed' }), /rejection_reason is allowed only/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [] }), /expense_lines must include at least one line/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [baseInput.expense_lines[0], baseInput.expense_lines[0]] }), /must not repeat expense_line_ref/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [{ ...baseInput.expense_lines[0], expense_line_ref: '' }] }), /expense_lines.expense_line_ref is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [{ ...baseInput.expense_lines[0], line_type: 'OTHER' as never }] }), /line_type is not supported/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [{ ...baseInput.expense_lines[0], description: '' }] }), /expense_lines.description is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [{ ...baseInput.expense_lines[0], quantity_units: 0 }] }), /quantity_units must be a positive integer/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [{ ...baseInput.expense_lines[0], unit_amount_minor: -1 }] }), /unit_amount_minor must be a non-negative integer/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [{ ...baseInput.expense_lines[0], line_total_minor: 1 }] }), /line_total_minor must equal/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, expense_lines: [{ ...baseInput.expense_lines[0], currency_code: 'PKR' }] }), /expense line currency must match/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, authorized_by_user_id: '' }), /authorized_by_user_id is required/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, authorized_at: 'not-a-date' }), /authorized_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, vendor_payment_requested: true }), /must not execute vendor payments/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, gl_posting_requested: true }), /must not post to general ledger/);
assert.throws(() => authorizeExpenseRecord({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-079 expense record authority service test passed.');
