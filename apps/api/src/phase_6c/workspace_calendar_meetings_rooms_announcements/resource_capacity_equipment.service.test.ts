import assert from 'node:assert/strict';

import { evaluateResourceCapacityEquipment, type ResourceCapacityEquipmentInput } from './resource_capacity_equipment.service';

const baseInput: ResourceCapacityEquipmentInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_resource_capacity_equipment',
  resource_ref: 'room_boardroom_a',
  resource_type: 'ROOM',
  display_name: 'Boardroom A',
  status: 'ACTIVE',
  capacity: 12,
  location_ref: 'floor_7_north',
  equipment: [
    { equipment_ref: 'screen_001', name: 'Display screen', quantity: 1 },
    { equipment_ref: 'speakerphone_001', name: 'Speakerphone', quantity: 1, portable: true },
  ],
  accessibility_features: ['wheelchair_accessible', 'hearing_loop'],
  metadata_tags: ['executive', 'video-ready'],
  evaluated_by_user_id: 'user_room_admin',
  evaluated_at: '2026-06-18T15:00:00.000Z',
  metadata: { source: 'phase_6c_resource_capacity_equipment_test' },
};

const receipt = evaluateResourceCapacityEquipment(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_087_resource_capacity_equipment');
assert.equal(receipt.component_id, '6C.07');
assert.equal(receipt.component_slug, 'workspace_calendar_meetings_rooms_announcements');
assert.equal(receipt.model_name, 'Phase6CResourceCapacityEquipment');
assert.equal(receipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.resource_capacity_equipment.runtime_evaluated');
assert.equal(receipt.booking_ready, true);
assert.equal(receipt.capacity, 12);
assert.equal(receipt.equipment_count, 2);
assert.equal(receipt.total_equipment_quantity, 2);
assert.deepEqual(receipt.validation_warnings, []);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateResourceCapacityEquipment(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

const warningReceipt = evaluateResourceCapacityEquipment({
  ...baseInput,
  capacity: undefined,
  location_ref: undefined,
  equipment: [],
  accessibility_features: [],
});
assert.equal(warningReceipt.booking_ready, false);
assert.deepEqual(warningReceipt.validation_warnings, [
  'room_resource_has_no_capacity_metadata',
  'room_resource_has_no_location_ref',
  'room_resource_has_no_equipment_metadata',
  'resource_has_no_accessibility_metadata',
]);

const inactiveEquipmentReceipt = evaluateResourceCapacityEquipment({
  ...baseInput,
  resource_ref: 'projector_cart_001',
  resource_type: 'EQUIPMENT',
  status: 'MAINTENANCE',
  capacity: undefined,
  location_ref: undefined,
  equipment: [],
  accessibility_features: [],
});
assert.equal(inactiveEquipmentReceipt.booking_ready, false);
assert.deepEqual(inactiveEquipmentReceipt.validation_warnings, ['resource_has_no_accessibility_metadata', 'resource_not_active_for_booking']);

assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, resource_type: 'VEHICLE' as never }), /resource_type must be ROOM or EQUIPMENT/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, status: 'DELETED' as never }), /status must be ACTIVE, INACTIVE, or MAINTENANCE/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, capacity: 0 }), /capacity must be a positive integer/);
assert.throws(() => evaluateResourceCapacityEquipment({
  ...baseInput,
  equipment: [
    { equipment_ref: 'screen_001', name: 'Display screen', quantity: 1 },
    { equipment_ref: 'screen_001', name: 'Display screen duplicate', quantity: 1 },
  ],
}), /duplicate equipment_ref/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, equipment: [{ equipment_ref: 'bad', name: '', quantity: 1 }] }), /equipment\[0\]\.name is required/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, equipment: [{ equipment_ref: 'bad', name: 'Broken', quantity: 0 }] }), /equipment\[0\]\.quantity must be a positive integer/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, accessibility_features: ['lift', 'lift'] }), /accessibility_features contains duplicate value/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, booking_write_requested: true }), /booking writes are outside this FFET/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, calendar_write_requested: true }), /calendar writes are outside this FFET/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, inventory_mutation_requested: true }), /inventory mutation is outside this FFET/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateResourceCapacityEquipment({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime resource_capacity_equipment test passed.');
