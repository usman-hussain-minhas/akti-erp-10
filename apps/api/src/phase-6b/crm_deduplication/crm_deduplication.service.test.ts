import assert from 'node:assert/strict';

import { CrmDeduplicationService } from './crm_deduplication.service';

const service = new CrmDeduplicationService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.05');
assert.equal(metadata.component_key, 'crm_deduplication');
assert.equal(metadata.display_name, 'CRM Deduplication');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('crm_deduplication scaffold metadata boundary validated.');
