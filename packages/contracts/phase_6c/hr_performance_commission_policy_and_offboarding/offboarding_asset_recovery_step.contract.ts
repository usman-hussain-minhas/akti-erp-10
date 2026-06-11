export const PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_SEED_ID = "seed_6c_053_offboarding_asset_recovery_step" as const;
export const PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_COMPONENT_ID = "6C.04" as const;
export const OFFBOARDING_ASSET_RECOVERY_STEP_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_asset_recovery_step.evaluated" as const;

export type OffboardingAssetRecoveryCategory =
  | "DEVICE"
  | "ACCESS_CARD"
  | "VEHICLE"
  | "UNIFORM"
  | "TOOLING"
  | "DOCUMENT"
  | "OTHER";

export type OffboardingAssetRecoveryCondition = "GOOD" | "DAMAGED" | "LOST" | "NOT_RETURNED";

export type OffboardingAssetRecoveryDisposition =
  | "RETURNED"
  | "RECOVERY_PENDING"
  | "DEDUCTION_REQUIRED"
  | "REVIEW_REQUIRED";

export type OffboardingAssetRecoveryDecision =
  | "ASSET_RECOVERY_CLEAR"
  | "ASSET_RECOVERY_HOLD"
  | "ASSET_RECOVERY_DEDUCTION_REVIEW"
  | "ASSET_RECOVERY_REQUIRES_REVIEW";

export type OffboardingAssetRecoveryItemInput = {
  asset_ref: string;
  category: OffboardingAssetRecoveryCategory;
  assigned_to_employee_ref: string;
  expected_return_by: string;
  declared_value: number;
  currency: string;
  returned_at?: string;
  recovered_condition?: OffboardingAssetRecoveryCondition;
  custodian_user_id?: string;
  evidence_refs: string[];
  recovery_note?: string;
};

export type OffboardingAssetRecoveryStepInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  currency: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  assets: OffboardingAssetRecoveryItemInput[];
  payroll_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  dlq_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OffboardingAssetRecoveryPreparedItem = {
  item_index: number;
  asset_ref: string;
  category: OffboardingAssetRecoveryCategory;
  disposition: OffboardingAssetRecoveryDisposition;
  recovered_condition: OffboardingAssetRecoveryCondition;
  expected_return_by: string;
  returned_at: string | null;
  declared_value: number;
  recovery_value_at_risk: number;
  recommended_deduction: number;
  hold_recommended: boolean;
  evidence_refs: string[];
  reason: string;
};

export type OffboardingAssetRecoveryStepReceipt = {
  seed_id: typeof PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_SEED_ID;
  component_id: typeof PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6COffboardingAssetRecoveryStep";
  event_name: typeof OFFBOARDING_ASSET_RECOVERY_STEP_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  currency: string;
  asset_count: number;
  returned_count: number;
  pending_count: number;
  deduction_required_count: number;
  review_required_count: number;
  value_at_risk_total: number;
  recommended_deduction_total: number;
  holds_required: boolean;
  decision: OffboardingAssetRecoveryDecision;
  prepared_items: OffboardingAssetRecoveryPreparedItem[];
  payroll_mutation_performed: false;
  payment_mutation_performed: false;
  event_dispatch_performed: false;
  dlq_write_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  runtime_adapter_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  recovery_evidence_digest: string;
};
