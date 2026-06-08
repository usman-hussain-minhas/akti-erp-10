export const PHASE_6B_FOLLOW_UP_TASK_CADENCE_SEED_ID = 'seed_6b_08_follow_up_task_cadence' as const;
export const PHASE_6B_FOLLOW_UP_TASK_CADENCE_COMPONENT_ID = '6B.08' as const;

export const FOLLOW_UP_TASK_CADENCE_EVENT = 'phase_6b.crm_scoring_reporting.follow_up_task_cadence.planned' as const;

export type FollowUpTaskCadenceLifecycleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type FollowUpTaskChannel = 'TASK_ONLY' | 'WHATSAPP_TEMPLATE_REMINDER' | 'EMAIL_TASK_REFERENCE';
export type FollowUpTaskPriority = 'LOW' | 'NORMAL' | 'HIGH';

export type FollowUpCadenceStep = {
  step_id: string;
  step_order: number;
  offset_minutes_after_anchor: number;
  task_title: string;
  task_priority: FollowUpTaskPriority;
  channel: FollowUpTaskChannel;
  evidence_label: string;
  active: boolean;
};

export type FollowUpTaskCadenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  cadence_id: string;
  lead_record_ref: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  anchor_at: string;
  lifecycle_status: FollowUpTaskCadenceLifecycleStatus;
  cadence_steps: FollowUpCadenceStep[];
  configured_by_user_id: string;
  configured_at: string;
  scheduler_execution_requested?: boolean;
  communication_send_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PlannedFollowUpTask = {
  task_id: string;
  step_id: string;
  due_at: string;
  task_title: string;
  task_priority: FollowUpTaskPriority;
  channel: FollowUpTaskChannel;
  evidence_label: string;
};

export type FollowUpTaskCadenceReceipt = {
  seed_id: typeof PHASE_6B_FOLLOW_UP_TASK_CADENCE_SEED_ID;
  component_id: typeof PHASE_6B_FOLLOW_UP_TASK_CADENCE_COMPONENT_ID;
  event_name: typeof FOLLOW_UP_TASK_CADENCE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  cadence_id: string;
  lead_record_ref: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  anchor_at: string;
  lifecycle_status: FollowUpTaskCadenceLifecycleStatus;
  planned_tasks: PlannedFollowUpTask[];
  active_step_count: number;
  scheduler_execution_allowed: false;
  communication_send_allowed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};
