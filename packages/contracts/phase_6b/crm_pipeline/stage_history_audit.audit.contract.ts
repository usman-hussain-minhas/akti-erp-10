export const PHASE_6B_STAGE_HISTORY_AUDIT_SEED_ID = 'seed_6b_06_stage_history_audit' as const;
export const PHASE_6B_STAGE_HISTORY_AUDIT_COMPONENT_ID = '6B.06' as const;

export const STAGE_HISTORY_AUDIT_EVENT = 'phase_6b.crm_pipeline.stage_history_audit.recorded' as const;

export type StageHistoryAuditReason = 'PIPELINE_ADVANCEMENT' | 'PIPELINE_REGRESSION' | 'DEDUP_REVIEW' | 'OPERATOR_CORRECTION' | 'WORKFLOW_RULE_EVIDENCE';

export type StageHistoryAuditInput = {
  organization_id: string;
  stage_history_audit_id: string;
  lead_record_id: string;
  lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  workflow_node_ref: string;
  previous_stage_key: string;
  next_stage_key: string;
  transition_reason: StageHistoryAuditReason;
  transition_evidence_ref: string;
  changed_by_user_id: string;
  changed_at: string;
  evidence_refs: string[];
  stage_movement_execution_requested?: boolean;
  timeline_entry_mutation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type StageHistoryAuditReceipt = {
  seed_id: typeof PHASE_6B_STAGE_HISTORY_AUDIT_SEED_ID;
  component_id: typeof PHASE_6B_STAGE_HISTORY_AUDIT_COMPONENT_ID;
  event_name: typeof STAGE_HISTORY_AUDIT_EVENT;
  organization_id: string;
  stage_history_audit_id: string;
  lead_record_id: string;
  lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  workflow_node_ref: string;
  previous_stage_key: string;
  next_stage_key: string;
  transition_reason: StageHistoryAuditReason;
  transition_evidence_ref: string;
  changed_by_user_id: string;
  changed_at: string;
  evidence_refs: readonly string[];
  evidence_count: number;
  append_only_audit_log_enforced: true;
  stage_transition_evidence_recorded: true;
  stage_movement_execution_allowed: false;
  timeline_entry_mutation_allowed: false;
  irreversible_action_allowed: false;
};
