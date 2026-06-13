import assert from 'node:assert/strict';
import { evaluateNonInventoryBusinessPolicy } from './non_inventory_business_policy.service';

const baseInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_inventory_stock',
  product_record_authority_id: 'product_authority_active',
  product_price_history_id: 'price_history_current',
  business_package_profile: 'NON_INVENTORY' as const,
  inventory_service_activation_state: 'DISABLED' as const,
};

const optionalDisabled = evaluateNonInventoryBusinessPolicy(baseInput);
assert.equal(optionalDisabled.seed_id, 'seed_6b_03_non_inventory_business_policy');
assert.equal(optionalDisabled.component_id, '6B.03');
assert.equal(optionalDisabled.organization_id, 'org_demo');
assert.equal(optionalDisabled.inventory_service_required, false);
assert.equal(optionalDisabled.inventory_service_activation_state, 'DISABLED');
assert.equal(optionalDisabled.policy_outcome, 'INVENTORY_OPTIONAL_AND_DISABLED_ALLOWED');
assert.deepEqual(optionalDisabled.dependency_basis, [
  'activation_lifecycle_required',
  'product_record_authority_required',
  'product_price_history_required',
]);

const optionalEnabled = evaluateNonInventoryBusinessPolicy({
  ...baseInput,
  inventory_service_activation_state: 'ENABLED',
});
assert.equal(optionalEnabled.inventory_service_required, false);
assert.equal(optionalEnabled.policy_outcome, 'INVENTORY_OPTIONAL_AND_ENABLED');

const retailRequired = evaluateNonInventoryBusinessPolicy({
  ...baseInput,
  business_package_profile: 'RETAIL',
  inventory_service_activation_state: 'ENABLED',
});
assert.equal(retailRequired.inventory_service_required, true);
assert.equal(retailRequired.policy_outcome, 'INVENTORY_REQUIRED_AND_ENABLED');

const ecommerceRequired = evaluateNonInventoryBusinessPolicy({
  ...baseInput,
  business_package_profile: 'E_COMMERCE',
  inventory_service_activation_state: 'ENABLED',
});
assert.equal(ecommerceRequired.inventory_service_required, true);
assert.equal(ecommerceRequired.policy_outcome, 'INVENTORY_REQUIRED_AND_ENABLED');

assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, business_package_profile: 'RETAIL' }),
  /inventory service is required for retail and e-commerce packages/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, business_package_profile: 'E_COMMERCE' }),
  /inventory service is required for retail and e-commerce packages/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, stock_tracking_requested: true }),
  /stock tracking requests require inventory service to be enabled/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, inventory_policy_override_requested: true }),
  /cannot override the accepted retail\/e-commerce inventory requirement/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, provider_operation_requested: true }),
  /must not request provider/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, service_manifest_contract_id: ' ' }),
  /service_manifest_contract_id is required/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, product_record_authority_id: '' }),
  /product_record_authority_id is required/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, product_price_history_id: '' }),
  /product_price_history_id is required/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, business_package_profile: 'WHOLESALE' as never }),
  /business_package_profile is not supported/,
);
assert.throws(
  () => evaluateNonInventoryBusinessPolicy({ ...baseInput, inventory_service_activation_state: 'PAUSED' as never }),
  /inventory_service_activation_state is not supported/,
);

console.log('P6B-FFET-021 non inventory business policy service test passed.');
