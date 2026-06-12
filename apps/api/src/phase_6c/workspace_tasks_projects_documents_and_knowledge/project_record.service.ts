import { createHash } from 'node:crypto';

export const PHASE_6C_PROJECT_RECORD_SEED_ID = "seed_6c_072_project_record" as const;
export const PHASE_6C_PROJECT_RECORD_COMPONENT_ID = "6C.06" as const;
export const PROJECT_RECORD_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.project_record.evaluated" as const;

export const projectRecordStatuses = ["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;
export const projectRecordPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export const projectRecordVisibilities = ["PRIVATE", "TEAM", "WORKSPACE"] as const;

type ProjectRecordStatus = (typeof projectRecordStatuses)[number];
type ProjectRecordPriority = (typeof projectRecordPriorities)[number];
type ProjectRecordVisibility = (typeof projectRecordVisibilities)[number];
type ProjectRecordDecision = "PROJECT_RECORD_READY" | "PROJECT_RECORD_REQUIRES_REVIEW" | "PROJECT_RECORD_REJECTED";

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

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for project_record.');
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
    throw new Error(field + ' must be a valid ISO-compatible timestamp for project_record.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | null {
  const normalized = optionalText(value);
  if (normalized === null) {
    return null;
  }
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for project_record.');
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

function normalizeMetadata(entries: readonly ProjectMetadataEntryInput[] | undefined): readonly NormalizedProjectMetadataEntry[] {
  if (entries === undefined) {
    return [];
  }
  const byKey = new Map<string, NormalizedProjectMetadataEntry>();
  for (const entry of entries) {
    const key = requireNonEmpty(entry.key, 'metadata_entries key').toLowerCase();
    const value = requireNonEmpty(entry.value, 'metadata_entries value');
    byKey.set(key, {
      key,
      value,
      source_ref: optionalText(entry.source_ref),
    });
  }
  return Array.from(byKey.values()).sort((left, right) => left.key.localeCompare(right.key));
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

function digestProjectRecord(receiptWithoutDigest: Omit<ProjectRecordReceipt, 'project_record_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: ProjectRecordInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.persistence_requested, 'project_record must not persist database changes inside this FFET.'],
    [input.dependency_graph_execution_requested, 'project_record must not execute dependency graphs inside this FFET.'],
    [input.gantt_view_requested, 'project_record must not render Gantt or frontend views inside this FFET.'],
    [input.notification_send_requested, 'project_record must not send notifications inside this FFET.'],
    [input.runtime_adapter_requested, 'project_record must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'project_record must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'project_record must not write cross-phase data inside this FFET.'],
    [input.frontend_publication_requested, 'project_record must not publish frontend routes inside this FFET.'],
    [input.ticket_flag_flip_requested, 'project_record must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function evaluateProjectConsistency(project: NormalizedProjectRecord): { review_reasons: readonly string[]; rejection_reasons: readonly string[] } {
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];

  if (project.status === 'COMPLETED' && project.completed_at === null) {
    rejectionReasons.push('completed_project_requires_completed_at');
  }
  if (project.status !== 'COMPLETED' && project.completed_at !== null) {
    reviewReasons.push('completed_at_present_for_non_completed_project');
  }
  if (project.status === 'ACTIVE' && project.team_refs.length === 0) {
    reviewReasons.push('active_project_has_no_team_ref');
  }
  if (project.visibility === 'WORKSPACE' && project.workspace_ref === null) {
    reviewReasons.push('workspace_visibility_requires_workspace_ref');
  }
  if (project.visibility === 'TEAM' && project.team_refs.length === 0) {
    reviewReasons.push('team_visibility_requires_team_ref');
  }
  if (project.start_at !== null && project.target_end_at !== null && Date.parse(project.target_end_at) < Date.parse(project.start_at)) {
    reviewReasons.push('target_end_at_precedes_start_at');
  }
  if (project.parent_project_ref !== null && project.parent_project_ref === project.project_ref) {
    rejectionReasons.push('project_cannot_parent_itself');
  }
  if (project.dependency_refs.includes(project.project_ref)) {
    rejectionReasons.push('project_cannot_depend_on_itself');
  }

  return {
    review_reasons: Array.from(new Set(reviewReasons)).sort(),
    rejection_reasons: Array.from(new Set(rejectionReasons)).sort(),
  };
}

export function evaluateProjectRecord(input: ProjectRecordInput): ProjectRecordReceipt {
  assertForbiddenRequests(input);

  const normalizedProject: NormalizedProjectRecord = {
    project_ref: requireNonEmpty(input.project_ref, 'project_ref'),
    name: requireNonEmpty(input.name, 'name'),
    summary: optionalText(input.summary),
    status: requireOneOf(requireNonEmpty(input.status, 'status'), projectRecordStatuses, 'status'),
    priority: requireOneOf(requireNonEmpty(input.priority, 'priority'), projectRecordPriorities, 'priority'),
    visibility: requireOneOf(requireNonEmpty(input.visibility, 'visibility'), projectRecordVisibilities, 'visibility'),
    owner_user_ref: requireNonEmpty(input.owner_user_ref, 'owner_user_ref'),
    sponsor_user_ref: optionalText(input.sponsor_user_ref),
    team_refs: normalizeList(input.team_refs, 'team_refs'),
    workspace_ref: optionalText(input.workspace_ref),
    start_at: optionalTimestamp(input.start_at, 'start_at'),
    target_end_at: optionalTimestamp(input.target_end_at, 'target_end_at'),
    completed_at: optionalTimestamp(input.completed_at, 'completed_at'),
    parent_project_ref: optionalText(input.parent_project_ref),
    dependency_refs: normalizeList(input.dependency_refs, 'dependency_refs'),
    budget_ref: optionalText(input.budget_ref),
    tags: normalizeList(input.tags, 'tags'),
    metadata_entries: normalizeMetadata(input.metadata_entries),
  };

  const consistency = evaluateProjectConsistency(normalizedProject);
  const evidenceArtifacts = normalizeList(input.evidence_refs, 'evidence_refs');
  const decision: ProjectRecordDecision = consistency.rejection_reasons.length > 0
    ? 'PROJECT_RECORD_REJECTED'
    : consistency.review_reasons.length > 0
      ? 'PROJECT_RECORD_REQUIRES_REVIEW'
      : 'PROJECT_RECORD_READY';

  const receiptWithoutDigest: Omit<ProjectRecordReceipt, 'project_record_evidence_digest'> = {
    seed_id: PHASE_6C_PROJECT_RECORD_SEED_ID,
    component_id: PHASE_6C_PROJECT_RECORD_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CProjectRecord",
    event_name: PROJECT_RECORD_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    normalized_project: normalizedProject,
    review_reasons: consistency.review_reasons,
    rejection_reasons: consistency.rejection_reasons,
    evidence_artifacts: evidenceArtifacts,
    decision_refs: ["6C-WORK-TASK-004"],
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    persistence_performed: false,
    dependency_graph_executed: false,
    gantt_view_rendered: false,
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
    project_record_evidence_digest: digestProjectRecord(receiptWithoutDigest),
  };
}
