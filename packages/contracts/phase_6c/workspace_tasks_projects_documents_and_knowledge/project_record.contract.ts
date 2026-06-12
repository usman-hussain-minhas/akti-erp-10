export const PHASE_6C_PROJECT_RECORD_SEED_ID = "seed_6c_072_project_record" as const;
export const PHASE_6C_PROJECT_RECORD_COMPONENT_ID = "6C.06" as const;
export const PROJECT_RECORD_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.project_record.evaluated" as const;

export const projectRecordStatuses = ["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;
export const projectRecordPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export const projectRecordVisibilities = ["PRIVATE", "TEAM", "WORKSPACE"] as const;
export const projectRecordDecisions = ["PROJECT_RECORD_READY", "PROJECT_RECORD_REQUIRES_REVIEW", "PROJECT_RECORD_REJECTED"] as const;

export type ProjectRecordStatus = (typeof projectRecordStatuses)[number];
export type ProjectRecordPriority = (typeof projectRecordPriorities)[number];
export type ProjectRecordVisibility = (typeof projectRecordVisibilities)[number];
export type ProjectRecordDecision = (typeof projectRecordDecisions)[number];

export type ProjectMetadataEntryInput = {
  key: string;
  value: string;
  source_ref?: string;
};

export type ProjectRecordInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  project_ref: string;
  name: string;
  summary?: string;
  status: ProjectRecordStatus;
  priority: ProjectRecordPriority;
  visibility: ProjectRecordVisibility;
  owner_user_ref: string;
  sponsor_user_ref?: string;
  team_refs?: readonly string[];
  workspace_ref?: string;
  start_at?: string;
  target_end_at?: string;
  completed_at?: string;
  parent_project_ref?: string;
  dependency_refs?: readonly string[];
  budget_ref?: string;
  tags?: readonly string[];
  metadata_entries?: readonly ProjectMetadataEntryInput[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  dependency_graph_execution_requested?: boolean;
  gantt_view_requested?: boolean;
  notification_send_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedProjectMetadataEntry = {
  key: string;
  value: string;
  source_ref: string | null;
};

export type NormalizedProjectRecord = {
  project_ref: string;
  name: string;
  summary: string | null;
  status: ProjectRecordStatus;
  priority: ProjectRecordPriority;
  visibility: ProjectRecordVisibility;
  owner_user_ref: string;
  sponsor_user_ref: string | null;
  team_refs: readonly string[];
  workspace_ref: string | null;
  start_at: string | null;
  target_end_at: string | null;
  completed_at: string | null;
  parent_project_ref: string | null;
  dependency_refs: readonly string[];
  budget_ref: string | null;
  tags: readonly string[];
  metadata_entries: readonly NormalizedProjectMetadataEntry[];
};

export type ProjectRecordReceipt = {
  seed_id: typeof PHASE_6C_PROJECT_RECORD_SEED_ID;
  component_id: typeof PHASE_6C_PROJECT_RECORD_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CProjectRecord";
  event_name: typeof PROJECT_RECORD_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  decision: ProjectRecordDecision;
  normalized_project: NormalizedProjectRecord;
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  evidence_artifacts: readonly string[];
  decision_refs: readonly string[];
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  dependency_graph_executed: false;
  gantt_view_rendered: false;
  notification_sent: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  project_record_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
