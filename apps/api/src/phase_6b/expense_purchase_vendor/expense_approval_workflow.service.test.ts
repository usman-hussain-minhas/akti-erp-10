import assert from 'node:assert/strict';
import { recordExpenseApprovalWorkflowDecision, type ExpenseApprovalWorkflowInput } from './expense_approval_workflow.service';

const digest = 'a'.repeat(64);
const baseInput: ExpenseApprovalWorkflowInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_expense_purchase_vendor',
  expense_record_ref: 'expense_001',
  expense_record_digest: digest,
  requester_person_ref: 'person_requester_001',
  approver_person_ref: 'person_approver_001',
  visual_workflow_builder_ref: 'workflow_expense_approval',
  approval_workflow_ref: 'approval_workflow_001',
  approval_step_ref: 'approval_step_finance_owner',
  evidence_mode: 'MANUAL_REVIEW',
  decision: 'APPROVED',
  decision_reason: 'approved from valid receipt evidence',
  expense_total_minor: 33000,
  currency_code: 'usd',
  submitted_at: '2026-06-02T00:00:00.000Z',
  decided_at: '2026-06-03T00:00:00.000Z',
};

const receipt = recordExpenseApprovalWorkflowDecision(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_11_expense_approval_workflow');
assert.equal(receipt.component_id, '6B.11');
assert.equal(receipt.event_name, 'phase_6b.expense_purchase_vendor.expense_approval.decision_recorded');
assert.equal(receipt.decision, 'APPROVED');
assert.equal(receipt.evidence_mode, 'MANUAL_REVIEW');
assert.equal(receipt.currency_code, 'USD');
assert.equal(receipt.approval_capability_gated, true);
assert.equal(receipt.approval_evidence_ref, 'expense_approval:expense_001:approval_step_finance_owner:APPROVED');
assert.equal(receipt.vendor_payment_performed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.gl_posting_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const escalated = recordExpenseApprovalWorkflowDecision({
  ...baseInput,
  approval_step_ref: 'approval_step_escalation',
  evidence_mode: 'WORKFLOW_RULE',
  decision: 'ESCALATED',
  decision_reason: 'expense amount requires senior review',
});
assert.equal(escalated.decision, 'ESCALATED');
assert.equal(escalated.evidence_mode, 'WORKFLOW_RULE');

assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, expense_record_ref: '' }), /expense_record_ref is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, expense_record_digest: 'abc' }), /expense_record_digest must be a 64-character/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, requester_person_ref: '' }), /requester_person_ref is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, approver_person_ref: '' }), /approver_person_ref is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, approval_workflow_ref: '' }), /approval_workflow_ref is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, approval_step_ref: '' }), /approval_step_ref is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, evidence_mode: 'AUTO_APPROVE' as never }), /evidence_mode is not supported/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, decision: 'PAID' as never }), /decision is not supported/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, decision_reason: '' }), /decision_reason is required/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, expense_total_minor: 0 }), /expense_total_minor must be a positive integer/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, currency_code: 'US' }), /currency_code must be a three-letter/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, submitted_at: 'not-a-date' }), /submitted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, decided_at: 'not-a-date' }), /decided_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, decided_at: '2026-06-01T00:00:00.000Z' }), /decided_at must not be earlier/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, vendor_payment_requested: true }), /must not execute vendor payments/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, gl_posting_requested: true }), /must not post to general ledger/);
assert.throws(() => recordExpenseApprovalWorkflowDecision({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-080 expense approval workflow service test passed.');
