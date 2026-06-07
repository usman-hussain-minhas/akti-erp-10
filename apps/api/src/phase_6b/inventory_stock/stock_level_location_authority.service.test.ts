import assert from 'node:assert/strict';
import { Phase6BStockLevelLocationAuthorityService } from './stock_level_location_authority.service';

const service = new Phase6BStockLevelLocationAuthorityService();

const baseRequest = {
  organization_id: 'org_phase_6b',
  product_id: 'product_inventory_item',
  location_id: 'location_main_warehouse',
  price_history_id: 'price_history_inventory_item_2026_06',
  stock_level_id: 'stock_level_main_warehouse_item',
  quantity_on_hand: 25,
  quantity_reserved: 7,
  unit_of_measure: 'unit',
  counted_at: '2026-06-08T10:00:00.000Z',
  actor_user_id: 'user_inventory_admin',
  evidence_id: 'evidence_stock_level_001',
  source_seed_id: 'seed_6b_03_stock_level_location_authority' as const,
  inventory_service_enabled: true as const,
};

const receipt = service.validateSnapshot(baseRequest);
assert.equal(receipt.seed_id, 'seed_6b_03_stock_level_location_authority');
assert.equal(receipt.component_id, '6B.03');
assert.equal(receipt.module_key, 'phase-6b.inventory-stock');
assert.equal(receipt.quantity_on_hand, 25);
assert.equal(receipt.quantity_reserved, 7);
assert.equal(receipt.quantity_available, 18);
assert.equal(receipt.authority.tenant_service, true);
assert.equal(receipt.authority.product_record_authority_required, true);
assert.equal(receipt.authority.product_price_history_required, true);
assert.equal(receipt.authority.location_scoped_stock_level, true);
assert.equal(receipt.non_scope_confirmation.stock_movement_performed, false);
assert.equal(receipt.non_scope_confirmation.allocation_performed, false);
assert.equal(receipt.evidence.validation_event, 'PHASE_6B_STOCK_LEVEL_LOCATION_AUTHORITY_VALIDATED');

assert.throws(
  () =>
    service.validateSnapshot({
      ...baseRequest,
      inventory_service_enabled: false,
    } as never),
  /inventory_service_enabled/,
);

assert.throws(
  () =>
    service.validateSnapshot({
      ...baseRequest,
      quantity_on_hand: -1,
    }),
  /quantity_on_hand/,
);

assert.throws(
  () =>
    service.validateSnapshot({
      ...baseRequest,
      quantity_reserved: 26,
    }),
  /cannot exceed quantity_on_hand/,
);

assert.throws(
  () =>
    service.validateSnapshot({
      ...baseRequest,
      counted_at: 'not-a-date',
    }),
  /valid date/,
);

assert.throws(
  () =>
    service.validateSnapshot({
      ...baseRequest,
      location_id: '',
    }),
  /location_id/,
);

assert.throws(
  () =>
    service.validateSnapshot({
      ...baseRequest,
      movement_requested: 'move_stock',
    } as never),
  /does not perform stock movement/,
);

assert.throws(
  () =>
    service.validateSnapshot({
      ...baseRequest,
      allocation_requested: 'allocate_stock',
    } as never),
  /does not perform allocation/,
);

console.log('P6B-FFET-017 stock level location authority service test passed.');
