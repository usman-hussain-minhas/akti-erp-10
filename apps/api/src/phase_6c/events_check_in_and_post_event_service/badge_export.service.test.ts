import assert from 'node:assert/strict';

import { evaluateBadgeExport, type BadgeExportInput } from './badge_export.service';

const baseInput: BadgeExportInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_badge_export',
  event_ref: 'event_001',
  source_record_ref: 'badge_export_batch_001',
  requested_by_user_id: 'operator_001',
  requested_at: '2026-06-09T10:00:00.000Z',
  export_format: 'pdf',
  badge_layout_ref: 'standard_badge_v1',
  include_qr_token_ref: true,
  rows: [
    {
      attendee_ref: 'attendee_001',
      registration_ref: 'registration_001',
      ticket_ref: 'ticket_001',
      display_name: 'Ayesha Khan',
      organization_label: 'Example Org',
      role_label: 'Speaker',
      qr_ticket_token_ref: 'qr_token_001',
      badge_number: 'B-001',
    },
  ],
  control_metadata: { channel: 'operations_console' },
};

const ready = evaluateBadgeExport(baseInput);
assert.equal(ready.seed_id, 'seed_6c_119_badge_export');
assert.equal(ready.component_id, '6C.09');
assert.equal(ready.component_slug, 'events_check_in_and_post_event_service');
assert.equal(ready.model_name, 'Phase6CBadgeExport');
assert.equal(ready.event_name, 'phase_6c.events_check_in_and_post_event_service.badge_export.runtime_evaluated');
assert.equal(ready.decision, 'BADGE_EXPORT_READY');
assert.deepEqual(ready.printable_attendee_refs, ['attendee_001']);
assert.deepEqual(ready.review_attendee_refs, []);
assert.equal(ready.printable_count, 1);
assert.equal(ready.review_count, 0);
assert.deepEqual(ready.decision_refs, ['6C-EVENT-CHECK-009', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012']);
assert.deepEqual(ready.dependency_refs, ['seed_6a_service_manifest_contract', '6C.08']);
assert.match(ready.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeated = evaluateBadgeExport(baseInput);
assert.equal(repeated.runtime_evidence_digest, ready.runtime_evidence_digest);

const review = evaluateBadgeExport({
  ...baseInput,
  source_record_ref: 'badge_export_batch_002',
  rows: [{ ...baseInput.rows[0], attendee_ref: 'attendee_002', qr_ticket_token_ref: undefined }],
});
assert.equal(review.decision, 'BADGE_EXPORT_REQUIRES_REVIEW');
assert.deepEqual(review.review_attendee_refs, ['attendee_002']);
assert.deepEqual(review.rejection_reasons, ['qr_ticket_token_ref_required:attendee_002']);

const shortName = evaluateBadgeExport({
  ...baseInput,
  source_record_ref: 'badge_export_batch_003',
  include_qr_token_ref: false,
  rows: [{ ...baseInput.rows[0], attendee_ref: 'attendee_003', display_name: 'A', qr_ticket_token_ref: undefined }],
});
assert.equal(shortName.decision, 'BADGE_EXPORT_REQUIRES_REVIEW');
assert.deepEqual(shortName.rejection_reasons, ['display_name_too_short:attendee_003']);

const empty = evaluateBadgeExport({ ...baseInput, source_record_ref: 'badge_export_batch_004', rows: [] });
assert.equal(empty.decision, 'BADGE_EXPORT_REJECTED_EMPTY');
assert.deepEqual(empty.rejection_reasons, ['badge_export_rows_required']);

assert.throws(() => evaluateBadgeExport({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, badge_layout_ref: '!!' }), /badge_layout_ref must be a stable layout reference/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, rows: [{ ...baseInput.rows[0], attendee_ref: '' }] }), /rows\[0\]\.attendee_ref is required/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, rows: [{ ...baseInput.rows[0], organization_label: ' ' }] }), /organization_label must be non-empty/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, file_generation_requested: true }), /must not generate files/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, file_storage_requested: true }), /must not store files/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, qr_token_creation_requested: true }), /must not create QR tokens/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, ticket_mutation_requested: true }), /must not mutate tickets/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateBadgeExport({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime badge_export test passed.');
