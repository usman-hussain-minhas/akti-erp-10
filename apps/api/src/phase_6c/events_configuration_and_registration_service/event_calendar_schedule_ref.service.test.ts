import assert from 'node:assert/strict';

import { evaluateEventCalendarScheduleRef, type EventCalendarScheduleRefInput } from './event_calendar_schedule_ref.service';

const baseInput: EventCalendarScheduleRefInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_event_calendar_schedule_ref',
  event_config_ref: 'event_config_annual_summit',
  source_record_ref: 'event_calendar_schedule_ref_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  event_start_at: '2026-07-15T14:00:00.000Z',
  event_end_at: '2026-07-15T16:30:00.000Z',
  timezone: 'Asia/Karachi',
  workspace_calendar_active: true,
  calendar_schedule_ref: 'calendar_schedule_event_001',
  calendar_owner_ref: 'employee_event_owner_001',
  calendar_id_ref: 'workspace_calendar_primary',
  calendar_event_ref: 'calendar_event_annual_summit',
  sync_status: 'synced',
  product_catalogue_anchor_ref: 'product_catalogue_ticket_anchor_001',
  invoice_saga_ref: 'registration_invoice_saga_001',
  payment_saga_ref: 'registration_payment_saga_001',
  crm_handoff_ref: 'event_crm_handoff_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const readyReceipt = evaluateEventCalendarScheduleRef(baseInput);
assert.equal(readyReceipt.seed_id, 'seed_6c_105_event_calendar_schedule_ref');
assert.equal(readyReceipt.component_id, '6C.08');
assert.equal(readyReceipt.event_name, 'phase_6c.events_configuration_and_registration_service.event_calendar_schedule_ref.runtime_evaluated');
assert.equal(readyReceipt.decision, 'CALENDAR_REF_READY');
assert.equal(readyReceipt.duration_minutes, 150);
assert.equal(readyReceipt.dependency_trace.workspace_calendar_condition, 'workspace_calendar_active');
assert.equal(readyReceipt.dependency_trace.product_catalogue_anchor_ref, 'product_catalogue_ticket_anchor_001');
assert.equal(readyReceipt.dependency_trace.invoice_saga_ref, 'registration_invoice_saga_001');
assert.equal(readyReceipt.dependency_trace.payment_saga_ref, 'registration_payment_saga_001');
assert.equal(readyReceipt.dependency_trace.crm_handoff_ref, 'event_crm_handoff_001');
assert.deepEqual(readyReceipt.decision_refs, ['6C-EVENT-REG-009', '6C-EVENT-REG-012', '6C-EVENT-REG-003', '6C-BILL-007', 'ADL-001']);
assert.match(readyReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEventCalendarScheduleRef(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, readyReceipt.runtime_evidence_digest);

const inactiveReceipt = evaluateEventCalendarScheduleRef({
  ...baseInput,
  workspace_calendar_active: false,
  sync_status: 'not_requested',
  calendar_schedule_ref: undefined,
  calendar_owner_ref: undefined,
  calendar_id_ref: undefined,
  calendar_event_ref: undefined,
});
assert.equal(inactiveReceipt.decision, 'CALENDAR_NOT_REQUESTED');
assert.equal(inactiveReceipt.dependency_trace.workspace_calendar_condition, 'workspace_calendar_inactive');

const pendingReceipt = evaluateEventCalendarScheduleRef({ ...baseInput, sync_status: 'pending', calendar_event_ref: undefined });
assert.equal(pendingReceipt.decision, 'CALENDAR_REF_PENDING');

const conflictReceipt = evaluateEventCalendarScheduleRef({ ...baseInput, sync_status: 'conflict', conflict_refs: ['calendar_conflict_001'] });
assert.equal(conflictReceipt.decision, 'CALENDAR_REF_CONFLICT');
assert.deepEqual(conflictReceipt.conflict_refs, ['calendar_conflict_001']);

const reviewReceipt = evaluateEventCalendarScheduleRef({ ...baseInput, sync_status: 'failed' });
assert.equal(reviewReceipt.decision, 'CALENDAR_REF_REQUIRES_REVIEW');

assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, event_config_ref: '' }), /event_config_ref is required/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, calendar_schedule_ref: '' }), /calendar_schedule_ref must be non-empty/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, event_end_at: baseInput.event_start_at }), /event_end_at must be after event_start_at/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, timezone: 'not-a-timezone' }), /timezone must be an IANA timezone/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, workspace_calendar_active: false, sync_status: 'pending' }), /sync_status must be not_requested/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, conflict_refs: ['dup', 'dup'] }), /conflict_refs must be unique/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, create_calendar_event_requested: true }), /calendar event creation is deferred/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, update_calendar_event_requested: true }), /calendar event update is deferred/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, provider_sync_requested: true }), /provider sync is not authorized/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, calendar_api_publication_requested: true }), /API publication is deferred/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, persistence_requested: true }), /persistence is outside/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateEventCalendarScheduleRef({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime event_calendar_schedule_ref test passed.');
