import { z } from 'zod';

export const phase6BTieredPricingModelSeedId = 'seed_6b_02_tiered_pricing_model' as const;
export const phase6BTieredPricingModelComponentId = '6B.02' as const;
export const phase6BTieredPricingModelModuleKey = 'phase-6b.product-pricing' as const;

export const Phase6BTieredPricingTierSchema = z.object({
  tier_id: z.string().min(1),
  min_quantity: z.number().int().positive(),
  max_quantity: z.number().int().positive().optional(),
  unit_amount_minor_units: z.number().int().nonnegative(),
  currency_code: z.string().regex(/^[A-Z]{3}$/),
  evidence_id: z.string().min(1),
});

export const Phase6BTieredPricingModelConfigSchema = z.object({
  organization_id: z.string().min(1),
  product_id: z.string().min(1),
  price_history_id: z.string().min(1),
  source_seed_id: z.literal(phase6BTieredPricingModelSeedId).optional(),
  tiers: z.array(Phase6BTieredPricingTierSchema).min(1),
  effective_from: z.string().min(1),
  effective_to: z.string().min(1).optional(),
  actor_user_id: z.string().min(1),
  invoice_snapshot_required: z.literal(true),
  independent_activation_requested: z.literal(false).optional(),
  formula_expression: z.never().optional(),
});

export type Phase6BTieredPricingTier = z.infer<typeof Phase6BTieredPricingTierSchema>;
export type Phase6BTieredPricingModelConfig = z.infer<typeof Phase6BTieredPricingModelConfigSchema>;

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

export function validatePhase6BTieredPricingModelConfig(
  input: unknown,
): Phase6BTieredPricingModelDecision {
  const parsed = Phase6BTieredPricingModelConfigSchema.parse(input);
  assertValidEffectiveWindow(parsed.effective_from, parsed.effective_to);
  assertValidTierStructure(parsed.tiers);

  const currencies = new Set(parsed.tiers.map((tier) => tier.currency_code));
  if (currencies.size !== 1) {
    throw new Error('Tiered pricing model requires a single currency across all tiers.');
  }

  return {
    seed_id: phase6BTieredPricingModelSeedId,
    component_id: phase6BTieredPricingModelComponentId,
    module_key: phase6BTieredPricingModelModuleKey,
    organization_id: parsed.organization_id,
    product_id: parsed.product_id,
    price_history_id: parsed.price_history_id,
    configuration_extension: true,
    canonical_price_history_required: true,
    invoice_snapshot_required: true,
    independent_foundry_activation: false,
    pricing_engine_implemented: false,
    tier_count: parsed.tiers.length,
    tiers: parsed.tiers.map((tier) => ({
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
      effective_from: parsed.effective_from,
      effective_to: parsed.effective_to ?? null,
    },
    evidence: {
      actor_user_id: parsed.actor_user_id,
      validation_event: 'PHASE_6B_TIERED_PRICING_MODEL_CONFIG_VALIDATED',
    },
  };
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

function assertValidTierStructure(tiers: readonly Phase6BTieredPricingTier[]): void {
  const sorted = [...tiers].sort((left, right) => left.min_quantity - right.min_quantity);
  let expectedMinQuantity = 1;
  let openEndedTierSeen = false;

  for (const tier of sorted) {
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
