export const PHASE_6C_MEMBERSHIP_POLICY_SEED_ID = "seed_6c_064_membership_policy" as const;
export const PHASE_6C_MEMBERSHIP_POLICY_COMPONENT_ID = "6C.05" as const;
export const MEMBERSHIP_POLICY_EVALUATED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.membership_policy.evaluated" as const;

export type MembershipEmployeeStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type MembershipPolicyMode = "ANY_ROLE_OR_TEAM" | "ROLE_AND_TEAM" | "REQUIRED_TEAMS_ONLY";
export type MembershipPolicyDecision = "MEMBERSHIP_GRANTED" | "MEMBERSHIP_DENIED" | "MEMBERSHIP_REVIEW_REQUIRED";

export type MembershipPolicyRule = {
  policy_ref: string;
  mode: MembershipPolicyMode;
  allowed_role_refs: string[];
  denied_role_refs: string[];
  allowed_team_refs: string[];
  required_team_refs: string[];
  require_active_employee: boolean;
};

export type MembershipPolicyCandidate = {
  principal_ref: string;
  person_ref?: string;
  employee_ref?: string;
  access_core_role_refs: string[];
  employee_team_refs: string[];
  employee_status: MembershipEmployeeStatus;
  evidence_refs: string[];
};

export type MembershipPolicyInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  resource_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  policy: MembershipPolicyRule;
  candidates: MembershipPolicyCandidate[];
  access_core_mutation_requested?: boolean;
  employee_team_mutation_requested?: boolean;
  workspace_membership_mutation_requested?: boolean;
  gatekeeper_bypass_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type MembershipPolicyCandidateEvaluation = {
  principal_ref: string;
  person_ref?: string;
  employee_ref?: string;
  decision: MembershipPolicyDecision;
  matched_role_refs: string[];
  matched_team_refs: string[];
  missing_required_team_refs: string[];
  deny_reasons: string[];
  review_reasons: string[];
  evidence_refs: string[];
};

export type MembershipPolicyReceipt = {
  seed_id: typeof PHASE_6C_MEMBERSHIP_POLICY_SEED_ID;
  component_id: typeof PHASE_6C_MEMBERSHIP_POLICY_COMPONENT_ID;
  event_name: typeof MEMBERSHIP_POLICY_EVALUATED_EVENT;
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  resource_ref: string;
  policy_ref: string;
  grant_count: number;
  deny_count: number;
  review_count: number;
  evaluations: MembershipPolicyCandidateEvaluation[];
  access_core_mutation_performed: false;
  employee_team_mutation_performed: false;
  workspace_membership_mutation_performed: false;
  gatekeeper_bypass_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  event_dispatch_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-010", "6C-GLOBAL-018"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};
