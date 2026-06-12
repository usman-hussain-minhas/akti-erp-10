import assert from 'node:assert/strict';

import { evaluateOfflineCheckinQueue, type OfflineCheckinQueueInput } from './offline_checkin_queue.service';

const baseInput: OfflineCheckinQueueInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_offline_checkin_queue',
  source_record_ref: 'offline_queue_batch_001',
  evaluated_at: '2026-06-09T10:00:00.000Z',
  max_offline_age_minutes: 120,
  queue_entries: [
    {
      local_entry_ref: 'offline_entry_001',
      ticket_ref: 'ticket_001',
      attendee_ref: 'attendee_001',
      registration_ref: 'registration_001',
      event_ref: 'event_001',
      session_ref: 'session_001',
      captured_at: '2026-06-09T09:30:00.000Z',
      captured_by_device_ref: 'device_kiosk_001',
      captured_by_user_id: 'operator_001',
      payload_digest: 'abcdef1234567890abcdef1234567890',
    },
  ],
  control_metadata: { channel: 'offline_kiosk' },
};

const accepted = evaluateOfflineCheckinQueue(baseInput);
assert.equal(accepted.seed_id, 'seed_6c_118_offline_checkin_queue');
assert.equal(accepted.component_id, '6C.09');
assert.equal(accepted.component_slug, 'events_check_in_and_post_event_service');
assert.equal(accepted.model_name, 'Phase6COfflineCheckinQueue');
assert.equal(accepted.event_name, 'phase_6c.events_check_in_and_post_event_service.offline_checkin_queue.runtime_evaluated');
assert.equal(accepted.decision, 'OFFLINE_QUEUE_ACCEPTED_FOR_SYNC');
assert.equal(accepted.sync_state, 'ready_for_sync');
assert.deepEqual(accepted.accepted_entry_refs, ['offline_entry_001']);
assert.deepEqual(accepted.rejected_entry_refs, []);
assert.deepEqual(accepted.decision_refs, ['6C-EVENT-CHECK-008', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012']);
assert.deepEqual(accepted.dependency_refs, ['seed_6a_service_manifest_contract', '6C.08']);
assert.match(accepted.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeated = evaluateOfflineCheckinQueue(baseInput);
assert.equal(repeated.runtime_evidence_digest, accepted.runtime_evidence_digest);

const duplicate = evaluateOfflineCheckinQueue({
  ...baseInput,
  source_record_ref: 'offline_queue_batch_002',
  known_synced_entry_refs: ['offline_entry_001'],
});
assert.equal(duplicate.decision, 'OFFLINE_QUEUE_REJECTED_DUPLICATE');
assert.equal(duplicate.sync_state, 'rejected');
assert.deepEqual(duplicate.duplicate_entry_refs, ['offline_entry_001']);
assert.deepEqual(duplicate.rejection_reasons, ['duplicate_offline_entry:offline_entry_001']);

const expired = evaluateOfflineCheckinQueue({
  ...baseInput,
  source_record_ref: 'offline_queue_batch_003',
  queue_entries: [{ ...baseInput.queue_entries[0], local_entry_ref: 'offline_entry_003', captured_at: '2026-06-09T07:00:00.000Z' }],
});
assert.equal(expired.decision, 'OFFLINE_QUEUE_REJECTED_EXPIRED');
assert.deepEqual(expired.expired_entry_refs, ['offline_entry_003']);

const review = evaluateOfflineCheckinQueue({
  ...baseInput,
  source_record_ref: 'offline_queue_batch_004',
  queue_entries: [{ ...baseInput.queue_entries[0], local_entry_ref: 'offline_entry_004', payload_digest: 'not-hex' }],
});
assert.equal(review.decision, 'OFFLINE_QUEUE_REQUIRES_REVIEW');
assert.equal(review.sync_state, 'requires_review');
assert.deepEqual(review.review_entry_refs, ['offline_entry_004']);
assert.deepEqual(review.rejection_reasons, ['payload_digest_not_hex:offline_entry_004']);

const mixed = evaluateOfflineCheckinQueue({
  ...baseInput,
  source_record_ref: 'offline_queue_batch_005',
  queue_entries: [
    baseInput.queue_entries[0],
    { ...baseInput.queue_entries[0], local_entry_ref: 'offline_entry_005', captured_at: '2026-06-09T07:00:00.000Z' },
  ],
});
assert.equal(mixed.decision, 'OFFLINE_QUEUE_REQUIRES_REVIEW');
assert.deepEqual(mixed.accepted_entry_refs, ['offline_entry_001']);
assert.deepEqual(mixed.expired_entry_refs, ['offline_entry_005']);

assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, max_offline_age_minutes: 0 }), /max_offline_age_minutes must be a positive integer/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, queue_entries: [{ ...baseInput.queue_entries[0], local_entry_ref: '' }] }), /queue_entries\[0\]\.local_entry_ref is required/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, known_synced_entry_refs: [' '] }), /known_synced_entry_refs\[0\] is required/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, queue_persistence_requested: true }), /must not persist queue entries/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, network_sync_requested: true }), /must not perform network sync/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, checkin_record_creation_requested: true }), /must not create check-in records/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, ticket_mutation_requested: true }), /must not mutate tickets/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateOfflineCheckinQueue({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime offline_checkin_queue test passed.');
