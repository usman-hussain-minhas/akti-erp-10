import assert from 'node:assert/strict';

import { ExpensePurchaseVendorService } from './expense_purchase_vendor.service';

const service = new ExpensePurchaseVendorService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.11');
assert.equal(metadata.component_key, 'expense_purchase_vendor');
assert.equal(metadata.display_name, 'Expense Purchase Vendor');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('expense_purchase_vendor scaffold metadata boundary validated.');
