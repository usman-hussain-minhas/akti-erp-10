import { z } from 'zod';

export const phase6BEarlyBirdPricingDeadlineSeedId = 'seed_6b_02_early_bird_pricing_deadline' as const;
export const phase6BEarlyBirdPricingDeadlineComponentId = '6B.02' as const;
export const phase6BEarlyBirdPricingDeadlineModuleKey = 'phase-6b.product-pricing' as const;

export const Phase6BEarlyBirdPricingDeadlineConfigSchema = z.object({
  organization_id: z.string().min(1),
  product_id: z.string().min(1),
  price_history_id: z.string().min(1),
  source_seed_id: z.literal(phase6BEarlyBirdPricingDeadlineSeedId).optional(),
  early_bird_deadline_at: z.string().min(1),
  early_bird_price_history_id: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  actor_user_id: z.string().min(1),
  evidence_id: z.string().min(1),
  invoice_snapshot_required: z.literal(true),
  independent_activation_requested: z.literal(false).optional(),
  formula_expression: z.never().optional(),
});

export type Phase6BEarlyBirdPricingDeadlineConfig = z.infer<
  typeof Phase6BEarlyBirdPricingDeadlineConfigSchema
>;

export interface Phase6BEarlyBirdPricingDeadlineDecision {
  readonly seed_id: typeof phase6BEarlyBirdPricingDeadlineSeedId;
  readonly component_id: typeof phase6BEarlyBirdPricingDeadlineComponentId;
  readonly module_key: typeof phase6BEarlyBirdPricingDeadlineModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly configuration_extension: true;
  readonly canonical_price_history_required: true;
  readonly invoice_snapshot_required: true;
  readonly independent_foundry_activation: false;
  readonly pricing_engine_implemented: false;
  readonly early_bird_deadline: {
    readonly deadline_at: string;
    readonly early_bird_price_history_id: string | null;
    readonly label: string | null;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_EARLY_BIRD_PRICING_DEADLINE_CONFIG_VALIDATED';
  };
}

export function validatePhase6BEarlyBirdPricingDeadlineConfig(
  input: unknown,
): Phase6BEarlyBirdPricingDeadlineDecision {
  const parsed = Phase6BEarlyBirdPricingDeadlineConfigSchema.parse(input);
  assertValidDeadline(parsed.early_bird_deadline_at);

  return {
    seed_id: phase6BEarlyBirdPricingDeadlineSeedId,
    component_id: phase6BEarlyBirdPricingDeadlineComponentId,
    module_key: phase6BEarlyBirdPricingDeadlineModuleKey,
    organization_id: parsed.organization_id,
    product_id: parsed.product_id,
    price_history_id: parsed.price_history_id,
    configuration_extension: true,
    canonical_price_history_required: true,
    invoice_snapshot_required: true,
    independent_foundry_activation: false,
    pricing_engine_implemented: false,
    early_bird_deadline: {
      deadline_at: parsed.early_bird_deadline_at,
      early_bird_price_history_id: parsed.early_bird_price_history_id ?? null,
      label: parsed.label ?? null,
    },
    evidence: {
      actor_user_id: parsed.actor_user_id,
      evidence_id: parsed.evidence_id,
      validation_event: 'PHASE_6B_EARLY_BIRD_PRICING_DEADLINE_CONFIG_VALIDATED',
    },
  };
}

function assertValidDeadline(deadlineAt: string): void {
  if (Number.isNaN(Date.parse(deadlineAt))) {
    throw new Error('Early-bird pricing deadline_at must be a valid date.');
  }
}
