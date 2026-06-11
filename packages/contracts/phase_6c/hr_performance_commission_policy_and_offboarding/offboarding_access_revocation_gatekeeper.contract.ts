export const PHASE_6C_OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_SEED_ID = "seed_6c_055_offboarding_access_revocation_gatekeeper" as const;
export const PHASE_6C_OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_COMPONENT_ID = "6C.04" as const;
export const OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_access_revocation_gatekeeper.evaluated" as const;

export type OffboardingAccessRevocationSurface =
  | "DIRECTORY_ACCOUNT"
  | "APPLICATION_ROLE"
  | "DATA_GROUP"
  | "API_TOKEN"
  | "SSO_SESSION"
  | "VPN_ACCESS"
  | "DEVICE_TRUST"
  | "PRIVILEGED_ADMIN";

export type OffboardingAccessRevocationAction =
  | "REVOKE_ROLE"
  | "REMOVE_GROUP_MEMBERSHIP"
  | "DISABLE_LOGIN"
  | "END_SESSION"
  | "ROTATE_TOKEN"
  | "SUSPEND_ACCOUNT"
  | "REMOVE_DEVICE_TRUST";

export type OffboardingAccessRevocationRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OffboardingAccessRevocationGatekeeperOutcome = "ALLOW" | "DENY" | "APPROVAL_REQUIRED" | "STOP_FOR_REVIEW";

export type OffboardingAccessRevocationRequest = {
  access_ref: string;
  surface: OffboardingAccessRevocationSurface;
  action: OffboardingAccessRevocationAction;
  risk: OffboardingAccessRevocationRisk;
  requested_effective_at: string;
  evidence_ready: boolean;
  evidence_refs: string[];
  sensitive_data_access?: boolean;
  active_session_count?: number;
  break_glass_active?: boolean;
  privileged_access?: boolean;
  approval_ref?: string;
  revocation_reason: string;
};

export type OffboardingAccessRevocationGatekeeperInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  revocations: OffboardingAccessRevocationRequest[];
  gatekeeper_mutation_requested?: boolean;
  access_mutation_requested?: boolean;
  account_disable_requested?: boolean;
  event_dispatch_requested?: boolean;
  dlq_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OffboardingAccessRevocationGatekeeperDecision = {
  decision_index: number;
  access_ref: string;
  surface: OffboardingAccessRevocationSurface;
  action: OffboardingAccessRevocationAction;
  risk: OffboardingAccessRevocationRisk;
  outcome: OffboardingAccessRevocationGatekeeperOutcome;
  requested_effective_at: string;
  evidence_ready: boolean;
  sensitive_data_access: boolean;
  active_session_count: number;
  break_glass_active: boolean;
  privileged_access: boolean;
  approval_ref: string | null;
  evidence_refs: string[];
  reason: string;
};

export type OffboardingAccessRevocationGatekeeperReceipt = {
  seed_id: typeof PHASE_6C_OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_SEED_ID;
  component_id: typeof PHASE_6C_OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6COffboardingAccessRevocationGatekeeper";
  event_name: typeof OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  revocation_count: number;
  allow_count: number;
  deny_count: number;
  approval_required_count: number;
  stop_for_review_count: number;
  privileged_count: number;
  active_session_total: number;
  decisions: OffboardingAccessRevocationGatekeeperDecision[];
  gatekeeper_mutation_performed: false;
  access_mutation_performed: false;
  account_disable_performed: false;
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
  gatekeeper_evidence_digest: string;
};
