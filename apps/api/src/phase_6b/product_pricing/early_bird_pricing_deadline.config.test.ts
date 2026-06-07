import assert from 'node:assert/strict';
import { Phase6BEarlyBirdPricingDeadlineConfig } from './early_bird_pricing_deadline.config';

const config = new Phase6BEarlyBirdPricingDeadlineConfig();

const baseInput = {
  organization_id: 'org_phase_6b',
  product_id: 'product_event_pass',
  price_history_id: 'price_history_standard_2026_06',
  source_seed_id: 'seed_6b_02_early_bird_pricing_deadline' as const,
  early_bird_deadline_at: '2026-07-01T00:00:00.000Z',
  early_bird_price_history_id: 'price_history_early_bird_2026_06',
  label: 'launch early bird window',
  actor_user_id: 'user_pricing_admin',
  evidence_id: 'evidence_early_bird_2026_06',
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const decision = config.validate(baseInput);
assert.equal(decision.seed_id, 'seed_6b_02_early_bird_pricing_deadline');
assert.equal(decision.component_id, '6B.02');
assert.equal(decision.module_key, 'phase-6b.product-pricing');
assert.equal(decision.configuration_extension, true);
assert.equal(decision.canonical_price_history_required, true);
assert.equal(decision.invoice_snapshot_required, true);
assert.equal(decision.independent_foundry_activation, false);
assert.equal(decision.pricing_engine_implemented, false);
assert.deepEqual(decision.early_bird_deadline, {
  deadline_at: '2026-07-01T00:00:00.000Z',
  early_bird_price_history_id: 'price_history_early_bird_2026_06',
  label: 'launch early bird window',
});
assert.equal(decision.evidence.validation_event, 'PHASE_6B_EARLY_BIRD_PRICING_DEADLINE_CONFIG_VALIDATED');

const withoutOptionalEarlyBirdPrice = config.validate({
  ...baseInput,
  early_bird_price_history_id: undefined,
  label: undefined,
});
assert.equal(withoutOptionalEarlyBirdPrice.early_bird_deadline.early_bird_price_history_id, null);
assert.equal(withoutOptionalEarlyBirdPrice.early_bird_deadline.label, null);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      early_bird_deadline_at: 'not-a-date',
    }),
  /valid date/,
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
      early_bird_price_history_id: '',
    }),
  /early_bird_price_history_id/,
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
      formula_expression: 'deadline discount calculation',
    } as never),
  /does not implement pricing formula or engine behavior/,
);

console.log('P6B-FFET-011 early-bird pricing deadline config test passed.');
