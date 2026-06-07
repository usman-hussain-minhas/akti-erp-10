import assert from 'node:assert/strict';
import { Phase6BTieredPricingModelConfig } from './tiered_pricing_model.config';

const config = new Phase6BTieredPricingModelConfig();

const baseInput = {
  organization_id: 'org_phase_6b',
  product_id: 'product_standard_plan',
  price_history_id: 'price_history_tiered_2026_06',
  source_seed_id: 'seed_6b_02_tiered_pricing_model' as const,
  tiers: [
    {
      tier_id: 'tier_1_10',
      min_quantity: 1,
      max_quantity: 10,
      unit_amount_minor_units: 5000,
      currency_code: 'USD',
      evidence_id: 'evidence_tier_1_10',
    },
    {
      tier_id: 'tier_11_50',
      min_quantity: 11,
      max_quantity: 50,
      unit_amount_minor_units: 4500,
      currency_code: 'USD',
      evidence_id: 'evidence_tier_11_50',
    },
    {
      tier_id: 'tier_51_plus',
      min_quantity: 51,
      unit_amount_minor_units: 4000,
      currency_code: 'USD',
      evidence_id: 'evidence_tier_51_plus',
    },
  ],
  effective_from: '2026-06-01T00:00:00.000Z',
  actor_user_id: 'user_pricing_admin',
  invoice_snapshot_required: true as const,
  independent_activation_requested: false as const,
};

const decision = config.validate(baseInput);
assert.equal(decision.seed_id, 'seed_6b_02_tiered_pricing_model');
assert.equal(decision.component_id, '6B.02');
assert.equal(decision.module_key, 'phase-6b.product-pricing');
assert.equal(decision.configuration_extension, true);
assert.equal(decision.canonical_price_history_required, true);
assert.equal(decision.invoice_snapshot_required, true);
assert.equal(decision.independent_foundry_activation, false);
assert.equal(decision.pricing_engine_implemented, false);
assert.equal(decision.tier_count, 3);
assert.deepEqual(decision.tiers.map((tier) => tier.quantity_range), [
  { min_quantity: 1, max_quantity: 10 },
  { min_quantity: 11, max_quantity: 50 },
  { min_quantity: 51, max_quantity: null },
]);
assert.equal(decision.evidence.validation_event, 'PHASE_6B_TIERED_PRICING_MODEL_CONFIG_VALIDATED');

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      tiers: [
        baseInput.tiers[0],
        {
          ...baseInput.tiers[1],
          min_quantity: 12,
        },
      ],
    }),
  /gapless/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      tiers: [
        {
          ...baseInput.tiers[0],
          max_quantity: undefined,
        },
        baseInput.tiers[1],
      ],
    }),
  /open-ended final tier/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      tiers: [
        baseInput.tiers[0],
        {
          ...baseInput.tiers[1],
          currency_code: 'EUR',
        },
        baseInput.tiers[2],
      ],
    }),
  /single currency/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      tiers: [
        baseInput.tiers[0],
        {
          ...baseInput.tiers[1],
          tier_id: baseInput.tiers[0].tier_id,
        },
        baseInput.tiers[2],
      ],
    }),
  /tier_id values must be unique/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      price_history_id: '',
    }),
  /price_history_id/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      invoice_snapshot_required: false,
    } as never),
  /invoice price snapshots/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      independent_activation_requested: true,
    } as never),
  /cannot request independent activation/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      formula_expression: 'if quantity > 10 then discount',
    } as never),
  /does not implement pricing formula or engine behavior/,
);

console.log('P6B-FFET-006 tiered pricing model config test passed.');
