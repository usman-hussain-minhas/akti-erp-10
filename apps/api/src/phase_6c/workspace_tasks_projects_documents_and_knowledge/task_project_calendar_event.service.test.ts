import assert from 'node:assert/strict';

import { evaluateTaskProjectCalendarEvent, type TaskProjectCalendarEventInput } from './task_project_calendar_event.service';

const baseInput: TaskProjectCalendarEventInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_task_project_calendar_event',
  source_type: 'TASK',
  source_ref: 'task_001',
  event_ref: 'task_due_event_001',
  event_kind: 'DUE_DATE',
  title: 'Task due: Prepare launch checklist',
  start_at: '2026-06-20T15:00:00.000Z',
  timezone: 'Asia/Karachi',
  visibility: 'TEAM',
  generated_by_user_id: 'user_project_manager',
  generated_at: '2026-06-18T09:00:00.000Z',
  participants: [
    { participant_ref: 'person_owner', role: 'OWNER' },
    { participant_ref: 'person_assignee', role: 'ASSIGNEE' },
  ],
  calendar_surface_active: true,
  workspace_collaboration_surface_active: true,
  collaboration_context_ref: 'workspace_task_thread_001',
  evidence_refs: ['task_record:task_001'],
  metadata: { source: 'phase_6c_task_project_calendar_event_test' },
};

const receipt = evaluateTaskProjectCalendarEvent(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_082_task_project_calendar_event');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CTaskProjectCalendarEvent');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.task_project_calendar_event.runtime_evaluated');
assert.equal(receipt.status, 'READY_FOR_CALENDAR_CONSUMPTION');
assert.equal(receipt.calendar_payload.source_type, 'TASK');
assert.equal(receipt.calendar_payload.event_kind, 'DUE_DATE');
assert.equal(receipt.calendar_payload.participants.length, 2);
assert.equal(receipt.calendar_payload.evidence_refs.length, 1);
assert.match(receipt.calendar_payload.event_uid, /^[a-f0-9]{64}$/);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);
assert.deepEqual(receipt.validation_warnings, []);

const repeatedReceipt = evaluateTaskProjectCalendarEvent(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.calendar_payload.event_uid, receipt.calendar_payload.event_uid);

const deferredReceipt = evaluateTaskProjectCalendarEvent({
  ...baseInput,
  calendar_surface_active: false,
  participants: [],
  evidence_refs: [],
});
assert.equal(deferredReceipt.status, 'DEFERRED_INCOMPLETE_SOURCE');
assert.deepEqual(deferredReceipt.validation_warnings, [
  'calendar_surface_inactive_payload_ready_for_later_consumption',
  'calendar_event_has_no_participants',
  'calendar_event_has_no_evidence_refs',
]);

const workWindowReceipt = evaluateTaskProjectCalendarEvent({
  ...baseInput,
  event_kind: 'WORK_WINDOW',
  end_at: '2026-06-20T17:00:00.000Z',
});
assert.equal(workWindowReceipt.calendar_payload.end_at, '2026-06-20T17:00:00.000Z');
assert.equal(workWindowReceipt.validation_warnings.includes('work_window_has_no_end_at'), false);

assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, source_type: 'DOCUMENT' as never }), /source_type must be TASK, PROJECT, or MILESTONE/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, event_kind: 'MEETING' as never }), /event_kind must be DUE_DATE, WORK_WINDOW, MILESTONE_DATE, or REMINDER_WINDOW/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, visibility: 'PUBLIC' as never }), /visibility must be PRIVATE, TEAM, or ORGANIZATION/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, start_at: 'not-a-date' }), /start_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, end_at: '2026-06-20T14:00:00.000Z' }), /end_at must not be before start_at/);
assert.throws(() => evaluateTaskProjectCalendarEvent({
  ...baseInput,
  participants: [
    { participant_ref: 'person_owner', role: 'OWNER' },
    { participant_ref: 'person_owner', role: 'OWNER' },
  ],
}), /duplicate participant role/);
assert.throws(() => evaluateTaskProjectCalendarEvent({
  ...baseInput,
  participants: [{ participant_ref: 'person_owner', role: 'ORGANIZER' as never }],
}), /role must be OWNER, ASSIGNEE, or WATCHER/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, evidence_refs: ['task:1', 'task:1'] }), /evidence_refs contains duplicate value/);
assert.throws(() => evaluateTaskProjectCalendarEvent({
  ...baseInput,
  workspace_collaboration_surface_active: false,
  collaboration_context_ref: 'workspace_task_thread_001',
}), /collaboration_context_ref requires workspace_collaboration_surface_active/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, calendar_write_requested: true }), /calendar writes are forbidden/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, external_provider_sync_requested: true }), /external provider sync is outside this FFET/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, direct_calendar_mutation_requested: true }), /direct calendar mutation is forbidden/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateTaskProjectCalendarEvent({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime task_project_calendar_event test passed.');
