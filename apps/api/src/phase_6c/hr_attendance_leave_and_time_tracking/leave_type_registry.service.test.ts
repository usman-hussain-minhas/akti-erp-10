import assert from 'node:assert/strict';

import { evaluateLeaveTypeRegistry, type LeaveTypeRegistryInput } from './leave_type_registry.service';

const baseInput: LeaveTypeRegistryInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_leave_type_registry',
  source_record_ref: 'leave_type_registry_record_001',
  registry_ref: 'leave_type_registry_2026',
  effective_from: '2026-01-01',
  effective_to: '2026-12-31',
  leave_types: [
    {
      leave_type_ref: 'leave_type_paid_annual',
      leave_code: 'annual',
      display_name: 'Annual Leave',
      category: 'PAID',
      entitlement_unit: 'DAYS',
      paid: true,
      requestable_by_employee: true,
      accrual_enabled: true,
      carry_forward_enabled: true,
      requires_approval: true,
      negative_balance_allowed: false,
      annual_entitlement_units: 24,
      max_carry_forward_units: 5,
    },
    {
      leave_type_ref: 'leave_type_unpaid_personal',
      leave_code: 'unpaid_personal',
      display_name: 'Unpaid Personal Leave',
      category: 'UNPAID',
      entitlement_unit: 'DAYS',
      paid: false,
      requestable_by_employee: true,
      accrual_enabled: false,
      carry_forward_enabled: false,
      requires_approval: true,
      negative_balance_allowed: false,
    },
  ],
  evaluated_by_user_id: 'user_phase_6c_leave_admin',
  evaluated_at: '2026-06-09T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_033' },
};

const acceptedReceipt = evaluateLeaveTypeRegistry(baseInput);
assert.equal(acceptedReceipt.seed_id, 'seed_6c_033_leave_type_registry');
assert.equal(acceptedReceipt.component_id, '6C.03');
assert.equal(acceptedReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(acceptedReceipt.model_name, 'Phase6CLeaveTypeRegistry');
assert.equal(acceptedReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.leave_type_registry.evaluated');
assert.equal(acceptedReceipt.runtime_status, 'LEAVE_TYPE_REGISTRY_EVALUATED');
assert.equal(acceptedReceipt.decision, 'REGISTRY_ACCEPTED');
assert.equal(acceptedReceipt.leave_type_count, 2);
assert.equal(acceptedReceipt.paid_leave_type_count, 1);
assert.equal(acceptedReceipt.employee_requestable_count, 2);
assert.equal(acceptedReceipt.accrual_enabled_count, 1);
assert.equal(acceptedReceipt.carry_forward_enabled_count, 1);
assert.deepEqual(acceptedReceipt.issues, []);
assert.equal(acceptedReceipt.provider_neutral_only, true);
assert.equal(acceptedReceipt.attendance_record_mutation_allowed, false);
assert.deepEqual(acceptedReceipt.decision_refs, ['6C-ATT-002', '6C-ATT-014', '6C-ATT-019']);
assert.deepEqual(acceptedReceipt.evidence_artifacts, [
  'leave_type_registry_decision_receipt',
  'leave_type_registry_definition_evidence',
  'leave_type_registry_policy_issue_evidence',
]);
assert.match(acceptedReceipt.leave_type_registry_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateLeaveTypeRegistry(baseInput);
assert.equal(repeatedReceipt.leave_type_registry_evidence_digest, acceptedReceipt.leave_type_registry_evidence_digest);

const rejectedReceipt = evaluateLeaveTypeRegistry({
  ...baseInput,
  leave_types: [
    ...baseInput.leave_types,
    {
      leave_type_ref: 'leave_type_duplicate_missing_policy',
      leave_code: 'ANNUAL',
      display_name: 'Duplicate Annual',
      category: 'SPECIAL',
      entitlement_unit: 'HOURS',
      paid: true,
      requestable_by_employee: false,
      accrual_enabled: true,
      carry_forward_enabled: true,
      requires_approval: true,
      negative_balance_allowed: false,
    },
    {
      leave_type_ref: 'leave_type_carry_without_accrual',
      leave_code: 'carry_without_accrual',
      display_name: 'Carry Without Accrual',
      category: 'SPECIAL',
      entitlement_unit: 'DAYS',
      paid: false,
      requestable_by_employee: false,
      accrual_enabled: false,
      carry_forward_enabled: true,
      requires_approval: true,
      negative_balance_allowed: false,
      max_carry_forward_units: 2,
    },
  ],
});
assert.equal(rejectedReceipt.decision, 'REGISTRY_REJECTED');
assert.deepEqual(rejectedReceipt.issues.map((issue) => issue.issue_type), [
  'DUPLICATE_LEAVE_CODE',
  'ACCRUAL_REQUIRES_ENTITLEMENT',
  'CARRY_FORWARD_REQUIRES_LIMIT',
  'CARRY_FORWARD_REQUIRES_ACCRUAL',
]);

assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, registry_ref: '' }), /registry_ref is required/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, effective_from: '01-01-2026' }), /effective_from must use YYYY-MM-DD format/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, effective_from: '2027-01-01', effective_to: '2026-12-31' }), /effective_from must be on or before effective_to/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, leave_types: [] }), /leave_types must contain at least one configurable leave type/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, leave_types: [{ ...baseInput.leave_types[0]!, leave_type_ref: '' }] }), /leave_type_ref is required/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, leave_types: [{ ...baseInput.leave_types[0]!, leave_code: '' }] }), /leave_code is required/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, leave_types: [{ ...baseInput.leave_types[0]!, display_name: '' }] }), /display_name is required/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, leave_types: [{ ...baseInput.leave_types[0]!, annual_entitlement_units: 0 }] }), /annual_entitlement_units must be a positive finite number/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, leave_types: [{ ...baseInput.leave_types[0]!, max_carry_forward_units: -1 }] }), /max_carry_forward_units must be a positive finite number/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, direct_attendance_record_mutation_requested: true }), /must not mutate attendance records directly/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateLeaveTypeRegistry({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C leave_type_registry runtime test passed.');
