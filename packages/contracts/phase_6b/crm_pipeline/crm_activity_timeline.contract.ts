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
