export const phase6BStockMovementLedgerSeedId = 'seed_6b_03_stock_movement_ledger' as const;
export const phase6BStockMovementLedgerComponentId = '6B.03' as const;
export const phase6BStockMovementLedgerModuleKey = 'phase-6b.inventory-stock' as const;

export type Phase6BStockMovementType = 'RECEIVE' | 'ISSUE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';

export interface Phase6BStockMovementLedgerEntryRequest {
  readonly organization_id: string;
  readonly product_id: string;
  readonly location_id: string;
  readonly price_history_id: string;
  readonly movement_id: string;
  readonly movement_type: Phase6BStockMovementType;
  readonly quantity_before: number;
  readonly quantity_delta: number;
  readonly unit_of_measure: string;
  readonly occurred_at: string;
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly source_seed_id?: typeof phase6BStockMovementLedgerSeedId;
  readonly inventory_service_enabled: true;
  readonly provider_operation_requested?: never;
}

export interface Phase6BStockMovementLedgerEntryReceipt {
  readonly seed_id: typeof phase6BStockMovementLedgerSeedId;
  readonly component_id: typeof phase6BStockMovementLedgerComponentId;
  readonly module_key: typeof phase6BStockMovementLedgerModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly location_id: string;
  readonly price_history_id: string;
  readonly movement_id: string;
  readonly movement_type: Phase6BStockMovementType;
  readonly quantity_before: number;
  readonly quantity_delta: number;
  readonly quantity_after: number;
  readonly unit_of_measure: string;
  readonly occurred_at: string;
  readonly authority: {
    readonly tenant_service: true;
    readonly product_record_authority_required: true;
    readonly product_price_history_required: true;
    readonly stock_movement_evidence_required: true;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_STOCK_MOVEMENT_LEDGER_ENTRY_RECORDED';
  };
}

export class Phase6BStockMovementLedgerService {
  recordEntry(request: Phase6BStockMovementLedgerEntryRequest): Phase6BStockMovementLedgerEntryReceipt {
    assertValidStockMovementLedgerEntry(request);

    return {
      seed_id: phase6BStockMovementLedgerSeedId,
      component_id: phase6BStockMovementLedgerComponentId,
      module_key: phase6BStockMovementLedgerModuleKey,
      organization_id: request.organization_id,
      product_id: request.product_id,
      location_id: request.location_id,
      price_history_id: request.price_history_id,
      movement_id: request.movement_id,
      movement_type: request.movement_type,
      quantity_before: request.quantity_before,
      quantity_delta: request.quantity_delta,
      quantity_after: request.quantity_before + request.quantity_delta,
      unit_of_measure: request.unit_of_measure,
      occurred_at: request.occurred_at,
      authority: {
        tenant_service: true,
        product_record_authority_required: true,
        product_price_history_required: true,
        stock_movement_evidence_required: true,
      },
      evidence: {
        actor_user_id: request.actor_user_id,
        evidence_id: request.evidence_id,
        validation_event: 'PHASE_6B_STOCK_MOVEMENT_LEDGER_ENTRY_RECORDED',
      },
    };
  }
}

function assertValidStockMovementLedgerEntry(request: Phase6BStockMovementLedgerEntryRequest): void {
  assertNonEmpty(request.organization_id, 'organization_id');
  assertNonEmpty(request.product_id, 'product_id');
  assertNonEmpty(request.location_id, 'location_id');
  assertNonEmpty(request.price_history_id, 'price_history_id');
  assertNonEmpty(request.movement_id, 'movement_id');
  assertNonEmpty(request.unit_of_measure, 'unit_of_measure');
  assertNonEmpty(request.actor_user_id, 'actor_user_id');
  assertNonEmpty(request.evidence_id, 'evidence_id');

  if (request.source_seed_id !== undefined && request.source_seed_id !== phase6BStockMovementLedgerSeedId) {
    throw new Error('Stock movement ledger source_seed_id must match the FFET seed.');
  }

  if (request.inventory_service_enabled !== true) {
    throw new Error('Stock movement ledger requires inventory_service_enabled.');
  }

  if (!['RECEIVE', 'ISSUE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'].includes(request.movement_type)) {
    throw new Error('Stock movement ledger movement_type is not supported.');
  }

  if (!Number.isInteger(request.quantity_before) || request.quantity_before < 0) {
    throw new Error('Stock movement ledger quantity_before must be a non-negative integer.');
  }

  if (!Number.isInteger(request.quantity_delta) || request.quantity_delta === 0) {
    throw new Error('Stock movement ledger quantity_delta must be a non-zero integer.');
  }

  const quantityAfter = request.quantity_before + request.quantity_delta;
  if (quantityAfter < 0) {
    throw new Error('Stock movement ledger quantity_after cannot be negative.');
  }

  if ((request.movement_type === 'RECEIVE' || request.movement_type === 'TRANSFER_IN') && request.quantity_delta < 0) {
    throw new Error('Inbound stock movement types require a positive quantity_delta.');
  }

  if ((request.movement_type === 'ISSUE' || request.movement_type === 'TRANSFER_OUT') && request.quantity_delta > 0) {
    throw new Error('Outbound stock movement types require a negative quantity_delta.');
  }

  if (Number.isNaN(Date.parse(request.occurred_at))) {
    throw new Error('Stock movement ledger occurred_at must be a valid date.');
  }

  if ('provider_operation_requested' in request) {
    throw new Error('Stock movement ledger does not perform provider operations.');
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Stock movement ledger requires ${fieldName}.`);
  }
}
