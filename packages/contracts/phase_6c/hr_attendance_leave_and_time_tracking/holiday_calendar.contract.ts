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
