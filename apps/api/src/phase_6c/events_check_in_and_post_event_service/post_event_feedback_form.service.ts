import { createHash } from 'node:crypto';

export const PHASE_6C_POST_EVENT_FEEDBACK_FORM_SEED_ID = 'seed_6c_120_post_event_feedback_form' as const;
export const PHASE_6C_POST_EVENT_FEEDBACK_FORM_COMPONENT_ID = '6C.09' as const;
export const POST_EVENT_FEEDBACK_FORM_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.post_event_feedback_form.runtime_evaluated' as const;

export type FeedbackQuestionType = 'rating' | 'text' | 'single_choice' | 'multi_choice';
export type FeedbackFormDecision = 'FEEDBACK_FORM_READY' | 'FEEDBACK_FORM_REQUIRES_REVIEW' | 'FEEDBACK_FORM_REJECTED_EMPTY' | 'FEEDBACK_FORM_REJECTED_CLOSED';

export type FeedbackQuestionConfig = {
  question_ref: string;
  label: string;
  question_type: FeedbackQuestionType;
  required: boolean;
  options?: readonly string[];
  min_rating?: number;
  max_rating?: number;
};

export type PostEventFeedbackFormInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  form_ref: string;
  source_record_ref: string;
  opened_at: string;
  closes_at?: string;
  evaluated_at: string;
  allow_anonymous_response: boolean;
  questions: readonly FeedbackQuestionConfig[];
  control_metadata?: Record<string, unknown>;
  form_persistence_requested?: boolean;
  response_collection_requested?: boolean;
  frontend_requested?: boolean;
  schema_mutation_requested?: boolean;
  crm_write_requested?: boolean;
};

export type PostEventFeedbackFormRuntimeReceipt = {
  seed_id: typeof PHASE_6C_POST_EVENT_FEEDBACK_FORM_SEED_ID;
  component_id: typeof PHASE_6C_POST_EVENT_FEEDBACK_FORM_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CPostEventFeedbackForm';
  event_name: typeof POST_EVENT_FEEDBACK_FORM_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  form_ref: string;
  source_record_ref: string;
  decision: FeedbackFormDecision;
  allow_anonymous_response: boolean;
  question_count: number;
  required_question_refs: readonly string[];
  scoring_question_refs: readonly string[];
  review_question_refs: readonly string[];
  rejection_reasons: readonly string[];
  opened_at: string;
  closes_at: string | null;
  evaluated_at: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for post_event_feedback_form runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for post_event_feedback_form runtime evaluation.');
  }
  return normalized;
}

function normalizeOptionalTimestamp(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  return requireTimestamp(value, field);
}

function rejectForbiddenRequests(input: PostEventFeedbackFormInput): void {
  const forbidden: Array<[keyof PostEventFeedbackFormInput, string]> = [
    ['form_persistence_requested', 'post_event_feedback_form must not persist forms.'],
    ['response_collection_requested', 'post_event_feedback_form must not collect responses.'],
    ['frontend_requested', 'post_event_feedback_form must not create frontend surfaces.'],
    ['schema_mutation_requested', 'post_event_feedback_form must not mutate schema.'],
    ['crm_write_requested', 'post_event_feedback_form must not write CRM records.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<PostEventFeedbackFormRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function evaluateQuestion(question: FeedbackQuestionConfig, index: number): { questionRef: string; required: boolean; scoring: boolean; reviewReasons: string[] } {
  const questionRef = requireNonEmpty(question.question_ref, 'questions[' + index + '].question_ref');
  const label = requireNonEmpty(question.label, 'questions[' + index + '].label');
  const reviewReasons: string[] = [];
  if (label.length < 4) {
    reviewReasons.push('question_label_too_short:' + questionRef);
  }
  if (question.question_type === 'rating') {
    const minRating = question.min_rating;
    const maxRating = question.max_rating;
    if (!Number.isInteger(minRating) || !Number.isInteger(maxRating) || minRating === undefined || maxRating === undefined || minRating < 0 || maxRating <= minRating) {
      reviewReasons.push('rating_range_invalid:' + questionRef);
    }
  }
  if ((question.question_type === 'single_choice' || question.question_type === 'multi_choice') && (!question.options || question.options.length < 2)) {
    reviewReasons.push('choice_options_required:' + questionRef);
  }
  if (question.options) {
    question.options.forEach((option, optionIndex) => requireNonEmpty(option, 'questions[' + index + '].options[' + optionIndex + ']'));
  }
  return { questionRef, required: question.required, scoring: question.question_type === 'rating', reviewReasons };
}

export function evaluatePostEventFeedbackForm(input: PostEventFeedbackFormInput): PostEventFeedbackFormRuntimeReceipt {
  rejectForbiddenRequests(input);

  const openedAt = requireTimestamp(input.opened_at, 'opened_at');
  const closesAt = normalizeOptionalTimestamp(input.closes_at, 'closes_at');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const required: string[] = [];
  const scoring: string[] = [];
  const review: string[] = [];
  const reasons: string[] = [];

  for (let index = 0; index < input.questions.length; index += 1) {
    const result = evaluateQuestion(input.questions[index], index);
    if (result.required) {
      required.push(result.questionRef);
    }
    if (result.scoring) {
      scoring.push(result.questionRef);
    }
    if (result.reviewReasons.length > 0) {
      review.push(result.questionRef);
      reasons.push(...result.reviewReasons);
    }
  }

  if (Date.parse(openedAt) > Date.parse(evaluatedAt)) {
    review.push('form_window');
    reasons.push('feedback_form_not_yet_open');
  }
  const closed = closesAt !== null && Date.parse(closesAt) < Date.parse(evaluatedAt);
  if (closed) {
    reasons.push('feedback_form_closed');
  }

  const decision: FeedbackFormDecision =
    input.questions.length === 0
      ? 'FEEDBACK_FORM_REJECTED_EMPTY'
      : closed
        ? 'FEEDBACK_FORM_REJECTED_CLOSED'
        : review.length > 0
          ? 'FEEDBACK_FORM_REQUIRES_REVIEW'
          : 'FEEDBACK_FORM_READY';

  const receiptWithoutDigest: Omit<PostEventFeedbackFormRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_POST_EVENT_FEEDBACK_FORM_SEED_ID,
    component_id: PHASE_6C_POST_EVENT_FEEDBACK_FORM_COMPONENT_ID,
    component_slug: 'events_check_in_and_post_event_service',
    model_name: 'Phase6CPostEventFeedbackForm',
    event_name: POST_EVENT_FEEDBACK_FORM_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_ref: requireNonEmpty(input.event_ref, 'event_ref'),
    form_ref: requireNonEmpty(input.form_ref, 'form_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    allow_anonymous_response: input.allow_anonymous_response,
    question_count: input.questions.length,
    required_question_refs: required,
    scoring_question_refs: scoring,
    review_question_refs: review,
    rejection_reasons: decision === 'FEEDBACK_FORM_REJECTED_EMPTY' ? ['feedback_questions_required'] : reasons,
    opened_at: openedAt,
    closes_at: closesAt,
    evaluated_at: evaluatedAt,
    decision_refs: ['6C-EVENT-CHECK-010', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012'],
    dependency_refs: ['seed_6a_service_manifest_contract', '6C.08'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
