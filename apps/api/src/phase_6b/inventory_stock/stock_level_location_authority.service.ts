export const phase6BStockLevelLocationAuthoritySeedId = 'seed_6b_03_stock_level_location_authority' as const;
export const phase6BStockLevelLocationAuthorityComponentId = '6B.03' as const;
export const phase6BStockLevelLocationAuthorityModuleKey = 'phase-6b.inventory-stock' as const;

export interface Phase6BStockLevelLocationSnapshotRequest {
  readonly organization_id: string;
  readonly product_id: string;
  readonly location_id: string;
  readonly price_history_id: string;
  readonly stock_level_id: string;
  readonly quantity_on_hand: number;
  readonly quantity_reserved: number;
  readonly unit_of_measure: string;
  readonly counted_at: string;
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly source_seed_id?: typeof phase6BStockLevelLocationAuthoritySeedId;
  readonly inventory_service_enabled: true;
  readonly movement_requested?: never;
  readonly allocation_requested?: never;
}

export interface Phase6BStockLevelLocationSnapshotReceipt {
  readonly seed_id: typeof phase6BStockLevelLocationAuthoritySeedId;
  readonly component_id: typeof phase6BStockLevelLocationAuthorityComponentId;
  readonly module_key: typeof phase6BStockLevelLocationAuthorityModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly location_id: string;
  readonly price_history_id: string;
  readonly stock_level_id: string;
  readonly quantity_on_hand: number;
  readonly quantity_reserved: number;
  readonly quantity_available: number;
  readonly unit_of_measure: string;
  readonly counted_at: string;
  readonly authority: {
    readonly tenant_service: true;
    readonly product_record_authority_required: true;
    readonly product_price_history_required: true;
    readonly location_scoped_stock_level: true;
  };
  readonly non_scope_confirmation: {
    readonly stock_movement_performed: false;
    readonly allocation_performed: false;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_STOCK_LEVEL_LOCATION_AUTHORITY_VALIDATED';
  };
}

export class Phase6BStockLevelLocationAuthorityService {
  validateSnapshot(request: Phase6BStockLevelLocationSnapshotRequest): Phase6BStockLevelLocationSnapshotReceipt {
    assertValidStockLevelLocationSnapshot(request);

    return {
      seed_id: phase6BStockLevelLocationAuthoritySeedId,
      component_id: phase6BStockLevelLocationAuthorityComponentId,
      module_key: phase6BStockLevelLocationAuthorityModuleKey,
      organization_id: request.organization_id,
      product_id: request.product_id,
      location_id: request.location_id,
      price_history_id: request.price_history_id,
      stock_level_id: request.stock_level_id,
      quantity_on_hand: request.quantity_on_hand,
      quantity_reserved: request.quantity_reserved,
      quantity_available: request.quantity_on_hand - request.quantity_reserved,
      unit_of_measure: request.unit_of_measure,
      counted_at: request.counted_at,
      authority: {
        tenant_service: true,
        product_record_authority_required: true,
        product_price_history_required: true,
        location_scoped_stock_level: true,
      },
      non_scope_confirmation: {
        stock_movement_performed: false,
        allocation_performed: false,
      },
      evidence: {
        actor_user_id: request.actor_user_id,
        evidence_id: request.evidence_id,
        validation_event: 'PHASE_6B_STOCK_LEVEL_LOCATION_AUTHORITY_VALIDATED',
      },
    };
  }
}

function assertValidStockLevelLocationSnapshot(request: Phase6BStockLevelLocationSnapshotRequest): void {
  assertNonEmpty(request.organization_id, 'organization_id');
  assertNonEmpty(request.product_id, 'product_id');
  assertNonEmpty(request.location_id, 'location_id');
  assertNonEmpty(request.price_history_id, 'price_history_id');
  assertNonEmpty(request.stock_level_id, 'stock_level_id');
  assertNonEmpty(request.unit_of_measure, 'unit_of_measure');
  assertNonEmpty(request.actor_user_id, 'actor_user_id');
  assertNonEmpty(request.evidence_id, 'evidence_id');

  if (request.source_seed_id !== undefined && request.source_seed_id !== phase6BStockLevelLocationAuthoritySeedId) {
    throw new Error('Stock level location authority source_seed_id must match the FFET seed.');
  }

  if (request.inventory_service_enabled !== true) {
    throw new Error('Stock level location authority requires inventory_service_enabled.');
  }

  if (!Number.isInteger(request.quantity_on_hand) || request.quantity_on_hand < 0) {
    throw new Error('Stock level quantity_on_hand must be a non-negative integer.');
  }

  if (!Number.isInteger(request.quantity_reserved) || request.quantity_reserved < 0) {
    throw new Error('Stock level quantity_reserved must be a non-negative integer.');
  }

  if (request.quantity_reserved > request.quantity_on_hand) {
    throw new Error('Stock level quantity_reserved cannot exceed quantity_on_hand.');
  }

  if (Number.isNaN(Date.parse(request.counted_at))) {
    throw new Error('Stock level counted_at must be a valid date.');
  }

  if ('movement_requested' in request) {
    throw new Error('Stock level location authority does not perform stock movement.');
  }

  if ('allocation_requested' in request) {
    throw new Error('Stock level location authority does not perform allocation.');
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Stock level location authority requires ${fieldName}.`);
  }
}
