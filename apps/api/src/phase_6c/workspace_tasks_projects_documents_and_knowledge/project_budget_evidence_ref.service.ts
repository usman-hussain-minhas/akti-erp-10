import { createHash } from 'node:crypto';

export const PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_SEED_ID = "seed_6c_074_project_budget_evidence_ref" as const;
export const PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_COMPONENT_ID = "6C.06" as const;
export const PROJECT_BUDGET_EVIDENCE_REF_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.project_budget_evidence_ref.evaluated" as const;

export const projectBudgetEvidenceTypes = ["BUDGET_RECORD", "BUDGET_LINE", "SPEND_EVIDENCE", "APPROVAL_EVIDENCE"] as const;

type ProjectBudgetEvidenceType = (typeof projectBudgetEvidenceTypes)[number];
type ProjectBudgetEvidenceDecision = "PROJECT_BUDGET_EVIDENCE_READY" | "PROJECT_BUDGET_EVIDENCE_REQUIRES_REVIEW" | "PROJECT_BUDGET_EVIDENCE_REJECTED";

export type ProjectBudgetEvidenceRefInput = {
  evidence_ref: string;
  finance_source_ref: string;
  evidence_type: ProjectBudgetEvidenceType;
  amount_minor_units?: number;
  currency_code?: string;
  captured_at?: string;
  read_model_version?: string;
};

export type ProjectBudgetEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  project_ref: string;
  budget_context_ref: string;
  evidence_refs: readonly ProjectBudgetEvidenceRefInput[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  finance_write_requested?: boolean;
  budget_allocation_requested?: boolean;
  payment_posting_requested?: boolean;
  reconciliation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedProjectBudgetEvidenceRef = {
  evidence_ref: string;
  finance_source_ref: string;
  evidence_type: ProjectBudgetEvidenceType;
  amount_minor_units: number | null;
  currency_code: string | null;
  captured_at: string | null;
  read_model_version: string | null;
};

export type ProjectBudgetEvidenceReceipt = {
  seed_id: typeof PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_SEED_ID;
  component_id: typeof PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CProjectBudgetEvidenceRef";
  event_name: typeof PROJECT_BUDGET_EVIDENCE_REF_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  project_ref: string;
  budget_context_ref: string;
  decision: ProjectBudgetEvidenceDecision;
  normalized_evidence_refs: readonly NormalizedProjectBudgetEvidenceRef[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  read_only_finance_reference: true;
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  finance_write_performed: false;
  budget_allocation_performed: false;
  payment_posting_performed: false;
  reconciliation_performed: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  project_budget_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for project_budget_evidence_ref.');
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
    throw new Error(field + ' must be a valid ISO-compatible timestamp for project_budget_evidence_ref.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | null {
  const normalized = optionalText(value);
  if (normalized === null) {
    return null;
  }
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for project_budget_evidence_ref.');
  }
  return normalized;
}

function requireOneOf<T extends string>(value: string, allowed: readonly T[], field: string): T {
  if (!allowed.includes(value as T)) {
    throw new Error(field + ' must be one of: ' + allowed.join(', '));
  }
  return value as T;
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

function digestEvidence(receiptWithoutDigest: Omit<ProjectBudgetEvidenceReceipt, 'project_budget_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: ProjectBudgetEvidenceInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.finance_write_requested, 'project_budget_evidence_ref must not write to Phase 6B Finance inside this FFET.'],
    [input.budget_allocation_requested, 'project_budget_evidence_ref must not allocate budget inside this FFET.'],
    [input.payment_posting_requested, 'project_budget_evidence_ref must not post payments inside this FFET.'],
    [input.reconciliation_requested, 'project_budget_evidence_ref must not execute reconciliation inside this FFET.'],
    [input.runtime_adapter_requested, 'project_budget_evidence_ref must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'project_budget_evidence_ref must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'project_budget_evidence_ref must not write cross-phase data inside this FFET.'],
    [input.frontend_publication_requested, 'project_budget_evidence_ref must not publish frontend routes inside this FFET.'],
    [input.ticket_flag_flip_requested, 'project_budget_evidence_ref must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function normalizeEvidenceRefs(evidenceRefs: readonly ProjectBudgetEvidenceRefInput[]): readonly NormalizedProjectBudgetEvidenceRef[] {
  if (evidenceRefs.length === 0) {
    throw new Error('evidence_refs must include at least one read-only Finance evidence reference.');
  }

  return evidenceRefs.map((evidence) => ({
    evidence_ref: requireNonEmpty(evidence.evidence_ref, 'evidence_ref'),
    finance_source_ref: requireNonEmpty(evidence.finance_source_ref, 'finance_source_ref'),
    evidence_type: requireOneOf(requireNonEmpty(evidence.evidence_type, 'evidence_type'), projectBudgetEvidenceTypes, 'evidence_type'),
    amount_minor_units: evidence.amount_minor_units ?? null,
    currency_code: optionalText(evidence.currency_code)?.toUpperCase() ?? null,
    captured_at: optionalTimestamp(evidence.captured_at, 'captured_at'),
    read_model_version: optionalText(evidence.read_model_version),
  })).sort((left, right) => left.evidence_ref.localeCompare(right.evidence_ref));
}

function evaluateEvidenceRefs(evidenceRefs: readonly NormalizedProjectBudgetEvidenceRef[]): { review_reasons: readonly string[]; rejection_reasons: readonly string[] } {
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];
  const seenEvidenceRefs = new Set<string>();

  for (const evidence of evidenceRefs) {
    if (seenEvidenceRefs.has(evidence.evidence_ref)) {
      rejectionReasons.push('duplicate_evidence_ref:' + evidence.evidence_ref);
    }
    seenEvidenceRefs.add(evidence.evidence_ref);

    if (evidence.amount_minor_units !== null && (!Number.isInteger(evidence.amount_minor_units) || evidence.amount_minor_units < 0)) {
      rejectionReasons.push('amount_minor_units_requires_non_negative_integer:' + evidence.evidence_ref);
    }
    if (evidence.amount_minor_units !== null && evidence.currency_code === null) {
      rejectionReasons.push('amount_requires_currency_code:' + evidence.evidence_ref);
    }
    if (evidence.amount_minor_units === null && evidence.currency_code !== null) {
      reviewReasons.push('currency_code_without_amount:' + evidence.evidence_ref);
    }
    if (evidence.currency_code !== null && !/^[A-Z]{3}$/.test(evidence.currency_code)) {
      rejectionReasons.push('currency_code_must_be_iso_4217_alpha_3:' + evidence.evidence_ref);
    }
    if (evidence.read_model_version === null) {
      reviewReasons.push('read_model_version_missing:' + evidence.evidence_ref);
    }
  }

  return {
    review_reasons: Array.from(new Set(reviewReasons)).sort(),
    rejection_reasons: Array.from(new Set(rejectionReasons)).sort(),
  };
}

export function evaluateProjectBudgetEvidenceRef(input: ProjectBudgetEvidenceInput): ProjectBudgetEvidenceReceipt {
  assertForbiddenRequests(input);

  const normalizedEvidenceRefs = normalizeEvidenceRefs(input.evidence_refs);
  const evaluation = evaluateEvidenceRefs(normalizedEvidenceRefs);
  const decision: ProjectBudgetEvidenceDecision = evaluation.rejection_reasons.length > 0
    ? 'PROJECT_BUDGET_EVIDENCE_REJECTED'
    : evaluation.review_reasons.length > 0
      ? 'PROJECT_BUDGET_EVIDENCE_REQUIRES_REVIEW'
      : 'PROJECT_BUDGET_EVIDENCE_READY';

  const receiptWithoutDigest: Omit<ProjectBudgetEvidenceReceipt, 'project_budget_evidence_digest'> = {
    seed_id: PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_SEED_ID,
    component_id: PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CProjectBudgetEvidenceRef",
    event_name: PROJECT_BUDGET_EVIDENCE_REF_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    project_ref: requireNonEmpty(input.project_ref, 'project_ref'),
    budget_context_ref: requireNonEmpty(input.budget_context_ref, 'budget_context_ref'),
    decision,
    normalized_evidence_refs: normalizedEvidenceRefs,
    review_reasons: evaluation.review_reasons,
    rejection_reasons: evaluation.rejection_reasons,
    decision_refs: ["6C-WORK-TASK-005", "6C-WORK-TASK-006"],
    read_only_finance_reference: true,
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    finance_write_performed: false,
    budget_allocation_performed: false,
    payment_posting_performed: false,
    reconciliation_performed: false,
    schema_mutation_performed: false,
    cross_phase_write_performed: false,
    frontend_publication_performed: false,
    ticket_flags_changed: false,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    project_budget_evidence_digest: digestEvidence(receiptWithoutDigest),
  };
}
