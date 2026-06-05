import assert from 'node:assert/strict';

import { CrmCommunicationService } from './crm_communication.service';

const service = new CrmCommunicationService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.07');
assert.equal(metadata.component_key, 'crm_communication');
assert.equal(metadata.display_name, 'CRM Communication');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('crm_communication scaffold metadata boundary validated.');
