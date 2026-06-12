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
