export const phase6BDiscountStackingEngineSeedId = 'seed_6b_02_discount_stacking_engine' as const;
export const phase6BDiscountStackingEngineComponentId = '6B.02' as const;
export const phase6BDiscountStackingEngineModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BDiscountStackInputLine {
  readonly discount_id: string;
  readonly sequence: number;
  readonly discount_amount_minor_units: number;
  readonly currency_code: string;
  readonly evidence_id: string;
}

export interface Phase6BDiscountStackRequest {
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly stack_run_id: string;
  readonly base_amount_minor_units: number;
  readonly currency_code: string;
  readonly discounts: readonly Phase6BDiscountStackInputLine[];
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly source_seed_id?: typeof phase6BDiscountStackingEngineSeedId;
  readonly invoice_snapshot_required: true;
  readonly independent_activation_requested?: boolean;
  readonly undisclosed_policy_requested?: never;
}

export interface Phase6BAppliedDiscountLine {
  readonly discount_id: string;
  readonly sequence: number;
  readonly discount_amount_minor_units: number;
  readonly amount_before_minor_units: number;
  readonly amount_after_minor_units: number;
  readonly currency_code: string;
  readonly evidence_id: string;
}

export interface Phase6BDiscountStackReceipt {
  readonly seed_id: typeof phase6BDiscountStackingEngineSeedId;
  readonly component_id: typeof phase6BDiscountStackingEngineComponentId;
  readonly module_key: typeof phase6BDiscountStackingEngineModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly stack_run_id: string;
  readonly base_amount_minor_units: number;
  readonly final_amount_minor_units: number;
  readonly currency_code: string;
  readonly applied_discounts: readonly Phase6BAppliedDiscountLine[];
  readonly pricing_authority: {
    readonly canonical_price_history_required: true;
    readonly invoice_snapshot_required: true;
    readonly adl_refs: readonly ['ADL-015'];
  };
  readonly lifecycle: {
    readonly activation_manifest_required: true;
    readonly independent_foundry_activation: false;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_DISCOUNT_STACKING_EVALUATED';
  };
}

export function evaluatePhase6BDiscountStack(request: Phase6BDiscountStackRequest): Phase6BDiscountStackReceipt {
  assertValidDiscountStackRequest(request);
  let currentAmount = request.base_amount_minor_units;
  const appliedDiscounts: Phase6BAppliedDiscountLine[] = [];

  for (const discount of [...request.discounts].sort((left, right) => left.sequence - right.sequence)) {
    const amountBefore = currentAmount;
    currentAmount -= discount.discount_amount_minor_units;
    appliedDiscounts.push({
      discount_id: discount.discount_id,
      sequence: discount.sequence,
      discount_amount_minor_units: discount.discount_amount_minor_units,
      amount_before_minor_units: amountBefore,
      amount_after_minor_units: currentAmount,
      currency_code: discount.currency_code,
      evidence_id: discount.evidence_id,
    });
  }

  return {
    seed_id: phase6BDiscountStackingEngineSeedId,
    component_id: phase6BDiscountStackingEngineComponentId,
    module_key: phase6BDiscountStackingEngineModuleKey,
    organization_id: request.organization_id,
    product_id: request.product_id,
    price_history_id: request.price_history_id,
    stack_run_id: request.stack_run_id,
    base_amount_minor_units: request.base_amount_minor_units,
    final_amount_minor_units: currentAmount,
    currency_code: request.currency_code,
    applied_discounts: appliedDiscounts,
    pricing_authority: {
      canonical_price_history_required: true,
      invoice_snapshot_required: true,
      adl_refs: ['ADL-015'],
    },
    lifecycle: {
      activation_manifest_required: true,
      independent_foundry_activation: false,
    },
    evidence: {
      actor_user_id: request.actor_user_id,
      evidence_id: request.evidence_id,
      validation_event: 'PHASE_6B_DISCOUNT_STACKING_EVALUATED',
    },
  };
}

export function assertValidDiscountStackRequest(request: Phase6BDiscountStackRequest): void {
  assertNonEmpty(request.organization_id, 'organization_id');
  assertNonEmpty(request.product_id, 'product_id');
  assertNonEmpty(request.price_history_id, 'price_history_id');
  assertNonEmpty(request.stack_run_id, 'stack_run_id');
  assertNonEmpty(request.currency_code, 'currency_code');
  assertNonEmpty(request.actor_user_id, 'actor_user_id');
  assertNonEmpty(request.evidence_id, 'evidence_id');

  if (request.source_seed_id !== undefined && request.source_seed_id !== phase6BDiscountStackingEngineSeedId) {
    throw new Error('Discount stacking engine source_seed_id must match the FFET seed.');
  }

  if (!Number.isInteger(request.base_amount_minor_units) || request.base_amount_minor_units < 0) {
    throw new Error('Discount stacking base_amount_minor_units must be a non-negative integer.');
  }

  if (!/^[A-Z]{3}$/.test(request.currency_code)) {
    throw new Error('Discount stacking currency_code must be an uppercase ISO-style currency code.');
  }

  if (request.discounts.length === 0) {
    throw new Error('Discount stacking engine requires at least one discount.');
  }

  if (request.invoice_snapshot_required !== true) {
    throw new Error('Discount stacking engine requires immutable invoice price snapshots.');
  }

  if (request.independent_activation_requested === true) {
    throw new Error('Discount stacking engine must activate only through Product Pricing manifest lifecycle.');
  }

  if ('undisclosed_policy_requested' in request) {
    throw new Error('Discount stacking engine cannot evaluate undisclosed discount policy.');
  }

  let expectedSequence = 1;
  let runningAmount = request.base_amount_minor_units;
  const discountIds = new Set<string>();

  for (const discount of [...request.discounts].sort((left, right) => left.sequence - right.sequence)) {
    assertNonEmpty(discount.discount_id, 'discount_id');
    assertNonEmpty(discount.currency_code, 'discount currency_code');
    assertNonEmpty(discount.evidence_id, 'discount evidence_id');

    if (discountIds.has(discount.discount_id)) {
      throw new Error('Discount stacking discount_id values must be unique.');
    }
    discountIds.add(discount.discount_id);

    if (discount.sequence !== expectedSequence) {
      throw new Error('Discount stacking sequence values must be gapless starting at 1.');
    }

    if (!Number.isInteger(discount.discount_amount_minor_units) || discount.discount_amount_minor_units < 0) {
      throw new Error('Discount amount_minor_units must be a non-negative integer.');
    }

    if (discount.currency_code !== request.currency_code) {
      throw new Error('Discount currency_code must match stack currency_code.');
    }

    runningAmount -= discount.discount_amount_minor_units;
    if (runningAmount < 0) {
      throw new Error('Discount stack cannot reduce the amount below zero.');
    }

    expectedSequence += 1;
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Discount stacking engine requires ${fieldName}.`);
  }
}
