import assert from 'node:assert/strict';

import { CrmScoringReportingService } from './crm_scoring_reporting.service';

const service = new CrmScoringReportingService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.08');
assert.equal(metadata.component_key, 'crm_scoring_reporting');
assert.equal(metadata.display_name, 'CRM Scoring Reporting');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('crm_scoring_reporting scaffold metadata boundary validated.');
