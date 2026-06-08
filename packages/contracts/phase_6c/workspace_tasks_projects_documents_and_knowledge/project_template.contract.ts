export const PHASE_6C_PROJECT_TEMPLATE_SEED_ID = "seed_6c_080_project_template" as const;
export const PHASE_6C_PROJECT_TEMPLATE_COMPONENT_ID = "6C.06" as const;
export const PROJECT_TEMPLATE_SCAFFOLD_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.project_template.scaffold_control_evaluated" as const;

export type ProjectTemplateScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type ProjectTemplateScaffoldReceipt = {
  seed_id: typeof PHASE_6C_PROJECT_TEMPLATE_SEED_ID;
  component_id: typeof PHASE_6C_PROJECT_TEMPLATE_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CProjectTemplate";
  event_name: typeof PROJECT_TEMPLATE_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
