export const phase6BFixedPricingModelSeedId = 'seed_6b_02_fixed_pricing_model' as const;
export const phase6BFixedPricingModelComponentId = '6B.02' as const;
export const phase6BFixedPricingModelModuleKey = 'phase-6b.product-pricing' as const;

export type Phase6BFixedPricingModelInput = {
  organization_id: string;
  product_id: string;
  price_history_id: string;
  source_seed_id?: typeof phase6BFixedPricingModelSeedId;
  amount_minor_units: number;
  currency_code: string;
  effective_from: string;
  effective_to?: string;
  actor_user_id: string;
  evidence_id: string;
  invoice_snapshot_required: boolean;
  independent_activation_requested?: boolean;
  formula_expression?: string;
};

export type Phase6BFixedPricingModelEvidence = {
  seed_id: typeof phase6BFixedPricingModelSeedId;
  source_component_id: typeof phase6BFixedPricingModelComponentId;
  module_key: typeof phase6BFixedPricingModelModuleKey;
  organization_id: string;
  product_id: string;
  price_history_id: string;
  evidence_id: string;
  actor_user_id: string;
  evidence_subject: 'fixed_pricing_configuration';
  canonical_price_history_required: true;
  configuration_extension: true;
  independent_foundry_activation_allowed: false;
  invoice_snapshot_required: boolean;
  pricing_engine_implemented: false;
};

export type Phase6BFixedPricingModelDecision = {
  accepted: boolean;
  normalized_amount_minor_units: number;
  normalized_currency_code: string;
  evidence: Phase6BFixedPricingModelEvidence;
  violations: string[];
};

const currencyPattern = /^[A-Z]{3}$/;

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateString(value: string | undefined): value is string {
  return hasText(value) && !Number.isNaN(Date.parse(value));
}

export function validatePhase6BFixedPricingModelInput(input: Phase6BFixedPricingModelInput): string[] {
  const violations: string[] = [];

  if (!hasText(input.organization_id)) violations.push('organization_id is required for tenant isolation');
  if (!hasText(input.product_id)) violations.push('product_id is required for fixed pricing configuration');
  if (!hasText(input.price_history_id)) violations.push('price_history_id is required as canonical pricing authority');
  if (!hasText(input.actor_user_id)) violations.push('actor_user_id is required for pricing evidence');
  if (!hasText(input.evidence_id)) violations.push('evidence_id is required for pricing evidence');
  if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BFixedPricingModelSeedId) {
    violations.push('source_seed_id must remain bound to seed_6b_02_fixed_pricing_model');
  }
  if (!Number.isInteger(input.amount_minor_units) || input.amount_minor_units < 0) {
    violations.push('amount_minor_units must be a non-negative integer');
  }
  if (!currencyPattern.test(input.currency_code)) violations.push('currency_code must be an ISO-style uppercase 3-letter code');
  if (!isValidDateString(input.effective_from)) violations.push('effective_from must be a valid date string');
  if (input.effective_to !== undefined && !isValidDateString(input.effective_to)) {
    violations.push('effective_to must be a valid date string when provided');
  }
  if (isValidDateString(input.effective_from) && isValidDateString(input.effective_to)) {
    if (Date.parse(input.effective_to) < Date.parse(input.effective_from)) {
      violations.push('effective_to cannot be earlier than effective_from');
    }
  }
  if (input.independent_activation_requested) {
    violations.push('fixed pricing model is a configuration extension and cannot request independent Foundry activation');
  }
  if (hasText(input.formula_expression)) {
    violations.push('fixed pricing model cannot carry formula_expression or pricing-engine behavior');
  }
  if (!input.invoice_snapshot_required) {
    violations.push('invoice_snapshot_required must be true to preserve invoice immutability handoff');
  }

  return violations;
}

export function buildPhase6BFixedPricingModelDecision(
  input: Phase6BFixedPricingModelInput,
): Phase6BFixedPricingModelDecision {
  const violations = validatePhase6BFixedPricingModelInput(input);

  return {
    accepted: violations.length === 0,
    normalized_amount_minor_units: input.amount_minor_units,
    normalized_currency_code: input.currency_code,
    evidence: {
      seed_id: phase6BFixedPricingModelSeedId,
      source_component_id: phase6BFixedPricingModelComponentId,
      module_key: phase6BFixedPricingModelModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      price_history_id: input.price_history_id,
      evidence_id: input.evidence_id,
      actor_user_id: input.actor_user_id,
      evidence_subject: 'fixed_pricing_configuration',
      canonical_price_history_required: true,
      configuration_extension: true,
      independent_foundry_activation_allowed: false,
      invoice_snapshot_required: input.invoice_snapshot_required,
      pricing_engine_implemented: false,
    },
    violations,
  };
}
