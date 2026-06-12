import assert from 'node:assert/strict';

import { evaluateEventConfiguration, type EventConfigurationInput } from './event_configuration.service';

const paidTicketedEvent: EventConfigurationInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_event_configuration',
  event_configuration_id: 'event_config_001',
  source_record_ref: 'event_configuration_record_001',
  configured_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  event_name: 'Annual Operations Forum',
  event_code: 'ops-forum-2026',
  lifecycle_status: 'PUBLISHED',
  registration_mode: 'PAID_REGISTRATION',
  ticketing_mode: 'PRODUCT_CATALOGUE_TICKET_TYPES',
  capacity_mode: 'PER_TICKET_TYPE',
  audience_visibility: 'PUBLIC',
  timezone: 'Asia/Karachi',
  starts_at: '2026-09-01T09:00:00.000Z',
  ends_at: '2026-09-01T17:00:00.000Z',
  product_catalogue_ref: 'product_catalogue:event_ticket_ops_forum',
  ticket_type_refs: [
    {
      ticket_type_ref: 'ticket_type:standard',
      product_catalogue_item_ref: 'product_catalogue_item:standard_ticket',
      capacity: 120,
      active: true,
    },
    {
      ticket_type_ref: 'ticket_type:vip',
      product_catalogue_item_ref: 'product_catalogue_item:vip_ticket',
      capacity: 20,
      active: true,
    },
  ],
  paid_registration_policy: {
    invoice_required: true,
    payment_required: true,
    registration_invoice_saga_ref: 'saga:event_registration_invoice_001',
    finance_invoice_ref: 'invoice_ref:event_ops_forum',
    payment_collection_ref: 'payment_ref:event_ops_forum',
  },
  crm_handoff: {
    enabled: true,
    condition: 'event_crm_handoff_active',
    target_ref: 'crm_handoff:event_ops_forum',
  },
  calendar_schedule: {
    enabled: true,
    condition: 'workspace_calendar_active',
    target_ref: 'workspace_calendar:event_ops_forum',
  },
  employee_owner_ref: 'employee_ref:event_owner_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateEventConfiguration(paidTicketedEvent);
assert.equal(receipt.seed_id, 'seed_6c_096_event_configuration');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CEventConfiguration');
assert.equal(receipt.normalized_event_code, 'OPS-FORUM-2026');
assert.equal(receipt.decision, 'CONFIGURATION_READY');
assert.equal(receipt.product_catalogue_anchor_required, true);
assert.equal(receipt.product_catalogue_ref, 'product_catalogue:event_ticket_ops_forum');
assert.equal(receipt.active_ticket_type_count, 2);
assert.equal(receipt.registration_invoice_saga_required, true);
assert.equal(receipt.registration_invoice_saga_ref, 'saga:event_registration_invoice_001');
assert.equal(receipt.crm_handoff_condition, 'event_crm_handoff_active');
assert.equal(receipt.crm_handoff_target_ref, 'crm_handoff:event_ops_forum');
assert.equal(receipt.calendar_schedule_condition, 'workspace_calendar_active');
assert.equal(receipt.calendar_target_ref, 'workspace_calendar:event_ops_forum');
assert.deepEqual(receipt.adl_refs, ['ADL-001']);
assert.equal(receipt.refs_events_only, true);
assert.equal(receipt.direct_cross_module_write_allowed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.frontend_surface_created, false);
assert.match(receipt.event_configuration_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEventConfiguration(paidTicketedEvent);
assert.equal(repeatedReceipt.event_configuration_runtime_digest, receipt.event_configuration_runtime_digest);

const draftInformationOnly = evaluateEventConfiguration({
  ...paidTicketedEvent,
  event_configuration_id: 'event_config_draft_001',
  lifecycle_status: 'DRAFT',
  registration_mode: 'INFORMATION_ONLY',
  ticketing_mode: 'NONE',
  capacity_mode: 'FIXED_CAPACITY',
  max_capacity: 35,
  product_catalogue_ref: undefined,
  ticket_type_refs: undefined,
  paid_registration_policy: undefined,
  crm_handoff: { enabled: false, condition: 'event_crm_handoff_active' },
  calendar_schedule: { enabled: false, condition: 'workspace_calendar_active' },
});
assert.equal(draftInformationOnly.decision, 'DRAFT_CONFIGURATION_READY');
assert.equal(draftInformationOnly.product_catalogue_anchor_required, false);
assert.equal(draftInformationOnly.fixed_capacity, 35);
assert.equal(draftInformationOnly.registration_invoice_saga_required, false);
assert.deepEqual(draftInformationOnly.adl_refs, []);

const archivedPaidEvent = evaluateEventConfiguration({
  ...paidTicketedEvent,
  event_configuration_id: 'event_config_archived_001',
  lifecycle_status: 'ARCHIVED',
});
assert.equal(archivedPaidEvent.decision, 'CONFIGURATION_REQUIRES_REVIEW');

assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, event_code: 'x' }), /event_code must be 3-64 characters/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, starts_at: '2026-09-02T09:00:00.000Z' }), /ends_at must be after starts_at/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, product_catalogue_ref: undefined }), /product_catalogue_ref is required/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, ticket_type_refs: [] }), /at least one active ticket_type_ref is required/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, ticket_type_refs: [{ ticket_type_ref: 'ticket_type:standard', product_catalogue_item_ref: 'product_catalogue_item:standard_ticket', active: true }] }), /ticket_type_ref.capacity must be a positive integer/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, registration_mode: 'FREE_REGISTRATION', paid_registration_policy: paidTicketedEvent.paid_registration_policy }), /paid_registration_policy is only valid/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, paid_registration_policy: { invoice_required: false, payment_required: false, registration_invoice_saga_ref: 'saga:event_registration_invoice_001' } }), /requires invoice_required or payment_required/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, paid_registration_policy: { invoice_required: true, payment_required: false } }), /registration_invoice_saga_ref is required/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, crm_handoff: { enabled: true, condition: 'workspace_calendar_active', target_ref: 'workspace_calendar:wrong_surface' } }), /crm_handoff must use condition event_crm_handoff_active/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, calendar_schedule: { enabled: true, condition: 'event_crm_handoff_active', target_ref: 'crm:wrong_surface' } }), /calendar_schedule must use condition workspace_calendar_active/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, product_catalogue_write_requested: true }), /must reference Product Catalogue anchors/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, finance_invoice_write_requested: true }), /must use Saga\/evidence refs/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, payment_capture_requested: true }), /must not capture payment/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, crm_direct_write_requested: true }), /not write CRM data directly/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, calendar_direct_write_requested: true }), /not write calendar data directly/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateEventConfiguration({ ...paidTicketedEvent, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime event_configuration test passed.');
