export const phase6BVolumePricingModelSeedId = 'seed_6b_02_volume_pricing_model' as const;
export const phase6BVolumePricingModelComponentId = '6B.02' as const;
export const phase6BVolumePricingModelModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BVolumePricingBreakConfigInput {
  readonly break_id: string;
  readonly min_quantity: number;
  readonly max_quantity?: number;
  readonly unit_amount_minor_units: number;
  readonly currency_code: string;
  readonly evidence_id: string;
}

export interface Phase6BVolumePricingModelConfigInput {
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly source_seed_id?: typeof phase6BVolumePricingModelSeedId;
  readonly volume_breaks: readonly Phase6BVolumePricingBreakConfigInput[];
  readonly effective_from: string;
  readonly effective_to?: string;
  readonly actor_user_id: string;
  readonly invoice_snapshot_required: true;
  readonly independent_activation_requested?: boolean;
  readonly formula_expression?: never;
}

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

export class Phase6BVolumePricingModelConfig {
  validate(input: Phase6BVolumePricingModelConfigInput): Phase6BVolumePricingModelDecision {
    assertNonEmpty(input.organization_id, 'organization_id');
    assertNonEmpty(input.product_id, 'product_id');
    assertNonEmpty(input.price_history_id, 'price_history_id');
    assertNonEmpty(input.actor_user_id, 'actor_user_id');

    if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BVolumePricingModelSeedId) {
      throw new Error('Volume pricing model source_seed_id must match the FFET seed.');
    }

    if (input.independent_activation_requested === true) {
      throw new Error('Volume pricing model is a configuration extension and cannot request independent activation.');
    }

    if ('formula_expression' in input) {
      throw new Error('Volume pricing model FFET does not implement pricing formula or engine behavior.');
    }

    if (input.invoice_snapshot_required !== true) {
      throw new Error('Volume pricing model requires immutable invoice price snapshots.');
    }

    assertValidEffectiveWindow(input.effective_from, input.effective_to);
    assertValidVolumeBreaks(input.volume_breaks);

    const currencies = new Set(input.volume_breaks.map((volumeBreak) => volumeBreak.currency_code));
    if (currencies.size !== 1) {
      throw new Error('Volume pricing model requires a single currency across all volume breaks.');
    }

    return {
      seed_id: phase6BVolumePricingModelSeedId,
      component_id: phase6BVolumePricingModelComponentId,
      module_key: phase6BVolumePricingModelModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      price_history_id: input.price_history_id,
      configuration_extension: true,
      canonical_price_history_required: true,
      invoice_snapshot_required: true,
      independent_foundry_activation: false,
      pricing_engine_implemented: false,
      volume_break_count: input.volume_breaks.length,
      volume_breaks: [...input.volume_breaks]
        .sort((left, right) => left.min_quantity - right.min_quantity)
        .map((volumeBreak) => ({
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
        effective_from: input.effective_from,
        effective_to: input.effective_to ?? null,
      },
      evidence: {
        actor_user_id: input.actor_user_id,
        validation_event: 'PHASE_6B_VOLUME_PRICING_MODEL_CONFIG_VALIDATED',
      },
    };
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Volume pricing model requires ${fieldName}.`);
  }
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

function assertValidVolumeBreaks(volumeBreaks: readonly Phase6BVolumePricingBreakConfigInput[]): void {
  if (volumeBreaks.length === 0) {
    throw new Error('Volume pricing model requires at least one volume break.');
  }

  const sorted = [...volumeBreaks].sort((left, right) => left.min_quantity - right.min_quantity);
  const breakIds = new Set<string>();
  let expectedMinQuantity = 1;
  let openEndedBreakSeen = false;

  for (const volumeBreak of sorted) {
    assertNonEmpty(volumeBreak.break_id, 'break_id');
    assertNonEmpty(volumeBreak.currency_code, 'currency_code');
    assertNonEmpty(volumeBreak.evidence_id, 'evidence_id');

    if (breakIds.has(volumeBreak.break_id)) {
      throw new Error('Volume pricing model break_id values must be unique.');
    }
    breakIds.add(volumeBreak.break_id);

    if (!Number.isInteger(volumeBreak.min_quantity) || volumeBreak.min_quantity < 1) {
      throw new Error('Volume pricing break min_quantity must be a positive integer.');
    }

    if (volumeBreak.max_quantity !== undefined && (!Number.isInteger(volumeBreak.max_quantity) || volumeBreak.max_quantity < 1)) {
      throw new Error('Volume pricing break max_quantity must be a positive integer when supplied.');
    }

    if (!Number.isInteger(volumeBreak.unit_amount_minor_units) || volumeBreak.unit_amount_minor_units < 0) {
      throw new Error('Volume pricing break unit_amount_minor_units must be a non-negative integer.');
    }

    if (!/^[A-Z]{3}$/.test(volumeBreak.currency_code)) {
      throw new Error('Volume pricing break currency_code must be an uppercase ISO-style currency code.');
    }

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
