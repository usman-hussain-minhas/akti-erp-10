import assert from 'node:assert/strict';
import { authorizePurchaseOrder, type PurchaseOrderAuthorityInput } from './purchase_order_authority.service';

const baseInput: PurchaseOrderAuthorityInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_expense_purchase_vendor',
  source_seed_id: 'seed_6b_11_purchase_order_authority',
  purchase_order_ref: 'po_001',
  purchase_order_number: 'PO-2026-0001',
  vendor_record_ref: 'vendor_001',
  requester_person_ref: 'person_requester_001',
  approver_person_ref: 'person_approver_001',
  visual_workflow_builder_ref: 'workflow_purchase_order_approval',
  approval_workflow_ref: 'approval_workflow_po_001',
  approval_step_ref: 'approval_step_finance_owner',
  payment_allocation_balance_ref: 'payment_allocation_balance_po_001',
  approval_decision: 'APPROVED',
  currency_code: 'usd',
  issued_at: '2026-06-05T00:00:00.000Z',
  approved_at: '2026-06-05T01:00:00.000Z',
  expected_receipt_at: '2026-06-10T00:00:00.000Z',
  purchase_order_lines: [
    {
      purchase_order_line_ref: 'po_line_001',
      line_type: 'GOODS',
      description: 'Approved stock purchase line',
      quantity_units: 4,
      unit_amount_minor: 25000,
      line_total_minor: 100000,
      currency_code: 'USD',
    },
    {
      purchase_order_line_ref: 'po_line_002',
      line_type: 'SERVICE',
      description: 'Delivery handling service',
      quantity_units: 1,
      unit_amount_minor: 5000,
      line_total_minor: 5000,
      currency_code: 'usd',
    },
  ],
  purchase_order_evidence_refs: ['po_approval_evidence_001', 'vendor_quote_evidence_001'],
  authorized_by_user_id: 'user_purchase_controller_001',
  authorized_at: '2026-06-05T01:05:00.000Z',
};

const receipt = authorizePurchaseOrder(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_11_purchase_order_authority');
assert.equal(receipt.component_id, '6B.11');
assert.equal(receipt.event_name, 'phase_6b.expense_purchase_vendor.po.approved');
assert.equal(receipt.phase_6b_purchase_order_model, 'Phase6BPurchaseOrder');
assert.equal(receipt.phase_6b_vendor_model_relation_required, true);
assert.equal(receipt.source_seed_id, 'seed_6b_11_purchase_order_authority');
assert.equal(receipt.purchase_order_ref, 'po_001');
assert.equal(receipt.vendor_record_ref, 'vendor_001');
assert.equal(receipt.approval_decision, 'APPROVED');
assert.equal(receipt.currency_code, 'USD');
assert.equal(receipt.line_count, 2);
assert.equal(receipt.purchase_order_total_minor, 105000);
assert.equal(receipt.evidence_count, 2);
assert.equal(receipt.approval_capability_gated, true);
assert.equal(receipt.purchase_order_evidence_ref, 'purchase_order:po_001:approval_step_finance_owner:APPROVED');
assert.equal(receipt.purchase_order_digest.length, 64);
assert.equal(receipt.purchase_receipt_created, false);
assert.equal(receipt.vendor_invoice_created, false);
assert.equal(receipt.inventory_receiving_performed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.gl_posting_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const withoutExpectedReceipt = authorizePurchaseOrder({
  ...baseInput,
  purchase_order_ref: 'po_002',
  expected_receipt_at: undefined,
});
assert.equal(withoutExpectedReceipt.expected_receipt_at, undefined);

assert.throws(() => authorizePurchaseOrder({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_ref: '' }), /purchase_order_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_number: '' }), /purchase_order_number is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, vendor_record_ref: '' }), /vendor_record_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, requester_person_ref: '' }), /requester_person_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, approver_person_ref: '' }), /approver_person_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, approval_workflow_ref: '' }), /approval_workflow_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, approval_step_ref: '' }), /approval_step_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, approval_decision: 'REJECTED' as never }), /approval_decision must be APPROVED/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, currency_code: 'US' }), /currency_code must be a three-letter/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, issued_at: 'not-a-date' }), /issued_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, approved_at: 'not-a-date' }), /approved_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, approved_at: '2026-06-04T00:00:00.000Z' }), /approved_at must not be earlier/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, expected_receipt_at: '2026-06-04T00:00:00.000Z' }), /expected_receipt_at must not be earlier/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [] }), /purchase_order_lines must include at least one line/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [baseInput.purchase_order_lines[0], baseInput.purchase_order_lines[0]] }), /must not repeat purchase_order_line_ref/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [{ ...baseInput.purchase_order_lines[0], purchase_order_line_ref: '' }] }), /purchase_order_lines.purchase_order_line_ref is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [{ ...baseInput.purchase_order_lines[0], line_type: 'OTHER' as never }] }), /line_type is not supported/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [{ ...baseInput.purchase_order_lines[0], description: '' }] }), /purchase_order_lines.description is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [{ ...baseInput.purchase_order_lines[0], quantity_units: 0 }] }), /quantity_units must be a positive integer/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [{ ...baseInput.purchase_order_lines[0], unit_amount_minor: -1 }] }), /unit_amount_minor must be a non-negative integer/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [{ ...baseInput.purchase_order_lines[0], line_total_minor: 1 }] }), /line_total_minor must equal/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_lines: [{ ...baseInput.purchase_order_lines[0], currency_code: 'PKR' }] }), /purchase order line currency must match/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_evidence_refs: [] }), /purchase_order_evidence_refs must include at least one/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_evidence_refs: ['evidence_a', 'evidence_a'] }), /purchase_order_evidence_refs must not contain duplicates/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_order_evidence_refs: [' '] }), /purchase_order_evidence_refs\[0\] is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, authorized_by_user_id: '' }), /authorized_by_user_id is required/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, authorized_at: 'not-a-date' }), /authorized_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, purchase_receipt_requested: true }), /must not create purchase receipts/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, vendor_invoice_requested: true }), /must not create vendor invoices/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, inventory_receiving_requested: true }), /must not perform inventory receiving/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, gl_posting_requested: true }), /must not post to general ledger/);
assert.throws(() => authorizePurchaseOrder({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-082 purchase order authority service test passed.');
