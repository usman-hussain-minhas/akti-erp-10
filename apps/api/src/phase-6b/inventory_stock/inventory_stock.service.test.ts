import assert from 'node:assert/strict';

import { InventoryStockService } from './inventory_stock.service';

const service = new InventoryStockService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.03');
assert.equal(metadata.component_key, 'inventory_stock');
assert.equal(metadata.display_name, 'Inventory Stock');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('inventory_stock scaffold metadata boundary validated.');
