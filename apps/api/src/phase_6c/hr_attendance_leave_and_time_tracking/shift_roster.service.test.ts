import assert from 'node:assert/strict';

import { evaluateShiftRoster, type ShiftRosterInput } from './shift_roster.service';

const baseInput: ShiftRosterInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_shift_roster',
  source_record_ref: 'shift_roster_record_001',
  roster_ref: 'shift_roster_week_001',
  roster_pattern: 'FIXED',
  effective_from: '2026-06-09',
  effective_to: '2026-06-15',
  roster_timezone: 'UTC',
  overlap_policy: 'REJECT_OVERLAP',
  maximum_shift_minutes: 600,
  minimum_break_minutes: 30,
  assignments: [
    {
      assignment_ref: 'shift_assignment_001',
      employee_ref: 'employee_phase_6c_001',
      roster_date: '2026-06-09',
      shift_start_at: '2026-06-09T09:00:00.000Z',
      shift_end_at: '2026-06-09T17:00:00.000Z',
      break_minutes: 45,
      role_ref: 'role_shift_operator',
      location_ref: 'location_shift_area_a',
    },
    {
      assignment_ref: 'shift_assignment_002',
      employee_ref: 'employee_phase_6c_002',
      roster_date: '2026-06-09',
      shift_start_at: '2026-06-09T10:00:00.000Z',
      shift_end_at: '2026-06-09T18:00:00.000Z',
      break_minutes: 45,
    },
  ],
  evaluated_by_user_id: 'user_phase_6c_roster_planner',
  evaluated_at: '2026-06-09T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_031' },
};

const acceptedReceipt = evaluateShiftRoster(baseInput);
assert.equal(acceptedReceipt.seed_id, 'seed_6c_031_shift_roster');
assert.equal(acceptedReceipt.component_id, '6C.03');
assert.equal(acceptedReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(acceptedReceipt.model_name, 'Phase6CShiftRoster');
assert.equal(acceptedReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.shift_roster.evaluated');
assert.equal(acceptedReceipt.runtime_status, 'SHIFT_ROSTER_EVALUATED');
assert.equal(acceptedReceipt.decision, 'ROSTER_ACCEPTED');
assert.equal(acceptedReceipt.assignment_count, 2);
assert.equal(acceptedReceipt.total_scheduled_minutes, 870);
assert.deepEqual(acceptedReceipt.issues, []);
assert.equal(acceptedReceipt.provider_neutral_only, true);
assert.equal(acceptedReceipt.attendance_record_mutation_allowed, false);
assert.deepEqual(acceptedReceipt.decision_refs, ['6C-ATT-002', '6C-ATT-012', '6C-ATT-019']);
assert.deepEqual(acceptedReceipt.evidence_artifacts, [
  'shift_roster_decision_receipt',
  'shift_roster_assignment_evidence',
  'shift_roster_conflict_evidence',
]);
assert.match(acceptedReceipt.roster_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateShiftRoster(baseInput);
assert.equal(repeatedReceipt.roster_evidence_digest, acceptedReceipt.roster_evidence_digest);

const rejectedReceipt = evaluateShiftRoster({
  ...baseInput,
  maximum_shift_minutes: 300,
  minimum_break_minutes: 60,
  assignments: [
    ...baseInput.assignments,
    {
      assignment_ref: 'shift_assignment_003',
      employee_ref: 'employee_phase_6c_001',
      roster_date: '2026-06-16',
      shift_start_at: '2026-06-09T12:00:00.000Z',
      shift_end_at: '2026-06-09T20:00:00.000Z',
      break_minutes: 15,
    },
  ],
});
assert.equal(rejectedReceipt.decision, 'ROSTER_REJECTED');
assert.deepEqual(rejectedReceipt.issues.map((issue) => issue.issue_type), [
  'SHIFT_DURATION_EXCEEDS_MAXIMUM',
  'BREAK_BELOW_MINIMUM',
  'SHIFT_DURATION_EXCEEDS_MAXIMUM',
  'BREAK_BELOW_MINIMUM',
  'ASSIGNMENT_OUTSIDE_EFFECTIVE_WINDOW',
  'SHIFT_DURATION_EXCEEDS_MAXIMUM',
  'BREAK_BELOW_MINIMUM',
  'SHIFT_OVERLAP',
]);

const overlapAllowedReceipt = evaluateShiftRoster({
  ...baseInput,
  overlap_policy: 'ALLOW_WITH_EXCEPTION',
  assignments: [
    baseInput.assignments[0]!,
    {
      assignment_ref: 'shift_assignment_overlap_allowed',
      employee_ref: 'employee_phase_6c_001',
      roster_date: '2026-06-09',
      shift_start_at: '2026-06-09T12:00:00.000Z',
      shift_end_at: '2026-06-09T16:00:00.000Z',
      break_minutes: 30,
    },
  ],
});
assert.equal(overlapAllowedReceipt.decision, 'ROSTER_ACCEPTED');
assert.deepEqual(overlapAllowedReceipt.issues, []);

assert.throws(() => evaluateShiftRoster({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, roster_ref: '' }), /roster_ref is required/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, effective_from: '09-06-2026' }), /effective_from must use YYYY-MM-DD format/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, effective_from: '2026-06-16', effective_to: '2026-06-15' }), /effective_from must be on or before effective_to/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, roster_timezone: '' }), /roster_timezone is required/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, maximum_shift_minutes: 0 }), /maximum_shift_minutes must be a positive finite number/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, minimum_break_minutes: -1 }), /minimum_break_minutes must be a non-negative finite number/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, assignments: [] }), /assignments must contain at least one roster assignment/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, assignments: [{ ...baseInput.assignments[0]!, assignment_ref: '' }] }), /assignment_ref is required/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, assignments: [{ ...baseInput.assignments[0]!, roster_date: '09-06-2026' }] }), /roster_date must use YYYY-MM-DD format/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, assignments: [{ ...baseInput.assignments[0]!, shift_start_at: 'not-a-date' }] }), /shift_start_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, assignments: [{ ...baseInput.assignments[0]!, shift_end_at: '2026-06-09T08:00:00.000Z' }] }), /shift_end_at must be after shift_start_at/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, assignments: [{ ...baseInput.assignments[0]!, break_minutes: -1 }] }), /break_minutes must be a non-negative finite number/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, direct_attendance_record_mutation_requested: true }), /must not mutate attendance records directly/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateShiftRoster({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C shift_roster runtime test passed.');
