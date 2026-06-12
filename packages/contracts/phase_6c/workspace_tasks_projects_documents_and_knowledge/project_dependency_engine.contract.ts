export const PHASE_6C_PROJECT_DEPENDENCY_ENGINE_SEED_ID = "seed_6c_073_project_dependency_engine" as const;
export const PHASE_6C_PROJECT_DEPENDENCY_ENGINE_COMPONENT_ID = "6C.06" as const;
export const PROJECT_DEPENDENCY_ENGINE_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.project_dependency_engine.evaluated" as const;

export const projectDependencyTypes = ["FINISH_TO_START", "START_TO_START", "FINISH_TO_FINISH", "BLOCKS"] as const;
export const projectDependencyEngineDecisions = ["PROJECT_DEPENDENCY_GRAPH_READY", "PROJECT_DEPENDENCY_GRAPH_REQUIRES_REVIEW", "PROJECT_DEPENDENCY_GRAPH_REJECTED"] as const;

export type ProjectDependencyType = (typeof projectDependencyTypes)[number];
export type ProjectDependencyEngineDecision = (typeof projectDependencyEngineDecisions)[number];

export type ProjectDependencyNodeInput = {
  project_ref: string;
  label?: string;
  is_active?: boolean;
};

export type ProjectDependencyEdgeInput = {
  dependency_ref: string;
  source_project_ref: string;
  target_project_ref: string;
  dependency_type: ProjectDependencyType;
  lag_days?: number;
  is_blocking?: boolean;
};

export type ProjectDependencyEngineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  graph_ref: string;
  nodes: readonly ProjectDependencyNodeInput[];
  dependencies: readonly ProjectDependencyEdgeInput[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  gantt_view_requested?: boolean;
  frontend_publication_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  notification_send_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedProjectDependencyNode = {
  project_ref: string;
  label: string | null;
  is_active: boolean;
};

export type NormalizedProjectDependencyEdge = {
  dependency_ref: string;
  source_project_ref: string;
  target_project_ref: string;
  dependency_type: ProjectDependencyType;
  lag_days: number;
  is_blocking: boolean;
};

export type ProjectDependencyEngineReceipt = {
  seed_id: typeof PHASE_6C_PROJECT_DEPENDENCY_ENGINE_SEED_ID;
  component_id: typeof PHASE_6C_PROJECT_DEPENDENCY_ENGINE_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CProjectDependencyEngine";
  event_name: typeof PROJECT_DEPENDENCY_ENGINE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  graph_ref: string;
  decision: ProjectDependencyEngineDecision;
  normalized_nodes: readonly NormalizedProjectDependencyNode[];
  normalized_dependencies: readonly NormalizedProjectDependencyEdge[];
  topological_order: readonly string[];
  dependency_depth_by_project: Readonly<Record<string, number>>;
  cycle_paths: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  evidence_artifacts: readonly string[];
  decision_refs: readonly string[];
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  gantt_view_rendered: false;
  frontend_publication_performed: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  notification_sent: false;
  ticket_flags_changed: false;
  project_dependency_engine_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
