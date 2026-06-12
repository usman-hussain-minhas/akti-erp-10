import assert from 'node:assert/strict';

import { evaluateTicketTypeCapacity, type TicketTypeCapacityInput } from './ticket_type_capacity.service';

const baseInput: TicketTypeCapacityInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_ticket_type_capacity',
  event_configuration_id: 'event_config_001',
  source_record_ref: 'ticket_type_capacity_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  product_catalogue_ref: 'product_catalogue:event_ticket_ops_forum',
  ticket_types: [
    {
      ticket_type_ref: 'ticket_type:standard',
      product_catalogue_item_ref: 'product_catalogue_item:standard_ticket',
      active: true,
      capacity: 100,
      sold_count: 25,
      held_count: 5,
      reserved_count: 10,
    },
    {
      ticket_type_ref: 'ticket_type:vip',
      product_catalogue_item_ref: 'product_catalogue_item:vip_ticket',
      active: true,
      capacity: 20,
      sold_count: 20,
      held_count: 0,
      reserved_count: 0,
    },
  ],
  capacity_request: {
    ticket_type_ref: 'ticket_type:standard',
    requested_quantity: 3,
  },
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateTicketTypeCapacity(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_099_ticket_type_capacity');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CTicketTypeCapacity');
assert.equal(receipt.product_catalogue_ref, 'product_catalogue:event_ticket_ops_forum');
assert.equal(receipt.ticket_type_count, 2);
assert.equal(receipt.total_capacity, 120);
assert.equal(receipt.total_committed_count, 60);
assert.equal(receipt.total_remaining_capacity, 60);
assert.equal(receipt.evaluations[0].status, 'AVAILABLE');
assert.equal(receipt.evaluations[0].committed_count, 40);
assert.equal(receipt.evaluations[0].remaining_capacity, 60);
assert.equal(receipt.evaluations[1].status, 'EXHAUSTED');
assert.equal(receipt.requested_ticket_type_ref, 'ticket_type:standard');
assert.equal(receipt.requested_quantity, 3);
assert.equal(receipt.requested_remaining_after_hold, 57);
assert.equal(receipt.decision, 'CAPACITY_AVAILABLE');
assert.equal(receipt.refs_events_only, true);
assert.equal(receipt.product_catalogue_write_allowed, false);
assert.equal(receipt.ticket_inventory_mutation_performed, false);
assert.equal(receipt.payment_capture_allowed, false);
assert.equal(receipt.registration_creation_allowed, false);
assert.equal(receipt.waitlist_promotion_performed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.frontend_surface_created, false);
assert.match(receipt.ticket_type_capacity_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateTicketTypeCapacity(baseInput);
assert.equal(repeatedReceipt.ticket_type_capacity_runtime_digest, receipt.ticket_type_capacity_runtime_digest);

const exhaustedReceipt = evaluateTicketTypeCapacity({
  ...baseInput,
  capacity_request: { ticket_type_ref: 'ticket_type:vip', requested_quantity: 1 },
});
assert.equal(exhaustedReceipt.decision, 'CAPACITY_EXHAUSTED');
assert.equal(exhaustedReceipt.requested_remaining_after_hold, -1);

const inactiveReceipt = evaluateTicketTypeCapacity({
  ...baseInput,
  ticket_types: [{ ...baseInput.ticket_types[0], active: false }],
  capacity_request: { ticket_type_ref: 'ticket_type:standard', requested_quantity: 1 },
});
assert.equal(inactiveReceipt.evaluations[0].status, 'INACTIVE');
assert.equal(inactiveReceipt.decision, 'CAPACITY_REQUIRES_REVIEW');

const overAllocatedReceipt = evaluateTicketTypeCapacity({
  ...baseInput,
  ticket_types: [{ ...baseInput.ticket_types[0], sold_count: 120 }],
  capacity_request: undefined,
});
assert.equal(overAllocatedReceipt.evaluations[0].status, 'OVER_ALLOCATED');
assert.equal(overAllocatedReceipt.decision, 'CAPACITY_REQUIRES_REVIEW');

assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, product_catalogue_ref: '' }), /product_catalogue_ref is required/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, ticket_types: [] }), /at least one ticket_type is required/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, ticket_types: [{ ...baseInput.ticket_types[0], ticket_type_ref: '' }] }), /ticket_type_ref is required/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, ticket_types: [{ ...baseInput.ticket_types[0] }, { ...baseInput.ticket_types[0] }] }), /ticket_type_ref values must be unique/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, ticket_types: [{ ...baseInput.ticket_types[0], capacity: 0 }] }), /capacity must be a positive integer/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, ticket_types: [{ ...baseInput.ticket_types[0], sold_count: -1 }] }), /sold_count must be a non-negative integer/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, capacity_request: { ticket_type_ref: 'ticket_type:missing', requested_quantity: 1 } }), /must match a declared ticket_type_ref/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, capacity_request: { ticket_type_ref: 'ticket_type:standard', requested_quantity: 0 } }), /requested_quantity must be a positive integer/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, product_catalogue_write_requested: true }), /not write Product Catalogue data/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, ticket_inventory_mutation_requested: true }), /not mutate ticket inventory/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, payment_capture_requested: true }), /must not capture payment/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, registration_creation_requested: true }), /must not create registrations/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, waitlist_promotion_requested: true }), /must not promote waitlist entries/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateTicketTypeCapacity({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime ticket_type_capacity test passed.');
