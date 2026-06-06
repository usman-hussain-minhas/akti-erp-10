import assert from 'node:assert/strict';

import { PaymentCollectionTopupService } from './payment_collection_topup.service';

const service = new PaymentCollectionTopupService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.10');
assert.equal(metadata.component_key, 'payment_collection_topup');
assert.equal(metadata.display_name, 'Payment Collection Top-Up');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);
assert.equal(metadata.schema_baseline_status, 'phase_6b_schema_declared');
assert.deepEqual(metadata.schema_model_refs, [
  'Phase6BPayment',
  'Phase6BPaymentAllocation',
  'Phase6BReceipt',
  'Phase6BTopUp',
  'Phase6BReconciliationCandidate',
]);

console.log('payment_collection_topup scaffold metadata boundary validated.');
