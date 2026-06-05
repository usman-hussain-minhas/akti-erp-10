import assert from 'node:assert/strict';

import { BankingReconciliationService } from './banking_reconciliation.service';

const service = new BankingReconciliationService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.13');
assert.equal(metadata.component_key, 'banking_reconciliation');
assert.equal(metadata.display_name, 'Banking Reconciliation');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('banking_reconciliation scaffold metadata boundary validated.');
