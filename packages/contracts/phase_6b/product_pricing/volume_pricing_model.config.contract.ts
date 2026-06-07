import { z } from 'zod';

export const phase6BVolumePricingModelSeedId = 'seed_6b_02_volume_pricing_model' as const;
export const phase6BVolumePricingModelComponentId = '6B.02' as const;
export const phase6BVolumePricingModelModuleKey = 'phase-6b.product-pricing' as const;

export const Phase6BVolumePricingBreakSchema = z.object({
  break_id: z.string().min(1),
  min_quantity: z.number().int().positive(),
  max_quantity: z.number().int().positive().optional(),
  unit_amount_minor_units: z.number().int().nonnegative(),
  currency_code: z.string().regex(/^[A-Z]{3}$/),
  evidence_id: z.string().min(1),
});

export const Phase6BVolumePricingModelConfigSchema = z.object({
  organization_id: z.string().min(1),
  product_id: z.string().min(1),
  price_history_id: z.string().min(1),
  source_seed_id: z.literal(phase6BVolumePricingModelSeedId).optional(),
  volume_breaks: z.array(Phase6BVolumePricingBreakSchema).min(1),
  effective_from: z.string().min(1),
  effective_to: z.string().min(1).optional(),
  actor_user_id: z.string().min(1),
  invoice_snapshot_required: z.literal(true),
  independent_activation_requested: z.literal(false).optional(),
  formula_expression: z.never().optional(),
});

export type Phase6BVolumePricingBreak = z.infer<typeof Phase6BVolumePricingBreakSchema>;
export type Phase6BVolumePricingModelConfig = z.infer<typeof Phase6BVolumePricingModelConfigSchema>;

export interface Phase6BVolumePricingBreakDecision {
  readonly break_id: string;
  readonly quantity_range: {
    readonly min_quantity: number;
    readonly max_quantity: number | null;
  };
  readonly unit_amount_minor_units: number;
  readonly currency_code: string;
  readonly applies_to_entire_order_quantity: true;
  readonly evidence_id: string;
}

export interface Phase6BVolumePricingModelDecision {
  readonly seed_id: typeof phase6BVolumePricingModelSeedId;
  readonly component_id: typeof phase6BVolumePricingModelComponentId;
  readonly module_key: typeof phase6BVolumePricingModelModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly configuration_extension: true;
  readonly canonical_price_history_required: true;
  readonly invoice_snapshot_required: true;
  readonly independent_foundry_activation: false;
  readonly pricing_engine_implemented: false;
  readonly volume_break_count: number;
  readonly volume_breaks: readonly Phase6BVolumePricingBreakDecision[];
  readonly effective_window: {
    readonly effective_from: string;
    readonly effective_to: string | null;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly validation_event: 'PHASE_6B_VOLUME_PRICING_MODEL_CONFIG_VALIDATED';
  };
}

export function validatePhase6BVolumePricingModelConfig(
  input: unknown,
): Phase6BVolumePricingModelDecision {
  const parsed = Phase6BVolumePricingModelConfigSchema.parse(input);
  assertValidEffectiveWindow(parsed.effective_from, parsed.effective_to);
  assertValidVolumeBreaks(parsed.volume_breaks);

  const currencies = new Set(parsed.volume_breaks.map((volumeBreak) => volumeBreak.currency_code));
  if (currencies.size !== 1) {
    throw new Error('Volume pricing model requires a single currency across all volume breaks.');
  }

  return {
    seed_id: phase6BVolumePricingModelSeedId,
    component_id: phase6BVolumePricingModelComponentId,
    module_key: phase6BVolumePricingModelModuleKey,
    organization_id: parsed.organization_id,
    product_id: parsed.product_id,
    price_history_id: parsed.price_history_id,
    configuration_extension: true,
    canonical_price_history_required: true,
    invoice_snapshot_required: true,
    independent_foundry_activation: false,
    pricing_engine_implemented: false,
    volume_break_count: parsed.volume_breaks.length,
    volume_breaks: parsed.volume_breaks.map((volumeBreak) => ({
      break_id: volumeBreak.break_id,
      quantity_range: {
        min_quantity: volumeBreak.min_quantity,
        max_quantity: volumeBreak.max_quantity ?? null,
      },
      unit_amount_minor_units: volumeBreak.unit_amount_minor_units,
      currency_code: volumeBreak.currency_code,
      applies_to_entire_order_quantity: true,
      evidence_id: volumeBreak.evidence_id,
    })),
    effective_window: {
      effective_from: parsed.effective_from,
      effective_to: parsed.effective_to ?? null,
    },
    evidence: {
      actor_user_id: parsed.actor_user_id,
      validation_event: 'PHASE_6B_VOLUME_PRICING_MODEL_CONFIG_VALIDATED',
    },
  };
}

function assertValidEffectiveWindow(effectiveFrom: string, effectiveTo?: string): void {
  const fromTime = Date.parse(effectiveFrom);
  if (Number.isNaN(fromTime)) {
    throw new Error('Volume pricing effective_from must be a valid date.');
  }

  if (effectiveTo === undefined) {
    return;
  }

  const toTime = Date.parse(effectiveTo);
  if (Number.isNaN(toTime)) {
    throw new Error('Volume pricing effective_to must be a valid date.');
  }

  if (toTime < fromTime) {
    throw new Error('Volume pricing effective_to must be on or after effective_from.');
  }
}

function assertValidVolumeBreaks(volumeBreaks: readonly Phase6BVolumePricingBreak[]): void {
  const sorted = [...volumeBreaks].sort((left, right) => left.min_quantity - right.min_quantity);
  let expectedMinQuantity = 1;
  let openEndedBreakSeen = false;

  for (const volumeBreak of sorted) {
    if (openEndedBreakSeen) {
      throw new Error('Volume pricing may only have an open-ended final break.');
    }

    if (volumeBreak.min_quantity !== expectedMinQuantity) {
      throw new Error('Volume pricing breaks must be gapless and start at quantity 1.');
    }

    if (volumeBreak.max_quantity !== undefined && volumeBreak.max_quantity < volumeBreak.min_quantity) {
      throw new Error('Volume pricing break max_quantity must be greater than or equal to min_quantity.');
    }

    if (volumeBreak.max_quantity === undefined) {
      openEndedBreakSeen = true;
    } else {
      expectedMinQuantity = volumeBreak.max_quantity + 1;
    }
  }
}
