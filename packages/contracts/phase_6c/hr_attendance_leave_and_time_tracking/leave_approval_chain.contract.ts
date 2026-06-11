export const PHASE_6C_LEAVE_APPROVAL_CHAIN_SEED_ID = "seed_6c_037_leave_approval_chain" as const;
export const PHASE_6C_LEAVE_APPROVAL_CHAIN_COMPONENT_ID = "6C.03" as const;
export const LEAVE_APPROVAL_CHAIN_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.leave_approval_chain.evaluated" as const;

export type LeaveApprovalMode = "SEQUENTIAL" | "PARALLEL_ALL" | "PARALLEL_ANY";
export type LeaveApproverKind = "MANAGER" | "ROLE" | "USER" | "GROUP";
export type LeaveApprovalDecision = "APPROVED" | "REJECTED";
export type LeaveApprovalChainStatus = "APPROVAL_PENDING" | "APPROVED" | "REJECTED" | "ESCALATION_REQUIRED";

export type LeaveApprovalStep = {
  step_order: number;
  approver_kind: LeaveApproverKind;
  approver_ref: string;
  min_leave_units?: number;
  max_leave_units?: number;
  escalation_after_hours?: number;
  required: boolean;
};

export type LeaveApprovalRecordedDecision = {
  step_order: number;
  approver_ref: string;
  decision: LeaveApprovalDecision;
  decided_at: string;
};

export type LeaveApprovalChainInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  leave_request_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  policy_ref: string;
  approval_mode: LeaveApprovalMode;
  requested_leave_units: number;
  submitted_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  steps: readonly LeaveApprovalStep[];
  decisions?: readonly LeaveApprovalRecordedDecision[];
  control_metadata?: Record<string, unknown>;
  approval_mutation_requested?: boolean;
  notification_send_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type LeaveApprovalChainReceipt = {
  seed_id: typeof PHASE_6C_LEAVE_APPROVAL_CHAIN_SEED_ID;
  component_id: typeof PHASE_6C_LEAVE_APPROVAL_CHAIN_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CLeaveApprovalChain";
  event_name: typeof LEAVE_APPROVAL_CHAIN_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  leave_request_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  policy_ref: string;
  approval_mode: LeaveApprovalMode;
  requested_leave_units: number;
  applicable_step_orders: readonly number[];
  completed_step_orders: readonly number[];
  next_step_orders: readonly number[];
  next_approver_refs: readonly string[];
  rejected_by_refs: readonly string[];
  status: LeaveApprovalChainStatus;
  approval_mutation_allowed: false;
  notification_send_allowed: false;
  provider_neutral_only: true;
  runtime_status: "LEAVE_APPROVAL_CHAIN_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  leave_approval_chain_evidence_digest: string;
};
