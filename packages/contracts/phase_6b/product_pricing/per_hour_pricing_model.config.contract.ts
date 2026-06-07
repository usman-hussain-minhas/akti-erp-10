import { z } from 'zod';

export const phase6BPerHourPricingModelSeedId = 'seed_6b_02_per_hour_pricing_model' as const;
export const phase6BPerHourPricingModelComponentId = '6B.02' as const;
export const phase6BPerHourPricingModelModuleKey = 'phase-6b.product-pricing' as const;

export const Phase6BPerHourPricingModelConfigSchema = z.object({
  organization_id: z.string().min(1),
  product_id: z.string().min(1),
  price_history_id: z.string().min(1),
  source_seed_id: z.literal(phase6BPerHourPricingModelSeedId).optional(),
  time_unit: z.literal('hour').optional(),
  hour_amount_minor_units: z.number().int().nonnegative(),
  currency_code: z.string().regex(/^[A-Z]{3}$/),
  effective_from: z.string().min(1),
  effective_to: z.string().min(1).optional(),
  actor_user_id: z.string().min(1),
  evidence_id: z.string().min(1),
  invoice_snapshot_required: z.literal(true),
  independent_activation_requested: z.literal(false).optional(),
  formula_expression: z.never().optional(),
});

export type Phase6BPerHourPricingModelConfig = z.infer<typeof Phase6BPerHourPricingModelConfigSchema>;

export interface Phase6BPerHourPricingModelDecision {
  readonly seed_id: typeof phase6BPerHourPricingModelSeedId;
  readonly component_id: typeof phase6BPerHourPricingModelComponentId;
  readonly module_key: typeof phase6BPerHourPricingModelModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly configuration_extension: true;
  readonly canonical_price_history_required: true;
  readonly invoice_snapshot_required: true;
  readonly independent_foundry_activation: false;
  readonly pricing_engine_implemented: false;
  readonly per_hour_price: {
    readonly time_unit: 'hour';
    readonly hour_amount_minor_units: number;
    readonly currency_code: string;
  };
  readonly effective_window: {
    readonly effective_from: string;
    readonly effective_to: string | null;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_PER_HOUR_PRICING_MODEL_CONFIG_VALIDATED';
  };
}

export function validatePhase6BPerHourPricingModelConfig(
  input: unknown,
): Phase6BPerHourPricingModelDecision {
  const parsed = Phase6BPerHourPricingModelConfigSchema.parse(input);
  assertValidEffectiveWindow(parsed.effective_from, parsed.effective_to);

  return {
    seed_id: phase6BPerHourPricingModelSeedId,
    component_id: phase6BPerHourPricingModelComponentId,
    module_key: phase6BPerHourPricingModelModuleKey,
    organization_id: parsed.organization_id,
    product_id: parsed.product_id,
    price_history_id: parsed.price_history_id,
    configuration_extension: true,
    canonical_price_history_required: true,
    invoice_snapshot_required: true,
    independent_foundry_activation: false,
    pricing_engine_implemented: false,
    per_hour_price: {
      time_unit: 'hour',
      hour_amount_minor_units: parsed.hour_amount_minor_units,
      currency_code: parsed.currency_code,
    },
    effective_window: {
      effective_from: parsed.effective_from,
      effective_to: parsed.effective_to ?? null,
    },
    evidence: {
      actor_user_id: parsed.actor_user_id,
      evidence_id: parsed.evidence_id,
      validation_event: 'PHASE_6B_PER_HOUR_PRICING_MODEL_CONFIG_VALIDATED',
    },
  };
}

function assertValidEffectiveWindow(effectiveFrom: string, effectiveTo?: string): void {
  const fromTime = Date.parse(effectiveFrom);
  if (Number.isNaN(fromTime)) {
    throw new Error('Per-hour pricing effective_from must be a valid date.');
  }

  if (effectiveTo === undefined) {
    return;
  }

  const toTime = Date.parse(effectiveTo);
  if (Number.isNaN(toTime)) {
    throw new Error('Per-hour pricing effective_to must be a valid date.');
  }

  if (toTime < fromTime) {
    throw new Error('Per-hour pricing effective_to must be on or after effective_from.');
  }
}
