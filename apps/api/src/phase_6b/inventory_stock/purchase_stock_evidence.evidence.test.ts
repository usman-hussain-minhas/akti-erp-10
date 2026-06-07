import assert from 'node:assert/strict';
import { recordPurchaseStockEvidence } from './purchase_stock_evidence.evidence';

const baseInput = {
  organization_id: 'org_akti_demo',
  product_record_id: 'prod_textbook_001',
  product_price_history_id: 'price_history_2026_q1',
  inventory_location_id: 'location_main_store',
  stock_movement_ledger_id: 'movement_receive_001',
  evidence_source_type: 'GOODS_RECEIPT_NOTE' as const,
  evidence_source_id: 'grn_2026_0001',
  supplier_reference: ' supplier-invoice-44 ',
  received_quantity: 12,
  received_at: '2026-06-07T10:30:00.000Z',
  evidence_collected_by_user_id: 'user_inventory_clerk',
  inventory_service_enabled: true,
};

const record = recordPurchaseStockEvidence(baseInput);
assert.equal(record.seed_id, 'seed_6b_03_purchase_stock_evidence');
assert.equal(record.component_id, '6B.03');
assert.equal(record.event_name, 'phase_6b.inventory_stock.purchase_stock_evidence.recorded');
assert.equal(record.organization_id, 'org_akti_demo');
assert.equal(record.product_record_id, 'prod_textbook_001');
assert.equal(record.product_price_history_id, 'price_history_2026_q1');
assert.equal(record.inventory_location_id, 'location_main_store');
assert.equal(record.stock_movement_ledger_id, 'movement_receive_001');
assert.equal(record.evidence_source_type, 'GOODS_RECEIPT_NOTE');
assert.equal(record.evidence_source_id, 'grn_2026_0001');
assert.equal(record.supplier_reference, 'supplier-invoice-44');
assert.equal(record.received_quantity, 12);
assert.equal(record.evidence_status, 'RECORDED');

const manualReceipt = recordPurchaseStockEvidence({
  ...baseInput,
  evidence_source_type: 'MANUAL_STOCK_RECEIPT',
  supplier_reference: ' ',
});
assert.equal(manualReceipt.supplier_reference, null);

assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, product_record_id: ' ' }),
  /product_record_id is required/,
);
assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, product_price_history_id: '' }),
  /product_price_history_id is required/,
);
assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, stock_movement_ledger_id: '' }),
  /stock_movement_ledger_id is required/,
);
assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, received_quantity: 0 }),
  /received_quantity must be a positive integer/,
);
assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, received_quantity: 1.5 }),
  /received_quantity must be a positive integer/,
);
assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, received_at: 'not-a-date' }),
  /received_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, inventory_service_enabled: false }),
  /inventory_service_enabled must be true/,
);
assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, provider_operation_requested: true }),
  /must not request provider/,
);
assert.throws(
  () => recordPurchaseStockEvidence({ ...baseInput, evidence_source_type: 'PAYMENT_CALLBACK' as never }),
  /evidence_source_type is not supported/,
);

console.log('P6B-FFET-020 purchase stock evidence test passed.');
