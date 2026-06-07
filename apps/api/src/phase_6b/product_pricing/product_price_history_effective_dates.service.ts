export const phase6BProductPriceHistoryEffectiveDatesSeedId = 'seed_6b_02_product_price_history_effective_dates' as const;
export const phase6BProductPriceHistoryEffectiveDatesComponentId = '6B.02' as const;
export const phase6BProductPriceHistoryEffectiveDatesModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BProductPriceHistoryRecord {
  readonly price_history_id: string;
  readonly product_id: string;
  readonly amount_minor_units: number;
  readonly currency_code: string;
  readonly effective_from: string;
  readonly effective_to?: string;
  readonly evidence_id: string;
}

export interface Phase6BProductPriceHistoryValidationRequest {
  readonly organization_id: string;
  readonly product_id: string;
  readonly records: readonly Phase6BProductPriceHistoryRecord[];
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly source_seed_id?: typeof phase6BProductPriceHistoryEffectiveDatesSeedId;
  readonly invoice_snapshot_required: true;
  readonly retroactive_invoice_mutation_requested?: never;
  readonly independent_activation_requested?: boolean;
}

export interface Phase6BProductPriceHistoryResolutionRequest extends Phase6BProductPriceHistoryValidationRequest {
  readonly price_as_of: string;
}

export interface Phase6BProductPriceHistoryValidationReceipt {
  readonly seed_id: typeof phase6BProductPriceHistoryEffectiveDatesSeedId;
  readonly component_id: typeof phase6BProductPriceHistoryEffectiveDatesComponentId;
  readonly module_key: typeof phase6BProductPriceHistoryEffectiveDatesModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly record_count: number;
  readonly records: readonly Phase6BProductPriceHistoryRecord[];
  readonly pricing_authority: {
    readonly canonical_price_history: true;
    readonly effective_date_ranges_required: true;
    readonly invoice_snapshot_required: true;
    readonly retroactive_invoice_mutation_allowed: false;
  };
  readonly lifecycle: {
    readonly activation_manifest_required: true;
    readonly independent_foundry_activation: false;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_PRODUCT_PRICE_HISTORY_EFFECTIVE_DATES_VALIDATED';
  };
}

export interface Phase6BProductPriceHistoryResolutionReceipt extends Phase6BProductPriceHistoryValidationReceipt {
  readonly price_as_of: string;
  readonly active_price_history_id: string;
  readonly active_amount_minor_units: number;
  readonly active_currency_code: string;
}

export class Phase6BProductPriceHistoryEffectiveDatesService {
  validateHistory(request: Phase6BProductPriceHistoryValidationRequest): Phase6BProductPriceHistoryValidationReceipt {
    assertValidPriceHistoryRequest(request);

    return {
      seed_id: phase6BProductPriceHistoryEffectiveDatesSeedId,
      component_id: phase6BProductPriceHistoryEffectiveDatesComponentId,
      module_key: phase6BProductPriceHistoryEffectiveDatesModuleKey,
      organization_id: request.organization_id,
      product_id: request.product_id,
      record_count: request.records.length,
      records: [...request.records].sort((left, right) => Date.parse(left.effective_from) - Date.parse(right.effective_from)),
      pricing_authority: {
        canonical_price_history: true,
        effective_date_ranges_required: true,
        invoice_snapshot_required: true,
        retroactive_invoice_mutation_allowed: false,
      },
      lifecycle: {
        activation_manifest_required: true,
        independent_foundry_activation: false,
      },
      evidence: {
        actor_user_id: request.actor_user_id,
        evidence_id: request.evidence_id,
        validation_event: 'PHASE_6B_PRODUCT_PRICE_HISTORY_EFFECTIVE_DATES_VALIDATED',
      },
    };
  }

  resolvePriceAsOf(request: Phase6BProductPriceHistoryResolutionRequest): Phase6BProductPriceHistoryResolutionReceipt {
    const validation = this.validateHistory(request);
    const asOfTime = Date.parse(request.price_as_of);
    if (Number.isNaN(asOfTime)) {
      throw new Error('Product price history price_as_of must be a valid date.');
    }

    const active = validation.records.find((record) => {
      const starts = Date.parse(record.effective_from) <= asOfTime;
      const ends = record.effective_to === undefined || asOfTime <= Date.parse(record.effective_to);
      return starts && ends;
    });

    if (active === undefined) {
      throw new Error('Product price history has no active price for price_as_of.');
    }

    return {
      ...validation,
      price_as_of: request.price_as_of,
      active_price_history_id: active.price_history_id,
      active_amount_minor_units: active.amount_minor_units,
      active_currency_code: active.currency_code,
    };
  }
}

function assertValidPriceHistoryRequest(request: Phase6BProductPriceHistoryValidationRequest): void {
  assertNonEmpty(request.organization_id, 'organization_id');
  assertNonEmpty(request.product_id, 'product_id');
  assertNonEmpty(request.actor_user_id, 'actor_user_id');
  assertNonEmpty(request.evidence_id, 'evidence_id');

  if (request.source_seed_id !== undefined && request.source_seed_id !== phase6BProductPriceHistoryEffectiveDatesSeedId) {
    throw new Error('Product price history source_seed_id must match the FFET seed.');
  }

  if (request.records.length === 0) {
    throw new Error('Product price history requires at least one record.');
  }

  if (request.invoice_snapshot_required !== true) {
    throw new Error('Product price history requires immutable invoice price snapshots.');
  }

  if ('retroactive_invoice_mutation_requested' in request) {
    throw new Error('Product price history cannot request retroactive invoice mutation.');
  }

  if (request.independent_activation_requested === true) {
    throw new Error('Product price history must activate only through Product Pricing manifest lifecycle.');
  }

  const ids = new Set<string>();
  const sorted = [...request.records].sort((left, right) => Date.parse(left.effective_from) - Date.parse(right.effective_from));
  let previousEffectiveTo: number | null = null;

  for (const record of sorted) {
    assertNonEmpty(record.price_history_id, 'price_history_id');
    assertNonEmpty(record.product_id, 'record product_id');
    assertNonEmpty(record.currency_code, 'currency_code');
    assertNonEmpty(record.evidence_id, 'record evidence_id');

    if (record.product_id !== request.product_id) {
      throw new Error('Product price history record product_id must match request product_id.');
    }

    if (ids.has(record.price_history_id)) {
      throw new Error('Product price history price_history_id values must be unique.');
    }
    ids.add(record.price_history_id);

    if (!Number.isInteger(record.amount_minor_units) || record.amount_minor_units < 0) {
      throw new Error('Product price history amount_minor_units must be a non-negative integer.');
    }

    if (!/^[A-Z]{3}$/.test(record.currency_code)) {
      throw new Error('Product price history currency_code must be an uppercase ISO-style currency code.');
    }

    const effectiveFrom = Date.parse(record.effective_from);
    if (Number.isNaN(effectiveFrom)) {
      throw new Error('Product price history effective_from must be a valid date.');
    }

    const effectiveTo = record.effective_to === undefined ? null : Date.parse(record.effective_to);
    if (effectiveTo !== null && Number.isNaN(effectiveTo)) {
      throw new Error('Product price history effective_to must be a valid date.');
    }

    if (effectiveTo !== null && effectiveTo < effectiveFrom) {
      throw new Error('Product price history effective_to must be on or after effective_from.');
    }

    if (previousEffectiveTo !== null && effectiveFrom <= previousEffectiveTo) {
      throw new Error('Product price history effective date ranges must not overlap.');
    }

    previousEffectiveTo = effectiveTo;
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Product price history requires ${fieldName}.`);
  }
}
