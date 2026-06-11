export const PHASE_6C_POLICY_VERSION_LIBRARY_SEED_ID = "seed_6c_049_policy_version_library" as const;
export const PHASE_6C_POLICY_VERSION_LIBRARY_COMPONENT_ID = "6C.04" as const;
export const POLICY_VERSION_LIBRARY_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.policy_version_library.evaluated" as const;

export type PolicyVersionCategory =
  | "HR_POLICY"
  | "COMMISSION_POLICY"
  | "OFFBOARDING_POLICY"
  | "ATTENDANCE_POLICY"
  | "PERFORMANCE_POLICY";

export type PolicyVersionStatus = "DRAFT" | "ACTIVE" | "SUPERSEDED" | "RETIRED";

export type PolicyVersionLibraryDecision =
  | "POLICY_VERSION_LIBRARY_READY"
  | "POLICY_VERSION_LIBRARY_PARTIAL"
  | "POLICY_VERSION_LIBRARY_REQUIRES_REVIEW";

export type PolicyVersionRecord = {
  policy_key: string;
  policy_title: string;
  category: PolicyVersionCategory;
  version: string;
  status: PolicyVersionStatus;
  effective_from: string;
  effective_to?: string;
  supersedes_version?: string;
  policy_hash: string;
  evidence_refs: readonly string[];
};

export type PolicyVersionLibraryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  library_ref: string;
  requested_policy_keys: readonly string[];
  policy_versions: readonly PolicyVersionRecord[];
  effective_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  policy_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type PolicyVersionSelection = {
  policy_key: string;
  selected_version: string | null;
  selected_policy_hash: string | null;
  category: PolicyVersionCategory | null;
  status: "SELECTED" | "MISSING" | "CONFLICT";
  effective_version_count: number;
  evidence_refs: readonly string[];
  conflict_versions: readonly string[];
};

export type PolicyVersionLibraryReceipt = {
  seed_id: typeof PHASE_6C_POLICY_VERSION_LIBRARY_SEED_ID;
  component_id: typeof PHASE_6C_POLICY_VERSION_LIBRARY_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CPolicyVersionLibrary";
  event_name: typeof POLICY_VERSION_LIBRARY_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  library_ref: string;
  effective_at: string;
  requested_policy_count: number;
  selected_policy_count: number;
  missing_policy_count: number;
  conflict_policy_count: number;
  decision: PolicyVersionLibraryDecision;
  selections: readonly PolicyVersionSelection[];
  policy_mutation_allowed: false;
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
  policy_library_digest: string;
};
