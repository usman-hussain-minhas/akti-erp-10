export const PHASE_6B_CRM_ACTIVITY_TIMELINE_SEED_ID = 'seed_6b_06_crm_activity_timeline' as const;
export const PHASE_6B_CRM_ACTIVITY_TIMELINE_COMPONENT_ID = '6B.06' as const;

export const CRM_ACTIVITY_TIMELINE_EVENT = 'phase_6b.crm_pipeline.crm_activity_timeline.recorded' as const;

export type CrmActivityTimelineType =
  | 'LEAD_INTAKE_ACTIVITY'
  | 'DEDUP_MATCH_ACTIVITY'
  | 'PIPELINE_STAGE_ACTIVITY'
  | 'CUSTOMER_INTERACTION_ACTIVITY'
  | 'SYSTEM_EVIDENCE_ACTIVITY';

export type CrmActivityTimelineDirection = 'INBOUND' | 'OUTBOUND_EVIDENCE_ONLY' | 'INTERNAL' | 'SYSTEM';

export type CrmActivityTimelineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  timeline_entry_id: string;
  lead_record_id: string;
  lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  activity_type: CrmActivityTimelineType;
  activity_direction: CrmActivityTimelineDirection;
  activity_title: string;
  occurred_at: string;
  recorded_at: string;
  recorded_by_user_id: string;
  timeline_order: number;
  pipeline_stage_key?: string;
  workflow_node_ref?: string;
  source_event_ref: string;
  evidence_refs: string[];
  note_creation_requested?: boolean;
  stage_history_mutation_requested?: boolean;
  communication_send_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type CrmActivityTimelineReceipt = {
  seed_id: typeof PHASE_6B_CRM_ACTIVITY_TIMELINE_SEED_ID;
  component_id: typeof PHASE_6B_CRM_ACTIVITY_TIMELINE_COMPONENT_ID;
  event_name: typeof CRM_ACTIVITY_TIMELINE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  timeline_entry_id: string;
  lead_record_id: string;
  lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  activity_type: CrmActivityTimelineType;
  activity_direction: CrmActivityTimelineDirection;
  activity_title: string;
  occurred_at: string;
  recorded_at: string;
  recorded_by_user_id: string;
  timeline_order: number;
  pipeline_stage_key?: string;
  workflow_node_ref?: string;
  source_event_ref: string;
  evidence_refs: readonly string[];
  evidence_count: number;
  activation_lifecycle_required: true;
  timeline_evidence_recorded: true;
  note_creation_allowed: false;
  stage_history_mutation_allowed: false;
  communication_send_allowed: false;
  irreversible_action_allowed: false;
};

const ACTIVITY_TYPES: readonly CrmActivityTimelineType[] = [
  'LEAD_INTAKE_ACTIVITY',
  'DEDUP_MATCH_ACTIVITY',
  'PIPELINE_STAGE_ACTIVITY',
  'CUSTOMER_INTERACTION_ACTIVITY',
  'SYSTEM_EVIDENCE_ACTIVITY',
] as const;

const ACTIVITY_DIRECTIONS: readonly CrmActivityTimelineDirection[] = ['INBOUND', 'OUTBOUND_EVIDENCE_ONLY', 'INTERNAL', 'SYSTEM'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for crm activity timeline.`);
  }
  return value.trim();
}

function normalizeOptional(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for crm activity timeline.`);
  }
  return normalized;
}

function normalizeActivityType(value: CrmActivityTimelineType): CrmActivityTimelineType {
  if (!ACTIVITY_TYPES.includes(value)) {
    throw new Error('activity_type is not supported for crm activity timeline.');
  }
  return value;
}

function normalizeActivityDirection(value: CrmActivityTimelineDirection): CrmActivityTimelineDirection {
  if (!ACTIVITY_DIRECTIONS.includes(value)) {
    throw new Error('activity_direction is not supported for crm activity timeline.');
  }
  return value;
}

function requireTimelineOrder(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('timeline_order must be a positive integer for crm activity timeline.');
  }
  return value;
}

function normalizeEvidenceRefs(evidenceRefs: string[]): readonly string[] {
  if (!Array.isArray(evidenceRefs) || evidenceRefs.length === 0) {
    throw new Error('evidence_refs must contain at least one evidence reference for crm activity timeline.');
  }
  const normalized = evidenceRefs.map((evidenceRef, index) => requireNonEmpty(evidenceRef, `evidence_refs.${index}`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('evidence_refs must not contain duplicate references for crm activity timeline.');
  }
  return Object.freeze(normalized);
}

export function recordCrmActivityTimeline(input: CrmActivityTimelineInput): CrmActivityTimelineReceipt {
  if (input.note_creation_requested === true) {
    throw new Error('crm activity timeline must not create notes.');
  }
  if (input.stage_history_mutation_requested === true) {
    throw new Error('crm activity timeline must not mutate stage history.');
  }
  if (input.communication_send_requested === true) {
    throw new Error('crm activity timeline must not send communications.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('crm activity timeline must not perform irreversible actions.');
  }

  const evidenceRefs = normalizeEvidenceRefs(input.evidence_refs);

  return {
    seed_id: PHASE_6B_CRM_ACTIVITY_TIMELINE_SEED_ID,
    component_id: PHASE_6B_CRM_ACTIVITY_TIMELINE_COMPONENT_ID,
    event_name: CRM_ACTIVITY_TIMELINE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    timeline_entry_id: requireNonEmpty(input.timeline_entry_id, 'timeline_entry_id'),
    lead_record_id: requireNonEmpty(input.lead_record_id, 'lead_record_id'),
    lead_record_authority_id: requireNonEmpty(input.lead_record_authority_id, 'lead_record_authority_id'),
    match_candidate_generation_ref: requireNonEmpty(input.match_candidate_generation_ref, 'match_candidate_generation_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    activity_type: normalizeActivityType(input.activity_type),
    activity_direction: normalizeActivityDirection(input.activity_direction),
    activity_title: requireNonEmpty(input.activity_title, 'activity_title'),
    occurred_at: requireTimestamp(input.occurred_at, 'occurred_at'),
    recorded_at: requireTimestamp(input.recorded_at, 'recorded_at'),
    recorded_by_user_id: requireNonEmpty(input.recorded_by_user_id, 'recorded_by_user_id'),
    timeline_order: requireTimelineOrder(input.timeline_order),
    pipeline_stage_key: normalizeOptional(input.pipeline_stage_key, 'pipeline_stage_key'),
    workflow_node_ref: normalizeOptional(input.workflow_node_ref, 'workflow_node_ref'),
    source_event_ref: requireNonEmpty(input.source_event_ref, 'source_event_ref'),
    evidence_refs: evidenceRefs,
    evidence_count: evidenceRefs.length,
    activation_lifecycle_required: true,
    timeline_evidence_recorded: true,
    note_creation_allowed: false,
    stage_history_mutation_allowed: false,
    communication_send_allowed: false,
    irreversible_action_allowed: false,
  };
}
