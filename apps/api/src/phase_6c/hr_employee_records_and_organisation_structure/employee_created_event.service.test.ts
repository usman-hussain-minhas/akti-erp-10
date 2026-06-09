import assert from 'node:assert/strict';

import { evaluateEmployeeCreatedEventRuntime, type EmployeeCreatedEventInput } from './employee_created_event.service';

const baseInput: EmployeeCreatedEventInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_employee_created_event',
  source_record_ref: 'employee_created_event_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  employee_record_ref: 'employee_001',
  person_identity_anchor_id: 'person_anchor_001',
  employee_number_ref: 'employee_number_001',
  lifecycle_anchor: 'active',
  creation_origin: 'DIRECT_HR_CREATE',
  event_targets: ['WORKSPACE_FOUNDATION_REFERENCE', 'PHASE_6B_PAYROLL_FOUNDATION_REFERENCE'],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateEmployeeCreatedEventRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_010_employee_created_event');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CEmployeeCreatedEvent');
assert.equal(receipt.runtime_status, 'EMPLOYEE_CREATED_EVENT_EMITTED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.workspace_provisioning_allowed, false);
assert.equal(receipt.payroll_record_creation_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-015', '6C-SCHEMA-006', '6C-NON-007', '6C-GLOBAL-018']);
assert.equal(receipt.event_envelopes.length, 2);
assert.deepEqual(receipt.event_envelopes.map((event) => event.event_target), ['PHASE_6B_PAYROLL_FOUNDATION_REFERENCE', 'WORKSPACE_FOUNDATION_REFERENCE']);
assert.equal(receipt.event_envelopes[0]?.evidence_mode, 'REFERENCE_ONLY');
assert.match(receipt.event_envelopes[0]?.event_ref ?? '', /^employee_created_[a-f0-9]{24}$/);
assert.match(receipt.event_envelopes[0]?.evidence_hash ?? '', /^[a-f0-9]{64}$/);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEmployeeCreatedEventRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.deepEqual(repeatedReceipt.event_envelopes, receipt.event_envelopes);

assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, employee_record_ref: '' }), /employee_record_ref is required/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, creation_origin: 'UNKNOWN' as never }), /creation_origin must be supported/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, lifecycle_anchor: 'terminated' as never }), /lifecycle_anchor must be active or inactive/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, event_targets: [] }), /requires at least one event target/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, event_targets: ['WORKSPACE_FOUNDATION_REFERENCE', 'WORKSPACE_FOUNDATION_REFERENCE'] }), /event_targets must be unique/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, event_targets: ['UNKNOWN_TARGET' as never] }), /event target must be supported/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, workspace_provisioning_requested: true }), /must not provision Workspace accounts/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, payroll_record_creation_requested: true }), /must not create Phase 6B payroll records/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B records/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateEmployeeCreatedEventRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime employee_created_event test passed.');
