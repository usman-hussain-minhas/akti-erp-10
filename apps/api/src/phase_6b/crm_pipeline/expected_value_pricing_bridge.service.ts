export const PHASE_6B_EXPECTED_VALUE_PRICING_BRIDGE_SEED_ID = 'seed_6b_06_expected_value_pricing_bridge' as const;
export const PHASE_6B_EXPECTED_VALUE_PRICING_BRIDGE_COMPONENT_ID = '6B.06' as const;

export const EXPECTED_VALUE_PRICING_BRIDGE_EVENT = 'phase_6b.crm_pipeline.expected_value_pricing_bridge.calculated' as const;
export const EXPECTED_VALUE_DENOMINATOR = 10000 as const;

export type ExpectedValuePricingBridgeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  expected_value_bridge_id: string;
  lead_record_id: string;
  lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  pipeline_stage_key: string;
  product_ref: string;
  product_price_history_ref: string;
  currency_code: string;
  unit_price_minor_units: number;
  quantity: number;
  probability_basis_points: number;
  calculated_by_user_id: string;
  calculated_at: string;
  pricing_engine_requested?: boolean;
  invoice_creation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ExpectedValuePricingBridgeReceipt = {
  seed_id: typeof PHASE_6B_EXPECTED_VALUE_PRICING_BRIDGE_SEED_ID;
  component_id: typeof PHASE_6B_EXPECTED_VALUE_PRICING_BRIDGE_COMPONENT_ID;
  event_name: typeof EXPECTED_VALUE_PRICING_BRIDGE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  expected_value_bridge_id: string;
  lead_record_id: string;
  lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  pipeline_stage_key: string;
  product_ref: string;
  product_price_history_ref: string;
  currency_code: string;
  unit_price_minor_units: number;
  quantity: number;
  gross_value_minor_units: number;
  probability_basis_points: number;
  expected_value_minor_units_numerator: number;
  expected_value_denominator: typeof EXPECTED_VALUE_DENOMINATOR;
  calculated_by_user_id: string;
  calculated_at: string;
  canonical_price_history_required: true;
  pricing_engine_allowed: false;
  invoice_creation_allowed: false;
  payment_allocation_allowed: false;
  irreversible_action_allowed: false;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for expected value pricing bridge.`);
  }
  return value.trim();
}

function requireCalculatedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'calculated_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('calculated_at must be a valid ISO-compatible timestamp for expected value pricing bridge.');
  }
  return normalized;
}

function normalizeCurrencyCode(value: string): string {
  const normalized = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('currency_code must be an ISO-style 3-letter code for expected value pricing bridge.');
  }
  return normalized;
}

function requireNonNegativeSafeInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative safe integer for expected value pricing bridge.`);
  }
  return value;
}

function requirePositiveSafeInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive safe integer for expected value pricing bridge.`);
  }
  return value;
}

function requireProbabilityBasisPoints(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > EXPECTED_VALUE_DENOMINATOR) {
    throw new Error('probability_basis_points must be between 0 and 10000 for expected value pricing bridge.');
  }
  return value;
}

export function calculateExpectedValuePricingBridge(input: ExpectedValuePricingBridgeInput): ExpectedValuePricingBridgeReceipt {
  if (input.pricing_engine_requested === true) {
    throw new Error('expected value pricing bridge must not execute the pricing engine.');
  }
  if (input.invoice_creation_requested === true) {
    throw new Error('expected value pricing bridge must not create invoices.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('expected value pricing bridge must not allocate payments.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('expected value pricing bridge must not perform irreversible actions.');
  }

  const unitPriceMinorUnits = requireNonNegativeSafeInteger(input.unit_price_minor_units, 'unit_price_minor_units');
  const quantity = requirePositiveSafeInteger(input.quantity, 'quantity');
  const probabilityBasisPoints = requireProbabilityBasisPoints(input.probability_basis_points);
  const grossValueMinorUnits = unitPriceMinorUnits * quantity;
  if (!Number.isSafeInteger(grossValueMinorUnits)) {
    throw new Error('gross_value_minor_units must remain a safe integer for expected value pricing bridge.');
  }
  const expectedValueMinorUnitsNumerator = grossValueMinorUnits * probabilityBasisPoints;
  if (!Number.isSafeInteger(expectedValueMinorUnitsNumerator)) {
    throw new Error('expected_value_minor_units_numerator must remain a safe integer for expected value pricing bridge.');
  }

  return {
    seed_id: PHASE_6B_EXPECTED_VALUE_PRICING_BRIDGE_SEED_ID,
    component_id: PHASE_6B_EXPECTED_VALUE_PRICING_BRIDGE_COMPONENT_ID,
    event_name: EXPECTED_VALUE_PRICING_BRIDGE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    expected_value_bridge_id: requireNonEmpty(input.expected_value_bridge_id, 'expected_value_bridge_id'),
    lead_record_id: requireNonEmpty(input.lead_record_id, 'lead_record_id'),
    lead_record_authority_id: requireNonEmpty(input.lead_record_authority_id, 'lead_record_authority_id'),
    match_candidate_generation_ref: requireNonEmpty(input.match_candidate_generation_ref, 'match_candidate_generation_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    pipeline_stage_key: requireNonEmpty(input.pipeline_stage_key, 'pipeline_stage_key'),
    product_ref: requireNonEmpty(input.product_ref, 'product_ref'),
    product_price_history_ref: requireNonEmpty(input.product_price_history_ref, 'product_price_history_ref'),
    currency_code: normalizeCurrencyCode(input.currency_code),
    unit_price_minor_units: unitPriceMinorUnits,
    quantity,
    gross_value_minor_units: grossValueMinorUnits,
    probability_basis_points: probabilityBasisPoints,
    expected_value_minor_units_numerator: expectedValueMinorUnitsNumerator,
    expected_value_denominator: EXPECTED_VALUE_DENOMINATOR,
    calculated_by_user_id: requireNonEmpty(input.calculated_by_user_id, 'calculated_by_user_id'),
    calculated_at: requireCalculatedAt(input.calculated_at),
    canonical_price_history_required: true,
    pricing_engine_allowed: false,
    invoice_creation_allowed: false,
    payment_allocation_allowed: false,
    irreversible_action_allowed: false,
  };
}
