export const PHASE_6C_TASK_STATUS_CONFIG_SEED_ID = "seed_6c_071_task_status_config" as const;
export const PHASE_6C_TASK_STATUS_CONFIG_COMPONENT_ID = "6C.06" as const;
export const TASK_STATUS_CONFIG_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.task_status_config.evaluated" as const;

export const taskStatusHardAnchors = ["OPEN", "IN_PROGRESS", "DONE"] as const;
export const taskStatusCategories = ["ENTRY", "ACTIVE", "BLOCKED", "TERMINAL"] as const;
export const taskStatusConfigDecisions = ["TASK_STATUS_CONFIG_READY", "TASK_STATUS_CONFIG_REQUIRES_REVIEW", "TASK_STATUS_CONFIG_REJECTED"] as const;

export type TaskStatusHardAnchor = (typeof taskStatusHardAnchors)[number];
export type TaskStatusCategory = (typeof taskStatusCategories)[number];
export type TaskStatusConfigDecision = (typeof taskStatusConfigDecisions)[number];

export type TaskStatusDefinitionInput = {
  status_key: string;
  label: string;
  category: TaskStatusCategory;
  sort_order: number;
  is_enabled: boolean;
  is_default?: boolean;
  hard_anchor?: TaskStatusHardAnchor;
  requires_reason?: boolean;
  allowed_next_status_keys?: readonly string[];
};

export type TaskStatusConfigInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  config_ref: string;
  allow_custom_status_labels: boolean;
  required_hard_anchors?: readonly TaskStatusHardAnchor[];
  statuses: readonly TaskStatusDefinitionInput[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  workflow_transition_requested?: boolean;
  notification_send_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedTaskStatusDefinition = {
  status_key: string;
  label: string;
  category: TaskStatusCategory;
  sort_order: number;
  is_enabled: boolean;
  is_default: boolean;
  hard_anchor: TaskStatusHardAnchor | null;
  requires_reason: boolean;
  allowed_next_status_keys: readonly string[];
};

export type TaskStatusConfigReceipt = {
  seed_id: typeof PHASE_6C_TASK_STATUS_CONFIG_SEED_ID;
  component_id: typeof PHASE_6C_TASK_STATUS_CONFIG_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CTaskStatusConfig";
  event_name: typeof TASK_STATUS_CONFIG_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  config_ref: string;
  decision: TaskStatusConfigDecision;
  allow_custom_status_labels: boolean;
  required_hard_anchors: readonly TaskStatusHardAnchor[];
  normalized_statuses: readonly NormalizedTaskStatusDefinition[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  evidence_artifacts: readonly string[];
  decision_refs: readonly string[];
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  workflow_transition_performed: false;
  notification_sent: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  task_status_config_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
