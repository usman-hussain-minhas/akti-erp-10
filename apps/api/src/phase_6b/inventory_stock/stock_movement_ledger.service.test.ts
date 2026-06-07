import assert from 'node:assert/strict';
import { Phase6BStockMovementLedgerService } from './stock_movement_ledger.service';

const service = new Phase6BStockMovementLedgerService();

const baseRequest = {
  organization_id: 'org_phase_6b',
  product_id: 'product_inventory_item',
  location_id: 'location_main_warehouse',
  price_history_id: 'price_history_inventory_item_2026_06',
  movement_id: 'movement_receive_001',
  movement_type: 'RECEIVE' as const,
  quantity_before: 10,
  quantity_delta: 5,
  unit_of_measure: 'unit',
  occurred_at: '2026-06-08T10:30:00.000Z',
  actor_user_id: 'user_inventory_admin',
  evidence_id: 'evidence_stock_movement_001',
  source_seed_id: 'seed_6b_03_stock_movement_ledger' as const,
  inventory_service_enabled: true as const,
};

const receipt = service.recordEntry(baseRequest);
assert.equal(receipt.seed_id, 'seed_6b_03_stock_movement_ledger');
assert.equal(receipt.component_id, '6B.03');
assert.equal(receipt.module_key, 'phase-6b.inventory-stock');
assert.equal(receipt.quantity_before, 10);
assert.equal(receipt.quantity_delta, 5);
assert.equal(receipt.quantity_after, 15);
assert.equal(receipt.authority.tenant_service, true);
assert.equal(receipt.authority.product_record_authority_required, true);
assert.equal(receipt.authority.product_price_history_required, true);
assert.equal(receipt.authority.stock_movement_evidence_required, true);
assert.equal(receipt.evidence.validation_event, 'PHASE_6B_STOCK_MOVEMENT_LEDGER_ENTRY_RECORDED');

const issue = service.recordEntry({
  ...baseRequest,
  movement_id: 'movement_issue_001',
  movement_type: 'ISSUE',
  quantity_before: 10,
  quantity_delta: -4,
});
assert.equal(issue.quantity_after, 6);

assert.throws(
  () =>
    service.recordEntry({
      ...baseRequest,
      movement_type: 'RECEIVE',
      quantity_delta: -1,
    }),
  /positive quantity_delta/,
);

assert.throws(
  () =>
    service.recordEntry({
      ...baseRequest,
      movement_type: 'ISSUE',
      quantity_delta: 1,
    }),
  /negative quantity_delta/,
);

assert.throws(
  () =>
    service.recordEntry({
      ...baseRequest,
      quantity_before: 1,
      quantity_delta: -2,
    }),
  /quantity_after cannot be negative/,
);

assert.throws(
  () =>
    service.recordEntry({
      ...baseRequest,
      quantity_delta: 0,
    }),
  /non-zero integer/,
);

assert.throws(
  () =>
    service.recordEntry({
      ...baseRequest,
      occurred_at: 'not-a-date',
    }),
  /valid date/,
);

assert.throws(
  () =>
    service.recordEntry({
      ...baseRequest,
      inventory_service_enabled: false,
    } as never),
  /inventory_service_enabled/,
);

assert.throws(
  () =>
    service.recordEntry({
      ...baseRequest,
      provider_operation_requested: 'external_provider',
    } as never),
  /does not perform provider operations/,
);

console.log('P6B-FFET-019 stock movement ledger service test passed.');
