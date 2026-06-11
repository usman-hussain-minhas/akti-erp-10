import { createHash } from 'node:crypto';

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

const ALLOWED_SURFACES: readonly OffboardingWorkspaceRemovalSurface[] = [
  "DIRECTORY_ACCOUNT",
  "EMAIL_ACCOUNT",
  "CHAT_ACCOUNT",
  "PROJECT_WORKSPACE",
  "STORAGE_DRIVE",
  "VPN_ACCESS",
  "DEVICE_MDM",
  "SSO_SESSION",
  "OTHER",
] as const;

const ALLOWED_ACTIONS: readonly OffboardingWorkspaceRemovalAction[] = [
  "DISABLE_ACCOUNT",
  "REVOKE_ACCESS",
  "TRANSFER_OWNERSHIP",
  "ARCHIVE_CONTENT",
  "ROTATE_SECRET",
  "REMOVE_GROUP_MEMBERSHIP",
] as const;

const ALLOWED_RISKS: readonly OffboardingWorkspaceRemovalRisk[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offboarding_workspace_removal_step.');
  }
  return value.trim();
}

function requireOptionalNonEmpty(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offboarding_workspace_removal_step.');
  }
  return normalized;
}

function requireEvidenceRefs(value: string[] | undefined, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(field + ' must include at least one evidence reference for offboarding_workspace_removal_step.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, field + '[' + index + ']'));
  return Array.from(new Set(refs)).sort();
}

function requireSurface(value: OffboardingWorkspaceRemovalSurface): OffboardingWorkspaceRemovalSurface {
  if (!ALLOWED_SURFACES.includes(value)) {
    throw new Error('surface must be a supported workspace removal surface.');
  }
  return value;
}

function requireAction(value: OffboardingWorkspaceRemovalAction): OffboardingWorkspaceRemovalAction {
  if (!ALLOWED_ACTIONS.includes(value)) {
    throw new Error('action must be a supported workspace removal action.');
  }
  return value;
}

function requireRisk(value: OffboardingWorkspaceRemovalRisk): OffboardingWorkspaceRemovalRisk {
  if (!ALLOWED_RISKS.includes(value)) {
    throw new Error('risk must be LOW, MEDIUM, HIGH, or CRITICAL.');
  }
  return value;
}

function rejectForbiddenMutation(input: OffboardingWorkspaceRemovalStepInput): void {
  const forbidden: Array<[keyof OffboardingWorkspaceRemovalStepInput, string]> = [
    ['access_mutation_requested', 'access mutation'],
    ['account_disable_requested', 'account disable execution'],
    ['event_dispatch_requested', 'event dispatch'],
    ['dlq_write_requested', 'DLQ write'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbidden) {
    if (input[field] === true) {
      throw new Error('offboarding_workspace_removal_step must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<OffboardingWorkspaceRemovalStepReceipt, 'workspace_removal_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function classifyTask(task: OffboardingWorkspaceRemovalTaskInput, evaluatedAt: string): {
  disposition: OffboardingWorkspaceRemovalDisposition;
  ownerTransferRequired: boolean;
  evidenceReady: boolean;
  legalHoldActive: boolean;
  manualReviewRequired: boolean;
  reason: string;
} {
  const ownerTransferRequired = task.owner_transfer_required === true || task.action === "TRANSFER_OWNERSHIP";
  const evidenceReady = task.evidence_ready !== false;
  const legalHoldActive = task.legal_hold_active === true;
  const overdue = Date.parse(task.removal_due_at) < Date.parse(evaluatedAt);
  const highRisk = task.risk === "HIGH" || task.risk === "CRITICAL";

  if (legalHoldActive) {
    return {
      disposition: "REVIEW_REQUIRED",
      ownerTransferRequired,
      evidenceReady,
      legalHoldActive,
      manualReviewRequired: true,
      reason: 'Legal hold is active; workspace removal requires human review before any downstream adapter action.',
    };
  }

  if (ownerTransferRequired && requireOptionalNonEmpty(task.target_owner_ref, 'target_owner_ref') === null) {
    return {
      disposition: "OWNER_TRANSFER_REQUIRED",
      ownerTransferRequired,
      evidenceReady,
      legalHoldActive,
      manualReviewRequired: false,
      reason: 'Workspace ownership transfer is required before removal can proceed.',
    };
  }

  if (!evidenceReady) {
    return {
      disposition: "EVIDENCE_REQUIRED",
      ownerTransferRequired,
      evidenceReady,
      legalHoldActive,
      manualReviewRequired: false,
      reason: 'Workspace removal evidence is not ready; removal must wait for evidence capture.',
    };
  }

  if (highRisk && overdue) {
    return {
      disposition: "REVIEW_REQUIRED",
      ownerTransferRequired,
      evidenceReady,
      legalHoldActive,
      manualReviewRequired: true,
      reason: 'High-risk workspace removal is overdue and requires manual review before execution.',
    };
  }

  return {
    disposition: "READY_FOR_REMOVAL",
    ownerTransferRequired,
    evidenceReady,
    legalHoldActive,
    manualReviewRequired: false,
    reason: 'Workspace removal prerequisites are satisfied for downstream execution by an authorized adapter.',
  };
}

function normalizeTask(task: OffboardingWorkspaceRemovalTaskInput, taskIndex: number, employeeRef: string, evaluatedAt: string): OffboardingWorkspaceRemovalPreparedTask {
  const workspaceRef = requireNonEmpty(task.workspace_ref, 'tasks[' + taskIndex + '].workspace_ref');
  const surface = requireSurface(task.surface);
  const action = requireAction(task.action);
  const risk = requireRisk(task.risk);
  const currentOwnerRef = requireOptionalNonEmpty(task.current_owner_ref, 'tasks[' + taskIndex + '].current_owner_ref');
  const targetOwnerRef = requireOptionalNonEmpty(task.target_owner_ref, 'tasks[' + taskIndex + '].target_owner_ref');
  const removalDueAt = requireTimestamp(task.removal_due_at, 'tasks[' + taskIndex + '].removal_due_at');
  const evidenceRefs = requireEvidenceRefs(task.evidence_refs, 'tasks[' + taskIndex + '].evidence_refs');

  if (action === "TRANSFER_OWNERSHIP" && currentOwnerRef !== employeeRef) {
    throw new Error('tasks[' + taskIndex + '].current_owner_ref must match employee_ref for ownership transfer.');
  }

  const classification = classifyTask({ ...task, surface, action, risk, removal_due_at: removalDueAt }, evaluatedAt);

  return {
    task_index: taskIndex,
    workspace_ref: workspaceRef,
    surface,
    action,
    risk,
    disposition: classification.disposition,
    removal_due_at: removalDueAt,
    overdue: Date.parse(removalDueAt) < Date.parse(evaluatedAt),
    current_owner_ref: currentOwnerRef,
    target_owner_ref: targetOwnerRef,
    owner_transfer_required: classification.ownerTransferRequired,
    evidence_ready: classification.evidenceReady,
    legal_hold_active: classification.legalHoldActive,
    manual_review_required: classification.manualReviewRequired,
    evidence_refs: evidenceRefs,
    reason: classification.reason,
  };
}

export function evaluateOffboardingWorkspaceRemovalStep(input: OffboardingWorkspaceRemovalStepInput): OffboardingWorkspaceRemovalStepReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const offboardingCaseRef = requireNonEmpty(input.offboarding_case_ref, 'offboarding_case_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.tasks) || input.tasks.length === 0) {
    throw new Error('tasks must include at least one workspace removal task for offboarding_workspace_removal_step.');
  }

  const preparedTasks = input.tasks.map((task, index) => normalizeTask(task, index, employeeRef, evaluatedAt));
  const readyCount = preparedTasks.filter((task) => task.disposition === "READY_FOR_REMOVAL").length;
  const transferBlockedCount = preparedTasks.filter((task) => task.disposition === "OWNER_TRANSFER_REQUIRED").length;
  const evidenceBlockedCount = preparedTasks.filter((task) => task.disposition === "EVIDENCE_REQUIRED").length;
  const reviewRequiredCount = preparedTasks.filter((task) => task.disposition === "REVIEW_REQUIRED").length;
  const overdueCount = preparedTasks.filter((task) => task.overdue).length;
  const highRiskCount = preparedTasks.filter((task) => task.risk === "HIGH" || task.risk === "CRITICAL").length;

  let decision: OffboardingWorkspaceRemovalDecision = "WORKSPACE_REMOVAL_READY";
  if (reviewRequiredCount > 0) {
    decision = "WORKSPACE_REMOVAL_REQUIRES_REVIEW";
  } else if (transferBlockedCount > 0) {
    decision = "WORKSPACE_REMOVAL_BLOCKED_FOR_TRANSFER";
  } else if (evidenceBlockedCount > 0) {
    decision = "WORKSPACE_REMOVAL_BLOCKED_FOR_EVIDENCE";
  }

  const receiptWithoutDigest: Omit<OffboardingWorkspaceRemovalStepReceipt, 'workspace_removal_evidence_digest'> = {
    seed_id: PHASE_6C_OFFBOARDING_WORKSPACE_REMOVAL_STEP_SEED_ID,
    component_id: PHASE_6C_OFFBOARDING_WORKSPACE_REMOVAL_STEP_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6COffboardingWorkspaceRemovalStep",
    event_name: OFFBOARDING_WORKSPACE_REMOVAL_STEP_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    offboarding_case_ref: offboardingCaseRef,
    employee_ref: employeeRef,
    task_count: preparedTasks.length,
    ready_count: readyCount,
    transfer_blocked_count: transferBlockedCount,
    evidence_blocked_count: evidenceBlockedCount,
    review_required_count: reviewRequiredCount,
    overdue_count: overdueCount,
    high_risk_count: highRiskCount,
    decision,
    prepared_tasks: preparedTasks,
    access_mutation_performed: false,
    account_disable_performed: false,
    event_dispatch_performed: false,
    dlq_write_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: ["6C-HR-OPS-012", "6C-HR-OPS-011", "6C-ADL-002", "6C-ADL-004"],
    adl_refs: ["ADL-001", "ADL-002"],
    evidence_artifacts: [
      "offboarding_workspace_removal_step_runtime_receipt",
      "offboarding_workspace_removal_step_validation_result",
      "offboarding_workspace_removal_step_forbidden_behavior_rejection_evidence",
    ],
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    workspace_removal_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
