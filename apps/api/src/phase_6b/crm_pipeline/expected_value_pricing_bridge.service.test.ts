import assert from 'node:assert/strict';
import { calculateExpectedValuePricingBridge, type ExpectedValuePricingBridgeInput } from './expected_value_pricing_bridge.service';

const baseInput: ExpectedValuePricingBridgeInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_pipeline',
  expected_value_bridge_id: 'expected_value_bridge_001',
  lead_record_id: 'lead_record_001',
  lead_record_authority_id: 'lead_authority_001',
  match_candidate_generation_ref: 'match_candidate_generation_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_crm_pipeline_001',
  pipeline_stage_key: 'qualification',
  product_ref: 'product_catalogue_item_001',
  product_price_history_ref: 'product_price_history_001',
  currency_code: 'pkr',
  unit_price_minor_units: 250000,
  quantity: 3,
  probability_basis_points: 6250,
  calculated_by_user_id: 'user_pipeline_owner_001',
  calculated_at: '2026-06-08T18:40:00.000Z',
};

const receipt = calculateExpectedValuePricingBridge(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_06_expected_value_pricing_bridge');
assert.equal(receipt.component_id, '6B.06');
assert.equal(receipt.event_name, 'phase_6b.crm_pipeline.expected_value_pricing_bridge.calculated');
assert.equal(receipt.expected_value_bridge_id, 'expected_value_bridge_001');
assert.equal(receipt.lead_record_authority_id, 'lead_authority_001');
assert.equal(receipt.match_candidate_generation_ref, 'match_candidate_generation_001');
assert.equal(receipt.visual_workflow_builder_ref, 'visual_workflow_builder_crm_pipeline_001');
assert.equal(receipt.product_price_history_ref, 'product_price_history_001');
assert.equal(receipt.currency_code, 'PKR');
assert.equal(receipt.gross_value_minor_units, 750000);
assert.equal(receipt.probability_basis_points, 6250);
assert.equal(receipt.expected_value_minor_units_numerator, 4687500000);
assert.equal(receipt.expected_value_denominator, 10000);
assert.equal(receipt.canonical_price_history_required, true);
assert.equal(receipt.pricing_engine_allowed, false);
assert.equal(receipt.invoice_creation_allowed, false);
assert.equal(receipt.payment_allocation_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const zeroProbabilityReceipt = calculateExpectedValuePricingBridge({
  ...baseInput,
  expected_value_bridge_id: 'expected_value_bridge_002',
  probability_basis_points: 0,
});
assert.equal(zeroProbabilityReceipt.expected_value_minor_units_numerator, 0);

assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, expected_value_bridge_id: '' }), /expected_value_bridge_id is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, lead_record_authority_id: '' }), /lead_record_authority_id is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, match_candidate_generation_ref: '' }), /match_candidate_generation_ref is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, pipeline_stage_key: '' }), /pipeline_stage_key is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, product_ref: '' }), /product_ref is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, product_price_history_ref: '' }), /product_price_history_ref is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, currency_code: 'PK' }), /currency_code must be an ISO-style 3-letter code/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, unit_price_minor_units: -1 }), /unit_price_minor_units must be a non-negative safe integer/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, quantity: 0 }), /quantity must be a positive safe integer/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, probability_basis_points: 10001 }), /probability_basis_points must be between 0 and 10000/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, calculated_by_user_id: '' }), /calculated_by_user_id is required/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, calculated_at: 'not-a-date' }), /calculated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, unit_price_minor_units: Number.MAX_SAFE_INTEGER, quantity: 2 }), /gross_value_minor_units must remain a safe integer/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, unit_price_minor_units: 900719925475, quantity: 1, probability_basis_points: 10000 }), /expected_value_minor_units_numerator must remain a safe integer/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, pricing_engine_requested: true }), /must not execute the pricing engine/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, invoice_creation_requested: true }), /must not create invoices/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, payment_allocation_requested: true }), /must not allocate payments/);
assert.throws(() => calculateExpectedValuePricingBridge({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-049 expected value pricing bridge service test passed.');
