import assert from 'node:assert/strict';
import { authorizeInvoiceLifecycleTransition, type InvoiceLifecycleTransitionInput } from './invoice_lifecycle_types.service';

const baseInput: InvoiceLifecycleTransitionInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_finance_invoice_receivables',
  invoice_id: 'invoice_001',
  invoice_record_authority_ref: 'invoice_record_authority_001',
  product_record_authority_ref: 'product_record_authority_001',
  product_price_history_ref: 'product_price_history_001',
  pricing_table_effective_date_ref: 'pricing_table_effective_date_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_001',
  current_status: 'DRAFT',
  requested_status: 'ISSUED',
  transition_reason: 'Invoice approved for issue',
  issued_at: '2026-06-08T23:05:00.000Z',
  transitioned_by_user_id: 'user_finance_owner_001',
  transitioned_at: '2026-06-08T23:06:00.000Z',
};

const issuedReceipt = authorizeInvoiceLifecycleTransition(baseInput);
assert.equal(issuedReceipt.seed_id, 'seed_6b_09_invoice_lifecycle_types');
assert.equal(issuedReceipt.component_id, '6B.09');
assert.equal(issuedReceipt.event_name, 'phase_6b.finance_invoice_receivables.invoice_lifecycle.transition_authorized');
assert.equal(issuedReceipt.transition_kind, 'DRAFT_TO_ISSUED');
assert.equal(issuedReceipt.immutable_after_issue, true);
assert.equal(issuedReceipt.post_issue_change_policy, 'CREDIT_OR_DEBIT_NOTE_REQUIRED');
assert.equal(issuedReceipt.mutate_issued_invoice_allowed, false);
assert.equal(issuedReceipt.credit_note_creation_allowed, false);
assert.equal(issuedReceipt.payment_allocation_allowed, false);
assert.equal(issuedReceipt.invoice_send_allowed, false);
assert.equal(issuedReceipt.irreversible_action_allowed, false);

const cancelledReceipt = authorizeInvoiceLifecycleTransition({
  ...baseInput,
  invoice_id: 'invoice_002',
  requested_status: 'CANCELLED_BEFORE_ISSUE',
  issued_at: undefined,
});
assert.equal(cancelledReceipt.transition_kind, 'DRAFT_TO_CANCELLED_BEFORE_ISSUE');
assert.equal(cancelledReceipt.immutable_after_issue, false);

const noOpReceipt = authorizeInvoiceLifecycleTransition({
  ...baseInput,
  invoice_id: 'invoice_003',
  current_status: 'DRAFT',
  requested_status: 'DRAFT',
  issued_at: undefined,
});
assert.equal(noOpReceipt.transition_kind, 'NO_OP_CURRENT_STATE');
assert.equal(noOpReceipt.immutable_after_issue, false);

assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, invoice_id: '' }), /invoice_id is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, invoice_record_authority_ref: '' }), /invoice_record_authority_ref is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, product_record_authority_ref: '' }), /product_record_authority_ref is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, product_price_history_ref: '' }), /product_price_history_ref is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, current_status: 'PAID' as never }), /current_status is not supported/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, requested_status: 'PAID' as never }), /requested_status is not supported/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, current_status: 'ISSUED', requested_status: 'DRAFT' }), /issued invoices are immutable/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, current_status: 'CANCELLED_BEFORE_ISSUE', requested_status: 'ISSUED' }), /requested invoice lifecycle transition is not allowed/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, requested_status: 'ISSUED', issued_at: undefined }), /issued_at is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, requested_status: 'DRAFT', issued_at: '2026-06-08T23:05:00.000Z' }), /issued_at is allowed only when requested_status is ISSUED/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, issued_at: 'not-a-date' }), /issued_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, transition_reason: '' }), /transition_reason is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, transitioned_by_user_id: '' }), /transitioned_by_user_id is required/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, transitioned_at: 'not-a-date' }), /transitioned_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, mutate_issued_invoice_requested: true }), /must not mutate issued invoices/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, credit_note_creation_requested: true }), /must not create credit or debit notes/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, invoice_send_requested: true }), /must not send invoices/);
assert.throws(() => authorizeInvoiceLifecycleTransition({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-065 invoice lifecycle types service test passed.');
