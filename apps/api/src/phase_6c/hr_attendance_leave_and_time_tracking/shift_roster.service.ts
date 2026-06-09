import { createHash } from 'node:crypto';

export const PHASE_6C_SHIFT_ROSTER_SEED_ID = "seed_6c_031_shift_roster" as const;
export const PHASE_6C_SHIFT_ROSTER_COMPONENT_ID = "6C.03" as const;
export const SHIFT_ROSTER_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.shift_roster.evaluated" as const;

export type ShiftRosterPattern = "FIXED" | "ROTATING" | "FLEXIBLE" | "NIGHT";
export type ShiftRosterDecision = "ROSTER_ACCEPTED" | "ROSTER_REJECTED";
export type ShiftRosterOverlapPolicy = "REJECT_OVERLAP" | "ALLOW_WITH_EXCEPTION";

export type ShiftRosterAssignment = {
  assignment_ref: string;
  employee_ref: string;
  roster_date: string;
  shift_start_at: string;
  shift_end_at: string;
  break_minutes: number;
  role_ref?: string;
  location_ref?: string;
};

export type ShiftRosterInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  roster_ref: string;
  roster_pattern: ShiftRosterPattern;
  effective_from: string;
  effective_to: string;
  roster_timezone: string;
  overlap_policy: ShiftRosterOverlapPolicy;
  maximum_shift_minutes: number;
  minimum_break_minutes: number;
  assignments: readonly ShiftRosterAssignment[];
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

export type ShiftRosterIssue = {
  issue_type: "ASSIGNMENT_OUTSIDE_EFFECTIVE_WINDOW" | "SHIFT_OVERLAP" | "SHIFT_DURATION_EXCEEDS_MAXIMUM" | "BREAK_BELOW_MINIMUM";
  assignment_ref: string;
  employee_ref: string;
  evidence_ref: string;
};

export type ShiftRosterReceipt = {
  seed_id: typeof PHASE_6C_SHIFT_ROSTER_SEED_ID;
  component_id: typeof PHASE_6C_SHIFT_ROSTER_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CShiftRoster";
  event_name: typeof SHIFT_ROSTER_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  roster_ref: string;
  roster_pattern: ShiftRosterPattern;
  effective_from: string;
  effective_to: string;
  roster_timezone: string;
  overlap_policy: ShiftRosterOverlapPolicy;
  maximum_shift_minutes: number;
  minimum_break_minutes: number;
  assignment_count: number;
  total_scheduled_minutes: number;
  decision: ShiftRosterDecision;
  issues: readonly ShiftRosterIssue[];
  provider_neutral_only: true;
  attendance_record_mutation_allowed: false;
  runtime_status: "SHIFT_ROSTER_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  roster_evidence_digest: string;
};

const VALID_PATTERNS: readonly ShiftRosterPattern[] = ["FIXED", "ROTATING", "FLEXIBLE", "NIGHT"];
const VALID_OVERLAP_POLICIES: readonly ShiftRosterOverlapPolicy[] = ["REJECT_OVERLAP", "ALLOW_WITH_EXCEPTION"];
const DECISION_REFS = ["6C-ATT-002", "6C-ATT-012", "6C-ATT-019"] as const;
const EVIDENCE_ARTIFACTS = [
  "shift_roster_decision_receipt",
  "shift_roster_assignment_evidence",
  "shift_roster_conflict_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for shift_roster.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for shift_roster.');
  }
  return normalized;
}

function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(field + ' must use YYYY-MM-DD format for shift_roster.');
  }
  return normalized;
}

function requirePositiveNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(field + ' must be a positive finite number for shift_roster.');
  }
  return value;
}

function requireNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for shift_roster.');
  }
  return value;
}

function rejectForbiddenRequests(input: ShiftRosterInput): void {
  const forbiddenFlags: Array<[keyof ShiftRosterInput, string]> = [
    ['direct_attendance_record_mutation_requested', 'shift_roster must model roster evidence and must not mutate attendance records directly.'],
    ['provider_specific_adapter_requested', 'shift_roster must remain provider-neutral.'],
    ['schema_mutation_requested', 'shift_roster must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'shift_roster must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'shift_roster must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'shift_roster must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'shift_roster must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function requirePattern(value: ShiftRosterPattern): ShiftRosterPattern {
  if (!VALID_PATTERNS.includes(value)) {
    throw new Error('roster_pattern is not allowed for shift_roster.');
  }
  return value;
}

function requireOverlapPolicy(value: ShiftRosterOverlapPolicy): ShiftRosterOverlapPolicy {
  if (!VALID_OVERLAP_POLICIES.includes(value)) {
    throw new Error('overlap_policy is not allowed for shift_roster.');
  }
  return value;
}

function minutesBetween(start: string, end: string): number {
  return (Date.parse(end) - Date.parse(start)) / 60000;
}

function overlaps(a: ShiftRosterAssignment, b: ShiftRosterAssignment): boolean {
  return a.employee_ref === b.employee_ref
    && a.shift_start_at < b.shift_end_at
    && b.shift_start_at < a.shift_end_at;
}

function issue(issueType: ShiftRosterIssue['issue_type'], assignmentRef: string, employeeRef: string): ShiftRosterIssue {
  return {
    issue_type: issueType,
    assignment_ref: assignmentRef,
    employee_ref: employeeRef,
    evidence_ref: assignmentRef + ':' + issueType.toLowerCase(),
  };
}

function digestRoster(receiptWithoutDigest: Omit<ShiftRosterReceipt, 'roster_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateShiftRoster(input: ShiftRosterInput): ShiftRosterReceipt {
  rejectForbiddenRequests(input);

  const effectiveFrom = requireDate(input.effective_from, 'effective_from');
  const effectiveTo = requireDate(input.effective_to, 'effective_to');
  if (effectiveFrom > effectiveTo) {
    throw new Error('effective_from must be on or before effective_to for shift_roster.');
  }

  const maximumShiftMinutes = requirePositiveNumber(input.maximum_shift_minutes, 'maximum_shift_minutes');
  const minimumBreakMinutes = requireNonNegativeNumber(input.minimum_break_minutes, 'minimum_break_minutes');
  if (input.assignments.length === 0) {
    throw new Error('assignments must contain at least one roster assignment for shift_roster.');
  }

  const normalizedAssignments = input.assignments.map((assignment) => {
    const normalized = {
      assignment_ref: requireNonEmpty(assignment.assignment_ref, 'assignment_ref'),
      employee_ref: requireNonEmpty(assignment.employee_ref, 'employee_ref'),
      roster_date: requireDate(assignment.roster_date, 'roster_date'),
      shift_start_at: requireTimestamp(assignment.shift_start_at, 'shift_start_at'),
      shift_end_at: requireTimestamp(assignment.shift_end_at, 'shift_end_at'),
      break_minutes: requireNonNegativeNumber(assignment.break_minutes, 'break_minutes'),
    };
    if (minutesBetween(normalized.shift_start_at, normalized.shift_end_at) <= 0) {
      throw new Error('shift_end_at must be after shift_start_at for shift_roster.');
    }
    return normalized;
  });

  const issues: ShiftRosterIssue[] = [];
  let totalScheduledMinutes = 0;
  for (const assignment of normalizedAssignments) {
    const duration = minutesBetween(assignment.shift_start_at, assignment.shift_end_at);
    totalScheduledMinutes += duration - assignment.break_minutes;

    if (assignment.roster_date < effectiveFrom || assignment.roster_date > effectiveTo) {
      issues.push(issue("ASSIGNMENT_OUTSIDE_EFFECTIVE_WINDOW", assignment.assignment_ref, assignment.employee_ref));
    }
    if (duration > maximumShiftMinutes) {
      issues.push(issue("SHIFT_DURATION_EXCEEDS_MAXIMUM", assignment.assignment_ref, assignment.employee_ref));
    }
    if (assignment.break_minutes < minimumBreakMinutes) {
      issues.push(issue("BREAK_BELOW_MINIMUM", assignment.assignment_ref, assignment.employee_ref));
    }
  }

  if (input.overlap_policy === "REJECT_OVERLAP") {
    for (let i = 0; i < normalizedAssignments.length; i += 1) {
      for (let j = i + 1; j < normalizedAssignments.length; j += 1) {
        const first = normalizedAssignments[i];
        const second = normalizedAssignments[j];
        if (first !== undefined && second !== undefined && overlaps(first, second)) {
          issues.push(issue("SHIFT_OVERLAP", second.assignment_ref, second.employee_ref));
        }
      }
    }
  }

  const receiptWithoutDigest: Omit<ShiftRosterReceipt, 'roster_evidence_digest'> = {
    seed_id: PHASE_6C_SHIFT_ROSTER_SEED_ID,
    component_id: PHASE_6C_SHIFT_ROSTER_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CShiftRoster",
    event_name: SHIFT_ROSTER_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    roster_ref: requireNonEmpty(input.roster_ref, 'roster_ref'),
    roster_pattern: requirePattern(input.roster_pattern),
    effective_from: effectiveFrom,
    effective_to: effectiveTo,
    roster_timezone: requireNonEmpty(input.roster_timezone, 'roster_timezone'),
    overlap_policy: requireOverlapPolicy(input.overlap_policy),
    maximum_shift_minutes: maximumShiftMinutes,
    minimum_break_minutes: minimumBreakMinutes,
    assignment_count: normalizedAssignments.length,
    total_scheduled_minutes: totalScheduledMinutes,
    decision: issues.length === 0 ? "ROSTER_ACCEPTED" : "ROSTER_REJECTED",
    issues,
    provider_neutral_only: true,
    attendance_record_mutation_allowed: false,
    runtime_status: "SHIFT_ROSTER_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    roster_evidence_digest: digestRoster(receiptWithoutDigest),
  };
}
