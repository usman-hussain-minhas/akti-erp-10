import assert from 'node:assert/strict';

import { FinanceBillingOperationsService } from './finance_billing_operations.service';

const service = new FinanceBillingOperationsService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.15');
assert.equal(metadata.component_key, 'finance_billing_operations');
assert.equal(metadata.display_name, 'Finance Billing Operations');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);
assert.equal(metadata.schema_baseline_status, 'phase_6b_schema_declared');
assert.deepEqual(metadata.schema_model_refs, [
  'Phase6BBillingOperation',
  'Phase6BBudgetCap',
]);

console.log('finance_billing_operations scaffold metadata boundary validated.');
