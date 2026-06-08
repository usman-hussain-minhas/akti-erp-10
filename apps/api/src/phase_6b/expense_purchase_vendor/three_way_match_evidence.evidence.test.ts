import assert from 'node:assert/strict';
import { recordThreeWayMatchEvidence, type ThreeWayMatchEvidenceInput } from './three_way_match_evidence.evidence';

const digest = 'b'.repeat(64);
const baseInput: ThreeWayMatchEvidenceInput = {
  organization_id: 'org_demo',
  purchase_order_ref: 'po_001',
  purchase_order_digest: digest,
  purchase_receipt_ref: 'purchase_receipt_001',
  purchase_receipt_evidence_ref: 'receipt_evidence_001',
  vendor_invoice_ref: 'vendor_invoice_001',
  vendor_invoice_evidence_ref: 'vendor_invoice_evidence_001',
  vendor_record_ref: 'vendor_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  reviewer_person_ref: 'person_reviewer_001',
  visual_workflow_builder_ref: 'workflow_three_way_match',
  match_policy: 'BLOCK_PAYMENT_EVIDENCE_ON_VARIANCE',
  currency_code: 'usd',
  amount_tolerance_minor: 100,
  quantity_tolerance_units: 0,
  line_matches: [
    {
      purchase_order_line_ref: 'po_line_001',
      purchase_receipt_line_ref: 'receipt_line_001',
      vendor_invoice_line_ref: 'invoice_line_001',
      ordered_quantity_units: 4,
      received_quantity_units: 4,
      invoiced_quantity_units: 4,
      ordered_amount_minor: 100000,
      invoiced_amount_minor: 100000,
    },
    {
      purchase_order_line_ref: 'po_line_002',
      purchase_receipt_line_ref: 'receipt_line_002',
      vendor_invoice_line_ref: 'invoice_line_002',
      ordered_quantity_units: 1,
      received_quantity_units: 1,
      invoiced_quantity_units: 1,
      ordered_amount_minor: 5000,
      invoiced_amount_minor: 5050,
    },
  ],
  evidence_recorded_by_user_id: 'user_match_reviewer_001',
  evidence_recorded_at: '2026-06-08T00:00:00.000Z',
};

const receipt = recordThreeWayMatchEvidence(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_11_three_way_match_evidence');
assert.equal(receipt.component_id, '6B.11');
assert.equal(receipt.event_name, 'phase_6b.expense_purchase_vendor.three_way_match.evidence_recorded');
assert.equal(receipt.match_status, 'MATCHED');
assert.equal(receipt.currency_code, 'USD');
assert.equal(receipt.line_count, 2);
assert.equal(receipt.matched_line_count, 2);
assert.equal(receipt.variance_count, 0);
assert.equal(receipt.total_ordered_amount_minor, 105000);
assert.equal(receipt.total_invoiced_amount_minor, 105050);
assert.equal(receipt.total_amount_variance_minor, 50);
assert.equal(receipt.payment_evidence_blocked, false);
assert.equal(receipt.three_way_match_evidence_ref, 'three_way_match:po_001:vendor_invoice_001');
assert.equal(receipt.three_way_match_digest.length, 64);
assert.equal(receipt.purchase_receipt_created, false);
assert.equal(receipt.vendor_invoice_created, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.gl_posting_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const variance = recordThreeWayMatchEvidence({
  ...baseInput,
  amount_tolerance_minor: 0,
  line_matches: [
    {
      ...baseInput.line_matches[0],
      invoiced_quantity_units: 3,
      invoiced_amount_minor: 90000,
    },
  ],
});
assert.equal(variance.match_status, 'VARIANCE_REVIEW_REQUIRED');
assert.equal(variance.variance_count, 1);
assert.equal(variance.matched_line_count, 0);
assert.equal(variance.payment_evidence_blocked, true);
assert.equal(variance.variances[0].quantity_variance_units, 1);
assert.equal(variance.variances[0].amount_variance_minor, 10000);
assert.equal(variance.variances[0].within_quantity_tolerance, false);
assert.equal(variance.variances[0].within_amount_tolerance, false);

const flaggedOnly = recordThreeWayMatchEvidence({
  ...baseInput,
  match_policy: 'FLAG_VARIANCE',
  amount_tolerance_minor: 0,
  line_matches: [{ ...baseInput.line_matches[0], invoiced_amount_minor: 90000 }],
});
assert.equal(flaggedOnly.match_status, 'VARIANCE_REVIEW_REQUIRED');
assert.equal(flaggedOnly.payment_evidence_blocked, false);

assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, purchase_order_ref: '' }), /purchase_order_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, purchase_order_digest: 'abc' }), /purchase_order_digest must be a 64-character/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, purchase_receipt_ref: '' }), /purchase_receipt_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, purchase_receipt_evidence_ref: '' }), /purchase_receipt_evidence_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, vendor_invoice_ref: '' }), /vendor_invoice_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, vendor_invoice_evidence_ref: '' }), /vendor_invoice_evidence_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, vendor_record_ref: '' }), /vendor_record_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, reviewer_person_ref: '' }), /reviewer_person_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, match_policy: 'AUTO_PAY' as never }), /match_policy is not supported/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, currency_code: 'US' }), /currency_code must be a three-letter/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, amount_tolerance_minor: -1 }), /amount_tolerance_minor must be a non-negative integer/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, quantity_tolerance_units: -1 }), /quantity_tolerance_units must be a non-negative integer/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, line_matches: [] }), /line_matches must include at least one line/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, line_matches: [{ ...baseInput.line_matches[0], purchase_order_line_ref: '' }] }), /line_matches\[0\].purchase_order_line_ref is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, line_matches: [baseInput.line_matches[0], baseInput.line_matches[0]] }), /must not repeat purchase_order_line_ref/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, line_matches: [{ ...baseInput.line_matches[0], ordered_quantity_units: -1 }] }), /ordered_quantity_units must be a non-negative integer/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, line_matches: [{ ...baseInput.line_matches[0], received_quantity_units: -1 }] }), /received_quantity_units must be a non-negative integer/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, line_matches: [{ ...baseInput.line_matches[0], invoiced_quantity_units: -1 }] }), /invoiced_quantity_units must be a non-negative integer/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, line_matches: [{ ...baseInput.line_matches[0], ordered_amount_minor: -1 }] }), /ordered_amount_minor must be a non-negative integer/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, line_matches: [{ ...baseInput.line_matches[0], invoiced_amount_minor: -1 }] }), /invoiced_amount_minor must be a non-negative integer/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, evidence_recorded_by_user_id: '' }), /evidence_recorded_by_user_id is required/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, evidence_recorded_at: 'not-a-date' }), /evidence_recorded_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, purchase_receipt_creation_requested: true }), /must not create purchase receipts/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, vendor_invoice_creation_requested: true }), /must not create vendor invoices/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, gl_posting_requested: true }), /must not post to general ledger/);
assert.throws(() => recordThreeWayMatchEvidence({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-083 three way match evidence test passed.');
