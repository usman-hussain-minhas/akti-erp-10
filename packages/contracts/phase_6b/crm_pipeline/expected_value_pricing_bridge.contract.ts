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
