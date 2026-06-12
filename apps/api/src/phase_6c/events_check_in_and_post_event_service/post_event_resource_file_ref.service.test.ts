import assert from 'node:assert/strict';

import { evaluatePostEventResourceFileRef, type PostEventResourceFileRefInput } from './post_event_resource_file_ref.service';

const baseInput: PostEventResourceFileRefInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_post_event_resource_file_ref',
  event_ref: 'event_001',
  source_record_ref: 'resource_manifest_001',
  evaluated_by_user_id: 'operator_001',
  evaluated_at: '2026-06-10T10:00:00.000Z',
  resources: [
    {
      file_ref: 'file_slide_deck_001',
      title: 'Session slides',
      content_type: 'application/pdf',
      checksum_digest: 'abcdef1234567890abcdef1234567890',
      visibility: 'attendees_only',
      available_from: '2026-06-09T10:00:00.000Z',
      available_until: '2026-06-20T10:00:00.000Z',
    },
  ],
  control_metadata: { channel: 'post_event' },
};

const ready = evaluatePostEventResourceFileRef(baseInput);
assert.equal(ready.seed_id, 'seed_6c_122_post_event_resource_file_ref');
assert.equal(ready.component_id, '6C.09');
assert.equal(ready.component_slug, 'events_check_in_and_post_event_service');
assert.equal(ready.model_name, 'Phase6CPostEventResourceFileRef');
assert.equal(ready.event_name, 'phase_6c.events_check_in_and_post_event_service.post_event_resource_file_ref.runtime_evaluated');
assert.equal(ready.decision, 'RESOURCE_FILE_REFS_READY');
assert.deepEqual(ready.ready_file_refs, ['file_slide_deck_001']);
assert.deepEqual(ready.review_file_refs, []);
assert.deepEqual(ready.decision_refs, ['6C-EVENT-CHECK-012', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012']);
assert.deepEqual(ready.dependency_refs, ['seed_6a_service_manifest_contract', '6C.08']);
assert.match(ready.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeated = evaluatePostEventResourceFileRef(baseInput);
assert.equal(repeated.runtime_evidence_digest, ready.runtime_evidence_digest);

const empty = evaluatePostEventResourceFileRef({ ...baseInput, source_record_ref: 'resource_manifest_002', resources: [] });
assert.equal(empty.decision, 'RESOURCE_FILE_REFS_REJECTED_EMPTY');
assert.deepEqual(empty.rejection_reasons, ['post_event_resource_file_refs_required']);

const review = evaluatePostEventResourceFileRef({
  ...baseInput,
  source_record_ref: 'resource_manifest_003',
  resources: [{ ...baseInput.resources[0], file_ref: 'file_public_001', visibility: 'public_link', checksum_digest: 'bad' }],
});
assert.equal(review.decision, 'RESOURCE_FILE_REFS_REQUIRE_REVIEW');
assert.deepEqual(review.review_file_refs, ['file_public_001']);
assert.deepEqual(review.rejection_reasons, ['public_link_visibility_requires_review:file_public_001', 'checksum_digest_invalid:file_public_001']);

const closed = evaluatePostEventResourceFileRef({
  ...baseInput,
  source_record_ref: 'resource_manifest_004',
  resources: [{ ...baseInput.resources[0], file_ref: 'file_old_001', available_until: '2026-06-09T10:00:00.000Z' }],
});
assert.equal(closed.decision, 'RESOURCE_FILE_REFS_REJECTED_WINDOW_CLOSED');
assert.deepEqual(closed.rejection_reasons, ['resource_window_closed:file_old_001']);

const notYet = evaluatePostEventResourceFileRef({
  ...baseInput,
  source_record_ref: 'resource_manifest_005',
  resources: [{ ...baseInput.resources[0], file_ref: 'file_future_001', available_from: '2026-06-11T10:00:00.000Z' }],
});
assert.equal(notYet.decision, 'RESOURCE_FILE_REFS_REQUIRE_REVIEW');
assert.deepEqual(notYet.rejection_reasons, ['resource_not_yet_available:file_future_001']);

assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, resources: [{ ...baseInput.resources[0], file_ref: '' }] }), /resources\[0\]\.file_ref is required/);
const invalidContentType = evaluatePostEventResourceFileRef({ ...baseInput, source_record_ref: 'resource_manifest_006', resources: [{ ...baseInput.resources[0], file_ref: 'file_bad_content_type', content_type: 'bad' }] });
assert.equal(invalidContentType.decision, 'RESOURCE_FILE_REFS_REQUIRE_REVIEW');
assert.deepEqual(invalidContentType.rejection_reasons, ['content_type_invalid:file_bad_content_type']);
assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, file_upload_requested: true }), /must not upload files/);
assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, file_storage_requested: true }), /must not store files/);
assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, file_mutation_requested: true }), /must not mutate files/);
assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, public_url_generation_requested: true }), /must not generate public URLs/);
assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluatePostEventResourceFileRef({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime post_event_resource_file_ref test passed.');
