export const phase6BEarlyBirdPricingDeadlineSeedId = 'seed_6b_02_early_bird_pricing_deadline' as const;
export const phase6BEarlyBirdPricingDeadlineComponentId = '6B.02' as const;
export const phase6BEarlyBirdPricingDeadlineModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BEarlyBirdPricingDeadlineConfigInput {
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly source_seed_id?: typeof phase6BEarlyBirdPricingDeadlineSeedId;
  readonly early_bird_deadline_at: string;
  readonly early_bird_price_history_id?: string;
  readonly label?: string;
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly invoice_snapshot_required: true;
  readonly independent_activation_requested?: boolean;
  readonly formula_expression?: never;
}

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

export class Phase6BEarlyBirdPricingDeadlineConfig {
  validate(input: Phase6BEarlyBirdPricingDeadlineConfigInput): Phase6BEarlyBirdPricingDeadlineDecision {
    assertNonEmpty(input.organization_id, 'organization_id');
    assertNonEmpty(input.product_id, 'product_id');
    assertNonEmpty(input.price_history_id, 'price_history_id');
    assertNonEmpty(input.early_bird_deadline_at, 'early_bird_deadline_at');
    assertNonEmpty(input.actor_user_id, 'actor_user_id');
    assertNonEmpty(input.evidence_id, 'evidence_id');

    if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BEarlyBirdPricingDeadlineSeedId) {
      throw new Error('Early-bird pricing deadline source_seed_id must match the FFET seed.');
    }

    if (input.early_bird_price_history_id !== undefined) {
      assertNonEmpty(input.early_bird_price_history_id, 'early_bird_price_history_id');
    }

    if (input.label !== undefined) {
      assertNonEmpty(input.label, 'label');
    }

    if (Number.isNaN(Date.parse(input.early_bird_deadline_at))) {
      throw new Error('Early-bird pricing deadline_at must be a valid date.');
    }

    if (input.independent_activation_requested === true) {
      throw new Error('Early-bird pricing deadline is a configuration extension and cannot request independent activation.');
    }

    if ('formula_expression' in input) {
      throw new Error('Early-bird pricing deadline FFET does not implement pricing formula or engine behavior.');
    }

    if (input.invoice_snapshot_required !== true) {
      throw new Error('Early-bird pricing deadline requires immutable invoice price snapshots.');
    }

    return {
      seed_id: phase6BEarlyBirdPricingDeadlineSeedId,
      component_id: phase6BEarlyBirdPricingDeadlineComponentId,
      module_key: phase6BEarlyBirdPricingDeadlineModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      price_history_id: input.price_history_id,
      configuration_extension: true,
      canonical_price_history_required: true,
      invoice_snapshot_required: true,
      independent_foundry_activation: false,
      pricing_engine_implemented: false,
      early_bird_deadline: {
        deadline_at: input.early_bird_deadline_at,
        early_bird_price_history_id: input.early_bird_price_history_id ?? null,
        label: input.label ?? null,
      },
      evidence: {
        actor_user_id: input.actor_user_id,
        evidence_id: input.evidence_id,
        validation_event: 'PHASE_6B_EARLY_BIRD_PRICING_DEADLINE_CONFIG_VALIDATED',
      },
    };
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Early-bird pricing deadline requires ${fieldName}.`);
  }
}
