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
assert.equal(metadata.schema_baseline_status, 'phase_6b_schema_declared');
assert.deepEqual(metadata.schema_model_refs, [
  'Phase6BInvoice',
  'Phase6BInvoiceLine',
  'Phase6BReceivable',
  'Phase6BCreditDebitNote',
]);

console.log('finance_invoice_receivables scaffold metadata boundary validated.');
