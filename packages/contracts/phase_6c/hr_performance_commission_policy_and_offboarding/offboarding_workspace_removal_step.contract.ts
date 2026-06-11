export const PHASE_6C_OFFBOARDING_WORKSPACE_REMOVAL_STEP_SEED_ID = "seed_6c_054_offboarding_workspace_removal_step" as const;
export const PHASE_6C_OFFBOARDING_WORKSPACE_REMOVAL_STEP_COMPONENT_ID = "6C.04" as const;
export const OFFBOARDING_WORKSPACE_REMOVAL_STEP_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_workspace_removal_step.evaluated" as const;

export type OffboardingWorkspaceRemovalSurface =
  | "DIRECTORY_ACCOUNT"
  | "EMAIL_ACCOUNT"
  | "CHAT_ACCOUNT"
  | "PROJECT_WORKSPACE"
  | "STORAGE_DRIVE"
  | "VPN_ACCESS"
  | "DEVICE_MDM"
  | "SSO_SESSION"
  | "OTHER";

export type OffboardingWorkspaceRemovalAction =
  | "DISABLE_ACCOUNT"
  | "REVOKE_ACCESS"
  | "TRANSFER_OWNERSHIP"
  | "ARCHIVE_CONTENT"
  | "ROTATE_SECRET"
  | "REMOVE_GROUP_MEMBERSHIP";

export type OffboardingWorkspaceRemovalRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OffboardingWorkspaceRemovalDisposition =
  | "READY_FOR_REMOVAL"
  | "OWNER_TRANSFER_REQUIRED"
  | "EVIDENCE_REQUIRED"
  | "REVIEW_REQUIRED";

export type OffboardingWorkspaceRemovalDecision =
  | "WORKSPACE_REMOVAL_READY"
  | "WORKSPACE_REMOVAL_BLOCKED_FOR_TRANSFER"
  | "WORKSPACE_REMOVAL_BLOCKED_FOR_EVIDENCE"
  | "WORKSPACE_REMOVAL_REQUIRES_REVIEW";

export type OffboardingWorkspaceRemovalTaskInput = {
  workspace_ref: string;
  surface: OffboardingWorkspaceRemovalSurface;
  action: OffboardingWorkspaceRemovalAction;
  risk: OffboardingWorkspaceRemovalRisk;
  current_owner_ref?: string;
  target_owner_ref?: string;
  owner_transfer_required?: boolean;
  evidence_ready?: boolean;
  legal_hold_active?: boolean;
  removal_due_at: string;
  evidence_refs: string[];
  removal_note?: string;
};

export type OffboardingWorkspaceRemovalStepInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  tasks: OffboardingWorkspaceRemovalTaskInput[];
  access_mutation_requested?: boolean;
  account_disable_requested?: boolean;
  event_dispatch_requested?: boolean;
  dlq_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OffboardingWorkspaceRemovalPreparedTask = {
  task_index: number;
  workspace_ref: string;
  surface: OffboardingWorkspaceRemovalSurface;
  action: OffboardingWorkspaceRemovalAction;
  risk: OffboardingWorkspaceRemovalRisk;
  disposition: OffboardingWorkspaceRemovalDisposition;
  removal_due_at: string;
  overdue: boolean;
  current_owner_ref: string | null;
  target_owner_ref: string | null;
  owner_transfer_required: boolean;
  evidence_ready: boolean;
  legal_hold_active: boolean;
  manual_review_required: boolean;
  evidence_refs: string[];
  reason: string;
};

export type OffboardingWorkspaceRemovalStepReceipt = {
  seed_id: typeof PHASE_6C_OFFBOARDING_WORKSPACE_REMOVAL_STEP_SEED_ID;
  component_id: typeof PHASE_6C_OFFBOARDING_WORKSPACE_REMOVAL_STEP_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6COffboardingWorkspaceRemovalStep";
  event_name: typeof OFFBOARDING_WORKSPACE_REMOVAL_STEP_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  task_count: number;
  ready_count: number;
  transfer_blocked_count: number;
  evidence_blocked_count: number;
  review_required_count: number;
  overdue_count: number;
  high_risk_count: number;
  decision: OffboardingWorkspaceRemovalDecision;
  prepared_tasks: OffboardingWorkspaceRemovalPreparedTask[];
  access_mutation_performed: false;
  account_disable_performed: false;
  event_dispatch_performed: false;
  dlq_write_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  runtime_adapter_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  workspace_removal_evidence_digest: string;
};
