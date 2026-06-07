export const phase6BPerUnitPricingModelSeedId = 'seed_6b_02_per_unit_pricing_model' as const;
export const phase6BPerUnitPricingModelComponentId = '6B.02' as const;
export const phase6BPerUnitPricingModelModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BPerUnitPricingModelConfigInput {
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly source_seed_id?: typeof phase6BPerUnitPricingModelSeedId;
  readonly unit_of_measure: string;
  readonly unit_amount_minor_units: number;
  readonly currency_code: string;
  readonly effective_from: string;
  readonly effective_to?: string;
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly invoice_snapshot_required: true;
  readonly independent_activation_requested?: boolean;
  readonly formula_expression?: never;
}

export interface Phase6BPerUnitPricingModelDecision {
  readonly seed_id: typeof phase6BPerUnitPricingModelSeedId;
  readonly component_id: typeof phase6BPerUnitPricingModelComponentId;
  readonly module_key: typeof phase6BPerUnitPricingModelModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly configuration_extension: true;
  readonly canonical_price_history_required: true;
  readonly invoice_snapshot_required: true;
  readonly independent_foundry_activation: false;
  readonly pricing_engine_implemented: false;
  readonly per_unit_price: {
    readonly unit_of_measure: string;
    readonly unit_amount_minor_units: number;
    readonly currency_code: string;
  };
  readonly effective_window: {
    readonly effective_from: string;
    readonly effective_to: string | null;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_PER_UNIT_PRICING_MODEL_CONFIG_VALIDATED';
  };
}

export class Phase6BPerUnitPricingModelConfig {
  validate(input: Phase6BPerUnitPricingModelConfigInput): Phase6BPerUnitPricingModelDecision {
    assertNonEmpty(input.organization_id, 'organization_id');
    assertNonEmpty(input.product_id, 'product_id');
    assertNonEmpty(input.price_history_id, 'price_history_id');
    assertNonEmpty(input.unit_of_measure, 'unit_of_measure');
    assertNonEmpty(input.currency_code, 'currency_code');
    assertNonEmpty(input.actor_user_id, 'actor_user_id');
    assertNonEmpty(input.evidence_id, 'evidence_id');

    if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BPerUnitPricingModelSeedId) {
      throw new Error('Per-unit pricing model source_seed_id must match the FFET seed.');
    }

    if (!Number.isInteger(input.unit_amount_minor_units) || input.unit_amount_minor_units < 0) {
      throw new Error('Per-unit pricing unit_amount_minor_units must be a non-negative integer.');
    }

    if (!/^[A-Z]{3}$/.test(input.currency_code)) {
      throw new Error('Per-unit pricing currency_code must be an uppercase ISO-style currency code.');
    }

    if (input.independent_activation_requested === true) {
      throw new Error('Per-unit pricing model is a configuration extension and cannot request independent activation.');
    }

    if ('formula_expression' in input) {
      throw new Error('Per-unit pricing model FFET does not implement pricing formula or engine behavior.');
    }

    if (input.invoice_snapshot_required !== true) {
      throw new Error('Per-unit pricing model requires immutable invoice price snapshots.');
    }

    assertValidEffectiveWindow(input.effective_from, input.effective_to);

    return {
      seed_id: phase6BPerUnitPricingModelSeedId,
      component_id: phase6BPerUnitPricingModelComponentId,
      module_key: phase6BPerUnitPricingModelModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      price_history_id: input.price_history_id,
      configuration_extension: true,
      canonical_price_history_required: true,
      invoice_snapshot_required: true,
      independent_foundry_activation: false,
      pricing_engine_implemented: false,
      per_unit_price: {
        unit_of_measure: input.unit_of_measure,
        unit_amount_minor_units: input.unit_amount_minor_units,
        currency_code: input.currency_code,
      },
      effective_window: {
        effective_from: input.effective_from,
        effective_to: input.effective_to ?? null,
      },
      evidence: {
        actor_user_id: input.actor_user_id,
        evidence_id: input.evidence_id,
        validation_event: 'PHASE_6B_PER_UNIT_PRICING_MODEL_CONFIG_VALIDATED',
      },
    };
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Per-unit pricing model requires ${fieldName}.`);
  }
}

function assertValidEffectiveWindow(effectiveFrom: string, effectiveTo?: string): void {
  const fromTime = Date.parse(effectiveFrom);
  if (Number.isNaN(fromTime)) {
    throw new Error('Per-unit pricing effective_from must be a valid date.');
  }

  if (effectiveTo === undefined) {
    return;
  }

  const toTime = Date.parse(effectiveTo);
  if (Number.isNaN(toTime)) {
    throw new Error('Per-unit pricing effective_to must be a valid date.');
  }

  if (toTime < fromTime) {
    throw new Error('Per-unit pricing effective_to must be on or after effective_from.');
  }
}
