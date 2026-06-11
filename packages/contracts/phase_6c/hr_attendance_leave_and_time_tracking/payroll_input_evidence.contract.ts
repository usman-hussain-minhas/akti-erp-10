export const PHASE_6C_PAYROLL_INPUT_EVIDENCE_SEED_ID = "seed_6c_038_payroll_input_evidence" as const;
export const PHASE_6C_PAYROLL_INPUT_EVIDENCE_COMPONENT_ID = "6C.03" as const;
export const PAYROLL_INPUT_EVIDENCE_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.payroll_input_evidence.evaluated" as const;

export type PayrollInputEvidenceKind = "ATTENDANCE_HOURS" | "OVERTIME_HOURS" | "PAID_LEAVE_UNITS" | "UNPAID_LEAVE_UNITS" | "ABSENCE_DEDUCTION_UNITS" | "LEAVE_ENCASHMENT_AMOUNT";
export type PayrollInputEvidenceStatus = "PAYROLL_INPUT_READY" | "PAYROLL_INPUT_REQUIRES_REVIEW";

export type PayrollInputEvidenceLine = {
  evidence_ref: string;
  source_seed_id: string;
  kind: PayrollInputEvidenceKind;
  quantity: number;
  amount?: number;
  currency?: string;
  approved: boolean;
};

export type PayrollInputEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  payroll_period_ref: string;
  attendance_period_start: string;
  attendance_period_end: string;
  evidence_lines: readonly PayrollInputEvidenceLine[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  payroll_mutation_requested?: boolean;
  balance_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type PayrollInputEvidenceReceipt = {
  seed_id: typeof PHASE_6C_PAYROLL_INPUT_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_PAYROLL_INPUT_EVIDENCE_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CPayrollInputEvidence";
  event_name: typeof PAYROLL_INPUT_EVIDENCE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  payroll_period_ref: string;
  attendance_period_start: string;
  attendance_period_end: string;
  evidence_line_count: number;
  approved_line_count: number;
  rejected_line_count: number;
  attendance_hours: number;
  overtime_hours: number;
  paid_leave_units: number;
  unpaid_leave_units: number;
  absence_deduction_units: number;
  leave_encashment_amount: number;
  currency: string | null;
  status: PayrollInputEvidenceStatus;
  payroll_mutation_allowed: false;
  balance_mutation_allowed: false;
  provider_neutral_only: true;
  runtime_status: "PAYROLL_INPUT_EVIDENCE_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  payroll_input_evidence_digest: string;
};
