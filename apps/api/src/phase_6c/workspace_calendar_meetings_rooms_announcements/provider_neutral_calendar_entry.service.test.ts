import assert from 'node:assert/strict';

import { evaluateProviderNeutralCalendarEntry, type ProviderNeutralCalendarEntryInput } from './provider_neutral_calendar_entry.service';

const baseInput: ProviderNeutralCalendarEntryInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_provider_neutral_calendar_entry',
  calendar_entry_ref: 'calendar_entry_001',
  source_type: 'TASK',
  source_ref: 'task_001',
  title: 'Task due: Board packet',
  description: 'Provider-neutral calendar entry for a workspace task.',
  status: 'CONFIRMED',
  visibility: 'TEAM',
  start_at: '2026-06-21T09:00:00.000Z',
  end_at: '2026-06-21T09:30:00.000Z',
  timezone: 'Asia/Karachi',
  created_by_user_id: 'user_calendar_owner',
  created_at: '2026-06-18T10:00:00.000Z',
  participants: [
    { participant_ref: 'person_owner', role: 'OWNER', response_status: 'ACCEPTED' },
    { participant_ref: 'person_attendee', role: 'ATTENDEE' },
  ],
  evidence_refs: ['task_project_calendar_event:task_due_event_001'],
  metadata: { source: 'phase_6c_provider_neutral_calendar_entry_test' },
};

const receipt = evaluateProviderNeutralCalendarEntry(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_083_provider_neutral_calendar_entry');
assert.equal(receipt.component_id, '6C.07');
assert.equal(receipt.component_slug, 'workspace_calendar_meetings_rooms_announcements');
assert.equal(receipt.model_name, 'Phase6CProviderNeutralCalendarEntry');
assert.equal(receipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.provider_neutral_calendar_entry.runtime_evaluated');
assert.equal(receipt.provider_adapter_boundary_only, true);
assert.equal(receipt.participant_count, 2);
assert.equal(receipt.provider_neutral_payload.source_type, 'TASK');
assert.equal(receipt.provider_neutral_payload.source_ref, 'task_001');
assert.equal(receipt.provider_neutral_payload.participants[1]?.response_status, 'NEEDS_ACTION');
assert.deepEqual(receipt.validation_warnings, []);
assert.match(receipt.provider_neutral_payload.entry_uid, /^[a-f0-9]{64}$/);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateProviderNeutralCalendarEntry(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.provider_neutral_payload.entry_uid, receipt.provider_neutral_payload.entry_uid);

const manualAllDayReceipt = evaluateProviderNeutralCalendarEntry({
  ...baseInput,
  source_type: 'MANUAL',
  source_ref: undefined,
  status: 'TENTATIVE',
  all_day: true,
  end_at: undefined,
  participants: [],
  evidence_refs: [],
});
assert.equal(manualAllDayReceipt.provider_neutral_payload.all_day, true);
assert.deepEqual(manualAllDayReceipt.validation_warnings, ['calendar_entry_has_no_evidence_refs']);

const warningReceipt = evaluateProviderNeutralCalendarEntry({
  ...baseInput,
  end_at: undefined,
  participants: [],
  evidence_refs: [],
});
assert.deepEqual(warningReceipt.validation_warnings, [
  'confirmed_entry_has_no_participants',
  'calendar_entry_has_no_evidence_refs',
  'timed_entry_has_no_end_at',
]);

assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, source_type: 'UNKNOWN' as never }), /source_type must be MANUAL, TASK, PROJECT, ROOM, or ANNOUNCEMENT/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, source_ref: undefined }), /source_ref is required when source_type is not MANUAL/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, status: 'PUBLISHED' as never }), /status must be TENTATIVE, CONFIRMED, or CANCELLED/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, visibility: 'PUBLIC' as never }), /visibility must be PRIVATE, TEAM, or ORGANIZATION/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, start_at: 'not-a-date' }), /start_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, end_at: '2026-06-21T08:30:00.000Z' }), /end_at must not be before start_at/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({
  ...baseInput,
  participants: [
    { participant_ref: 'person_owner', role: 'OWNER' },
    { participant_ref: 'person_owner', role: 'OWNER' },
  ],
}), /duplicate participant role/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({
  ...baseInput,
  participants: [{ participant_ref: 'person_owner', role: 'ORGANIZER' as never }],
}), /role must be OWNER, ATTENDEE, OPTIONAL, or RESOURCE/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, evidence_refs: ['event:1', 'event:1'] }), /evidence_refs contains duplicate value/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, provider_sync_requested: true }), /provider sync is adapter-boundary-only/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, provider_credential_requested: true }), /provider credential access is forbidden/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, direct_provider_mutation_requested: true }), /direct provider mutation is forbidden/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateProviderNeutralCalendarEntry({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime provider_neutral_calendar_entry test passed.');
