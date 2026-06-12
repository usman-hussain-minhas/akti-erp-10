import { createHash } from 'node:crypto';

export const PHASE_6C_TASK_STATUS_CONFIG_SEED_ID = "seed_6c_071_task_status_config" as const;
export const PHASE_6C_TASK_STATUS_CONFIG_COMPONENT_ID = "6C.06" as const;
export const TASK_STATUS_CONFIG_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.task_status_config.evaluated" as const;

export const taskStatusHardAnchors = ["OPEN", "IN_PROGRESS", "DONE"] as const;
export const taskStatusCategories = ["ENTRY", "ACTIVE", "BLOCKED", "TERMINAL"] as const;

type TaskStatusHardAnchor = (typeof taskStatusHardAnchors)[number];
type TaskStatusCategory = (typeof taskStatusCategories)[number];
type TaskStatusConfigDecision = "TASK_STATUS_CONFIG_READY" | "TASK_STATUS_CONFIG_REQUIRES_REVIEW" | "TASK_STATUS_CONFIG_REJECTED";

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

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for task_status_config.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for task_status_config.');
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

function digestConfig(receiptWithoutDigest: Omit<TaskStatusConfigReceipt, 'task_status_config_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: TaskStatusConfigInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.persistence_requested, 'task_status_config must not persist database changes inside this FFET.'],
    [input.workflow_transition_requested, 'task_status_config must not execute workflow transitions inside this FFET.'],
    [input.notification_send_requested, 'task_status_config must not send notifications inside this FFET.'],
    [input.runtime_adapter_requested, 'task_status_config must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'task_status_config must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'task_status_config must not write cross-phase data inside this FFET.'],
    [input.frontend_publication_requested, 'task_status_config must not publish frontend routes inside this FFET.'],
    [input.ticket_flag_flip_requested, 'task_status_config must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function normalizeRequiredAnchors(input: readonly TaskStatusHardAnchor[] | undefined): readonly TaskStatusHardAnchor[] {
  const anchors = input === undefined ? taskStatusHardAnchors : input;
  const normalized = anchors.map((anchor) => requireOneOf(anchor, taskStatusHardAnchors, 'required_hard_anchors entry'));
  return Array.from(new Set(normalized)).sort();
}

function normalizeStatuses(statuses: readonly TaskStatusDefinitionInput[]): readonly NormalizedTaskStatusDefinition[] {
  if (statuses.length === 0) {
    throw new Error('statuses must include at least the configured hard anchors for task_status_config.');
  }

  return statuses.map((status) => ({
    status_key: requireNonEmpty(status.status_key, 'status_key'),
    label: requireNonEmpty(status.label, 'label'),
    category: requireOneOf(requireNonEmpty(status.category, 'category'), taskStatusCategories, 'category'),
    sort_order: status.sort_order,
    is_enabled: status.is_enabled,
    is_default: status.is_default === true,
    hard_anchor: status.hard_anchor === undefined ? null : requireOneOf(status.hard_anchor, taskStatusHardAnchors, 'hard_anchor'),
    requires_reason: status.requires_reason === true,
    allowed_next_status_keys: normalizeList(status.allowed_next_status_keys, 'allowed_next_status_keys'),
  })).sort((left, right) => left.sort_order - right.sort_order || left.status_key.localeCompare(right.status_key));
}

function evaluateStatusConfig(
  statuses: readonly NormalizedTaskStatusDefinition[],
  requiredHardAnchors: readonly TaskStatusHardAnchor[],
): { review_reasons: readonly string[]; rejection_reasons: readonly string[] } {
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];
  const keys = new Set<string>();
  const orders = new Set<number>();
  const anchorCounts = new Map<TaskStatusHardAnchor, number>();
  const enabledKeys = new Set(statuses.filter((status) => status.is_enabled).map((status) => status.status_key));

  for (const status of statuses) {
    if (keys.has(status.status_key)) {
      rejectionReasons.push('duplicate_status_key:' + status.status_key);
    }
    keys.add(status.status_key);

    if (!Number.isInteger(status.sort_order) || status.sort_order < 0) {
      rejectionReasons.push('invalid_sort_order:' + status.status_key);
    }
    if (orders.has(status.sort_order)) {
      reviewReasons.push('duplicate_sort_order:' + String(status.sort_order));
    }
    orders.add(status.sort_order);

    if (status.hard_anchor !== null) {
      anchorCounts.set(status.hard_anchor, (anchorCounts.get(status.hard_anchor) ?? 0) + 1);
      if (!status.is_enabled) {
        rejectionReasons.push('hard_anchor_status_cannot_be_disabled:' + status.hard_anchor);
      }
    }

    if (status.hard_anchor === 'OPEN' && status.category !== 'ENTRY') {
      rejectionReasons.push('open_anchor_must_be_entry_category');
    }
    if (status.hard_anchor === 'IN_PROGRESS' && status.category !== 'ACTIVE') {
      rejectionReasons.push('in_progress_anchor_must_be_active_category');
    }
    if (status.hard_anchor === 'DONE' && status.category !== 'TERMINAL') {
      rejectionReasons.push('done_anchor_must_be_terminal_category');
    }
    if (status.category === 'TERMINAL' && status.allowed_next_status_keys.length > 0) {
      reviewReasons.push('terminal_status_has_outgoing_transitions:' + status.status_key);
    }
    if (status.requires_reason && status.category !== 'BLOCKED' && status.category !== 'TERMINAL') {
      reviewReasons.push('reason_required_on_non_blocking_status:' + status.status_key);
    }

    for (const target of status.allowed_next_status_keys) {
      if (!keys.has(target) && !statuses.some((candidate) => candidate.status_key === target)) {
        rejectionReasons.push('transition_target_missing:' + status.status_key + '->' + target);
      }
      if (keys.has(target) && !enabledKeys.has(target)) {
        reviewReasons.push('transition_targets_disabled_status:' + status.status_key + '->' + target);
      }
    }
  }

  for (const requiredAnchor of requiredHardAnchors) {
    const count = anchorCounts.get(requiredAnchor) ?? 0;
    if (count === 0) {
      rejectionReasons.push('missing_hard_anchor:' + requiredAnchor);
    }
    if (count > 1) {
      rejectionReasons.push('duplicate_hard_anchor:' + requiredAnchor);
    }
  }

  const defaultStatuses = statuses.filter((status) => status.is_default);
  if (defaultStatuses.length !== 1) {
    rejectionReasons.push('exactly_one_default_status_required');
  } else if (!defaultStatuses[0].is_enabled) {
    rejectionReasons.push('default_status_must_be_enabled');
  } else if (defaultStatuses[0].category === 'TERMINAL') {
    rejectionReasons.push('default_status_must_not_be_terminal');
  }

  return {
    review_reasons: Array.from(new Set(reviewReasons)).sort(),
    rejection_reasons: Array.from(new Set(rejectionReasons)).sort(),
  };
}

export function evaluateTaskStatusConfig(input: TaskStatusConfigInput): TaskStatusConfigReceipt {
  assertForbiddenRequests(input);

  const requiredHardAnchors = normalizeRequiredAnchors(input.required_hard_anchors);
  const normalizedStatuses = normalizeStatuses(input.statuses);
  const evaluation = evaluateStatusConfig(normalizedStatuses, requiredHardAnchors);
  const evidenceArtifacts = normalizeList(input.evidence_refs, 'evidence_refs');
  const decision: TaskStatusConfigDecision = evaluation.rejection_reasons.length > 0
    ? 'TASK_STATUS_CONFIG_REJECTED'
    : evaluation.review_reasons.length > 0
      ? 'TASK_STATUS_CONFIG_REQUIRES_REVIEW'
      : 'TASK_STATUS_CONFIG_READY';

  const receiptWithoutDigest: Omit<TaskStatusConfigReceipt, 'task_status_config_evidence_digest'> = {
    seed_id: PHASE_6C_TASK_STATUS_CONFIG_SEED_ID,
    component_id: PHASE_6C_TASK_STATUS_CONFIG_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CTaskStatusConfig",
    event_name: TASK_STATUS_CONFIG_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    config_ref: requireNonEmpty(input.config_ref, 'config_ref'),
    decision,
    allow_custom_status_labels: input.allow_custom_status_labels,
    required_hard_anchors: requiredHardAnchors,
    normalized_statuses: normalizedStatuses,
    review_reasons: evaluation.review_reasons,
    rejection_reasons: evaluation.rejection_reasons,
    evidence_artifacts: evidenceArtifacts,
    decision_refs: ["6C-WORK-TASK-003"],
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    persistence_performed: false,
    workflow_transition_performed: false,
    notification_sent: false,
    schema_mutation_performed: false,
    cross_phase_write_performed: false,
    frontend_publication_performed: false,
    ticket_flags_changed: false,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    task_status_config_evidence_digest: digestConfig(receiptWithoutDigest),
  };
}
