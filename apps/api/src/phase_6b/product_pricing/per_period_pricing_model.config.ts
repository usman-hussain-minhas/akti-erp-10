export const phase6BPerPeriodPricingModelSeedId = 'seed_6b_02_per_period_pricing_model' as const;
export const phase6BPerPeriodPricingModelComponentId = '6B.02' as const;
export const phase6BPerPeriodPricingModelModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BPerPeriodPricingModelConfigInput {
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly source_seed_id?: typeof phase6BPerPeriodPricingModelSeedId;
  readonly period_code: string;
  readonly period_amount_minor_units: number;
  readonly currency_code: string;
  readonly effective_from: string;
  readonly effective_to?: string;
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly invoice_snapshot_required: true;
  readonly independent_activation_requested?: boolean;
  readonly formula_expression?: never;
}

export interface Phase6BPerPeriodPricingModelDecision {
  readonly seed_id: typeof phase6BPerPeriodPricingModelSeedId;
  readonly component_id: typeof phase6BPerPeriodPricingModelComponentId;
  readonly module_key: typeof phase6BPerPeriodPricingModelModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly configuration_extension: true;
  readonly canonical_price_history_required: true;
  readonly invoice_snapshot_required: true;
  readonly independent_foundry_activation: false;
  readonly pricing_engine_implemented: false;
  readonly per_period_price: {
    readonly period_code: string;
    readonly period_amount_minor_units: number;
    readonly currency_code: string;
  };
  readonly effective_window: {
    readonly effective_from: string;
    readonly effective_to: string | null;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_PER_PERIOD_PRICING_MODEL_CONFIG_VALIDATED';
  };
}

export class Phase6BPerPeriodPricingModelConfig {
  validate(input: Phase6BPerPeriodPricingModelConfigInput): Phase6BPerPeriodPricingModelDecision {
    assertNonEmpty(input.organization_id, 'organization_id');
    assertNonEmpty(input.product_id, 'product_id');
    assertNonEmpty(input.price_history_id, 'price_history_id');
    assertNonEmpty(input.period_code, 'period_code');
    assertNonEmpty(input.currency_code, 'currency_code');
    assertNonEmpty(input.actor_user_id, 'actor_user_id');
    assertNonEmpty(input.evidence_id, 'evidence_id');

    if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BPerPeriodPricingModelSeedId) {
      throw new Error('Per-period pricing model source_seed_id must match the FFET seed.');
    }

    if (!Number.isInteger(input.period_amount_minor_units) || input.period_amount_minor_units < 0) {
      throw new Error('Per-period pricing period_amount_minor_units must be a non-negative integer.');
    }

    if (!/^[A-Z]{3}$/.test(input.currency_code)) {
      throw new Error('Per-period pricing currency_code must be an uppercase ISO-style currency code.');
    }

    if (input.independent_activation_requested === true) {
      throw new Error('Per-period pricing model is a configuration extension and cannot request independent activation.');
    }

    if ('formula_expression' in input) {
      throw new Error('Per-period pricing model FFET does not implement pricing formula or engine behavior.');
    }

    if (input.invoice_snapshot_required !== true) {
      throw new Error('Per-period pricing model requires immutable invoice price snapshots.');
    }

    assertValidEffectiveWindow(input.effective_from, input.effective_to);

    return {
      seed_id: phase6BPerPeriodPricingModelSeedId,
      component_id: phase6BPerPeriodPricingModelComponentId,
      module_key: phase6BPerPeriodPricingModelModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      price_history_id: input.price_history_id,
      configuration_extension: true,
      canonical_price_history_required: true,
      invoice_snapshot_required: true,
      independent_foundry_activation: false,
      pricing_engine_implemented: false,
      per_period_price: {
        period_code: input.period_code,
        period_amount_minor_units: input.period_amount_minor_units,
        currency_code: input.currency_code,
      },
      effective_window: {
        effective_from: input.effective_from,
        effective_to: input.effective_to ?? null,
      },
      evidence: {
        actor_user_id: input.actor_user_id,
        evidence_id: input.evidence_id,
        validation_event: 'PHASE_6B_PER_PERIOD_PRICING_MODEL_CONFIG_VALIDATED',
      },
    };
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Per-period pricing model requires ${fieldName}.`);
  }
}

function assertValidEffectiveWindow(effectiveFrom: string, effectiveTo?: string): void {
  const fromTime = Date.parse(effectiveFrom);
  if (Number.isNaN(fromTime)) {
    throw new Error('Per-period pricing effective_from must be a valid date.');
  }

  if (effectiveTo === undefined) {
    return;
  }

  const toTime = Date.parse(effectiveTo);
  if (Number.isNaN(toTime)) {
    throw new Error('Per-period pricing effective_to must be a valid date.');
  }

  if (toTime < fromTime) {
    throw new Error('Per-period pricing effective_to must be on or after effective_from.');
  }
}
