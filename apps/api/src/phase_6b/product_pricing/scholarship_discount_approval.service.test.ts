import assert from 'node:assert/strict';
import { Phase6BScholarshipDiscountApprovalService } from './scholarship_discount_approval.service';

const service = new Phase6BScholarshipDiscountApprovalService();

const baseRequest = {
  organization_id: 'org_phase_6b',
  product_id: 'product_academic_program',
  price_history_id: 'price_history_scholarship_2026_06',
  approval_request_id: 'approval_request_001',
  recipient_subject_id: 'recipient_subject_001',
  requested_discount_reference_id: 'discount_reference_scholarship_001',
  decision: 'APPROVE' as const,
  approver_user_id: 'user_pricing_approver',
  decision_reason: 'approved scholarship discount evidence packet',
  evidence_id: 'evidence_scholarship_approval_001',
  decided_at: '2026-06-08T12:00:00.000Z',
  source_seed_id: 'seed_6b_02_scholarship_discount_approval' as const,
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const receipt = service.recordDecision(baseRequest);
assert.equal(receipt.seed_id, 'seed_6b_02_scholarship_discount_approval');
assert.equal(receipt.component_id, '6B.02');
assert.equal(receipt.module_key, 'phase-6b.product-pricing');
assert.equal(receipt.decision, 'APPROVE');
assert.equal(receipt.pricing_authority.canonical_price_history_required, true);
assert.equal(receipt.pricing_authority.invoice_snapshot_required, true);
assert.equal(receipt.pricing_authority.discount_calculation_performed, false);
assert.equal(receipt.lifecycle.activation_manifest_required, true);
assert.equal(receipt.lifecycle.independent_foundry_activation, false);
assert.equal(receipt.evidence.validation_event, 'PHASE_6B_SCHOLARSHIP_DISCOUNT_APPROVAL_RECORDED');

const rejected = service.recordDecision({
  ...baseRequest,
  approval_request_id: 'approval_request_002',
  decision: 'REJECT',
  decision_reason: 'rejected scholarship discount evidence packet',
});
assert.equal(rejected.decision, 'REJECT');

assert.throws(
  () =>
    service.recordDecision({
      ...baseRequest,
      decision: 'PENDING',
    } as never),
  /APPROVE or REJECT/,
);

assert.throws(
  () =>
    service.recordDecision({
      ...baseRequest,
      price_history_id: '',
    }),
  /price_history_id/,
);

assert.throws(
  () =>
    service.recordDecision({
      ...baseRequest,
      decision_reason: '',
    }),
  /decision_reason/,
);

assert.throws(
  () =>
    service.recordDecision({
      ...baseRequest,
      decided_at: 'not-a-date',
    }),
  /valid date/,
);

assert.throws(
  () =>
    service.recordDecision({
      ...baseRequest,
      invoice_snapshot_required: false,
    } as never),
  /invoice price snapshots/,
);

assert.throws(
  () =>
    service.recordDecision({
      ...baseRequest,
      pricing_calculation_requested: 'calculate_discount',
    } as never),
  /does not calculate discounts/,
);

assert.throws(
  () =>
    service.recordDecision({
      ...baseRequest,
      independent_activation_requested: true,
    }),
  /manifest lifecycle/,
);

console.log('P6B-FFET-012 scholarship discount approval service test passed.');
