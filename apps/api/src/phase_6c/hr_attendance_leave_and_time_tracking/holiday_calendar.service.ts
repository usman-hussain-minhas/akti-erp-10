import { createHash } from 'node:crypto';

export const PHASE_6C_HOLIDAY_CALENDAR_SEED_ID = "seed_6c_032_holiday_calendar" as const;
export const PHASE_6C_HOLIDAY_CALENDAR_COMPONENT_ID = "6C.03" as const;
export const HOLIDAY_CALENDAR_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.holiday_calendar.evaluated" as const;

export type HolidayCalendarScope = "ORGANIZATION" | "BRANCH";
export type HolidayCalendarDecision = "CALENDAR_ACCEPTED" | "CALENDAR_REJECTED";
export type HolidayCalendarEntryType = "PUBLIC_HOLIDAY" | "OPTIONAL_HOLIDAY" | "SPECIAL_CLOSURE" | "WORKING_DAY_OVERRIDE";

export type HolidayCalendarEntry = {
  holiday_ref: string;
  holiday_date: string;
  holiday_name: string;
  holiday_type: HolidayCalendarEntryType;
  paid_leave_default: boolean;
  attendance_required: boolean;
};

export type HolidayCalendarInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  calendar_ref: string;
  calendar_scope: HolidayCalendarScope;
  branch_ref?: string;
  effective_from: string;
  effective_to: string;
  entries: readonly HolidayCalendarEntry[];
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

export type HolidayCalendarIssue = {
  issue_type: "BRANCH_SCOPE_REQUIRES_BRANCH_REF" | "ENTRY_OUTSIDE_EFFECTIVE_WINDOW" | "DUPLICATE_HOLIDAY_DATE";
  holiday_ref: string | null;
  holiday_date: string | null;
  evidence_ref: string;
};

export type HolidayCalendarReceipt = {
  seed_id: typeof PHASE_6C_HOLIDAY_CALENDAR_SEED_ID;
  component_id: typeof PHASE_6C_HOLIDAY_CALENDAR_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CHolidayCalendar";
  event_name: typeof HOLIDAY_CALENDAR_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  calendar_ref: string;
  calendar_scope: HolidayCalendarScope;
  branch_ref: string | null;
  effective_from: string;
  effective_to: string;
  entry_count: number;
  paid_leave_count: number;
  attendance_required_count: number;
  decision: HolidayCalendarDecision;
  issues: readonly HolidayCalendarIssue[];
  provider_neutral_only: true;
  attendance_record_mutation_allowed: false;
  runtime_status: "HOLIDAY_CALENDAR_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  holiday_calendar_evidence_digest: string;
};

const VALID_SCOPES: readonly HolidayCalendarScope[] = ["ORGANIZATION", "BRANCH"];
const VALID_ENTRY_TYPES: readonly HolidayCalendarEntryType[] = ["PUBLIC_HOLIDAY", "OPTIONAL_HOLIDAY", "SPECIAL_CLOSURE", "WORKING_DAY_OVERRIDE"];
const DECISION_REFS = ["6C-ATT-002", "6C-ATT-013", "6C-ATT-019"] as const;
const EVIDENCE_ARTIFACTS = [
  "holiday_calendar_decision_receipt",
  "holiday_calendar_entry_evidence",
  "holiday_calendar_scope_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for holiday_calendar.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' must be non-empty when supplied for holiday_calendar.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for holiday_calendar.');
  }
  return normalized;
}

function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(field + ' must use YYYY-MM-DD format for holiday_calendar.');
  }
  return normalized;
}

function requireScope(value: HolidayCalendarScope): HolidayCalendarScope {
  if (!VALID_SCOPES.includes(value)) {
    throw new Error('calendar_scope is not allowed for holiday_calendar.');
  }
  return value;
}

function requireEntryType(value: HolidayCalendarEntryType): HolidayCalendarEntryType {
  if (!VALID_ENTRY_TYPES.includes(value)) {
    throw new Error('holiday_type is not allowed for holiday_calendar.');
  }
  return value;
}

function rejectForbiddenRequests(input: HolidayCalendarInput): void {
  const forbiddenFlags: Array<[keyof HolidayCalendarInput, string]> = [
    ['direct_attendance_record_mutation_requested', 'holiday_calendar must model calendar evidence and must not mutate attendance records directly.'],
    ['provider_specific_adapter_requested', 'holiday_calendar must remain provider-neutral.'],
    ['schema_mutation_requested', 'holiday_calendar must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'holiday_calendar must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'holiday_calendar must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'holiday_calendar must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'holiday_calendar must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function issue(issueType: HolidayCalendarIssue['issue_type'], holidayRef: string | null, holidayDate: string | null): HolidayCalendarIssue {
  return {
    issue_type: issueType,
    holiday_ref: holidayRef,
    holiday_date: holidayDate,
    evidence_ref: (holidayRef ?? 'calendar_scope') + ':' + issueType.toLowerCase(),
  };
}

function digestCalendar(receiptWithoutDigest: Omit<HolidayCalendarReceipt, 'holiday_calendar_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateHolidayCalendar(input: HolidayCalendarInput): HolidayCalendarReceipt {
  rejectForbiddenRequests(input);

  const calendarScope = requireScope(input.calendar_scope);
  const branchRef = optionalNonEmpty(input.branch_ref, 'branch_ref');
  const effectiveFrom = requireDate(input.effective_from, 'effective_from');
  const effectiveTo = requireDate(input.effective_to, 'effective_to');
  if (effectiveFrom > effectiveTo) {
    throw new Error('effective_from must be on or before effective_to for holiday_calendar.');
  }
  if (input.entries.length === 0) {
    throw new Error('entries must contain at least one holiday calendar entry.');
  }

  const issues: HolidayCalendarIssue[] = [];
  const seenDates = new Set<string>();
  let paidLeaveCount = 0;
  let attendanceRequiredCount = 0;

  if (calendarScope === "BRANCH" && branchRef === null) {
    issues.push(issue("BRANCH_SCOPE_REQUIRES_BRANCH_REF", null, null));
  }

  for (const entry of input.entries) {
    const holidayRef = requireNonEmpty(entry.holiday_ref, 'holiday_ref');
    const holidayDate = requireDate(entry.holiday_date, 'holiday_date');
    requireNonEmpty(entry.holiday_name, 'holiday_name');
    requireEntryType(entry.holiday_type);

    if (entry.paid_leave_default) {
      paidLeaveCount += 1;
    }
    if (entry.attendance_required) {
      attendanceRequiredCount += 1;
    }
    if (holidayDate < effectiveFrom || holidayDate > effectiveTo) {
      issues.push(issue("ENTRY_OUTSIDE_EFFECTIVE_WINDOW", holidayRef, holidayDate));
    }
    if (seenDates.has(holidayDate)) {
      issues.push(issue("DUPLICATE_HOLIDAY_DATE", holidayRef, holidayDate));
    }
    seenDates.add(holidayDate);
  }

  const receiptWithoutDigest: Omit<HolidayCalendarReceipt, 'holiday_calendar_evidence_digest'> = {
    seed_id: PHASE_6C_HOLIDAY_CALENDAR_SEED_ID,
    component_id: PHASE_6C_HOLIDAY_CALENDAR_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CHolidayCalendar",
    event_name: HOLIDAY_CALENDAR_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    calendar_ref: requireNonEmpty(input.calendar_ref, 'calendar_ref'),
    calendar_scope: calendarScope,
    branch_ref: branchRef,
    effective_from: effectiveFrom,
    effective_to: effectiveTo,
    entry_count: input.entries.length,
    paid_leave_count: paidLeaveCount,
    attendance_required_count: attendanceRequiredCount,
    decision: issues.length === 0 ? "CALENDAR_ACCEPTED" : "CALENDAR_REJECTED",
    issues,
    provider_neutral_only: true,
    attendance_record_mutation_allowed: false,
    runtime_status: "HOLIDAY_CALENDAR_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    holiday_calendar_evidence_digest: digestCalendar(receiptWithoutDigest),
  };
}
