export const PHASE_6C_PROJECT_TEMPLATE_SEED_ID = 'seed_6c_080_project_template' as const;
export const PHASE_6C_PROJECT_TEMPLATE_COMPONENT_ID = '6C.06' as const;
export const PROJECT_TEMPLATE_RUNTIME_EVENT = 'phase_6c.workspace_tasks_projects_documents_and_knowledge.project_template.runtime_evaluated' as const;

export type ProjectTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ProjectTemplateVisibility = 'PRIVATE' | 'TEAM' | 'ORGANIZATION';
export type ProjectTemplateVariableType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT';

export type ProjectTemplateVariableDefinition = {
  key: string;
  label: string;
  type: ProjectTemplateVariableType;
  required?: boolean;
  options?: readonly string[];
  default_value?: string | number | boolean;
};

export type ProjectTemplatePhaseBlueprint = {
  phase_key: string;
  name: string;
  order: number;
};

export type ProjectTemplateTaskBlueprint = {
  task_key: string;
  title: string;
  phase_key?: string;
  order: number;
  estimated_minutes?: number;
  depends_on_task_keys?: readonly string[];
  assignee_role_ref?: string;
  required_variable_keys?: readonly string[];
};

export type ProjectTemplateInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  template_ref: string;
  template_name: string;
  version: number;
  status: ProjectTemplateStatus;
  visibility: ProjectTemplateVisibility;
  authored_by_user_id: string;
  authored_at: string;
  phases: readonly ProjectTemplatePhaseBlueprint[];
  task_blueprints: readonly ProjectTemplateTaskBlueprint[];
  variable_definitions?: readonly ProjectTemplateVariableDefinition[];
  source_project_ref?: string;
  workspace_collaboration_surface_active?: boolean;
  collaboration_context_ref?: string;
  metadata?: Record<string, unknown>;
  hardcoded_template_requested?: boolean;
  platform_default_template_requested?: boolean;
  project_creation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

export type ProjectTemplateTaskPreview = {
  task_key: string;
  title: string;
  phase_key?: string;
  order: number;
  estimated_minutes: number;
  depends_on_task_keys: readonly string[];
  assignee_role_ref?: string;
  required_variable_keys: readonly string[];
};

export type ProjectTemplateReceipt = {
  seed_id: typeof PHASE_6C_PROJECT_TEMPLATE_SEED_ID;
  component_id: typeof PHASE_6C_PROJECT_TEMPLATE_COMPONENT_ID;
  component_slug: 'workspace_tasks_projects_documents_and_knowledge';
  model_name: 'Phase6CProjectTemplate';
  event_name: typeof PROJECT_TEMPLATE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  template_ref: string;
  template_name: string;
  version: number;
  status: ProjectTemplateStatus;
  visibility: ProjectTemplateVisibility;
  authored_by_user_id: string;
  authored_at: string;
  tenant_authored: true;
  source_project_ref?: string;
  workspace_collaboration_surface_active: boolean;
  collaboration_context_ref?: string;
  phase_count: number;
  task_count: number;
  variable_count: number;
  estimated_total_minutes: number;
  phases: readonly ProjectTemplatePhaseBlueprint[];
  task_preview: readonly ProjectTemplateTaskPreview[];
  variable_definitions: readonly ProjectTemplateVariableDefinition[];
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
