import assert from 'node:assert/strict';

import { FinancePayrollFoundationService } from './finance_payroll_foundation.service';

const service = new FinancePayrollFoundationService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.14');
assert.equal(metadata.component_key, 'finance_payroll_foundation');
assert.equal(metadata.display_name, 'Finance Payroll Foundation');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('finance_payroll_foundation scaffold metadata boundary validated.');
