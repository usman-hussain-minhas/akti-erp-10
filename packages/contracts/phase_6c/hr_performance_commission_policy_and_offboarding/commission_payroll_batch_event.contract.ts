export const PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_SEED_ID = "seed_6c_048_commission_payroll_batch_event" as const;
export const PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_PAYROLL_BATCH_EVENT_PREPARED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_payroll_batch_event.prepared" as const;

export type CommissionPayrollBatchEventDecision =
  | "PAYROLL_BATCH_EVENT_READY"
  | "PAYROLL_BATCH_EVENT_PARTIAL_REVIEW"
  | "PAYROLL_BATCH_EVENT_REQUIRES_REVIEW";

export type CommissionPayrollBatchLine = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  payable_commission_amount: number;
  currency?: string;
  approved_for_payroll: boolean;
  payroll_input_code: "COMMISSION_EARNING" | "COMMISSION_REVERSAL" | "COMMISSION_ADJUSTMENT";
  evidence_refs: readonly string[];
  review_note?: string;
};

export type CommissionPayrollBatchEventInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  payroll_batch_ref: string;
  payroll_period_ref: string;
  currency: string;
  event_sequence: number;
  commission_lines: readonly CommissionPayrollBatchLine[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  payroll_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  crm_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type CommissionPayrollBatchEventLine = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  payroll_input_code: "COMMISSION_EARNING" | "COMMISSION_REVERSAL" | "COMMISSION_ADJUSTMENT";
  payable_commission_amount: number;
  currency: string;
  evidence_refs: readonly string[];
};

export type CommissionPayrollBatchEventPayload = {
  event_id: string;
  event_name: "phase_6c.commission.payroll_batch.approved";
  organization_id: string;
  payroll_batch_ref: string;
  payroll_period_ref: string;
  currency: string;
  sequence: number;
  total_payroll_amount: number;
  line_count: number;
  lines: readonly CommissionPayrollBatchEventLine[];
};

export type CommissionPayrollBatchEventReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionPayrollBatchEvent";
  event_name: typeof COMMISSION_PAYROLL_BATCH_EVENT_PREPARED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  payroll_batch_ref: string;
  payroll_period_ref: string;
  currency: string;
  approved_line_count: number;
  review_line_count: number;
  approved_payroll_amount_total: number;
  decision: CommissionPayrollBatchEventDecision;
  event_payload: CommissionPayrollBatchEventPayload | null;
  payroll_mutation_allowed: false;
  payment_mutation_allowed: false;
  crm_mutation_allowed: false;
  event_dispatch_allowed: false;
  provider_specific_adapter_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  payroll_batch_event_digest: string;
};
