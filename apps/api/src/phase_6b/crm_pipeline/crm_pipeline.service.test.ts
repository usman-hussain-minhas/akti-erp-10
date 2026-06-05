import assert from 'node:assert/strict';

import { CrmPipelineService } from './crm_pipeline.service';

const service = new CrmPipelineService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.06');
assert.equal(metadata.component_key, 'crm_pipeline');
assert.equal(metadata.display_name, 'CRM Pipeline');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('crm_pipeline scaffold metadata boundary validated.');
