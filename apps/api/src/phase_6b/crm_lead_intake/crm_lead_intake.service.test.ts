import assert from 'node:assert/strict';

import { CrmLeadIntakeService } from './crm_lead_intake.service';

const service = new CrmLeadIntakeService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.04');
assert.equal(metadata.component_key, 'crm_lead_intake');
assert.equal(metadata.display_name, 'CRM Lead Intake');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);
assert.equal(metadata.schema_baseline_status, 'phase_6b_schema_declared');
assert.deepEqual(metadata.schema_model_refs, [
  'Phase6BLeadSource',
  'Phase6BLeadEvidence',
]);

console.log('crm_lead_intake scaffold metadata boundary validated.');
