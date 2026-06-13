import assert from 'node:assert/strict';

import { Phase6BFixedPricingModelConfig } from './fixed_pricing_model.config';

function validFixedPricingInput() {
  return {
    organization_id: 'org_demo',
    product_id: 'prod_admission_package',
    price_history_id: 'price_history_2026_fixed',
    amount_minor_units: 250000,
    currency_code: 'PKR',
    effective_from: '2026-01-01T00:00:00.000Z',
    effective_to: '2026-12-31T23:59:59.999Z',
    actor_user_id: 'user_pricing_manager',
    evidence_id: 'evidence_fixed_price_2026',
    invoice_snapshot_required: true,
  };
}

function testAcceptsFixedPricingConfiguration() {
  const config = new Phase6BFixedPricingModelConfig();
  const result = config.evaluateFixedPricingModel(validFixedPricingInput());

  assert.equal(result.accepted, true);
  assert.deepEqual(result.violations, []);
  assert.equal(result.normalized_amount_minor_units, 250000);
  assert.equal(result.normalized_currency_code, 'PKR');
  assert.equal(result.evidence.canonical_price_history_required, true);
  assert.equal(result.evidence.configuration_extension, true);
  assert.equal(result.evidence.independent_foundry_activation_allowed, false);
  assert.equal(result.evidence.pricing_engine_implemented, false);
}

function testAllowsZeroFixedAmountAsConfigurationValue() {
  const config = new Phase6BFixedPricingModelConfig();
  const result = config.evaluateFixedPricingModel({
    ...validFixedPricingInput(),
    amount_minor_units: 0,
  });

  assert.equal(result.accepted, true);
  assert.equal(result.normalized_amount_minor_units, 0);
}

function testRejectsMissingCanonicalPriceHistory() {
  const config = new Phase6BFixedPricingModelConfig();
  const result = config.evaluateFixedPricingModel({
    ...validFixedPricingInput(),
    price_history_id: '',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('price_history_id is required as canonical pricing authority'));
}

function testRejectsFormulaOrEngineBehavior() {
  const config = new Phase6BFixedPricingModelConfig();
  const result = config.evaluateFixedPricingModel({
    ...validFixedPricingInput(),
    formula_expression: 'base * seats',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('fixed pricing model cannot carry formula_expression or pricing-engine behavior'));
}

function testRejectsIndependentActivation() {
  const config = new Phase6BFixedPricingModelConfig();
  const result = config.evaluateFixedPricingModel({
    ...validFixedPricingInput(),
    independent_activation_requested: true,
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('fixed pricing model is a configuration extension and cannot request independent Foundry activation'));
}

function testRejectsInvalidEffectiveDateRange() {
  const config = new Phase6BFixedPricingModelConfig();
  const result = config.evaluateFixedPricingModel({
    ...validFixedPricingInput(),
    effective_from: '2026-12-31T00:00:00.000Z',
    effective_to: '2026-01-01T00:00:00.000Z',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('effective_to cannot be earlier than effective_from'));
}

function testRequiresInvoiceSnapshotHandoff() {
  const config = new Phase6BFixedPricingModelConfig();
  const result = config.evaluateFixedPricingModel({
    ...validFixedPricingInput(),
    invoice_snapshot_required: false,
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('invoice_snapshot_required must be true to preserve invoice immutability handoff'));
}

function run() {
  testAcceptsFixedPricingConfiguration();
  testAllowsZeroFixedAmountAsConfigurationValue();
  testRejectsMissingCanonicalPriceHistory();
  testRejectsFormulaOrEngineBehavior();
  testRejectsIndependentActivation();
  testRejectsInvalidEffectiveDateRange();
  testRequiresInvoiceSnapshotHandoff();
  console.log('P6B-FFET-005 fixed pricing model config test passed.');
}

run();
