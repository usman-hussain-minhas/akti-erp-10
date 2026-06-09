import { createHash } from 'node:crypto';

export const PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SEED_ID = "seed_6c_008_employee_lifecycle_status_history" as const;
export const PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_LIFECYCLE_STATUS_HISTORY_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_lifecycle_status_history.runtime_evaluated" as const;
export const EMPLOYEE_LIFECYCLE_HARD_ANCHORS = ['active', 'inactive', 'terminated'] as const;

export type EmployeeLifecycleHardAnchor = typeof EMPLOYEE_LIFECYCLE_HARD_ANCHORS[number];

export type EmployeeLifecycleStatusLabel = {
  label_code: string;
  label_text: string;
  anchor: EmployeeLifecycleHardAnchor;
  is_default_for_anchor?: boolean;
};

export type EmployeeLifecycleStatusChange = {
  change_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  status_label_code: string;
  effective_at: string;
  reason_ref?: string;
  evidence_ref: string;
};

export type EmployeeLifecycleStatusHistoryRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  status_labels: readonly EmployeeLifecycleStatusLabel[];
  status_changes: readonly EmployeeLifecycleStatusChange[];
  control_metadata?: Record<string, unknown>;
  hard_anchor_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedEmployeeLifecycleStatusChange = EmployeeLifecycleStatusChange & {
  anchor: EmployeeLifecycleHardAnchor;
  label_text: string;
};

export type EmployeeLifecycleStatusHistoryRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeLifecycleStatusHistory";
  event_name: typeof EMPLOYEE_LIFECYCLE_STATUS_HISTORY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYEE_LIFECYCLE_STATUS_HISTORY_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  hard_anchors: readonly EmployeeLifecycleHardAnchor[];
  status_labels: readonly EmployeeLifecycleStatusLabel[];
  status_changes: readonly NormalizedEmployeeLifecycleStatusChange[];
  current_status_by_employee: Record<string, NormalizedEmployeeLifecycleStatusChange>;
  status_counts: {
    labels: number;
    changes: number;
    active_employees: number;
    inactive_employees: number;
    terminated_employees: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for employee_lifecycle_status_history runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for employee_lifecycle_status_history runtime.');
  }
  return normalized;
}

function requireAnchor(value: EmployeeLifecycleHardAnchor): EmployeeLifecycleHardAnchor {
  if (!EMPLOYEE_LIFECYCLE_HARD_ANCHORS.includes(value)) {
    throw new Error('anchor must be one of active, inactive, or terminated for employee_lifecycle_status_history runtime.');
  }
  return value;
}

function assertUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(field + ' must be unique for employee_lifecycle_status_history runtime: ' + value);
    }
    seen.add(value);
  }
}

function digestRuntime(receiptWithoutDigest: Omit<EmployeeLifecycleStatusHistoryRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateEmployeeLifecycleStatusHistoryRuntime(input: EmployeeLifecycleStatusHistoryRuntimeInput): EmployeeLifecycleStatusHistoryRuntimeReceipt {
  if (input.hard_anchor_mutation_requested === true) {
    throw new Error('employee_lifecycle_status_history runtime must not mutate hard lifecycle anchors.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('employee_lifecycle_status_history runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('employee_lifecycle_status_history runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('employee_lifecycle_status_history runtime must not mutate Phase 6B records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('employee_lifecycle_status_history runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('employee_lifecycle_status_history runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const statusLabels = input.status_labels.map((label) => ({
    label_code: requireNonEmpty(label.label_code, 'label_code'),
    label_text: requireNonEmpty(label.label_text, 'label_text'),
    anchor: requireAnchor(label.anchor),
    is_default_for_anchor: label.is_default_for_anchor === true,
  })).sort((left, right) => left.anchor.localeCompare(right.anchor) || left.label_code.localeCompare(right.label_code));
  assertUnique(statusLabels.map((label) => label.label_code), 'label_code');

  for (const anchor of EMPLOYEE_LIFECYCLE_HARD_ANCHORS) {
    if (!statusLabels.some((label) => label.anchor === anchor)) {
      throw new Error('each hard lifecycle anchor must have at least one configurable label for employee_lifecycle_status_history runtime: ' + anchor);
    }
    if (statusLabels.filter((label) => label.anchor === anchor && label.is_default_for_anchor === true).length > 1) {
      throw new Error('each hard lifecycle anchor must have no more than one default label for employee_lifecycle_status_history runtime: ' + anchor);
    }
  }

  const labelByCode = new Map(statusLabels.map((label) => [label.label_code, label]));
  const statusChanges = input.status_changes.map((change) => {
    const statusLabelCode = requireNonEmpty(change.status_label_code, 'status_label_code');
    const label = labelByCode.get(statusLabelCode);
    if (label === undefined) {
      throw new Error('status change references an unknown status_label_code for employee_lifecycle_status_history runtime: ' + statusLabelCode);
    }
    return {
      change_ref: requireNonEmpty(change.change_ref, 'change_ref'),
      employee_record_ref: requireNonEmpty(change.employee_record_ref, 'employee_record_ref'),
      person_identity_anchor_id: requireNonEmpty(change.person_identity_anchor_id, 'person_identity_anchor_id'),
      status_label_code: statusLabelCode,
      effective_at: requireTimestamp(change.effective_at, 'status_effective_at'),
      reason_ref: change.reason_ref === undefined ? undefined : requireNonEmpty(change.reason_ref, 'reason_ref'),
      evidence_ref: requireNonEmpty(change.evidence_ref, 'evidence_ref'),
      anchor: label.anchor,
      label_text: label.label_text,
    };
  }).sort((left, right) => left.employee_record_ref.localeCompare(right.employee_record_ref) || left.effective_at.localeCompare(right.effective_at) || left.change_ref.localeCompare(right.change_ref));
  assertUnique(statusChanges.map((change) => change.change_ref), 'change_ref');

  const currentStatusByEmployee: Record<string, NormalizedEmployeeLifecycleStatusChange> = {};
  for (const change of statusChanges) {
    if (Date.parse(change.effective_at) <= Date.parse(evaluatedAt)) {
      currentStatusByEmployee[change.employee_record_ref] = change;
    }
  }

  const currentStatuses = Object.values(currentStatusByEmployee);
  const receiptWithoutDigest: Omit<EmployeeLifecycleStatusHistoryRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SEED_ID,
    component_id: PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CEmployeeLifecycleStatusHistory",
    event_name: EMPLOYEE_LIFECYCLE_STATUS_HISTORY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'EMPLOYEE_LIFECYCLE_STATUS_HISTORY_VALIDATED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-HR-EMP-008", "6C-SCHEMA-006", "6C-NON-007"],
    hard_anchors: EMPLOYEE_LIFECYCLE_HARD_ANCHORS,
    status_labels: statusLabels,
    status_changes: statusChanges,
    current_status_by_employee: currentStatusByEmployee,
    status_counts: {
      labels: statusLabels.length,
      changes: statusChanges.length,
      active_employees: currentStatuses.filter((change) => change.anchor === 'active').length,
      inactive_employees: currentStatuses.filter((change) => change.anchor === 'inactive').length,
      terminated_employees: currentStatuses.filter((change) => change.anchor === 'terminated').length,
    },
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
