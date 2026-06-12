export const PHASE_6C_PRIVATE_CHANNEL_APPROVAL_SEED_ID = "seed_6c_065_private_channel_approval" as const;
export const PHASE_6C_PRIVATE_CHANNEL_APPROVAL_COMPONENT_ID = "6C.05" as const;
export const PRIVATE_CHANNEL_APPROVAL_EVALUATED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.private_channel_approval.evaluated" as const;

export type PrivateChannelApprovalMode = "AUTO_APPROVE_WHEN_POLICY_MATCHES" | "REQUIRE_APPROVAL" | "DISABLED";
export type PrivateChannelApprovalActionDecision = "APPROVED" | "REJECTED";
export type PrivateChannelApprovalDecision =
  | "PRIVATE_CHANNEL_APPROVED"
  | "PRIVATE_CHANNEL_PENDING_APPROVAL"
  | "PRIVATE_CHANNEL_DENIED"
  | "PRIVATE_CHANNEL_REVIEW_REQUIRED";

export type PrivateChannelApprovalPolicy = {
  policy_ref: string;
  mode: PrivateChannelApprovalMode;
  allowed_requester_role_refs: string[];
  allowed_requester_team_refs: string[];
  required_approver_role_refs: string[];
  require_business_justification: boolean;
  max_initial_member_count?: number;
};

export type PrivateChannelRequesterContext = {
  requester_user_ref: string;
  requester_person_ref?: string;
  requester_employee_ref?: string;
  access_core_role_refs: string[];
  employee_team_refs: string[];
  evidence_refs: string[];
};

export type PrivateChannelApprovalAction = {
  approver_user_ref: string;
  approver_role_refs: string[];
  decision: PrivateChannelApprovalActionDecision;
  reason: string;
  evidence_ref: string;
};

export type PrivateChannelApprovalInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  requested_channel_ref: string;
  requested_channel_name: string;
  business_justification?: string;
  initial_member_refs: string[];
  requested_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  policy: PrivateChannelApprovalPolicy;
  requester_context: PrivateChannelRequesterContext;
  approval_action?: PrivateChannelApprovalAction;
  channel_creation_requested?: boolean;
  membership_mutation_requested?: boolean;
  notification_send_requested?: boolean;
  gatekeeper_bypass_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type PrivateChannelApprovalReceipt = {
  seed_id: typeof PHASE_6C_PRIVATE_CHANNEL_APPROVAL_SEED_ID;
  component_id: typeof PHASE_6C_PRIVATE_CHANNEL_APPROVAL_COMPONENT_ID;
  event_name: typeof PRIVATE_CHANNEL_APPROVAL_EVALUATED_EVENT;
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  requested_channel_ref: string;
  policy_ref: string;
  decision: PrivateChannelApprovalDecision;
  requester_policy_matched: boolean;
  approver_policy_matched: boolean;
  matched_requester_role_refs: string[];
  matched_requester_team_refs: string[];
  matched_approver_role_refs: string[];
  review_reasons: string[];
  deny_reasons: string[];
  evidence_artifacts: string[];
  channel_creation_performed: false;
  membership_mutation_performed: false;
  notification_send_performed: false;
  gatekeeper_bypass_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  event_dispatch_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-011", "6C-GLOBAL-018"];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};
