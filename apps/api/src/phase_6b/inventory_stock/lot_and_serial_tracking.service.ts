export const phase6BLotAndSerialTrackingSeedId = 'seed_6b_03_lot_and_serial_tracking' as const;
export const phase6BLotAndSerialTrackingComponentId = '6B.03' as const;
export const phase6BLotAndSerialTrackingModuleKey = 'phase-6b.inventory-stock' as const;

export type Phase6BTrackingMode = 'LOT' | 'SERIAL' | 'LOT_AND_SERIAL';

export interface Phase6BLotAndSerialTrackingRequest {
  readonly organization_id: string;
  readonly product_id: string;
  readonly location_id: string;
  readonly price_history_id: string;
  readonly tracking_record_id: string;
  readonly tracking_mode: Phase6BTrackingMode;
  readonly quantity: number;
  readonly lot_id?: string;
  readonly serial_numbers?: readonly string[];
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly source_seed_id?: typeof phase6BLotAndSerialTrackingSeedId;
  readonly inventory_service_enabled: true;
  readonly movement_requested?: never;
}

export interface Phase6BLotAndSerialTrackingReceipt {
  readonly seed_id: typeof phase6BLotAndSerialTrackingSeedId;
  readonly component_id: typeof phase6BLotAndSerialTrackingComponentId;
  readonly module_key: typeof phase6BLotAndSerialTrackingModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly location_id: string;
  readonly price_history_id: string;
  readonly tracking_record_id: string;
  readonly tracking_mode: Phase6BTrackingMode;
  readonly quantity: number;
  readonly lot_id: string | null;
  readonly serial_numbers: readonly string[];
  readonly authority: {
    readonly tenant_service: true;
    readonly product_record_authority_required: true;
    readonly product_price_history_required: true;
    readonly lot_or_serial_identity_required: true;
  };
  readonly non_scope_confirmation: {
    readonly stock_movement_performed: false;
  };
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_LOT_AND_SERIAL_TRACKING_VALIDATED';
  };
}

export class Phase6BLotAndSerialTrackingService {
  validateTracking(request: Phase6BLotAndSerialTrackingRequest): Phase6BLotAndSerialTrackingReceipt {
    assertValidLotAndSerialTracking(request);

    return {
      seed_id: phase6BLotAndSerialTrackingSeedId,
      component_id: phase6BLotAndSerialTrackingComponentId,
      module_key: phase6BLotAndSerialTrackingModuleKey,
      organization_id: request.organization_id,
      product_id: request.product_id,
      location_id: request.location_id,
      price_history_id: request.price_history_id,
      tracking_record_id: request.tracking_record_id,
      tracking_mode: request.tracking_mode,
      quantity: request.quantity,
      lot_id: request.lot_id ?? null,
      serial_numbers: request.serial_numbers ?? [],
      authority: {
        tenant_service: true,
        product_record_authority_required: true,
        product_price_history_required: true,
        lot_or_serial_identity_required: true,
      },
      non_scope_confirmation: {
        stock_movement_performed: false,
      },
      evidence: {
        actor_user_id: request.actor_user_id,
        evidence_id: request.evidence_id,
        validation_event: 'PHASE_6B_LOT_AND_SERIAL_TRACKING_VALIDATED',
      },
    };
  }
}

function assertValidLotAndSerialTracking(request: Phase6BLotAndSerialTrackingRequest): void {
  assertNonEmpty(request.organization_id, 'organization_id');
  assertNonEmpty(request.product_id, 'product_id');
  assertNonEmpty(request.location_id, 'location_id');
  assertNonEmpty(request.price_history_id, 'price_history_id');
  assertNonEmpty(request.tracking_record_id, 'tracking_record_id');
  assertNonEmpty(request.actor_user_id, 'actor_user_id');
  assertNonEmpty(request.evidence_id, 'evidence_id');

  if (request.source_seed_id !== undefined && request.source_seed_id !== phase6BLotAndSerialTrackingSeedId) {
    throw new Error('Lot and serial tracking source_seed_id must match the FFET seed.');
  }

  if (request.inventory_service_enabled !== true) {
    throw new Error('Lot and serial tracking requires inventory_service_enabled.');
  }

  if (request.tracking_mode !== 'LOT' && request.tracking_mode !== 'SERIAL' && request.tracking_mode !== 'LOT_AND_SERIAL') {
    throw new Error('Lot and serial tracking mode must be LOT, SERIAL, or LOT_AND_SERIAL.');
  }

  if (!Number.isInteger(request.quantity) || request.quantity < 1) {
    throw new Error('Lot and serial tracking quantity must be a positive integer.');
  }

  const serialNumbers = request.serial_numbers ?? [];
  const hasLot = request.lot_id !== undefined && request.lot_id.trim().length > 0;
  const hasSerials = serialNumbers.length > 0;

  if (request.tracking_mode === 'LOT' && !hasLot) {
    throw new Error('LOT tracking requires lot_id.');
  }

  if (request.tracking_mode === 'SERIAL' && hasLot) {
    throw new Error('SERIAL tracking must not include lot_id.');
  }

  if (request.tracking_mode === 'SERIAL' && !hasSerials) {
    throw new Error('SERIAL tracking requires serial_numbers.');
  }

  if (request.tracking_mode === 'LOT_AND_SERIAL' && (!hasLot || !hasSerials)) {
    throw new Error('LOT_AND_SERIAL tracking requires both lot_id and serial_numbers.');
  }

  const serialSet = new Set<string>();
  for (const serialNumber of serialNumbers) {
    assertNonEmpty(serialNumber, 'serial_number');
    if (serialSet.has(serialNumber)) {
      throw new Error('Lot and serial tracking serial_numbers must be unique.');
    }
    serialSet.add(serialNumber);
  }

  if ((request.tracking_mode === 'SERIAL' || request.tracking_mode === 'LOT_AND_SERIAL') && serialNumbers.length !== request.quantity) {
    throw new Error('Serialized tracking quantity must match serial_numbers count.');
  }

  if ('movement_requested' in request) {
    throw new Error('Lot and serial tracking does not perform stock movement.');
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Lot and serial tracking requires ${fieldName}.`);
  }
}
