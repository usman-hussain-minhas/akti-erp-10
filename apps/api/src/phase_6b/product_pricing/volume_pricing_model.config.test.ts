import assert from 'node:assert/strict';
import { Phase6BVolumePricingModelConfig } from './volume_pricing_model.config';

const config = new Phase6BVolumePricingModelConfig();

const baseInput = {
  organization_id: 'org_phase_6b',
  product_id: 'product_standard_plan',
  price_history_id: 'price_history_volume_2026_06',
  source_seed_id: 'seed_6b_02_volume_pricing_model' as const,
  volume_breaks: [
    {
      break_id: 'volume_1_25',
      min_quantity: 1,
      max_quantity: 25,
      unit_amount_minor_units: 5000,
      currency_code: 'USD',
      evidence_id: 'evidence_volume_1_25',
    },
    {
      break_id: 'volume_26_100',
      min_quantity: 26,
      max_quantity: 100,
      unit_amount_minor_units: 4250,
      currency_code: 'USD',
      evidence_id: 'evidence_volume_26_100',
    },
    {
      break_id: 'volume_101_plus',
      min_quantity: 101,
      unit_amount_minor_units: 3750,
      currency_code: 'USD',
      evidence_id: 'evidence_volume_101_plus',
    },
  ],
  effective_from: '2026-06-01T00:00:00.000Z',
  actor_user_id: 'user_pricing_admin',
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const decision = config.validate(baseInput);
assert.equal(decision.seed_id, 'seed_6b_02_volume_pricing_model');
assert.equal(decision.component_id, '6B.02');
assert.equal(decision.module_key, 'phase-6b.product-pricing');
assert.equal(decision.configuration_extension, true);
assert.equal(decision.canonical_price_history_required, true);
assert.equal(decision.invoice_snapshot_required, true);
assert.equal(decision.independent_foundry_activation, false);
assert.equal(decision.pricing_engine_implemented, false);
assert.equal(decision.volume_break_count, 3);
assert.deepEqual(decision.volume_breaks.map((volumeBreak) => volumeBreak.quantity_range), [
  { min_quantity: 1, max_quantity: 25 },
  { min_quantity: 26, max_quantity: 100 },
  { min_quantity: 101, max_quantity: null },
]);
assert.equal(decision.volume_breaks[0]?.applies_to_entire_order_quantity, true);
assert.equal(decision.evidence.validation_event, 'PHASE_6B_VOLUME_PRICING_MODEL_CONFIG_VALIDATED');

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      volume_breaks: [
        baseInput.volume_breaks[0],
        {
          ...baseInput.volume_breaks[1],
          min_quantity: 27,
        },
      ],
    }),
  /gapless/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      volume_breaks: [
        {
          ...baseInput.volume_breaks[0],
          max_quantity: undefined,
        },
        baseInput.volume_breaks[1],
      ],
    }),
  /open-ended final break/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      volume_breaks: [
        baseInput.volume_breaks[0],
        {
          ...baseInput.volume_breaks[1],
          currency_code: 'EUR',
        },
        baseInput.volume_breaks[2],
      ],
    }),
  /single currency/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      volume_breaks: [
        baseInput.volume_breaks[0],
        {
          ...baseInput.volume_breaks[1],
          break_id: baseInput.volume_breaks[0].break_id,
        },
        baseInput.volume_breaks[2],
      ],
    }),
  /break_id values must be unique/,
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
    }),
  /cannot request independent activation/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      formula_expression: 'price = quantity * break_rate',
    } as never),
  /does not implement pricing formula or engine behavior/,
);

console.log('P6B-FFET-007 volume pricing model config test passed.');
