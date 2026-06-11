export const PHASE_6C_MESSAGE_EDIT_HISTORY_SEED_ID = "seed_6c_059_message_edit_history" as const;
export const PHASE_6C_MESSAGE_EDIT_HISTORY_COMPONENT_ID = "6C.05" as const;
export const MESSAGE_EDIT_HISTORY_EVALUATED_EVENT = "phase_6c.workspace_messaging_and_collaboration.message_edit_history.evaluated" as const;

export type MessageEditHistoryReason = "TYPO" | "CLARIFICATION" | "COMPLIANCE_REDACTION" | "ATTACHMENT_CORRECTION";
export type MessageEditHistoryDecision = "EDIT_HISTORY_ACCEPTED" | "EDIT_HISTORY_BLOCKED" | "EDIT_HISTORY_REQUIRES_REVIEW";

export type MessageEditHistoryEntryInput = {
  edit_ref: string;
  editor_user_ref: string;
  edited_at: string;
  previous_body_hash: string;
  new_body: string;
  edit_reason: MessageEditHistoryReason;
  compliance_review_ref?: string;
  evidence_refs: string[];
};

export type MessageEditHistoryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  original_author_user_ref: string;
  original_body_hash: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  edits: MessageEditHistoryEntryInput[];
  content_overwrite_requested?: boolean;
  history_delete_requested?: boolean;
  realtime_delivery_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type MessageEditHistoryPreparedEntry = {
  edit_index: number;
  edit_ref: string;
  editor_user_ref: string;
  edited_at: string;
  previous_body_hash: string;
  new_body_hash: string;
  body_length: number;
  edit_reason: MessageEditHistoryReason;
  compliance_review_ref: string | null;
  evidence_refs: string[];
};

export type MessageEditHistoryReceipt = {
  seed_id: typeof PHASE_6C_MESSAGE_EDIT_HISTORY_SEED_ID;
  component_id: typeof PHASE_6C_MESSAGE_EDIT_HISTORY_COMPONENT_ID;
  component_slug: "workspace_messaging_and_collaboration";
  model_name: "Phase6CMessageEditHistory";
  event_name: typeof MESSAGE_EDIT_HISTORY_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  original_author_user_ref: string;
  original_body_hash: string;
  latest_body_hash: string;
  edit_count: number;
  compliance_redaction_count: number;
  decision: MessageEditHistoryDecision;
  blockers: readonly string[];
  review_reasons: readonly string[];
  edit_chain: MessageEditHistoryPreparedEntry[];
  content_overwrite_performed: false;
  history_delete_performed: false;
  realtime_delivery_performed: false;
  event_dispatch_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  runtime_adapter_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  edit_history_evidence_digest: string;
};
