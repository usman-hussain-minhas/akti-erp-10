export const PHASE_6C_OFFBOARDING_SAGA_SEED_ID = "seed_6c_051_offboarding_saga" as const;
export const PHASE_6C_OFFBOARDING_SAGA_COMPONENT_ID = "6C.04" as const;
export const OFFBOARDING_SAGA_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_saga.evaluated" as const;

export type OffboardingSagaStepKind =
  | "ACCESS_REVOKE"
  | "ASSET_RECOVERY"
  | "FINAL_PAYROLL_HANDOFF"
  | "POLICY_ACK_REVIEW"
  | "KNOWLEDGE_TRANSFER"
  | "DATA_RETENTION_HOLD";

export type OffboardingSagaStepStatus = "PENDING" | "COMPLETED" | "FAILED" | "SKIPPED";

export type OffboardingSagaDecision =
  | "OFFBOARDING_SAGA_COMPLETE"
  | "OFFBOARDING_SAGA_IN_PROGRESS"
  | "OFFBOARDING_SAGA_COMPENSATION_REQUIRED"
  | "OFFBOARDING_SAGA_DLQ_ROUTED"
  | "OFFBOARDING_SAGA_REQUIRES_REVIEW";

export type OffboardingSagaStep = {
  step_id: string;
  order: number;
  kind: OffboardingSagaStepKind;
  status: OffboardingSagaStepStatus;
  idempotency_key: string;
  max_retries: number;
  retry_count: number;
  compensation_action?: string;
  failure_reason?: string;
  evidence_refs: readonly string[];
};

export type OffboardingSagaInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  saga_ref: string;
  employee_ref: string;
  initiated_by_user_id: string;
  initiated_at: string;
  steps: readonly OffboardingSagaStep[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  two_phase_commit_requested?: boolean;
  external_deprovisioning_requested?: boolean;
  payroll_mutation_requested?: boolean;
  access_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  dlq_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OffboardingSagaCompensationPlan = {
  step_id: string;
  compensation_action: string;
  reason: string;
  idempotency_key: string;
};

export type OffboardingSagaDlqRoute = {
  step_id: string;
  reason: string;
  retry_count: number;
  max_retries: number;
  idempotency_key: string;
};

export type OffboardingSagaReceipt = {
  seed_id: typeof PHASE_6C_OFFBOARDING_SAGA_SEED_ID;
  component_id: typeof PHASE_6C_OFFBOARDING_SAGA_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6COffboardingSaga";
  event_name: typeof OFFBOARDING_SAGA_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  saga_ref: string;
  employee_ref: string;
  step_count: number;
  completed_step_count: number;
  pending_step_count: number;
  failed_step_count: number;
  next_step_id: string | null;
  compensation_plan: readonly OffboardingSagaCompensationPlan[];
  dlq_routes: readonly OffboardingSagaDlqRoute[];
  decision: OffboardingSagaDecision;
  two_phase_commit_allowed: false;
  external_deprovisioning_allowed: false;
  payroll_mutation_allowed: false;
  access_mutation_allowed: false;
  event_dispatch_allowed: false;
  dlq_write_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  adl_refs: readonly string[];
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  offboarding_saga_digest: string;
};
