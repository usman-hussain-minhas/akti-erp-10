import assert from 'node:assert/strict';

import { evaluateEventLeadHandoff, type EventLeadHandoffInput } from './event_lead_handoff.service';

const baseInput: EventLeadHandoffInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_event_lead_handoff',
  event_config_ref: 'event_config_annual_summit',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  source_record_ref: 'event_lead_handoff_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  crm_handoff_active: true,
  handoff_status: 'ready',
  attendee_crm_lead_link_ref: 'attendee_crm_lead_link_001',
  event_lead_ref: 'event_lead_001',
  crm_lead_ref: 'crm_lead_001',
  crm_contact_ref: 'crm_contact_001',
  crm_campaign_ref: 'crm_campaign_summit',
  lead_source_ref: 'lead_source_event_registration',
  attendee_identity_ref: 'person_identity_attendee_001',
  product_catalogue_anchor_ref: 'product_catalogue_ticket_anchor_001',
  invoice_saga_ref: 'registration_invoice_saga_001',
  payment_saga_ref: 'registration_payment_saga_001',
  workspace_calendar_ref: 'workspace_calendar_event_ref_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const readyReceipt = evaluateEventLeadHandoff(baseInput);
assert.equal(readyReceipt.seed_id, 'seed_6c_107_event_lead_handoff');
assert.equal(readyReceipt.component_id, '6C.08');
assert.equal(readyReceipt.event_name, 'phase_6c.events_configuration_and_registration_service.event_lead_handoff.runtime_evaluated');
assert.equal(readyReceipt.decision, 'HANDOFF_EVENT_READY');
assert.equal(readyReceipt.handoff_envelope?.event_name, 'phase_6c.events_configuration_and_registration_service.event_lead_handoff.ready');
assert.equal(readyReceipt.handoff_envelope?.crm_lead_ref, 'crm_lead_001');
assert.match(readyReceipt.handoff_envelope?.idempotency_key ?? '', /^[a-f0-9]{64}$/);
assert.equal(readyReceipt.dependency_trace.crm_handoff_condition, 'event_crm_handoff_active');
assert.equal(readyReceipt.dependency_trace.product_catalogue_anchor_ref, 'product_catalogue_ticket_anchor_001');
assert.equal(readyReceipt.dependency_trace.invoice_saga_ref, 'registration_invoice_saga_001');
assert.equal(readyReceipt.dependency_trace.payment_saga_ref, 'registration_payment_saga_001');
assert.equal(readyReceipt.dependency_trace.workspace_calendar_ref, 'workspace_calendar_event_ref_001');
assert.deepEqual(readyReceipt.decision_refs, ['6C-EVENT-REG-012', '6C-GLOBAL-018', '6C-EVENT-REG-003', '6C-BILL-007', 'ADL-001']);
assert.match(readyReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEventLeadHandoff(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, readyReceipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.handoff_envelope?.idempotency_key, readyReceipt.handoff_envelope?.idempotency_key);

const inactiveReceipt = evaluateEventLeadHandoff({
  ...baseInput,
  crm_handoff_active: false,
  handoff_status: 'not_applicable',
  attendee_crm_lead_link_ref: undefined,
  event_lead_ref: undefined,
  crm_lead_ref: undefined,
  crm_contact_ref: undefined,
  crm_campaign_ref: undefined,
  lead_source_ref: undefined,
});
assert.equal(inactiveReceipt.decision, 'CRM_HANDOFF_INACTIVE');
assert.equal(inactiveReceipt.handoff_envelope, null);
assert.equal(inactiveReceipt.dependency_trace.crm_handoff_condition, 'event_crm_handoff_inactive');

const pendingReceipt = evaluateEventLeadHandoff({ ...baseInput, handoff_status: 'pending' });
assert.equal(pendingReceipt.decision, 'HANDOFF_EVENT_PENDING');

const conflictReceipt = evaluateEventLeadHandoff({ ...baseInput, handoff_status: 'conflict', conflict_refs: ['handoff_conflict_001'] });
assert.equal(conflictReceipt.decision, 'HANDOFF_EVENT_CONFLICT');
assert.deepEqual(conflictReceipt.conflict_refs, ['handoff_conflict_001']);

const reviewReceipt = evaluateEventLeadHandoff({ ...baseInput, handoff_status: 'failed' });
assert.equal(reviewReceipt.decision, 'HANDOFF_EVENT_REQUIRES_REVIEW');

assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, registration_ref: '' }), /registration_ref is required/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, attendee_ref: '' }), /attendee_ref is required/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, crm_lead_ref: '' }), /crm_lead_ref must be non-empty/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, crm_handoff_active: false, handoff_status: 'ready' }), /handoff_status must be not_applicable/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, conflict_refs: ['dup', 'dup'] }), /conflict_refs must be unique/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, crm_direct_write_requested: true }), /direct CRM writes are forbidden/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, crm_provider_sync_requested: true }), /CRM provider sync is not authorized/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, event_bus_publish_requested: true }), /event bus publication is deferred/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, registration_mutation_requested: true }), /registration mutation is outside/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, payment_mutation_requested: true }), /payment mutation is Saga-owned/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, persistence_requested: true }), /persistence is outside/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateEventLeadHandoff({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime event_lead_handoff test passed.');
