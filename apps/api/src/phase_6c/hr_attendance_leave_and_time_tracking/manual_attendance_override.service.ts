import { createHash } from 'node:crypto';

export const PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_SEED_ID = "seed_6c_028_manual_attendance_override" as const;
export const PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_COMPONENT_ID = "6C.03" as const;
export const MANUAL_ATTENDANCE_OVERRIDE_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.manual_attendance_override.evaluated" as const;

export type ManualAttendanceOverrideAction =
  | "CREATE_CHECK_IN"
  | "CREATE_CHECK_OUT"
  | "CORRECT_CHECK_IN"
  | "CORRECT_CHECK_OUT"
  | "MARK_ABSENT";

export type ManualAttendanceOverrideDecision =
  | "APPROVED_FOR_RECORDING"
  | "PENDING_APPROVAL"
  | "REJECTED";

export type ManualAttendanceOverrideInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  override_action: ManualAttendanceOverrideAction;
  override_effective_at: string;
  server_recorded_at: string;
  reason_ref: string;
  reason_text: string;
  requested_by_user_id: string;
  approval_required?: boolean;
  approval_ref?: string;
  duplicate_detected?: boolean;
  duplicate_exception_ref?: string;
  fallback_method_ref?: string;
  control_metadata?: Record<string, unknown>;
  reasonless_override_requested?: boolean;
  approval_bypass_requested?: boolean;
  direct_attendance_record_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ManualAttendanceOverrideReceipt = {
  seed_id: typeof PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_SEED_ID;
  component_id: typeof PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CManualAttendanceOverride";
  event_name: typeof MANUAL_ATTENDANCE_OVERRIDE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  override_action: ManualAttendanceOverrideAction;
  override_effective_at: string;
  server_recorded_at: string;
  requested_by_user_id: string;
  reason_ref: string;
  reason_text: string;
  approval_required: boolean;
  approval_default_on: true;
  approval_ref: string | null;
  duplicate_detected: boolean;
  duplicate_exception_ref: string | null;
  duplicate_exception_recorded: boolean;
  fallback_method_ref: string | null;
  provider_neutral_only: true;
  fallback_methods_allowed: true;
  attendance_record_mutation_allowed: false;
  runtime_status: "MANUAL_ATTENDANCE_OVERRIDE_EVALUATED";
  decision: ManualAttendanceOverrideDecision;
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  override_evidence_digest: string;
};

const VALID_OVERRIDE_ACTIONS: readonly ManualAttendanceOverrideAction[] = [
  "CREATE_CHECK_IN",
  "CREATE_CHECK_OUT",
  "CORRECT_CHECK_IN",
  "CORRECT_CHECK_OUT",
  "MARK_ABSENT",
];

const DECISION_REFS = [
  "6C-ATT-001",
  "6C-ATT-002",
  "6C-ATT-008",
  "6C-ATT-010",
  "6C-ATT-011",
  "6C-ATT-019",
] as const;

const EVIDENCE_ARTIFACTS = [
  "manual_attendance_override_decision_receipt",
  "manual_attendance_override_reason_evidence",
  "manual_attendance_override_approval_default_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for manual_attendance_override.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' must be non-empty when supplied for manual_attendance_override.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for manual_attendance_override.');
  }
  return normalized;
}

function requireOverrideAction(value: ManualAttendanceOverrideAction): ManualAttendanceOverrideAction {
  if (!VALID_OVERRIDE_ACTIONS.includes(value)) {
    throw new Error('override_action is not allowed for manual_attendance_override.');
  }
  return value;
}

function rejectForbiddenRequests(input: ManualAttendanceOverrideInput): void {
  const forbiddenFlags: Array<[keyof ManualAttendanceOverrideInput, string]> = [
    ['reasonless_override_requested', 'manual_attendance_override requires a reason for every override.'],
    ['approval_bypass_requested', 'manual_attendance_override must not bypass approval defaults.'],
    ['direct_attendance_record_mutation_requested', 'manual_attendance_override must emit evidence and must not mutate attendance records directly.'],
    ['provider_specific_adapter_requested', 'manual_attendance_override must remain provider-neutral.'],
    ['schema_mutation_requested', 'manual_attendance_override must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'manual_attendance_override must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'manual_attendance_override must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'manual_attendance_override must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'manual_attendance_override must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function decideManualOverride(approvalRequired: boolean, approvalRef: string | null, duplicateDetected: boolean, duplicateExceptionRef: string | null): {
  decision: ManualAttendanceOverrideDecision;
  rejectionReasons: string[];
} {
  const rejectionReasons: string[] = [];

  if (duplicateDetected && duplicateExceptionRef === null) {
    rejectionReasons.push('DUPLICATE_DETECTED_EXCEPTION_REQUIRED');
  }

  if (rejectionReasons.length > 0) {
    return {
      decision: "REJECTED",
      rejectionReasons,
    };
  }

  if (approvalRequired && approvalRef === null) {
    return {
      decision: "PENDING_APPROVAL",
      rejectionReasons,
    };
  }

  return {
    decision: "APPROVED_FOR_RECORDING",
    rejectionReasons,
  };
}

function digestOverride(receiptWithoutDigest: Omit<ManualAttendanceOverrideReceipt, 'override_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateManualAttendanceOverride(input: ManualAttendanceOverrideInput): ManualAttendanceOverrideReceipt {
  rejectForbiddenRequests(input);

  const approvalRequired = input.approval_required ?? true;
  const approvalRef = optionalNonEmpty(input.approval_ref, 'approval_ref');
  const duplicateDetected = input.duplicate_detected === true;
  const duplicateExceptionRef = optionalNonEmpty(input.duplicate_exception_ref, 'duplicate_exception_ref');
  const fallbackMethodRef = optionalNonEmpty(input.fallback_method_ref, 'fallback_method_ref');
  const decision = decideManualOverride(approvalRequired, approvalRef, duplicateDetected, duplicateExceptionRef);

  const receiptWithoutDigest: Omit<ManualAttendanceOverrideReceipt, 'override_evidence_digest'> = {
    seed_id: PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_SEED_ID,
    component_id: PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CManualAttendanceOverride",
    event_name: MANUAL_ATTENDANCE_OVERRIDE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    override_action: requireOverrideAction(input.override_action),
    override_effective_at: requireTimestamp(input.override_effective_at, 'override_effective_at'),
    server_recorded_at: requireTimestamp(input.server_recorded_at, 'server_recorded_at'),
    requested_by_user_id: requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id'),
    reason_ref: requireNonEmpty(input.reason_ref, 'reason_ref'),
    reason_text: requireNonEmpty(input.reason_text, 'reason_text'),
    approval_required: approvalRequired,
    approval_default_on: true,
    approval_ref: approvalRef,
    duplicate_detected: duplicateDetected,
    duplicate_exception_ref: duplicateExceptionRef,
    duplicate_exception_recorded: duplicateDetected && duplicateExceptionRef !== null,
    fallback_method_ref: fallbackMethodRef,
    provider_neutral_only: true,
    fallback_methods_allowed: true,
    attendance_record_mutation_allowed: false,
    runtime_status: "MANUAL_ATTENDANCE_OVERRIDE_EVALUATED",
    decision: decision.decision,
    rejection_reasons: decision.rejectionReasons,
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    override_evidence_digest: digestOverride(receiptWithoutDigest),
  };
}
