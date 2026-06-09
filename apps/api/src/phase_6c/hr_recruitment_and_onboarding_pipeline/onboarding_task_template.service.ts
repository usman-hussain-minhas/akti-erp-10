import { createHash } from 'node:crypto';

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

type OnboardingTaskTemplateReceiptWithoutDigest = Omit<OnboardingTaskTemplateReceipt, 'onboarding_task_template_evidence_digest'>;

const TASK_TYPES = new Set<OnboardingTaskTemplateTaskType>(['DOCUMENT', 'ACCESS', 'TRAINING', 'MEETING', 'CHECKLIST', 'EQUIPMENT']);
const DUE_ANCHORS = new Set<OnboardingTaskTemplateDueAnchor>(['ACCEPTANCE_DATE', 'START_DATE']);
const TEMPLATE_REF_PREFIX = 'onboarding_template:';

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for onboarding_task_template runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for onboarding_task_template runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: OnboardingTaskTemplateInput): void {
  if (input.hardcoded_template_requested === true) {
    throw new Error('onboarding_task_template runtime must use configurable templates, not hardcoded onboarding tasks.');
  }
  if (input.task_instantiation_requested === true) {
    throw new Error('onboarding_task_template runtime must validate templates, not instantiate tasks.');
  }
  if (input.workspace_task_mutation_requested === true) {
    throw new Error('onboarding_task_template runtime must not mutate Workspace task records.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('onboarding_task_template runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('onboarding_task_template runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('onboarding_task_template runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('onboarding_task_template runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('onboarding_task_template runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeTasks(tasks: readonly OnboardingTaskTemplateTask[]): {
  normalizedTasks: OnboardingTaskTemplateNormalizedTask[];
  requiredTaskCount: number;
  evidenceRequiredTaskCount: number;
} {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('at least one configurable onboarding task is required for onboarding_task_template runtime.');
  }

  const taskCodes = new Set<string>();
  const orders = new Set<number>();
  const normalizedTasks: OnboardingTaskTemplateNormalizedTask[] = [];
  let requiredTaskCount = 0;
  let evidenceRequiredTaskCount = 0;

  for (const task of tasks) {
    const taskCode = requireNonEmpty(task.task_code, 'task_code');
    requireNonEmpty(task.title, 'task title');
    if (taskCodes.has(taskCode)) {
      throw new Error('task_code must be unique for onboarding_task_template runtime: ' + taskCode);
    }
    taskCodes.add(taskCode);
    if (!TASK_TYPES.has(task.task_type)) {
      throw new Error('task_type is not supported for onboarding_task_template runtime: ' + taskCode);
    }
    if (!Number.isInteger(task.order) || task.order <= 0) {
      throw new Error('task order must be a positive integer for onboarding_task_template runtime: ' + taskCode);
    }
    if (orders.has(task.order)) {
      throw new Error('task order must be unique for onboarding_task_template runtime: ' + task.order);
    }
    orders.add(task.order);
    if (!DUE_ANCHORS.has(task.due_anchor)) {
      throw new Error('due_anchor is not supported for onboarding_task_template runtime: ' + taskCode);
    }
    if (!Number.isInteger(task.due_offset_days)) {
      throw new Error('due_offset_days must be an integer for onboarding_task_template runtime: ' + taskCode);
    }
    const assigneeRoleRef = requireNonEmpty(task.assignee_role_ref, 'assignee_role_ref');
    if (typeof task.required !== 'boolean') {
      throw new Error('task required flag must be boolean for onboarding_task_template runtime: ' + taskCode);
    }
    if (typeof task.evidence_required !== 'boolean') {
      throw new Error('task evidence_required flag must be boolean for onboarding_task_template runtime: ' + taskCode);
    }
    if (task.required) {
      requiredTaskCount += 1;
    }
    if (task.evidence_required) {
      evidenceRequiredTaskCount += 1;
    }
    const dependencyCodes: readonly string[] = task.depends_on_task_codes ?? [];
    normalizedTasks.push({
      task_code: taskCode,
      order: task.order,
      task_type: task.task_type,
      due_anchor: task.due_anchor,
      due_offset_days: task.due_offset_days,
      assignee_role_ref: assigneeRoleRef,
      required: task.required,
      evidence_required: task.evidence_required,
      depends_on_task_codes: dependencyCodes.map((code) => requireNonEmpty(code, 'depends_on_task_code')),
    });
  }

  for (const task of normalizedTasks) {
    const dependencySet = new Set<string>();
    for (const dependencyCode of task.depends_on_task_codes) {
      if (!taskCodes.has(dependencyCode)) {
        throw new Error('depends_on_task_code must reference an existing task for onboarding_task_template runtime: ' + dependencyCode);
      }
      if (dependencyCode === task.task_code) {
        throw new Error('task must not depend on itself for onboarding_task_template runtime: ' + task.task_code);
      }
      if (dependencySet.has(dependencyCode)) {
        throw new Error('depends_on_task_code must be unique per task for onboarding_task_template runtime: ' + dependencyCode);
      }
      dependencySet.add(dependencyCode);
    }
  }

  const orderedTasks = [...normalizedTasks].sort((a, b) => a.order - b.order);
  const orderByCode = new Map(orderedTasks.map((task) => [task.task_code, task.order]));
  for (const task of orderedTasks) {
    for (const dependencyCode of task.depends_on_task_codes) {
      if ((orderByCode.get(dependencyCode) ?? Number.POSITIVE_INFINITY) >= task.order) {
        throw new Error('task dependency must have a lower order than dependent task for onboarding_task_template runtime: ' + dependencyCode + ' -> ' + task.task_code);
      }
    }
  }

  if (requiredTaskCount === 0) {
    throw new Error('at least one required task is required for onboarding_task_template runtime.');
  }
  if (evidenceRequiredTaskCount === 0) {
    throw new Error('at least one evidence-required task is required for onboarding_task_template runtime.');
  }

  return { normalizedTasks: orderedTasks, requiredTaskCount, evidenceRequiredTaskCount };
}

function digestReceipt(receiptWithoutDigest: OnboardingTaskTemplateReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateOnboardingTaskTemplateRuntime(input: OnboardingTaskTemplateInput): OnboardingTaskTemplateReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const templateRef = requireNonEmpty(input.template_ref, 'template_ref');
  if (!templateRef.startsWith(TEMPLATE_REF_PREFIX)) {
    throw new Error('template_ref must identify a configurable onboarding template for onboarding_task_template runtime.');
  }
  requireNonEmpty(input.template_label, 'template_label');
  const templateVersion = requireNonEmpty(input.template_version, 'template_version');
  requireNonEmpty(input.employment_type, 'employment_type');
  if (input.department_ref !== undefined) {
    requireNonEmpty(input.department_ref, 'department_ref');
  }
  const configuredByUserId = requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const taskSummary = normalizeTasks(input.tasks);

  const receiptWithoutDigest: OnboardingTaskTemplateReceiptWithoutDigest = {
    seed_id: PHASE_6C_ONBOARDING_TASK_TEMPLATE_SEED_ID,
    component_id: PHASE_6C_ONBOARDING_TASK_TEMPLATE_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6COnboardingTaskTemplate',
    event_name: ONBOARDING_TASK_TEMPLATE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    runtime_status: 'ONBOARDING_TASK_TEMPLATE_READY',
    template_ref: templateRef,
    template_version: templateVersion,
    configurable_templates_required: true,
    hardcoded_template_allowed: false,
    task_instantiation_executed: false,
    workspace_task_mutation_allowed: false,
    task_count: taskSummary.normalizedTasks.length,
    required_task_count: taskSummary.requiredTaskCount,
    evidence_required_task_count: taskSummary.evidenceRequiredTaskCount,
    normalized_tasks: taskSummary.normalizedTasks,
    decision_refs: ['6C-RECRUIT-008'],
    evidence_artifacts: [
      'onboarding_task_template_runtime_receipt',
      'onboarding_task_template_validation_result',
      'onboarding_task_template_forbidden_behavior_rejection_evidence',
    ],
    control_metadata: input.control_metadata ?? {},
    configured_by_user_id: configuredByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    onboarding_task_template_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
