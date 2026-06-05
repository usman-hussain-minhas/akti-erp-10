import assert from 'node:assert/strict';

import { FinanceInvoiceReceivablesService } from './finance_invoice_receivables.service';

const service = new FinanceInvoiceReceivablesService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.09');
assert.equal(metadata.component_key, 'finance_invoice_receivables');
assert.equal(metadata.display_name, 'Finance Invoice Receivables');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('finance_invoice_receivables scaffold metadata boundary validated.');
