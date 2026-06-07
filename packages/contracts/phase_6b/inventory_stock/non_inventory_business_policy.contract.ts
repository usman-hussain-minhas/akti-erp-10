export const PHASE_6B_NON_INVENTORY_BUSINESS_POLICY_SEED_ID = 'seed_6b_03_non_inventory_business_policy' as const;
export const PHASE_6B_NON_INVENTORY_BUSINESS_POLICY_COMPONENT_ID = '6B.03' as const;

export type InventoryBusinessPackageProfile = 'NON_INVENTORY' | 'RETAIL' | 'E_COMMERCE';
export type InventoryActivationState = 'ENABLED' | 'DISABLED';
export type NonInventoryBusinessPolicyOutcome =
  | 'INVENTORY_OPTIONAL_AND_DISABLED_ALLOWED'
  | 'INVENTORY_OPTIONAL_AND_ENABLED'
  | 'INVENTORY_REQUIRED_AND_ENABLED';

export type NonInventoryBusinessPolicyInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  product_record_authority_id: string;
  product_price_history_id: string;
  business_package_profile: InventoryBusinessPackageProfile;
  inventory_service_activation_state: InventoryActivationState;
  stock_tracking_requested?: boolean;
  inventory_policy_override_requested?: boolean;
  provider_operation_requested?: boolean;
};

export type NonInventoryBusinessPolicyDecision = {
  seed_id: typeof PHASE_6B_NON_INVENTORY_BUSINESS_POLICY_SEED_ID;
  component_id: typeof PHASE_6B_NON_INVENTORY_BUSINESS_POLICY_COMPONENT_ID;
  organization_id: string;
  service_manifest_contract_id: string;
  product_record_authority_id: string;
  product_price_history_id: string;
  business_package_profile: InventoryBusinessPackageProfile;
  inventory_service_required: boolean;
  inventory_service_activation_state: InventoryActivationState;
  activation_allowed: true;
  policy_outcome: NonInventoryBusinessPolicyOutcome;
  dependency_basis: readonly [
    'activation_lifecycle_required',
    'product_record_authority_required',
    'product_price_history_required',
  ];
};

const BUSINESS_PACKAGE_PROFILES: readonly InventoryBusinessPackageProfile[] = ['NON_INVENTORY', 'RETAIL', 'E_COMMERCE'] as const;
const ACTIVATION_STATES: readonly InventoryActivationState[] = ['ENABLED', 'DISABLED'] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for non-inventory business policy.`);
  }
  return value.trim();
}

function requirePackageProfile(value: InventoryBusinessPackageProfile): InventoryBusinessPackageProfile {
  if (!BUSINESS_PACKAGE_PROFILES.includes(value)) {
    throw new Error('business_package_profile is not supported for non-inventory business policy.');
  }
  return value;
}

function requireActivationState(value: InventoryActivationState): InventoryActivationState {
  if (!ACTIVATION_STATES.includes(value)) {
    throw new Error('inventory_service_activation_state is not supported for non-inventory business policy.');
  }
  return value;
}

export function evaluateNonInventoryBusinessPolicy(
  input: NonInventoryBusinessPolicyInput,
): NonInventoryBusinessPolicyDecision {
  if (input.provider_operation_requested === true) {
    throw new Error('non-inventory business policy must not request provider, payment, or adapter operations.');
  }
  if (input.inventory_policy_override_requested === true) {
    throw new Error('non-inventory business policy cannot override the accepted retail/e-commerce inventory requirement.');
  }

  const businessPackageProfile = requirePackageProfile(input.business_package_profile);
  const activationState = requireActivationState(input.inventory_service_activation_state);
  const inventoryRequired = businessPackageProfile === 'RETAIL' || businessPackageProfile === 'E_COMMERCE';

  if (inventoryRequired && activationState !== 'ENABLED') {
    throw new Error('inventory service is required for retail and e-commerce packages.');
  }
  if (businessPackageProfile === 'NON_INVENTORY' && input.stock_tracking_requested === true && activationState !== 'ENABLED') {
    throw new Error('stock tracking requests require inventory service to be enabled even for non-inventory businesses.');
  }

  const policyOutcome: NonInventoryBusinessPolicyOutcome = inventoryRequired
    ? 'INVENTORY_REQUIRED_AND_ENABLED'
    : activationState === 'ENABLED'
      ? 'INVENTORY_OPTIONAL_AND_ENABLED'
      : 'INVENTORY_OPTIONAL_AND_DISABLED_ALLOWED';

  return {
    seed_id: PHASE_6B_NON_INVENTORY_BUSINESS_POLICY_SEED_ID,
    component_id: PHASE_6B_NON_INVENTORY_BUSINESS_POLICY_COMPONENT_ID,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    product_record_authority_id: requireNonEmpty(input.product_record_authority_id, 'product_record_authority_id'),
    product_price_history_id: requireNonEmpty(input.product_price_history_id, 'product_price_history_id'),
    business_package_profile: businessPackageProfile,
    inventory_service_required: inventoryRequired,
    inventory_service_activation_state: activationState,
    activation_allowed: true,
    policy_outcome: policyOutcome,
    dependency_basis: [
      'activation_lifecycle_required',
      'product_record_authority_required',
      'product_price_history_required',
    ],
  };
}
