import assert from 'node:assert/strict';
import { Phase6BPerPeriodPricingModelConfig } from './per_period_pricing_model.config';

const config = new Phase6BPerPeriodPricingModelConfig();

const baseInput = {
  organization_id: 'org_phase_6b',
  product_id: 'product_subscription_plan',
  price_history_id: 'price_history_per_period_2026_06',
  source_seed_id: 'seed_6b_02_per_period_pricing_model' as const,
  period_code: 'monthly',
  period_amount_minor_units: 30000,
  currency_code: 'USD',
  effective_from: '2026-06-01T00:00:00.000Z',
  actor_user_id: 'user_pricing_admin',
  evidence_id: 'evidence_per_period_2026_06',
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const decision = config.validate(baseInput);
assert.equal(decision.seed_id, 'seed_6b_02_per_period_pricing_model');
assert.equal(decision.component_id, '6B.02');
assert.equal(decision.module_key, 'phase-6b.product-pricing');
assert.equal(decision.configuration_extension, true);
assert.equal(decision.canonical_price_history_required, true);
assert.equal(decision.invoice_snapshot_required, true);
assert.equal(decision.independent_foundry_activation, false);
assert.equal(decision.pricing_engine_implemented, false);
assert.deepEqual(decision.per_period_price, {
  period_code: 'monthly',
  period_amount_minor_units: 30000,
  currency_code: 'USD',
});
assert.equal(decision.effective_window.effective_to, null);
assert.equal(decision.evidence.validation_event, 'PHASE_6B_PER_PERIOD_PRICING_MODEL_CONFIG_VALIDATED');

const zeroPriceDecision = config.validate({
  ...baseInput,
  period_amount_minor_units: 0,
});
assert.equal(zeroPriceDecision.per_period_price.period_amount_minor_units, 0);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      period_code: '',
    }),
  /period_code/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      period_amount_minor_units: -1,
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
      formula_expression: 'periods * rate',
    } as never),
  /does not implement pricing formula or engine behavior/,
);

console.log('P6B-FFET-010 per-period pricing model config test passed.');
