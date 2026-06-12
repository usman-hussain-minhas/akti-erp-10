import assert from 'node:assert/strict';

import { evaluateRecurringEventRule, type RecurringEventRuleInput } from './recurring_event_rule.service';

const baseInput: RecurringEventRuleInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_recurring_event_rule',
  rule_id: 'recurrence_rule_001',
  source_record_ref: 'recurring_event_source_record_001',
  requested_by_user_id: 'user_calendar_admin',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  frequency: 'WEEKLY',
  interval: 1,
  start_date: '2026-06-08',
  occurrence_count: 4,
  days_of_week: ['MONDAY', 'WEDNESDAY'],
  preview_limit: 4,
};

const weeklyReceipt = evaluateRecurringEventRule(baseInput);
assert.equal(weeklyReceipt.seed_id, 'seed_6c_091_recurring_event_rule');
assert.equal(weeklyReceipt.component_id, '6C.07');
assert.equal(weeklyReceipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.recurring_event_rule.runtime_evaluated');
assert.equal(weeklyReceipt.decision, 'VALID_RULE_WITH_PREVIEW');
assert.deepEqual(weeklyReceipt.normalized_rule.days_of_week, ['MONDAY', 'WEDNESDAY']);
assert.deepEqual(weeklyReceipt.preview_occurrences.map((occurrence) => occurrence.local_date), [
  '2026-06-08',
  '2026-06-10',
  '2026-06-15',
  '2026-06-17',
]);
assert.equal(weeklyReceipt.calendar_write_executed, false);
assert.equal(weeklyReceipt.provider_sync_executed, false);
assert.equal(weeklyReceipt.runtime_adapter_executed, false);
assert.equal(weeklyReceipt.persistence_executed, false);
assert.deepEqual(weeklyReceipt.decision_refs, ['6C-CAL-009']);
assert.match(weeklyReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateRecurringEventRule(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, weeklyReceipt.runtime_evidence_digest);

const dailyReceipt = evaluateRecurringEventRule({
  ...baseInput,
  rule_id: 'recurrence_rule_daily',
  frequency: 'DAILY',
  interval: 2,
  start_date: '2026-06-08',
  occurrence_count: 3,
  days_of_week: ['FRIDAY'],
});
assert.deepEqual(dailyReceipt.normalized_rule.days_of_week, []);
assert.deepEqual(dailyReceipt.preview_occurrences.map((occurrence) => occurrence.local_date), [
  '2026-06-08',
  '2026-06-10',
  '2026-06-12',
]);

const monthlyReceipt = evaluateRecurringEventRule({
  ...baseInput,
  rule_id: 'recurrence_rule_monthly',
  frequency: 'MONTHLY',
  interval: 1,
  start_date: '2026-01-31',
  occurrence_count: 3,
  days_of_week: undefined,
});
assert.deepEqual(monthlyReceipt.preview_occurrences.map((occurrence) => occurrence.local_date), [
  '2026-01-31',
  '2026-02-28',
  '2026-03-31',
]);

const emptyReceipt = evaluateRecurringEventRule({
  ...baseInput,
  rule_id: 'recurrence_rule_empty',
  start_date: '2026-06-08',
  end_date: '2026-06-08',
  days_of_week: ['TUESDAY'],
  occurrence_count: undefined,
  preview_limit: 1,
});
assert.equal(emptyReceipt.decision, 'VALID_RULE_WITH_EMPTY_PREVIEW');

assert.throws(() => evaluateRecurringEventRule({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, frequency: 'YEARLY' as never }), /unsupported value YEARLY/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, interval: 0 }), /interval must be an integer between 1 and 24/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, preview_limit: 0 }), /preview_limit must be an integer between 1 and 52/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, start_date: '2026-02-30' }), /start_date must be a valid calendar date/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, days_of_week: ['FUNDAY' as never] }), /unsupported day FUNDAY/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, end_date: '2026-06-01' }), /end_date must be on or after start_date/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, calendar_write_requested: true }), /must not write calendar events/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, provider_sync_requested: true }), /must not execute provider sync/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, persistence_requested: true }), /must not persist recurrence state/);
assert.throws(() => evaluateRecurringEventRule({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);

console.log('P6C runtime recurring_event_rule test passed.');
