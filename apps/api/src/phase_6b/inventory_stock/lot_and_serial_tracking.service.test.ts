import assert from 'node:assert/strict';
import { Phase6BLotAndSerialTrackingService } from './lot_and_serial_tracking.service';

const service = new Phase6BLotAndSerialTrackingService();

const lotAndSerialRequest = {
  organization_id: 'org_phase_6b',
  product_id: 'product_serialized_item',
  location_id: 'location_main_warehouse',
  price_history_id: 'price_history_serialized_item_2026_06',
  tracking_record_id: 'tracking_lot_serial_001',
  tracking_mode: 'LOT_AND_SERIAL' as const,
  quantity: 2,
  lot_id: 'lot_2026_06_a',
  serial_numbers: ['serial_001', 'serial_002'],
  actor_user_id: 'user_inventory_admin',
  evidence_id: 'evidence_lot_serial_001',
  source_seed_id: 'seed_6b_03_lot_and_serial_tracking' as const,
  inventory_service_enabled: true as const,
};

const receipt = service.validateTracking(lotAndSerialRequest);
assert.equal(receipt.seed_id, 'seed_6b_03_lot_and_serial_tracking');
assert.equal(receipt.component_id, '6B.03');
assert.equal(receipt.module_key, 'phase-6b.inventory-stock');
assert.equal(receipt.tracking_mode, 'LOT_AND_SERIAL');
assert.equal(receipt.quantity, 2);
assert.deepEqual(receipt.serial_numbers, ['serial_001', 'serial_002']);
assert.equal(receipt.authority.tenant_service, true);
assert.equal(receipt.authority.product_record_authority_required, true);
assert.equal(receipt.authority.product_price_history_required, true);
assert.equal(receipt.authority.lot_or_serial_identity_required, true);
assert.equal(receipt.non_scope_confirmation.stock_movement_performed, false);
assert.equal(receipt.evidence.validation_event, 'PHASE_6B_LOT_AND_SERIAL_TRACKING_VALIDATED');

const lotOnly = service.validateTracking({
  ...lotAndSerialRequest,
  tracking_record_id: 'tracking_lot_001',
  tracking_mode: 'LOT',
  quantity: 10,
  lot_id: 'lot_only_001',
  serial_numbers: undefined,
});
assert.equal(lotOnly.tracking_mode, 'LOT');
assert.equal(lotOnly.serial_numbers.length, 0);

assert.throws(
  () =>
    service.validateTracking({
      ...lotAndSerialRequest,
      tracking_mode: 'SERIAL',
      lot_id: 'lot_not_allowed',
    }),
  /SERIAL tracking must not include lot_id/,
);

assert.throws(
  () =>
    service.validateTracking({
      ...lotAndSerialRequest,
      serial_numbers: ['serial_001', 'serial_001'],
    }),
  /serial_numbers must be unique/,
);

assert.throws(
  () =>
    service.validateTracking({
      ...lotAndSerialRequest,
      quantity: 3,
    }),
  /quantity must match serial_numbers count/,
);

assert.throws(
  () =>
    service.validateTracking({
      ...lotAndSerialRequest,
      tracking_mode: 'LOT',
      lot_id: '',
      serial_numbers: undefined,
    }),
  /LOT tracking requires lot_id/,
);

assert.throws(
  () =>
    service.validateTracking({
      ...lotAndSerialRequest,
      inventory_service_enabled: false,
    } as never),
  /inventory_service_enabled/,
);

assert.throws(
  () =>
    service.validateTracking({
      ...lotAndSerialRequest,
      movement_requested: 'move_stock',
    } as never),
  /does not perform stock movement/,
);

console.log('P6B-FFET-018 lot and serial tracking service test passed.');
