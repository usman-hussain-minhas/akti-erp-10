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

const AUDIT_REASONS: readonly StageHistoryAuditReason[] = [
  'PIPELINE_ADVANCEMENT',
  'PIPELINE_REGRESSION',
  'DEDUP_REVIEW',
  'OPERATOR_CORRECTION',
  'WORKFLOW_RULE_EVIDENCE',
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for stage history audit.`);
  }
  return value.trim();
}

function requireChangedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'changed_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('changed_at must be a valid ISO-compatible timestamp for stage history audit.');
  }
  return normalized;
}

function normalizeAuditReason(value: StageHistoryAuditReason): StageHistoryAuditReason {
  if (!AUDIT_REASONS.includes(value)) {
    throw new Error('transition_reason is not supported for stage history audit.');
  }
  return value;
}

function normalizeEvidenceRefs(evidenceRefs: string[]): readonly string[] {
  if (!Array.isArray(evidenceRefs) || evidenceRefs.length === 0) {
    throw new Error('evidence_refs must contain at least one evidence reference for stage history audit.');
  }
  const normalized = evidenceRefs.map((evidenceRef, index) => requireNonEmpty(evidenceRef, `evidence_refs.${index}`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('evidence_refs must not contain duplicate references for stage history audit.');
  }
  return Object.freeze(normalized);
}

export function recordStageHistoryAudit(input: StageHistoryAuditInput): StageHistoryAuditReceipt {
  if (input.stage_movement_execution_requested === true) {
    throw new Error('stage history audit must not execute stage movement.');
  }
  if (input.timeline_entry_mutation_requested === true) {
    throw new Error('stage history audit must not mutate timeline entries.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('stage history audit must not perform irreversible actions.');
  }

  const previousStageKey = requireNonEmpty(input.previous_stage_key, 'previous_stage_key');
  const nextStageKey = requireNonEmpty(input.next_stage_key, 'next_stage_key');
  if (previousStageKey === nextStageKey) {
    throw new Error('previous_stage_key and next_stage_key must differ for stage history audit.');
  }

  const evidenceRefs = normalizeEvidenceRefs(input.evidence_refs);

  return {
    seed_id: PHASE_6B_STAGE_HISTORY_AUDIT_SEED_ID,
    component_id: PHASE_6B_STAGE_HISTORY_AUDIT_COMPONENT_ID,
    event_name: STAGE_HISTORY_AUDIT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    stage_history_audit_id: requireNonEmpty(input.stage_history_audit_id, 'stage_history_audit_id'),
    lead_record_id: requireNonEmpty(input.lead_record_id, 'lead_record_id'),
    lead_record_authority_id: requireNonEmpty(input.lead_record_authority_id, 'lead_record_authority_id'),
    match_candidate_generation_ref: requireNonEmpty(input.match_candidate_generation_ref, 'match_candidate_generation_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    workflow_node_ref: requireNonEmpty(input.workflow_node_ref, 'workflow_node_ref'),
    previous_stage_key: previousStageKey,
    next_stage_key: nextStageKey,
    transition_reason: normalizeAuditReason(input.transition_reason),
    transition_evidence_ref: requireNonEmpty(input.transition_evidence_ref, 'transition_evidence_ref'),
    changed_by_user_id: requireNonEmpty(input.changed_by_user_id, 'changed_by_user_id'),
    changed_at: requireChangedAt(input.changed_at),
    evidence_refs: evidenceRefs,
    evidence_count: evidenceRefs.length,
    append_only_audit_log_enforced: true,
    stage_transition_evidence_recorded: true,
    stage_movement_execution_allowed: false,
    timeline_entry_mutation_allowed: false,
    irreversible_action_allowed: false,
  };
}
