export const phase6BTieredPricingModelSeedId = 'seed_6b_02_tiered_pricing_model' as const;
export const phase6BTieredPricingModelComponentId = '6B.02' as const;
export const phase6BTieredPricingModelModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BTieredPricingTierConfigInput {
  readonly tier_id: string;
  readonly min_quantity: number;
  readonly max_quantity?: number;
  readonly unit_amount_minor_units: number;
  readonly currency_code: string;
  readonly evidence_id: string;
}

export interface Phase6BTieredPricingModelConfigInput {
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly source_seed_id?: typeof phase6BTieredPricingModelSeedId;
  readonly tiers: readonly Phase6BTieredPricingTierConfigInput[];
  readonly effective_from: string;
  readonly effective_to?: string;
  readonly actor_user_id: string;
  readonly invoice_snapshot_required: true;
  readonly independent_activation_requested?: boolean;
  readonly formula_expression?: never;
}

export interface Phase6BTieredPricingTierDecision {
  readonly tier_id: string;
  readonly quantity_range: {
    readonly min_quantity: number;
    readonly max_quantity: number | null;
  };
  readonly unit_amount_minor_units: number;
  readonly currency_code: string;
  readonly evidence_id: string;
}

export interface Phase6BTieredPricingModelDecision {
  readonly seed_id: typeof phase6BTieredPricingModelSeedId;
  readonly component_id: typeof phase6BTieredPricingModelComponentId;
  readonly module_key: typeof phase6BTieredPricingModelModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly configuration_extension: true;
  readonly canonical_price_history_required: true;
  readonly invoice_snapshot_required: true;
  readonly independent_foundry_activation: false;
  readonly pricing_engine_implemented: false;
  readonly tier_count: number;
  readonly tiers: readonly Phase6BTieredPricingTierDecision[];
  readonly effective_window: {
    readonly effective_from: string;
    readonly effective_to: string | null;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly validation_event: 'PHASE_6B_TIERED_PRICING_MODEL_CONFIG_VALIDATED';
  };
}

export class Phase6BTieredPricingModelConfig {
  validate(input: Phase6BTieredPricingModelConfigInput): Phase6BTieredPricingModelDecision {
    assertNonEmpty(input.organization_id, 'organization_id');
    assertNonEmpty(input.product_id, 'product_id');
    assertNonEmpty(input.price_history_id, 'price_history_id');
    assertNonEmpty(input.actor_user_id, 'actor_user_id');

    if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BTieredPricingModelSeedId) {
      throw new Error('Tiered pricing model source_seed_id must match the FFET seed.');
    }

    if (input.independent_activation_requested === true) {
      throw new Error('Tiered pricing model is a configuration extension and cannot request independent activation.');
    }

    if ('formula_expression' in input) {
      throw new Error('Tiered pricing model FFET does not implement pricing formula or engine behavior.');
    }

    if (input.invoice_snapshot_required !== true) {
      throw new Error('Tiered pricing model requires immutable invoice price snapshots.');
    }

    assertValidEffectiveWindow(input.effective_from, input.effective_to);
    assertValidTiers(input.tiers);

    const currencies = new Set(input.tiers.map((tier) => tier.currency_code));
    if (currencies.size !== 1) {
      throw new Error('Tiered pricing model requires a single currency across all tiers.');
    }

    return {
      seed_id: phase6BTieredPricingModelSeedId,
      component_id: phase6BTieredPricingModelComponentId,
      module_key: phase6BTieredPricingModelModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      price_history_id: input.price_history_id,
      configuration_extension: true,
      canonical_price_history_required: true,
      invoice_snapshot_required: true,
      independent_foundry_activation: false,
      pricing_engine_implemented: false,
      tier_count: input.tiers.length,
      tiers: [...input.tiers]
        .sort((left, right) => left.min_quantity - right.min_quantity)
        .map((tier) => ({
          tier_id: tier.tier_id,
          quantity_range: {
            min_quantity: tier.min_quantity,
            max_quantity: tier.max_quantity ?? null,
          },
          unit_amount_minor_units: tier.unit_amount_minor_units,
          currency_code: tier.currency_code,
          evidence_id: tier.evidence_id,
        })),
      effective_window: {
        effective_from: input.effective_from,
        effective_to: input.effective_to ?? null,
      },
      evidence: {
        actor_user_id: input.actor_user_id,
        validation_event: 'PHASE_6B_TIERED_PRICING_MODEL_CONFIG_VALIDATED',
      },
    };
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Tiered pricing model requires ${fieldName}.`);
  }
}

function assertValidEffectiveWindow(effectiveFrom: string, effectiveTo?: string): void {
  const fromTime = Date.parse(effectiveFrom);
  if (Number.isNaN(fromTime)) {
    throw new Error('Tiered pricing effective_from must be a valid date.');
  }

  if (effectiveTo === undefined) {
    return;
  }

  const toTime = Date.parse(effectiveTo);
  if (Number.isNaN(toTime)) {
    throw new Error('Tiered pricing effective_to must be a valid date.');
  }

  if (toTime < fromTime) {
    throw new Error('Tiered pricing effective_to must be on or after effective_from.');
  }
}

function assertValidTiers(tiers: readonly Phase6BTieredPricingTierConfigInput[]): void {
  if (tiers.length === 0) {
    throw new Error('Tiered pricing model requires at least one tier.');
  }

  const sorted = [...tiers].sort((left, right) => left.min_quantity - right.min_quantity);
  const tierIds = new Set<string>();
  let expectedMinQuantity = 1;
  let openEndedTierSeen = false;

  for (const tier of sorted) {
    assertNonEmpty(tier.tier_id, 'tier_id');
    assertNonEmpty(tier.currency_code, 'currency_code');
    assertNonEmpty(tier.evidence_id, 'evidence_id');

    if (tierIds.has(tier.tier_id)) {
      throw new Error('Tiered pricing model tier_id values must be unique.');
    }
    tierIds.add(tier.tier_id);

    if (!Number.isInteger(tier.min_quantity) || tier.min_quantity < 1) {
      throw new Error('Tiered pricing tier min_quantity must be a positive integer.');
    }

    if (tier.max_quantity !== undefined && (!Number.isInteger(tier.max_quantity) || tier.max_quantity < 1)) {
      throw new Error('Tiered pricing tier max_quantity must be a positive integer when supplied.');
    }

    if (!Number.isInteger(tier.unit_amount_minor_units) || tier.unit_amount_minor_units < 0) {
      throw new Error('Tiered pricing tier unit_amount_minor_units must be a non-negative integer.');
    }

    if (!/^[A-Z]{3}$/.test(tier.currency_code)) {
      throw new Error('Tiered pricing tier currency_code must be an uppercase ISO-style currency code.');
    }

    if (openEndedTierSeen) {
      throw new Error('Tiered pricing may only have an open-ended final tier.');
    }

    if (tier.min_quantity !== expectedMinQuantity) {
      throw new Error('Tiered pricing tiers must be gapless and start at quantity 1.');
    }

    if (tier.max_quantity !== undefined && tier.max_quantity < tier.min_quantity) {
      throw new Error('Tiered pricing tier max_quantity must be greater than or equal to min_quantity.');
    }

    if (tier.max_quantity === undefined) {
      openEndedTierSeen = true;
    } else {
      expectedMinQuantity = tier.max_quantity + 1;
    }
  }
}
