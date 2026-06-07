import assert from 'node:assert/strict';
import { Phase6BDiscountStackingEngineService } from './discount_stacking_engine.service';

const service = new Phase6BDiscountStackingEngineService();

const baseRequest = {
  organization_id: 'org_phase_6b',
  product_id: 'product_discounted_program',
  price_history_id: 'price_history_discount_2026_06',
  stack_run_id: 'discount_stack_001',
  base_amount_minor_units: 100000,
  currency_code: 'USD',
  discounts: [
    {
      discount_id: 'scholarship_discount',
      sequence: 1,
      discount_amount_minor_units: 10000,
      currency_code: 'USD',
      evidence_id: 'evidence_discount_scholarship',
    },
    {
      discount_id: 'early_bird_discount',
      sequence: 2,
      discount_amount_minor_units: 5000,
      currency_code: 'USD',
      evidence_id: 'evidence_discount_early_bird',
    },
  ],
  actor_user_id: 'user_pricing_admin',
  evidence_id: 'evidence_discount_stack_001',
  source_seed_id: 'seed_6b_02_discount_stacking_engine' as const,
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const receipt = service.evaluateStack(baseRequest);
assert.equal(receipt.seed_id, 'seed_6b_02_discount_stacking_engine');
assert.equal(receipt.component_id, '6B.02');
assert.equal(receipt.module_key, 'phase-6b.product-pricing');
assert.equal(receipt.final_amount_minor_units, 85000);
assert.deepEqual(receipt.pricing_authority.adl_refs, ['ADL-015']);
assert.equal(receipt.pricing_authority.canonical_price_history_required, true);
assert.equal(receipt.pricing_authority.invoice_snapshot_required, true);
assert.equal(receipt.lifecycle.activation_manifest_required, true);
assert.equal(receipt.lifecycle.independent_foundry_activation, false);
assert.deepEqual(
  receipt.applied_discounts.map((discount) => ({ before: discount.amount_before_minor_units, after: discount.amount_after_minor_units })),
  [
    { before: 100000, after: 90000 },
    { before: 90000, after: 85000 },
  ],
);
assert.equal(receipt.evidence.validation_event, 'PHASE_6B_DISCOUNT_STACKING_EVALUATED');

assert.throws(
  () =>
    service.evaluateStack({
      ...baseRequest,
      discounts: [],
    }),
  /at least one discount/,
);

assert.throws(
  () =>
    service.evaluateStack({
      ...baseRequest,
      discounts: [
        baseRequest.discounts[0],
        {
          ...baseRequest.discounts[1],
          sequence: 3,
        },
      ],
    }),
  /gapless/,
);

assert.throws(
  () =>
    service.evaluateStack({
      ...baseRequest,
      discounts: [
        baseRequest.discounts[0],
        {
          ...baseRequest.discounts[1],
          discount_id: baseRequest.discounts[0].discount_id,
        },
      ],
    }),
  /discount_id values must be unique/,
);

assert.throws(
  () =>
    service.evaluateStack({
      ...baseRequest,
      discounts: [
        {
          ...baseRequest.discounts[0],
          currency_code: 'EUR',
        },
      ],
    }),
  /must match stack currency_code/,
);

assert.throws(
  () =>
    service.evaluateStack({
      ...baseRequest,
      discounts: [
        {
          ...baseRequest.discounts[0],
          discount_amount_minor_units: 100001,
        },
      ],
    }),
  /cannot reduce the amount below zero/,
);

assert.throws(
  () =>
    service.evaluateStack({
      ...baseRequest,
      invoice_snapshot_required: false,
    } as never),
  /invoice price snapshots/,
);

assert.throws(
  () =>
    service.evaluateStack({
      ...baseRequest,
      undisclosed_policy_requested: 'apply_hidden_policy',
    } as never),
  /undisclosed discount policy/,
);

console.log('P6B-FFET-015 discount stacking engine service test passed.');
