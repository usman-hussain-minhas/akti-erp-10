export const PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_SEED_ID = "seed_6c_060_message_tombstone_staged_deletion" as const;
export const PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_COMPONENT_ID = "6C.05" as const;
export const MESSAGE_TOMBSTONE_STAGED_DELETION_EVALUATED_EVENT = "phase_6c.workspace_messaging_and_collaboration.message_tombstone_staged_deletion.evaluated" as const;

export type MessageTombstoneDeletionReason = "USER_REQUEST" | "MODERATION" | "RETENTION_POLICY" | "COMPLIANCE_REDACTION";
export type MessageTombstoneDeletionDecision =
  | "TOMBSTONE_READY"
  | "STAGED_DELETION_READY"
  | "HUMAN_APPROVAL_REQUIRED"
  | "DELETION_BLOCKED";

export type MessageTombstoneStagedDeletionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  requested_by_user_ref: string;
  deletion_reason: MessageTombstoneDeletionReason;
  message_created_at: string;
  retention_until: string;
  purge_not_before: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  legal_hold_active?: boolean;
  approval_required?: boolean;
  approval_ref?: string;
  evidence_refs: string[];
  tombstone_mutation_requested?: boolean;
  physical_delete_requested?: boolean;
  purge_execution_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type MessageTombstoneStagedDeletionReceipt = {
  seed_id: typeof PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_SEED_ID;
  component_id: typeof PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_COMPONENT_ID;
  component_slug: "workspace_messaging_and_collaboration";
  model_name: "Phase6CMessageTombstoneStagedDeletion";
  event_name: typeof MESSAGE_TOMBSTONE_STAGED_DELETION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  requested_by_user_ref: string;
  deletion_reason: MessageTombstoneDeletionReason;
  message_created_at: string;
  retention_until: string;
  purge_not_before: string;
  legal_hold_active: boolean;
  approval_ref: string | null;
  purge_window_open: boolean;
  retention_satisfied: boolean;
  decision: MessageTombstoneDeletionDecision;
  blockers: readonly string[];
  review_reasons: readonly string[];
  evidence_refs: string[];
  tombstone_plan_created: true;
  staged_deletion_plan_created: boolean;
  tombstone_mutation_performed: false;
  physical_delete_performed: false;
  purge_execution_performed: false;
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
  tombstone_evidence_digest: string;
};
