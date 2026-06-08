import assert from 'node:assert/strict';

import { Phase6CService } from './phase_6c.service';

const readiness = new Phase6CService().getScaffoldReadiness();
assert.equal(readiness.phase, '6C');
assert.equal(readiness.status, 'scaffold_control_only');
assert.equal(readiness.surface_count, 9);
assert.equal(readiness.model_count, 124);
assert.equal(readiness.capability_implementation_allowed, false);
assert.equal(readiness.business_behavior_implemented, false);
assert.equal(readiness.runtime_adapter_implemented, false);
assert.equal(readiness.ticket_generation_allowed, false);

console.log('Phase 6C scaffold-control metadata test passed.');
