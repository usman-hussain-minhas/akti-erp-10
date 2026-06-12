import { createHash } from 'node:crypto';

export const PHASE_6C_TASK_RECORD_SEED_ID = "seed_6c_070_task_record" as const;
export const PHASE_6C_TASK_RECORD_COMPONENT_ID = "6C.06" as const;
export const TASK_RECORD_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.task_record.evaluated" as const;

export const taskRecordStatuses = ["DRAFT", "OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"] as const;
export const taskRecordPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export const taskRecordVisibilities = ["PRIVATE", "TEAM", "WORKSPACE"] as const;

type TaskRecordStatus = (typeof taskRecordStatuses)[number];
type TaskRecordPriority = (typeof taskRecordPriorities)[number];
type TaskRecordVisibility = (typeof taskRecordVisibilities)[number];
type TaskRecordDecision = "TASK_RECORD_READY" | "TASK_RECORD_REQUIRES_REVIEW" | "TASK_RECORD_REJECTED";

export type TaskRecordInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  task_ref: string;
  title: string;
  description?: string;
  status: TaskRecordStatus;
  priority: TaskRecordPriority;
  visibility: TaskRecordVisibility;
  owner_user_ref: string;
  assignee_user_refs?: readonly string[];
  watcher_user_refs?: readonly string[];
  team_refs?: readonly string[];
  workspace_ref?: string;
  project_ref?: string;
  parent_task_ref?: string;
  external_ref?: string;
  start_at?: string;
  due_at?: string;
  completed_at?: string;
  blocked_reason?: string;
  tags?: readonly string[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  notification_send_requested?: boolean;
  workflow_transition_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedTaskRecord = {
  task_ref: string;
  title: string;
  description: string | null;
  status: TaskRecordStatus;
  priority: TaskRecordPriority;
  visibility: TaskRecordVisibility;
  owner_user_ref: string;
  assignee_user_refs: readonly string[];
  watcher_user_refs: readonly string[];
  team_refs: readonly string[];
  workspace_ref: string | null;
  project_ref: string | null;
  parent_task_ref: string | null;
  external_ref: string | null;
  start_at: string | null;
  due_at: string | null;
  completed_at: string | null;
  blocked_reason: string | null;
  tags: readonly string[];
};

export type TaskRecordReceipt = {
  seed_id: typeof PHASE_6C_TASK_RECORD_SEED_ID;
  component_id: typeof PHASE_6C_TASK_RECORD_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CTaskRecord";
  event_name: typeof TASK_RECORD_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  decision: TaskRecordDecision;
  normalized_task: NormalizedTaskRecord;
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  evidence_artifacts: readonly string[];
  decision_refs: readonly string[];
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  notification_sent: false;
  workflow_transition_performed: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  task_record_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for task_record.');
  }
  return value.trim();
}

function optionalText(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for task_record.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | null {
  const normalized = optionalText(value);
  if (normalized === null) {
    return null;
  }
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for task_record.');
  }
  return normalized;
}

function requireOneOf<T extends string>(value: string, allowed: readonly T[], field: string): T {
  if (!allowed.includes(value as T)) {
    throw new Error(field + ' must be one of: ' + allowed.join(', '));
  }
  return value as T;
}

function normalizeList(values: readonly string[] | undefined, field: string): readonly string[] {
  if (values === undefined) {
    return [];
  }
  const normalized = values.map((value) => requireNonEmpty(value, field + ' entry'));
  return Array.from(new Set(normalized)).sort();
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((entry) => stableJson(entry)).join(',') + ']';
  }
  if (value !== null && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => JSON.stringify(key) + ':' + stableJson(entry))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function digestTaskRecord(receiptWithoutDigest: Omit<TaskRecordReceipt, 'task_record_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: TaskRecordInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.persistence_requested, 'task_record must not persist database changes inside this FFET.'],
    [input.notification_send_requested, 'task_record must not send notifications inside this FFET.'],
    [input.workflow_transition_requested, 'task_record must not execute workflow transitions inside this FFET.'],
    [input.runtime_adapter_requested, 'task_record must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'task_record must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'task_record must not write cross-phase data inside this FFET.'],
    [input.frontend_publication_requested, 'task_record must not publish frontend routes inside this FFET.'],
    [input.ticket_flag_flip_requested, 'task_record must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function evaluateTaskConsistency(task: NormalizedTaskRecord): { review_reasons: readonly string[]; rejection_reasons: readonly string[] } {
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];

  if (task.status === 'DONE' && task.completed_at === null) {
    rejectionReasons.push('done_task_requires_completed_at');
  }
  if (task.status !== 'DONE' && task.completed_at !== null) {
    reviewReasons.push('completed_at_present_for_non_done_task');
  }
  if (task.status === 'BLOCKED' && task.blocked_reason === null) {
    reviewReasons.push('blocked_task_requires_blocked_reason_before_execution');
  }
  if (task.status !== 'BLOCKED' && task.blocked_reason !== null) {
    reviewReasons.push('blocked_reason_present_for_non_blocked_task');
  }
  if (task.start_at !== null && task.due_at !== null && Date.parse(task.due_at) < Date.parse(task.start_at)) {
    reviewReasons.push('due_at_precedes_start_at');
  }
  if (task.visibility === 'WORKSPACE' && task.workspace_ref === null) {
    reviewReasons.push('workspace_visibility_requires_workspace_ref');
  }
  if (task.visibility === 'TEAM' && task.team_refs.length === 0) {
    reviewReasons.push('team_visibility_requires_team_ref');
  }
  if (task.status !== 'DRAFT' && task.assignee_user_refs.length === 0) {
    reviewReasons.push('non_draft_task_has_no_assignee');
  }
  if (task.parent_task_ref !== null && task.parent_task_ref === task.task_ref) {
    rejectionReasons.push('task_cannot_parent_itself');
  }

  return {
    review_reasons: reviewReasons.sort(),
    rejection_reasons: rejectionReasons.sort(),
  };
}

export function evaluateTaskRecord(input: TaskRecordInput): TaskRecordReceipt {
  assertForbiddenRequests(input);

  const normalizedTask: NormalizedTaskRecord = {
    task_ref: requireNonEmpty(input.task_ref, 'task_ref'),
    title: requireNonEmpty(input.title, 'title'),
    description: optionalText(input.description),
    status: requireOneOf(requireNonEmpty(input.status, 'status'), taskRecordStatuses, 'status'),
    priority: requireOneOf(requireNonEmpty(input.priority, 'priority'), taskRecordPriorities, 'priority'),
    visibility: requireOneOf(requireNonEmpty(input.visibility, 'visibility'), taskRecordVisibilities, 'visibility'),
    owner_user_ref: requireNonEmpty(input.owner_user_ref, 'owner_user_ref'),
    assignee_user_refs: normalizeList(input.assignee_user_refs, 'assignee_user_refs'),
    watcher_user_refs: normalizeList(input.watcher_user_refs, 'watcher_user_refs'),
    team_refs: normalizeList(input.team_refs, 'team_refs'),
    workspace_ref: optionalText(input.workspace_ref),
    project_ref: optionalText(input.project_ref),
    parent_task_ref: optionalText(input.parent_task_ref),
    external_ref: optionalText(input.external_ref),
    start_at: optionalTimestamp(input.start_at, 'start_at'),
    due_at: optionalTimestamp(input.due_at, 'due_at'),
    completed_at: optionalTimestamp(input.completed_at, 'completed_at'),
    blocked_reason: optionalText(input.blocked_reason),
    tags: normalizeList(input.tags, 'tags'),
  };

  const consistency = evaluateTaskConsistency(normalizedTask);
  const evidenceArtifacts = normalizeList(input.evidence_refs, 'evidence_refs');
  const decision: TaskRecordDecision = consistency.rejection_reasons.length > 0
    ? 'TASK_RECORD_REJECTED'
    : consistency.review_reasons.length > 0
      ? 'TASK_RECORD_REQUIRES_REVIEW'
      : 'TASK_RECORD_READY';

  const receiptWithoutDigest: Omit<TaskRecordReceipt, 'task_record_evidence_digest'> = {
    seed_id: PHASE_6C_TASK_RECORD_SEED_ID,
    component_id: PHASE_6C_TASK_RECORD_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CTaskRecord",
    event_name: TASK_RECORD_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    normalized_task: normalizedTask,
    review_reasons: consistency.review_reasons,
    rejection_reasons: consistency.rejection_reasons,
    evidence_artifacts: evidenceArtifacts,
    decision_refs: ["6C-WORK-TASK-002"],
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    persistence_performed: false,
    notification_sent: false,
    workflow_transition_performed: false,
    schema_mutation_performed: false,
    cross_phase_write_performed: false,
    frontend_publication_performed: false,
    ticket_flags_changed: false,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    task_record_evidence_digest: digestTaskRecord(receiptWithoutDigest),
  };
}
