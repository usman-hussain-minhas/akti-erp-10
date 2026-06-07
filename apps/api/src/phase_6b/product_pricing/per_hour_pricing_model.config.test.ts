import assert from 'node:assert/strict';
import { Phase6BPerHourPricingModelConfig } from './per_hour_pricing_model.config';

const config = new Phase6BPerHourPricingModelConfig();

const baseInput = {
  organization_id: 'org_phase_6b',
  product_id: 'product_consulting_hour',
  price_history_id: 'price_history_per_hour_2026_06',
  source_seed_id: 'seed_6b_02_per_hour_pricing_model' as const,
  time_unit: 'hour' as const,
  hour_amount_minor_units: 15000,
  currency_code: 'USD',
  effective_from: '2026-06-01T00:00:00.000Z',
  actor_user_id: 'user_pricing_admin',
  evidence_id: 'evidence_per_hour_2026_06',
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const decision = config.validate(baseInput);
assert.equal(decision.seed_id, 'seed_6b_02_per_hour_pricing_model');
assert.equal(decision.component_id, '6B.02');
assert.equal(decision.module_key, 'phase-6b.product-pricing');
assert.equal(decision.configuration_extension, true);
assert.equal(decision.canonical_price_history_required, true);
assert.equal(decision.invoice_snapshot_required, true);
assert.equal(decision.independent_foundry_activation, false);
assert.equal(decision.pricing_engine_implemented, false);
assert.deepEqual(decision.per_hour_price, {
  time_unit: 'hour',
  hour_amount_minor_units: 15000,
  currency_code: 'USD',
});
assert.equal(decision.evidence.validation_event, 'PHASE_6B_PER_HOUR_PRICING_MODEL_CONFIG_VALIDATED');

const zeroPriceDecision = config.validate({
  ...baseInput,
  hour_amount_minor_units: 0,
});
assert.equal(zeroPriceDecision.per_hour_price.hour_amount_minor_units, 0);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      time_unit: 'minute',
    } as never),
  /only accepts hour/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      hour_amount_minor_units: -1,
    }),
  /non-negative integer/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      currency_code: 'usd',
    }),
  /uppercase ISO-style currency code/,
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
      effective_to: '2026-05-31T00:00:00.000Z',
    }),
  /effective_to must be on or after effective_from/,
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
      formula_expression: 'hours * hourly_rate',
    } as never),
  /does not implement pricing formula or engine behavior/,
);

console.log('P6B-FFET-009 per-hour pricing model config test passed.');
