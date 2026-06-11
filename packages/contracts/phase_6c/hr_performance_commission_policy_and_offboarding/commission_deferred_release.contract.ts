export const PHASE_6C_COMMISSION_DEFERRED_RELEASE_SEED_ID = "seed_6c_044_commission_deferred_release" as const;
export const PHASE_6C_COMMISSION_DEFERRED_RELEASE_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_DEFERRED_RELEASE_SCHEDULED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_deferred_release.scheduled" as const;

export type CommissionDeferredReleaseCadence =
  | "IMMEDIATE"
  | "MONTHLY"
  | "QUARTERLY"
  | "MILESTONE"
  | "HOLD_UNTIL_DATE";

export type CommissionDeferredReleaseOutcome =
  | "READY_FOR_RELEASE"
  | "SCHEDULED_FOR_FUTURE"
  | "HELD_FOR_REVIEW";

export type CommissionDeferredReleaseDecision =
  | "DEFERRED_RELEASE_PLAN_READY"
  | "DEFERRED_RELEASE_PARTIAL_HOLD"
  | "DEFERRED_RELEASE_REQUIRES_REVIEW";

export type CommissionDeferredReleaseItem = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  payable_commission_amount: number;
  currency?: string;
  earned_at: string;
  release_not_before: string;
  cadence: CommissionDeferredReleaseCadence;
  approved_for_release: boolean;
  risk_hold?: boolean;
  hold_reason?: string;
  evidence_refs: readonly string[];
};

export type CommissionDeferredReleaseInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scheduler_run_ref: string;
  period_ref: string;
  currency: string;
  scheduler_run_at: string;
  release_items: readonly CommissionDeferredReleaseItem[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  payroll_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  crm_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type CommissionDeferredReleasePlanItem = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  payable_commission_amount: number;
  currency: string;
  cadence: CommissionDeferredReleaseCadence;
  release_at: string;
  outcome: CommissionDeferredReleaseOutcome;
  hold_reason?: string;
  evidence_refs: readonly string[];
};

export type CommissionDeferredReleaseReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_DEFERRED_RELEASE_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_DEFERRED_RELEASE_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionDeferredRelease";
  event_name: typeof COMMISSION_DEFERRED_RELEASE_SCHEDULED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scheduler_run_ref: string;
  period_ref: string;
  currency: string;
  release_item_count: number;
  ready_release_count: number;
  future_release_count: number;
  held_release_count: number;
  ready_release_amount: number;
  future_release_amount: number;
  held_release_amount: number;
  next_release_at: string | null;
  decision: CommissionDeferredReleaseDecision;
  planned_releases: readonly CommissionDeferredReleasePlanItem[];
  payroll_mutation_allowed: false;
  payment_mutation_allowed: false;
  crm_mutation_allowed: false;
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
  release_schedule_digest: string;
};
