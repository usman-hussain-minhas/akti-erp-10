import assert from 'node:assert/strict';

import { evaluateDuplicateCheckinException, type DuplicateCheckinExceptionInput } from './duplicate_checkin_exception.service';

const baseInput: DuplicateCheckinExceptionInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_duplicate_checkin_exception',
  event_ref: 'event_annual_summit',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_ref: 'ticket_001',
  session_ref: 'session_keynote',
  checkin_scope: 'session',
  attempted_checkin_ref: 'checkin_attempt_002',
  attempted_at: '2026-06-09T09:05:00.000Z',
  attempted_checkpoint_ref: 'checkpoint_main_gate',
  attempted_operator_user_id: 'operator_002',
  source_record_ref: 'duplicate_exception_case_001',
  prior_checkins: [],
  control_metadata: { channel: 'kiosk' },
};

const accepted = evaluateDuplicateCheckinException(baseInput);
assert.equal(accepted.seed_id, 'seed_6c_117_duplicate_checkin_exception');
assert.equal(accepted.component_id, '6C.09');
assert.equal(accepted.component_slug, 'events_check_in_and_post_event_service');
assert.equal(accepted.model_name, 'Phase6CDuplicateCheckinException');
assert.equal(accepted.event_name, 'phase_6c.events_check_in_and_post_event_service.duplicate_checkin_exception.runtime_evaluated');
assert.equal(accepted.decision, 'CHECKIN_ACCEPTED_NO_DUPLICATE');
assert.equal(accepted.duplicate_detected, false);
assert.equal(accepted.exception_record_required, false);
assert.equal(accepted.manual_review_required, false);
assert.equal(accepted.severity, 'none');
assert.deepEqual(accepted.matched_prior_checkin_refs, []);
assert.deepEqual(accepted.decision_refs, ['6C-EVENT-CHECK-007', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012']);
assert.deepEqual(accepted.dependency_refs, ['seed_6a_service_manifest_contract', '6C.08']);
assert.match(accepted.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeated = evaluateDuplicateCheckinException(baseInput);
assert.equal(repeated.runtime_evidence_digest, accepted.runtime_evidence_digest);

const duplicateBlocked = evaluateDuplicateCheckinException({
  ...baseInput,
  source_record_ref: 'duplicate_exception_case_002',
  prior_checkins: [
    {
      checkin_ref: 'checkin_existing_001',
      checked_in_at: '2026-06-09T09:00:00.000Z',
      checkpoint_ref: 'checkpoint_main_gate',
      operator_user_id: 'operator_001',
    },
  ],
});
assert.equal(duplicateBlocked.decision, 'DUPLICATE_CHECKIN_BLOCKED');
assert.equal(duplicateBlocked.duplicate_detected, true);
assert.equal(duplicateBlocked.exception_record_required, true);
assert.equal(duplicateBlocked.manual_review_required, false);
assert.equal(duplicateBlocked.severity, 'medium');
assert.deepEqual(duplicateBlocked.matched_prior_checkin_refs, ['checkin_existing_001']);
assert.deepEqual(duplicateBlocked.rejection_reasons, ['prior_checkin_exists_for_scope']);

const duplicateReview = evaluateDuplicateCheckinException({
  ...baseInput,
  source_record_ref: 'duplicate_exception_case_003',
  allow_manual_review: true,
  prior_checkins: [
    {
      checkin_ref: 'checkin_existing_002',
      checked_in_at: '2026-06-09T09:01:00.000Z',
      checkpoint_ref: 'checkpoint_side_gate',
      operator_user_id: 'operator_003',
    },
  ],
});
assert.equal(duplicateReview.decision, 'DUPLICATE_CHECKIN_REQUIRES_REVIEW');
assert.equal(duplicateReview.manual_review_required, true);
assert.equal(duplicateReview.severity, 'high');
assert.deepEqual(duplicateReview.rejection_reasons, [
  'duplicate_detected_at_different_checkpoint',
  'prior_checkin_exists_for_scope',
]);

const sameAttemptRef = evaluateDuplicateCheckinException({
  ...baseInput,
  source_record_ref: 'duplicate_exception_case_004',
  prior_checkins: [
    {
      checkin_ref: 'checkin_attempt_002',
      checked_in_at: '2026-06-09T09:04:00.000Z',
      checkpoint_ref: 'checkpoint_main_gate',
      operator_user_id: 'operator_004',
    },
  ],
});
assert.equal(sameAttemptRef.decision, 'DUPLICATE_CHECKIN_BLOCKED');
assert.equal(sameAttemptRef.severity, 'high');
assert.deepEqual(sameAttemptRef.rejection_reasons, ['attempted_checkin_ref_already_recorded']);

const invalidSessionScope = evaluateDuplicateCheckinException({
  ...baseInput,
  source_record_ref: 'duplicate_exception_case_005',
  session_ref: undefined,
});
assert.equal(invalidSessionScope.decision, 'DUPLICATE_CHECKIN_CONTEXT_INVALID');
assert.equal(invalidSessionScope.manual_review_required, true);
assert.equal(invalidSessionScope.exception_record_required, true);
assert.deepEqual(invalidSessionScope.rejection_reasons, ['session_ref_required_for_session_scope']);

assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, attempted_at: 'not-a-date' }), /attempted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, attempted_checkin_ref: '' }), /attempted_checkin_ref is required/);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, session_ref: ' ' }), /session_ref must be non-empty/);
assert.throws(
  () => evaluateDuplicateCheckinException({
    ...baseInput,
    prior_checkins: [{ checkin_ref: '', checked_in_at: '2026-06-09T09:00:00.000Z', checkpoint_ref: 'checkpoint', operator_user_id: 'operator' }],
  }),
  /prior_checkins\[0\]\.checkin_ref is required/,
);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, duplicate_persistence_requested: true }), /must not persist exception records/);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, checkin_record_creation_requested: true }), /must not create check-in records/);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, ticket_mutation_requested: true }), /must not mutate tickets/);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, attendance_persistence_requested: true }), /must not persist attendance/);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateDuplicateCheckinException({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime duplicate_checkin_exception test passed.');
