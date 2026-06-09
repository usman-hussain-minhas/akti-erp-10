import assert from 'node:assert/strict';

import { evaluateHolidayCalendar, type HolidayCalendarInput } from './holiday_calendar.service';

const baseInput: HolidayCalendarInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_holiday_calendar',
  source_record_ref: 'holiday_calendar_record_001',
  calendar_ref: 'holiday_calendar_2026',
  calendar_scope: 'ORGANIZATION',
  effective_from: '2026-01-01',
  effective_to: '2026-12-31',
  entries: [
    {
      holiday_ref: 'holiday_entry_001',
      holiday_date: '2026-01-01',
      holiday_name: 'New Year Observance',
      holiday_type: 'PUBLIC_HOLIDAY',
      paid_leave_default: true,
      attendance_required: false,
    },
    {
      holiday_ref: 'holiday_entry_002',
      holiday_date: '2026-06-09',
      holiday_name: 'Working Day Override',
      holiday_type: 'WORKING_DAY_OVERRIDE',
      paid_leave_default: false,
      attendance_required: true,
    },
  ],
  evaluated_by_user_id: 'user_phase_6c_calendar_admin',
  evaluated_at: '2026-06-09T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_032' },
};

const acceptedReceipt = evaluateHolidayCalendar(baseInput);
assert.equal(acceptedReceipt.seed_id, 'seed_6c_032_holiday_calendar');
assert.equal(acceptedReceipt.component_id, '6C.03');
assert.equal(acceptedReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(acceptedReceipt.model_name, 'Phase6CHolidayCalendar');
assert.equal(acceptedReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.holiday_calendar.evaluated');
assert.equal(acceptedReceipt.runtime_status, 'HOLIDAY_CALENDAR_EVALUATED');
assert.equal(acceptedReceipt.decision, 'CALENDAR_ACCEPTED');
assert.equal(acceptedReceipt.entry_count, 2);
assert.equal(acceptedReceipt.paid_leave_count, 1);
assert.equal(acceptedReceipt.attendance_required_count, 1);
assert.deepEqual(acceptedReceipt.issues, []);
assert.equal(acceptedReceipt.provider_neutral_only, true);
assert.equal(acceptedReceipt.attendance_record_mutation_allowed, false);
assert.deepEqual(acceptedReceipt.decision_refs, ['6C-ATT-002', '6C-ATT-013', '6C-ATT-019']);
assert.deepEqual(acceptedReceipt.evidence_artifacts, [
  'holiday_calendar_decision_receipt',
  'holiday_calendar_entry_evidence',
  'holiday_calendar_scope_evidence',
]);
assert.match(acceptedReceipt.holiday_calendar_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateHolidayCalendar(baseInput);
assert.equal(repeatedReceipt.holiday_calendar_evidence_digest, acceptedReceipt.holiday_calendar_evidence_digest);

const rejectedReceipt = evaluateHolidayCalendar({
  ...baseInput,
  calendar_scope: 'BRANCH',
  entries: [
    ...baseInput.entries,
    {
      holiday_ref: 'holiday_entry_003',
      holiday_date: '2027-01-01',
      holiday_name: 'Out of Window',
      holiday_type: 'PUBLIC_HOLIDAY',
      paid_leave_default: true,
      attendance_required: false,
    },
    {
      holiday_ref: 'holiday_entry_004',
      holiday_date: '2026-06-09',
      holiday_name: 'Duplicate Date',
      holiday_type: 'SPECIAL_CLOSURE',
      paid_leave_default: true,
      attendance_required: false,
    },
  ],
});
assert.equal(rejectedReceipt.decision, 'CALENDAR_REJECTED');
assert.deepEqual(rejectedReceipt.issues.map((issue) => issue.issue_type), [
  'BRANCH_SCOPE_REQUIRES_BRANCH_REF',
  'ENTRY_OUTSIDE_EFFECTIVE_WINDOW',
  'DUPLICATE_HOLIDAY_DATE',
]);

const branchAcceptedReceipt = evaluateHolidayCalendar({
  ...baseInput,
  calendar_scope: 'BRANCH',
  branch_ref: 'branch_ref_north_operations',
});
assert.equal(branchAcceptedReceipt.decision, 'CALENDAR_ACCEPTED');
assert.equal(branchAcceptedReceipt.branch_ref, 'branch_ref_north_operations');

assert.throws(() => evaluateHolidayCalendar({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, calendar_ref: '' }), /calendar_ref is required/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, branch_ref: ' ' }), /branch_ref must be non-empty/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, effective_from: '01-01-2026' }), /effective_from must use YYYY-MM-DD format/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, effective_from: '2027-01-01', effective_to: '2026-12-31' }), /effective_from must be on or before effective_to/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, entries: [] }), /entries must contain at least one holiday calendar entry/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, entries: [{ ...baseInput.entries[0]!, holiday_ref: '' }] }), /holiday_ref is required/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, entries: [{ ...baseInput.entries[0]!, holiday_date: '01-01-2026' }] }), /holiday_date must use YYYY-MM-DD format/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, entries: [{ ...baseInput.entries[0]!, holiday_name: '' }] }), /holiday_name is required/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, direct_attendance_record_mutation_requested: true }), /must not mutate attendance records directly/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateHolidayCalendar({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C holiday_calendar runtime test passed.');
