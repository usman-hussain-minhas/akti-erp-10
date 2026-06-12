import assert from 'node:assert/strict';

import { evaluateReminderQuietHours, type ReminderQuietHoursInput } from './reminder_quiet_hours.service';

const baseInput: ReminderQuietHoursInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_reminder_quiet_hours',
  reminder_id: 'reminder_001',
  source_record_ref: 'reminder_source_record_001',
  requested_by_user_id: 'user_reminder_admin',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  recipient_user_id: 'user_reminder_recipient',
  recipient_timezone: 'UTC',
  scheduled_local_day: 'MONDAY',
  scheduled_local_time: '22:30',
  quiet_hours_enabled: true,
  quiet_hour_windows: [
    { window_id: 'overnight_window', start_local_time: '22:00', end_local_time: '07:00' },
  ],
  gateway_policy_ref: 'communication_gateway_policy_adl_004',
  idempotency_key: 'reminder_001_first_evaluation',
};

const deferredReceipt = evaluateReminderQuietHours(baseInput);
assert.equal(deferredReceipt.seed_id, 'seed_6c_090_reminder_quiet_hours');
assert.equal(deferredReceipt.component_id, '6C.07');
assert.equal(deferredReceipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.reminder_quiet_hours.runtime_evaluated');
assert.equal(deferredReceipt.decision, 'DEFER_UNTIL_QUIET_HOURS_END');
assert.equal(deferredReceipt.gateway_route_required, true);
assert.equal(deferredReceipt.opt_out_gateway_enforcement_required, true);
assert.equal(deferredReceipt.direct_provider_send_allowed, false);
assert.equal(deferredReceipt.runtime_adapter_executed, false);
assert.equal(deferredReceipt.persistence_executed, false);
assert.deepEqual(deferredReceipt.adl_refs, ['ADL-004']);
assert.deepEqual(deferredReceipt.decision_refs, ['6C-CAL-008', '6C-GLOBAL-013', '6C-ADL-008']);
assert.deepEqual(deferredReceipt.matched_window, {
  window_id: 'overnight_window',
  start_local_time: '22:00',
  end_local_time: '07:00',
  overnight: true,
});
assert.equal(deferredReceipt.defer_until_local_day, 'TUESDAY');
assert.equal(deferredReceipt.defer_until_local_time, '07:00');
assert.match(deferredReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateReminderQuietHours(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, deferredReceipt.runtime_evidence_digest);

const carryoverReceipt = evaluateReminderQuietHours({
  ...baseInput,
  scheduled_local_day: 'TUESDAY',
  scheduled_local_time: '06:30',
  idempotency_key: 'reminder_001_carryover',
});
assert.equal(carryoverReceipt.decision, 'DEFER_UNTIL_QUIET_HOURS_END');
assert.equal(carryoverReceipt.defer_until_local_day, 'TUESDAY');
assert.equal(carryoverReceipt.defer_until_local_time, '07:00');

const allowedReceipt = evaluateReminderQuietHours({
  ...baseInput,
  scheduled_local_time: '08:00',
  idempotency_key: 'reminder_001_allowed',
});
assert.equal(allowedReceipt.decision, 'SEND_ALLOWED_NOW');
assert.equal(allowedReceipt.matched_window, null);
assert.equal(allowedReceipt.defer_until_local_day, null);
assert.equal(allowedReceipt.defer_until_local_time, null);

const disabledReceipt = evaluateReminderQuietHours({
  ...baseInput,
  quiet_hours_enabled: false,
  idempotency_key: 'reminder_001_disabled',
});
assert.equal(disabledReceipt.decision, 'SEND_ALLOWED_NOW');
assert.equal(disabledReceipt.quiet_hours_enabled, false);

assert.throws(() => evaluateReminderQuietHours({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, scheduled_local_time: '25:00' }), /scheduled_local_time must use HH:mm/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, scheduled_local_day: 'FUNDAY' as never }), /unsupported day FUNDAY/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, quiet_hour_windows: [{ window_id: 'bad_window', start_local_time: '08:00', end_local_time: '08:00' }] }), /must not start and end at the same local time/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, quiet_hour_windows: [baseInput.quiet_hour_windows[0], baseInput.quiet_hour_windows[0]] }), /duplicate window_id overnight_window/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, direct_provider_send_requested: true }), /must not create direct provider sends/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, gateway_bypass_requested: true }), /must not bypass Communication Gateway routing/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, quiet_hours_override_requested: true }), /must not execute quiet-hours override behavior/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, persistence_requested: true }), /must not persist reminder schedule state/);
assert.throws(() => evaluateReminderQuietHours({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);

console.log('P6C runtime reminder_quiet_hours test passed.');
