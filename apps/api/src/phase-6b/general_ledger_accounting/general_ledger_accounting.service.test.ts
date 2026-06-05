import assert from 'node:assert/strict';

import { GeneralLedgerAccountingService } from './general_ledger_accounting.service';

const service = new GeneralLedgerAccountingService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.12');
assert.equal(metadata.component_key, 'general_ledger_accounting');
assert.equal(metadata.display_name, 'General Ledger Accounting');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('general_ledger_accounting scaffold metadata boundary validated.');
