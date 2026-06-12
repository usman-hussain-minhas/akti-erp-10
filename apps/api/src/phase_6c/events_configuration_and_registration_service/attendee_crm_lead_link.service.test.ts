import assert from 'node:assert/strict';

import { evaluateAttendeeCrmLeadLink, type AttendeeCrmLeadLinkInput } from './attendee_crm_lead_link.service';

const baseInput: AttendeeCrmLeadLinkInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_attendee_crm_lead_link',
  event_config_ref: 'event_config_annual_summit',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  source_record_ref: 'attendee_crm_lead_link_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  crm_handoff_active: true,
  crm_lead_ref: 'crm_lead_001',
  crm_contact_ref: 'crm_contact_001',
  crm_campaign_ref: 'crm_campaign_summit',
  lead_source_ref: 'lead_source_event_registration',
  attendee_identity_ref: 'person_identity_attendee_001',
  link_status: 'linked',
  product_catalogue_anchor_ref: 'product_catalogue_ticket_anchor_001',
  invoice_saga_ref: 'registration_invoice_saga_001',
  payment_saga_ref: 'registration_payment_saga_001',
  workspace_calendar_ref: 'workspace_calendar_event_ref_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const linkedReceipt = evaluateAttendeeCrmLeadLink(baseInput);
assert.equal(linkedReceipt.seed_id, 'seed_6c_106_attendee_crm_lead_link');
assert.equal(linkedReceipt.component_id, '6C.08');
assert.equal(linkedReceipt.event_name, 'phase_6c.events_configuration_and_registration_service.attendee_crm_lead_link.runtime_evaluated');
assert.equal(linkedReceipt.decision, 'CRM_LEAD_LINKED');
assert.equal(linkedReceipt.dependency_trace.crm_handoff_condition, 'event_crm_handoff_active');
assert.equal(linkedReceipt.dependency_trace.product_catalogue_anchor_ref, 'product_catalogue_ticket_anchor_001');
assert.equal(linkedReceipt.dependency_trace.invoice_saga_ref, 'registration_invoice_saga_001');
assert.equal(linkedReceipt.dependency_trace.payment_saga_ref, 'registration_payment_saga_001');
assert.equal(linkedReceipt.dependency_trace.workspace_calendar_ref, 'workspace_calendar_event_ref_001');
assert.deepEqual(linkedReceipt.decision_refs, ['6C-EVENT-REG-012', '6C-GLOBAL-018', '6C-EVENT-REG-003', '6C-BILL-007', 'ADL-001']);
assert.match(linkedReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAttendeeCrmLeadLink(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, linkedReceipt.runtime_evidence_digest);

const inactiveReceipt = evaluateAttendeeCrmLeadLink({
  ...baseInput,
  crm_handoff_active: false,
  link_status: 'not_applicable',
  crm_lead_ref: undefined,
  crm_contact_ref: undefined,
  crm_campaign_ref: undefined,
  lead_source_ref: undefined,
});
assert.equal(inactiveReceipt.decision, 'CRM_LINK_NOT_APPLICABLE');
assert.equal(inactiveReceipt.dependency_trace.crm_handoff_condition, 'event_crm_handoff_inactive');

const pendingReceipt = evaluateAttendeeCrmLeadLink({ ...baseInput, link_status: 'pending', crm_lead_ref: undefined, crm_contact_ref: undefined });
assert.equal(pendingReceipt.decision, 'CRM_LINK_PENDING');

const conflictReceipt = evaluateAttendeeCrmLeadLink({ ...baseInput, link_status: 'conflict', conflict_refs: ['crm_match_conflict_001'] });
assert.equal(conflictReceipt.decision, 'CRM_LINK_CONFLICT');
assert.deepEqual(conflictReceipt.conflict_refs, ['crm_match_conflict_001']);

const reviewReceipt = evaluateAttendeeCrmLeadLink({ ...baseInput, link_status: 'failed' });
assert.equal(reviewReceipt.decision, 'CRM_LINK_REQUIRES_REVIEW');

assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, registration_ref: '' }), /registration_ref is required/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, attendee_ref: '' }), /attendee_ref is required/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, crm_lead_ref: '' }), /crm_lead_ref must be non-empty/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, crm_handoff_active: false, link_status: 'pending' }), /link_status must be not_applicable/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, conflict_refs: ['dup', 'dup'] }), /conflict_refs must be unique/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, create_crm_lead_requested: true }), /CRM lead creation is delegated/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, update_crm_lead_requested: true }), /CRM lead update is delegated/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, crm_provider_sync_requested: true }), /CRM provider sync is not authorized/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, registration_mutation_requested: true }), /registration mutation is outside/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, payment_mutation_requested: true }), /payment mutation is Saga-owned/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, persistence_requested: true }), /persistence is outside/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateAttendeeCrmLeadLink({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime attendee_crm_lead_link test passed.');
