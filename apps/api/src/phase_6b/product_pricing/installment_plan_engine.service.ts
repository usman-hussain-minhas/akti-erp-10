export const phase6BInstallmentPlanEngineSeedId = 'seed_6b_02_installment_plan_engine' as const;
export const phase6BInstallmentPlanEngineComponentId = '6B.02' as const;
export const phase6BInstallmentPlanEngineModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BInstallmentPlanLine {
  readonly installment_id: string;
  readonly sequence: number;
  readonly due_at: string;
  readonly amount_minor_units: number;
  readonly currency_code: string;
  readonly evidence_id: string;
}

export interface Phase6BInstallmentPlanRequest {
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly installment_plan_id: string;
  readonly total_amount_minor_units: number;
  readonly currency_code: string;
  readonly installments: readonly Phase6BInstallmentPlanLine[];
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly source_seed_id?: typeof phase6BInstallmentPlanEngineSeedId;
  readonly invoice_snapshot_required: true;
  readonly independent_activation_requested?: boolean;
  readonly payment_allocation_requested?: never;
  readonly provider_charge_requested?: never;
}

export interface Phase6BInstallmentPlanReceipt {
  readonly seed_id: typeof phase6BInstallmentPlanEngineSeedId;
  readonly component_id: typeof phase6BInstallmentPlanEngineComponentId;
  readonly module_key: typeof phase6BInstallmentPlanEngineModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly installment_plan_id: string;
  readonly installment_count: number;
  readonly total_amount_minor_units: number;
  readonly currency_code: string;
  readonly installments: readonly Phase6BInstallmentPlanLine[];
  readonly pricing_authority: {
    readonly canonical_price_history_required: true;
    readonly invoice_snapshot_required: true;
    readonly adl_refs: readonly ['ADL-013'];
  };
  readonly lifecycle: {
    readonly activation_manifest_required: true;
    readonly independent_foundry_activation: false;
  };
  readonly non_scope_confirmation: {
    readonly payment_allocation_performed: false;
    readonly provider_charge_performed: false;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_INSTALLMENT_PLAN_VALIDATED';
  };
}

export class Phase6BInstallmentPlanEngineService {
  validatePlan(request: Phase6BInstallmentPlanRequest): Phase6BInstallmentPlanReceipt {
    assertValidInstallmentPlanRequest(request);

    return {
      seed_id: phase6BInstallmentPlanEngineSeedId,
      component_id: phase6BInstallmentPlanEngineComponentId,
      module_key: phase6BInstallmentPlanEngineModuleKey,
      organization_id: request.organization_id,
      product_id: request.product_id,
      price_history_id: request.price_history_id,
      installment_plan_id: request.installment_plan_id,
      installment_count: request.installments.length,
      total_amount_minor_units: request.total_amount_minor_units,
      currency_code: request.currency_code,
      installments: [...request.installments],
      pricing_authority: {
        canonical_price_history_required: true,
        invoice_snapshot_required: true,
        adl_refs: ['ADL-013'],
      },
      lifecycle: {
        activation_manifest_required: true,
        independent_foundry_activation: false,
      },
      non_scope_confirmation: {
        payment_allocation_performed: false,
        provider_charge_performed: false,
      },
      evidence: {
        actor_user_id: request.actor_user_id,
        evidence_id: request.evidence_id,
        validation_event: 'PHASE_6B_INSTALLMENT_PLAN_VALIDATED',
      },
    };
  }
}

function assertValidInstallmentPlanRequest(request: Phase6BInstallmentPlanRequest): void {
  assertNonEmpty(request.organization_id, 'organization_id');
  assertNonEmpty(request.product_id, 'product_id');
  assertNonEmpty(request.price_history_id, 'price_history_id');
  assertNonEmpty(request.installment_plan_id, 'installment_plan_id');
  assertNonEmpty(request.currency_code, 'currency_code');
  assertNonEmpty(request.actor_user_id, 'actor_user_id');
  assertNonEmpty(request.evidence_id, 'evidence_id');

  if (request.source_seed_id !== undefined && request.source_seed_id !== phase6BInstallmentPlanEngineSeedId) {
    throw new Error('Installment plan engine source_seed_id must match the FFET seed.');
  }

  if (!Number.isInteger(request.total_amount_minor_units) || request.total_amount_minor_units < 0) {
    throw new Error('Installment plan total_amount_minor_units must be a non-negative integer.');
  }

  if (!/^[A-Z]{3}$/.test(request.currency_code)) {
    throw new Error('Installment plan currency_code must be an uppercase ISO-style currency code.');
  }

  if (request.installments.length === 0) {
    throw new Error('Installment plan requires at least one installment.');
  }

  if (request.invoice_snapshot_required !== true) {
    throw new Error('Installment plan requires immutable invoice price snapshots.');
  }

  if (request.independent_activation_requested === true) {
    throw new Error('Installment plan engine must activate only through Product Pricing manifest lifecycle.');
  }

  if ('payment_allocation_requested' in request) {
    throw new Error('Installment plan engine does not perform payment allocation.');
  }

  if ('provider_charge_requested' in request) {
    throw new Error('Installment plan engine does not perform provider charging.');
  }

  let expectedSequence = 1;
  let previousDueAt = 0;
  let total = 0;
  const installmentIds = new Set<string>();

  for (const installment of [...request.installments].sort((left, right) => left.sequence - right.sequence)) {
    assertNonEmpty(installment.installment_id, 'installment_id');
    assertNonEmpty(installment.currency_code, 'installment currency_code');
    assertNonEmpty(installment.evidence_id, 'installment evidence_id');

    if (installmentIds.has(installment.installment_id)) {
      throw new Error('Installment plan installment_id values must be unique.');
    }
    installmentIds.add(installment.installment_id);

    if (installment.sequence !== expectedSequence) {
      throw new Error('Installment plan sequence values must be gapless starting at 1.');
    }

    if (!Number.isInteger(installment.amount_minor_units) || installment.amount_minor_units < 0) {
      throw new Error('Installment amount_minor_units must be a non-negative integer.');
    }

    if (installment.currency_code !== request.currency_code) {
      throw new Error('Installment currency_code must match the plan currency_code.');
    }

    const dueAt = Date.parse(installment.due_at);
    if (Number.isNaN(dueAt)) {
      throw new Error('Installment due_at must be a valid date.');
    }

    if (dueAt <= previousDueAt) {
      throw new Error('Installment due_at values must be strictly increasing by sequence.');
    }

    total += installment.amount_minor_units;
    previousDueAt = dueAt;
    expectedSequence += 1;
  }

  if (total !== request.total_amount_minor_units) {
    throw new Error('Installment amounts must sum to total_amount_minor_units.');
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Installment plan engine requires ${fieldName}.`);
  }
}
