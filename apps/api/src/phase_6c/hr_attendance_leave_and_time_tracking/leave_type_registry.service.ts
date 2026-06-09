import { createHash } from 'node:crypto';

export const PHASE_6C_LEAVE_TYPE_REGISTRY_SEED_ID = "seed_6c_033_leave_type_registry" as const;
export const PHASE_6C_LEAVE_TYPE_REGISTRY_COMPONENT_ID = "6C.03" as const;
export const LEAVE_TYPE_REGISTRY_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.leave_type_registry.evaluated" as const;

export type LeaveTypeCategory = "PAID" | "UNPAID" | "STATUTORY" | "SPECIAL";
export type LeaveEntitlementUnit = "DAYS" | "HOURS";
export type LeaveTypeRegistryDecision = "REGISTRY_ACCEPTED" | "REGISTRY_REJECTED";

export type LeaveTypeDefinition = {
  leave_type_ref: string;
  leave_code: string;
  display_name: string;
  category: LeaveTypeCategory;
  entitlement_unit: LeaveEntitlementUnit;
  paid: boolean;
  requestable_by_employee: boolean;
  accrual_enabled: boolean;
  carry_forward_enabled: boolean;
  requires_approval: boolean;
  negative_balance_allowed: boolean;
  annual_entitlement_units?: number;
  max_carry_forward_units?: number;
};

export type LeaveTypeRegistryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  registry_ref: string;
  effective_from: string;
  effective_to: string;
  leave_types: readonly LeaveTypeDefinition[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  direct_attendance_record_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type LeaveTypeRegistryIssue = {
  issue_type: "DUPLICATE_LEAVE_CODE" | "ACCRUAL_REQUIRES_ENTITLEMENT" | "CARRY_FORWARD_REQUIRES_ACCRUAL" | "CARRY_FORWARD_REQUIRES_LIMIT";
  leave_type_ref: string;
  leave_code: string;
  evidence_ref: string;
};

export type LeaveTypeRegistryReceipt = {
  seed_id: typeof PHASE_6C_LEAVE_TYPE_REGISTRY_SEED_ID;
  component_id: typeof PHASE_6C_LEAVE_TYPE_REGISTRY_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CLeaveTypeRegistry";
  event_name: typeof LEAVE_TYPE_REGISTRY_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  registry_ref: string;
  effective_from: string;
  effective_to: string;
  leave_type_count: number;
  paid_leave_type_count: number;
  employee_requestable_count: number;
  accrual_enabled_count: number;
  carry_forward_enabled_count: number;
  decision: LeaveTypeRegistryDecision;
  issues: readonly LeaveTypeRegistryIssue[];
  provider_neutral_only: true;
  attendance_record_mutation_allowed: false;
  runtime_status: "LEAVE_TYPE_REGISTRY_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  leave_type_registry_evidence_digest: string;
};

const VALID_CATEGORIES: readonly LeaveTypeCategory[] = ["PAID", "UNPAID", "STATUTORY", "SPECIAL"];
const VALID_UNITS: readonly LeaveEntitlementUnit[] = ["DAYS", "HOURS"];
const DECISION_REFS = ["6C-ATT-002", "6C-ATT-014", "6C-ATT-019"] as const;
const EVIDENCE_ARTIFACTS = [
  "leave_type_registry_decision_receipt",
  "leave_type_registry_definition_evidence",
  "leave_type_registry_policy_issue_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for leave_type_registry.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for leave_type_registry.');
  }
  return normalized;
}

function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(field + ' must use YYYY-MM-DD format for leave_type_registry.');
  }
  return normalized;
}

function optionalPositiveNumber(value: number | undefined, field: string): number | null {
  if (value === undefined) {
    return null;
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(field + ' must be a positive finite number when supplied for leave_type_registry.');
  }
  return value;
}

function requireCategory(value: LeaveTypeCategory): LeaveTypeCategory {
  if (!VALID_CATEGORIES.includes(value)) {
    throw new Error('category is not allowed for leave_type_registry.');
  }
  return value;
}

function requireUnit(value: LeaveEntitlementUnit): LeaveEntitlementUnit {
  if (!VALID_UNITS.includes(value)) {
    throw new Error('entitlement_unit is not allowed for leave_type_registry.');
  }
  return value;
}

function rejectForbiddenRequests(input: LeaveTypeRegistryInput): void {
  const forbiddenFlags: Array<[keyof LeaveTypeRegistryInput, string]> = [
    ['direct_attendance_record_mutation_requested', 'leave_type_registry must model leave policy evidence and must not mutate attendance records directly.'],
    ['provider_specific_adapter_requested', 'leave_type_registry must remain provider-neutral.'],
    ['schema_mutation_requested', 'leave_type_registry must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'leave_type_registry must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'leave_type_registry must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'leave_type_registry must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'leave_type_registry must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function issue(issueType: LeaveTypeRegistryIssue['issue_type'], leaveTypeRef: string, leaveCode: string): LeaveTypeRegistryIssue {
  return {
    issue_type: issueType,
    leave_type_ref: leaveTypeRef,
    leave_code: leaveCode,
    evidence_ref: leaveTypeRef + ':' + issueType.toLowerCase(),
  };
}

function digestRegistry(receiptWithoutDigest: Omit<LeaveTypeRegistryReceipt, 'leave_type_registry_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateLeaveTypeRegistry(input: LeaveTypeRegistryInput): LeaveTypeRegistryReceipt {
  rejectForbiddenRequests(input);

  const effectiveFrom = requireDate(input.effective_from, 'effective_from');
  const effectiveTo = requireDate(input.effective_to, 'effective_to');
  if (effectiveFrom > effectiveTo) {
    throw new Error('effective_from must be on or before effective_to for leave_type_registry.');
  }
  if (input.leave_types.length === 0) {
    throw new Error('leave_types must contain at least one configurable leave type.');
  }

  const issues: LeaveTypeRegistryIssue[] = [];
  const seenCodes = new Set<string>();
  let paidLeaveTypeCount = 0;
  let employeeRequestableCount = 0;
  let accrualEnabledCount = 0;
  let carryForwardEnabledCount = 0;

  for (const leaveType of input.leave_types) {
    const leaveTypeRef = requireNonEmpty(leaveType.leave_type_ref, 'leave_type_ref');
    const leaveCode = requireNonEmpty(leaveType.leave_code, 'leave_code').toUpperCase();
    requireNonEmpty(leaveType.display_name, 'display_name');
    requireCategory(leaveType.category);
    requireUnit(leaveType.entitlement_unit);
    const annualEntitlementUnits = optionalPositiveNumber(leaveType.annual_entitlement_units, 'annual_entitlement_units');
    const maxCarryForwardUnits = optionalPositiveNumber(leaveType.max_carry_forward_units, 'max_carry_forward_units');

    if (leaveType.paid) {
      paidLeaveTypeCount += 1;
    }
    if (leaveType.requestable_by_employee) {
      employeeRequestableCount += 1;
    }
    if (leaveType.accrual_enabled) {
      accrualEnabledCount += 1;
    }
    if (leaveType.carry_forward_enabled) {
      carryForwardEnabledCount += 1;
    }
    if (seenCodes.has(leaveCode)) {
      issues.push(issue("DUPLICATE_LEAVE_CODE", leaveTypeRef, leaveCode));
    }
    if (leaveType.accrual_enabled && annualEntitlementUnits === null) {
      issues.push(issue("ACCRUAL_REQUIRES_ENTITLEMENT", leaveTypeRef, leaveCode));
    }
    if (leaveType.carry_forward_enabled && !leaveType.accrual_enabled) {
      issues.push(issue("CARRY_FORWARD_REQUIRES_ACCRUAL", leaveTypeRef, leaveCode));
    }
    if (leaveType.carry_forward_enabled && maxCarryForwardUnits === null) {
      issues.push(issue("CARRY_FORWARD_REQUIRES_LIMIT", leaveTypeRef, leaveCode));
    }
    seenCodes.add(leaveCode);
  }

  const receiptWithoutDigest: Omit<LeaveTypeRegistryReceipt, 'leave_type_registry_evidence_digest'> = {
    seed_id: PHASE_6C_LEAVE_TYPE_REGISTRY_SEED_ID,
    component_id: PHASE_6C_LEAVE_TYPE_REGISTRY_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CLeaveTypeRegistry",
    event_name: LEAVE_TYPE_REGISTRY_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    registry_ref: requireNonEmpty(input.registry_ref, 'registry_ref'),
    effective_from: effectiveFrom,
    effective_to: effectiveTo,
    leave_type_count: input.leave_types.length,
    paid_leave_type_count: paidLeaveTypeCount,
    employee_requestable_count: employeeRequestableCount,
    accrual_enabled_count: accrualEnabledCount,
    carry_forward_enabled_count: carryForwardEnabledCount,
    decision: issues.length === 0 ? "REGISTRY_ACCEPTED" : "REGISTRY_REJECTED",
    issues,
    provider_neutral_only: true,
    attendance_record_mutation_allowed: false,
    runtime_status: "LEAVE_TYPE_REGISTRY_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    leave_type_registry_evidence_digest: digestRegistry(receiptWithoutDigest),
  };
}
