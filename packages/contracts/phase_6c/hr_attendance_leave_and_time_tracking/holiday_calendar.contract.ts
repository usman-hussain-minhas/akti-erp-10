export const PHASE_6C_HOLIDAY_CALENDAR_SEED_ID = "seed_6c_032_holiday_calendar" as const;
export const PHASE_6C_HOLIDAY_CALENDAR_COMPONENT_ID = "6C.03" as const;
export const HOLIDAY_CALENDAR_SCAFFOLD_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.holiday_calendar.scaffold_control_evaluated" as const;

export type HolidayCalendarScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type HolidayCalendarScaffoldReceipt = {
  seed_id: typeof PHASE_6C_HOLIDAY_CALENDAR_SEED_ID;
  component_id: typeof PHASE_6C_HOLIDAY_CALENDAR_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CHolidayCalendar";
  event_name: typeof HOLIDAY_CALENDAR_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
