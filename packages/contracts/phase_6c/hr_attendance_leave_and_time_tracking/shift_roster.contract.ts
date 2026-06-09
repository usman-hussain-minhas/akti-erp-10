export const PHASE_6C_SHIFT_ROSTER_SEED_ID = "seed_6c_031_shift_roster" as const;
export const PHASE_6C_SHIFT_ROSTER_COMPONENT_ID = "6C.03" as const;
export const SHIFT_ROSTER_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.shift_roster.evaluated" as const;

export type ShiftRosterPattern =
  | "FIXED"
  | "ROTATING"
  | "FLEXIBLE"
  | "NIGHT";

export type ShiftRosterDecision =
  | "ROSTER_ACCEPTED"
  | "ROSTER_REJECTED";

export type ShiftRosterOverlapPolicy =
  | "REJECT_OVERLAP"
  | "ALLOW_WITH_EXCEPTION";

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
