import assert from 'node:assert/strict';

import { evaluatePostEventFeedbackForm, type PostEventFeedbackFormInput } from './post_event_feedback_form.service';

const baseInput: PostEventFeedbackFormInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_post_event_feedback_form',
  event_ref: 'event_001',
  form_ref: 'feedback_form_001',
  source_record_ref: 'feedback_form_config_001',
  opened_at: '2026-06-09T10:00:00.000Z',
  closes_at: '2026-06-16T10:00:00.000Z',
  evaluated_at: '2026-06-10T10:00:00.000Z',
  allow_anonymous_response: true,
  questions: [
    { question_ref: 'q_rating', label: 'Overall rating', question_type: 'rating', required: true, min_rating: 1, max_rating: 5 },
    { question_ref: 'q_comment', label: 'Comments', question_type: 'text', required: false },
    { question_ref: 'q_track', label: 'Best track', question_type: 'single_choice', required: true, options: ['Sales', 'Finance'] },
  ],
  control_metadata: { channel: 'post_event' },
};

const ready = evaluatePostEventFeedbackForm(baseInput);
assert.equal(ready.seed_id, 'seed_6c_120_post_event_feedback_form');
assert.equal(ready.component_id, '6C.09');
assert.equal(ready.component_slug, 'events_check_in_and_post_event_service');
assert.equal(ready.model_name, 'Phase6CPostEventFeedbackForm');
assert.equal(ready.event_name, 'phase_6c.events_check_in_and_post_event_service.post_event_feedback_form.runtime_evaluated');
assert.equal(ready.decision, 'FEEDBACK_FORM_READY');
assert.equal(ready.allow_anonymous_response, true);
assert.equal(ready.question_count, 3);
assert.deepEqual(ready.required_question_refs, ['q_rating', 'q_track']);
assert.deepEqual(ready.scoring_question_refs, ['q_rating']);
assert.deepEqual(ready.review_question_refs, []);
assert.deepEqual(ready.decision_refs, ['6C-EVENT-CHECK-010', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012']);
assert.deepEqual(ready.dependency_refs, ['seed_6a_service_manifest_contract', '6C.08']);
assert.match(ready.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeated = evaluatePostEventFeedbackForm(baseInput);
assert.equal(repeated.runtime_evidence_digest, ready.runtime_evidence_digest);

const empty = evaluatePostEventFeedbackForm({ ...baseInput, source_record_ref: 'feedback_form_config_002', questions: [] });
assert.equal(empty.decision, 'FEEDBACK_FORM_REJECTED_EMPTY');
assert.deepEqual(empty.rejection_reasons, ['feedback_questions_required']);

const badRating = evaluatePostEventFeedbackForm({
  ...baseInput,
  source_record_ref: 'feedback_form_config_003',
  questions: [{ question_ref: 'q_bad_rating', label: 'Rate', question_type: 'rating', required: true, min_rating: 5, max_rating: 1 }],
});
assert.equal(badRating.decision, 'FEEDBACK_FORM_REQUIRES_REVIEW');
assert.deepEqual(badRating.review_question_refs, ['q_bad_rating']);
assert.deepEqual(badRating.rejection_reasons, ['rating_range_invalid:q_bad_rating']);

const badChoice = evaluatePostEventFeedbackForm({
  ...baseInput,
  source_record_ref: 'feedback_form_config_004',
  questions: [{ question_ref: 'q_choice', label: 'Choose', question_type: 'single_choice', required: true, options: ['Only'] }],
});
assert.equal(badChoice.decision, 'FEEDBACK_FORM_REQUIRES_REVIEW');
assert.deepEqual(badChoice.rejection_reasons, ['choice_options_required:q_choice']);

const closed = evaluatePostEventFeedbackForm({ ...baseInput, source_record_ref: 'feedback_form_config_005', closes_at: '2026-06-09T11:00:00.000Z' });
assert.equal(closed.decision, 'FEEDBACK_FORM_REJECTED_CLOSED');
assert.deepEqual(closed.rejection_reasons, ['feedback_form_closed']);

const notOpen = evaluatePostEventFeedbackForm({ ...baseInput, source_record_ref: 'feedback_form_config_006', opened_at: '2026-06-11T10:00:00.000Z' });
assert.equal(notOpen.decision, 'FEEDBACK_FORM_REQUIRES_REVIEW');
assert.deepEqual(notOpen.rejection_reasons, ['feedback_form_not_yet_open']);

assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, opened_at: 'not-a-date' }), /opened_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, questions: [{ ...baseInput.questions[0], question_ref: '' }] }), /questions\[0\]\.question_ref is required/);
assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, questions: [{ ...baseInput.questions[2], options: ['Good', ' '] }] }), /questions\[0\]\.options\[1\] is required/);
assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, form_persistence_requested: true }), /must not persist forms/);
assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, response_collection_requested: true }), /must not collect responses/);
assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);
assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluatePostEventFeedbackForm({ ...baseInput, crm_write_requested: true }), /must not write CRM records/);

console.log('P6C runtime post_event_feedback_form test passed.');
