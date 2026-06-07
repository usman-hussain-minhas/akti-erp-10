import assert from 'node:assert/strict';
import { Phase6BBundlePackageCompositionConfig } from './bundle_package_composition.config';

const config = new Phase6BBundlePackageCompositionConfig();

const baseInput = {
  organization_id: 'org_phase_6b',
  bundle_product_id: 'bundle_foundation_package',
  price_history_id: 'price_history_bundle_2026_06',
  source_seed_id: 'seed_6b_02_bundle_package_composition' as const,
  components: [
    {
      component_product_id: 'product_course_a',
      quantity: 1,
      component_price_history_id: 'price_history_course_a_2026_06',
      evidence_id: 'evidence_bundle_component_a',
    },
    {
      component_product_id: 'product_course_b',
      quantity: 2,
      evidence_id: 'evidence_bundle_component_b',
    },
  ],
  actor_user_id: 'user_pricing_admin',
  evidence_id: 'evidence_bundle_2026_06',
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const decision = config.validate(baseInput);
assert.equal(decision.seed_id, 'seed_6b_02_bundle_package_composition');
assert.equal(decision.component_id, '6B.02');
assert.equal(decision.module_key, 'phase-6b.product-pricing');
assert.equal(decision.configuration_extension, true);
assert.equal(decision.canonical_price_history_required, true);
assert.equal(decision.invoice_snapshot_required, true);
assert.equal(decision.independent_foundry_activation, false);
assert.equal(decision.pricing_engine_implemented, false);
assert.equal(decision.component_count, 2);
assert.deepEqual(decision.components.map((component) => component.component_product_id), ['product_course_a', 'product_course_b']);
assert.equal(decision.components[1]?.component_price_history_id, null);
assert.equal(decision.evidence.validation_event, 'PHASE_6B_BUNDLE_PACKAGE_COMPOSITION_CONFIG_VALIDATED');

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      components: [],
    }),
  /at least one component/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      components: [
        baseInput.components[0],
        {
          ...baseInput.components[1],
          component_product_id: baseInput.components[0].component_product_id,
        },
      ],
    }),
  /component_product_id values must be unique/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      components: [
        {
          ...baseInput.components[0],
          component_product_id: baseInput.bundle_product_id,
        },
      ],
    }),
  /cannot directly include the bundle product/,
);

assert.throws(
  () =>
    config.validate({
      ...baseInput,
      components: [
        {
          ...baseInput.components[0],
          quantity: 0,
        },
      ],
    }),
  /positive integer/,
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
      pricing_calculation_requested: 'calculate_bundle_price',
    } as never),
  /does not implement bundle pricing calculation/,
);

console.log('P6B-FFET-014 bundle package composition config test passed.');
