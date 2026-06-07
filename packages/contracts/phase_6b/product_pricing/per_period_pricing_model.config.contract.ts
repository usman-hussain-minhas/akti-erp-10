import { z } from 'zod';

export const phase6BPerPeriodPricingModelSeedId = 'seed_6b_02_per_period_pricing_model' as const;
export const phase6BPerPeriodPricingModelComponentId = '6B.02' as const;
export const phase6BPerPeriodPricingModelModuleKey = 'phase-6b.product-pricing' as const;

export const Phase6BPerPeriodPricingModelConfigSchema = z.object({
  organization_id: z.string().min(1),
  product_id: z.string().min(1),
  price_history_id: z.string().min(1),
  source_seed_id: z.literal(phase6BPerPeriodPricingModelSeedId).optional(),
  period_code: z.string().min(1),
  period_amount_minor_units: z.number().int().nonnegative(),
  currency_code: z.string().regex(/^[A-Z]{3}$/),
  effective_from: z.string().min(1),
  effective_to: z.string().min(1).optional(),
  actor_user_id: z.string().min(1),
  evidence_id: z.string().min(1),
  invoice_snapshot_required: z.literal(true),
  independent_activation_requested: z.literal(false).optional(),
  formula_expression: z.never().optional(),
});

export type Phase6BPerPeriodPricingModelConfig = z.infer<typeof Phase6BPerPeriodPricingModelConfigSchema>;

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

export function validatePhase6BPerPeriodPricingModelConfig(
  input: unknown,
): Phase6BPerPeriodPricingModelDecision {
  const parsed = Phase6BPerPeriodPricingModelConfigSchema.parse(input);
  assertValidEffectiveWindow(parsed.effective_from, parsed.effective_to);

  return {
    seed_id: phase6BPerPeriodPricingModelSeedId,
    component_id: phase6BPerPeriodPricingModelComponentId,
    module_key: phase6BPerPeriodPricingModelModuleKey,
    organization_id: parsed.organization_id,
    product_id: parsed.product_id,
    price_history_id: parsed.price_history_id,
    configuration_extension: true,
    canonical_price_history_required: true,
    invoice_snapshot_required: true,
    independent_foundry_activation: false,
    pricing_engine_implemented: false,
    per_period_price: {
      period_code: parsed.period_code,
      period_amount_minor_units: parsed.period_amount_minor_units,
      currency_code: parsed.currency_code,
    },
    effective_window: {
      effective_from: parsed.effective_from,
      effective_to: parsed.effective_to ?? null,
    },
    evidence: {
      actor_user_id: parsed.actor_user_id,
      evidence_id: parsed.evidence_id,
      validation_event: 'PHASE_6B_PER_PERIOD_PRICING_MODEL_CONFIG_VALIDATED',
    },
  };
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
