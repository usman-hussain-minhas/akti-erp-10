import { createHash } from 'node:crypto';

export const PHASE_6C_TIME_LOG_EVIDENCE_SEED_ID = "seed_6c_078_time_log_evidence" as const;
export const PHASE_6C_TIME_LOG_EVIDENCE_COMPONENT_ID = "6C.06" as const;
export const TIME_LOG_EVIDENCE_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.time_log_evidence.evaluated" as const;

export const timeLogWorkTypes = ["PROJECT_WORK", "TASK_WORK", "MEETING", "RESEARCH", "ADMIN"] as const;
export const timeLogBillingDimensionStates = ["NON_BILLABLE", "BILLING_CANDIDATE"] as const;

type TimeLogWorkType = (typeof timeLogWorkTypes)[number];
type TimeLogBillingDimensionState = (typeof timeLogBillingDimensionStates)[number];
type TimeLogEvidenceDecision = "TIME_LOG_EVIDENCE_READY" | "TIME_LOG_EVIDENCE_REQUIRES_REVIEW" | "TIME_LOG_EVIDENCE_REJECTED";

export type TimeLogEntryInput = {
  time_log_ref: string;
  subject_user_ref: string;
  project_ref?: string;
  task_ref?: string;
  work_type: TimeLogWorkType;
  billing_dimension_state: TimeLogBillingDimensionState;
  billing_dimension_refs?: readonly string[];
  start_at: string;
  end_at: string;
  duration_minutes?: number;
  evidence_refs?: readonly string[];
};

export type TimeLogEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  entries: readonly TimeLogEntryInput[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  invoice_generation_requested?: boolean;
  payroll_write_requested?: boolean;
  finance_write_requested?: boolean;
  timer_adapter_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedTimeLogEntry = {
  time_log_ref: string;
  subject_user_ref: string;
  project_ref: string | null;
  task_ref: string | null;
  work_type: TimeLogWorkType;
  billing_dimension_state: TimeLogBillingDimensionState;
  billing_dimension_refs: readonly string[];
  start_at: string;
  end_at: string;
  duration_minutes: number;
  evidence_refs: readonly string[];
};

export type TimeLogEvidenceReceipt = {
  seed_id: typeof PHASE_6C_TIME_LOG_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_TIME_LOG_EVIDENCE_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CTimeLogEvidence";
  event_name: typeof TIME_LOG_EVIDENCE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  decision: TimeLogEvidenceDecision;
  normalized_entries: readonly NormalizedTimeLogEntry[];
  total_duration_minutes: number;
  billing_candidate_minutes: number;
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  future_billing_evidence_only: true;
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  invoice_generated: false;
  payroll_written: false;
  finance_write_performed: false;
  timer_adapter_invoked: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  time_log_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for time_log_evidence.');
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
    throw new Error(field + ' must be a valid ISO-compatible timestamp for time_log_evidence.');
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

function digestEvidence(receiptWithoutDigest: Omit<TimeLogEvidenceReceipt, 'time_log_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: TimeLogEvidenceInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.persistence_requested, 'time_log_evidence must not persist database changes inside this FFET.'],
    [input.invoice_generation_requested, 'time_log_evidence must not generate invoices inside this FFET.'],
    [input.payroll_write_requested, 'time_log_evidence must not write payroll inside this FFET.'],
    [input.finance_write_requested, 'time_log_evidence must not write Finance data inside this FFET.'],
    [input.timer_adapter_requested, 'time_log_evidence must not invoke timer adapters inside this FFET.'],
    [input.runtime_adapter_requested, 'time_log_evidence must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'time_log_evidence must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'time_log_evidence must not write cross-phase data inside this FFET.'],
    [input.frontend_publication_requested, 'time_log_evidence must not publish frontend routes inside this FFET.'],
    [input.ticket_flag_flip_requested, 'time_log_evidence must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function normalizeEntries(entries: readonly TimeLogEntryInput[]): readonly NormalizedTimeLogEntry[] {
  if (entries.length === 0) {
    throw new Error('entries must include at least one time log evidence entry.');
  }

  return entries.map((entry) => {
    const startAt = requireTimestamp(entry.start_at, 'start_at');
    const endAt = requireTimestamp(entry.end_at, 'end_at');
    const calculatedDuration = Math.round((Date.parse(endAt) - Date.parse(startAt)) / 60000);
    return {
      time_log_ref: requireNonEmpty(entry.time_log_ref, 'time_log_ref'),
      subject_user_ref: requireNonEmpty(entry.subject_user_ref, 'subject_user_ref'),
      project_ref: optionalText(entry.project_ref),
      task_ref: optionalText(entry.task_ref),
      work_type: requireOneOf(requireNonEmpty(entry.work_type, 'work_type'), timeLogWorkTypes, 'work_type'),
      billing_dimension_state: requireOneOf(requireNonEmpty(entry.billing_dimension_state, 'billing_dimension_state'), timeLogBillingDimensionStates, 'billing_dimension_state'),
      billing_dimension_refs: normalizeList(entry.billing_dimension_refs, 'billing_dimension_refs'),
      start_at: startAt,
      end_at: endAt,
      duration_minutes: entry.duration_minutes ?? calculatedDuration,
      evidence_refs: normalizeList(entry.evidence_refs, 'evidence_refs'),
    };
  }).sort((left, right) => left.start_at.localeCompare(right.start_at) || left.time_log_ref.localeCompare(right.time_log_ref));
}

function evaluateEntries(entries: readonly NormalizedTimeLogEntry[]): { review_reasons: readonly string[]; rejection_reasons: readonly string[] } {
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];
  const seenRefs = new Set<string>();

  for (const entry of entries) {
    if (seenRefs.has(entry.time_log_ref)) {
      rejectionReasons.push('duplicate_time_log_ref:' + entry.time_log_ref);
    }
    seenRefs.add(entry.time_log_ref);

    const calculatedDuration = Math.round((Date.parse(entry.end_at) - Date.parse(entry.start_at)) / 60000);
    if (calculatedDuration <= 0) {
      rejectionReasons.push('time_log_requires_positive_duration:' + entry.time_log_ref);
    }
    if (!Number.isInteger(entry.duration_minutes) || entry.duration_minutes <= 0) {
      rejectionReasons.push('duration_minutes_requires_positive_integer:' + entry.time_log_ref);
    }
    if (calculatedDuration > 0 && entry.duration_minutes !== calculatedDuration) {
      reviewReasons.push('duration_minutes_differs_from_timestamp_delta:' + entry.time_log_ref);
    }
    if (entry.project_ref === null && entry.task_ref === null) {
      reviewReasons.push('time_log_has_no_project_or_task_ref:' + entry.time_log_ref);
    }
    if (entry.billing_dimension_state === 'BILLING_CANDIDATE' && entry.billing_dimension_refs.length === 0) {
      reviewReasons.push('billing_candidate_missing_dimension_ref:' + entry.time_log_ref);
    }
    if (entry.evidence_refs.length === 0) {
      reviewReasons.push('time_log_missing_evidence_ref:' + entry.time_log_ref);
    }
  }

  return {
    review_reasons: Array.from(new Set(reviewReasons)).sort(),
    rejection_reasons: Array.from(new Set(rejectionReasons)).sort(),
  };
}

export function evaluateTimeLogEvidence(input: TimeLogEvidenceInput): TimeLogEvidenceReceipt {
  assertForbiddenRequests(input);

  const normalizedEntries = normalizeEntries(input.entries);
  const evaluation = evaluateEntries(normalizedEntries);
  const totalDurationMinutes = normalizedEntries.reduce((total, entry) => total + entry.duration_minutes, 0);
  const billingCandidateMinutes = normalizedEntries
    .filter((entry) => entry.billing_dimension_state === 'BILLING_CANDIDATE')
    .reduce((total, entry) => total + entry.duration_minutes, 0);
  const decision: TimeLogEvidenceDecision = evaluation.rejection_reasons.length > 0
    ? 'TIME_LOG_EVIDENCE_REJECTED'
    : evaluation.review_reasons.length > 0
      ? 'TIME_LOG_EVIDENCE_REQUIRES_REVIEW'
      : 'TIME_LOG_EVIDENCE_READY';

  const receiptWithoutDigest: Omit<TimeLogEvidenceReceipt, 'time_log_evidence_digest'> = {
    seed_id: PHASE_6C_TIME_LOG_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_TIME_LOG_EVIDENCE_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CTimeLogEvidence",
    event_name: TIME_LOG_EVIDENCE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    normalized_entries: normalizedEntries,
    total_duration_minutes: totalDurationMinutes,
    billing_candidate_minutes: billingCandidateMinutes,
    review_reasons: evaluation.review_reasons,
    rejection_reasons: evaluation.rejection_reasons,
    decision_refs: ["6C-WORK-TASK-010"],
    future_billing_evidence_only: true,
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    persistence_performed: false,
    invoice_generated: false,
    payroll_written: false,
    finance_write_performed: false,
    timer_adapter_invoked: false,
    schema_mutation_performed: false,
    cross_phase_write_performed: false,
    frontend_publication_performed: false,
    ticket_flags_changed: false,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    time_log_evidence_digest: digestEvidence(receiptWithoutDigest),
  };
}
