export const PHASE_6C_ONBOARDING_TASK_TEMPLATE_SEED_ID = 'seed_6c_017_onboarding_task_template' as const;
export const PHASE_6C_ONBOARDING_TASK_TEMPLATE_COMPONENT_ID = '6C.02' as const;
export const ONBOARDING_TASK_TEMPLATE_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.onboarding_task_template.validated' as const;

export type OnboardingTaskTemplateTaskType = 'DOCUMENT' | 'ACCESS' | 'TRAINING' | 'MEETING' | 'CHECKLIST' | 'EQUIPMENT';
export type OnboardingTaskTemplateDueAnchor = 'ACCEPTANCE_DATE' | 'START_DATE';

export type OnboardingTaskTemplateTask = {
  task_code: string;
  title: string;
  task_type: OnboardingTaskTemplateTaskType;
  order: number;
  due_anchor: OnboardingTaskTemplateDueAnchor;
  due_offset_days: number;
  assignee_role_ref: string;
  required: boolean;
  evidence_required: boolean;
  depends_on_task_codes?: readonly string[];
};

export type OnboardingTaskTemplateInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  template_ref: string;
  template_label: string;
  template_version: string;
  employment_type: string;
  department_ref?: string;
  configured_by_user_id: string;
  evaluated_at: string;
  tasks: readonly OnboardingTaskTemplateTask[];
  control_metadata?: Record<string, unknown>;
  hardcoded_template_requested?: boolean;
  task_instantiation_requested?: boolean;
  workspace_task_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OnboardingTaskTemplateNormalizedTask = {
  task_code: string;
  order: number;
  task_type: OnboardingTaskTemplateTaskType;
  due_anchor: OnboardingTaskTemplateDueAnchor;
  due_offset_days: number;
  assignee_role_ref: string;
  required: boolean;
  evidence_required: boolean;
  depends_on_task_codes: readonly string[];
};

export type OnboardingTaskTemplateReceipt = {
  seed_id: typeof PHASE_6C_ONBOARDING_TASK_TEMPLATE_SEED_ID;
  component_id: typeof PHASE_6C_ONBOARDING_TASK_TEMPLATE_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6COnboardingTaskTemplate';
  event_name: typeof ONBOARDING_TASK_TEMPLATE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'ONBOARDING_TASK_TEMPLATE_READY';
  template_ref: string;
  template_version: string;
  configurable_templates_required: true;
  hardcoded_template_allowed: false;
  task_instantiation_executed: false;
  workspace_task_mutation_allowed: false;
  task_count: number;
  required_task_count: number;
  evidence_required_task_count: number;
  normalized_tasks: readonly OnboardingTaskTemplateNormalizedTask[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  configured_by_user_id: string;
  evaluated_at: string;
  onboarding_task_template_evidence_digest: string;
};
