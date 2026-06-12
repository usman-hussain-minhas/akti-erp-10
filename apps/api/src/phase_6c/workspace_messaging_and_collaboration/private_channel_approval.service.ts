import { createHash } from "crypto";

type PrivateChannelApprovalMode = "AUTO_APPROVE_WHEN_POLICY_MATCHES" | "REQUIRE_APPROVAL" | "DISABLED";
type PrivateChannelApprovalActionDecision = "APPROVED" | "REJECTED";
type PrivateChannelApprovalDecision =
  | "PRIVATE_CHANNEL_APPROVED"
  | "PRIVATE_CHANNEL_PENDING_APPROVAL"
  | "PRIVATE_CHANNEL_DENIED"
  | "PRIVATE_CHANNEL_REVIEW_REQUIRED";

type PrivateChannelApprovalPolicy = {
  policy_ref: string;
  mode: PrivateChannelApprovalMode;
  allowed_requester_role_refs: string[];
  allowed_requester_team_refs: string[];
  required_approver_role_refs: string[];
  require_business_justification: boolean;
  max_initial_member_count?: number;
};

type PrivateChannelRequesterContext = {
  requester_user_ref: string;
  requester_person_ref?: string;
  requester_employee_ref?: string;
  access_core_role_refs: string[];
  employee_team_refs: string[];
  evidence_refs: string[];
};

type PrivateChannelApprovalAction = {
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
  seed_id: "seed_6c_065_private_channel_approval";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.private_channel_approval.evaluated";
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

const SEED_ID = "seed_6c_065_private_channel_approval" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME = "phase_6c.workspace_messaging_and_collaboration.private_channel_approval.evaluated" as const;
const DECISION_REFS = ["6C-WORK-MSG-011", "6C-GLOBAL-018"] as const;
const MODES = new Set<PrivateChannelApprovalMode>([
  "AUTO_APPROVE_WHEN_POLICY_MATCHES",
  "REQUIRE_APPROVAL",
  "DISABLED",
]);
const ACTION_DECISIONS = new Set<PrivateChannelApprovalActionDecision>(["APPROVED", "REJECTED"]);

export function evaluatePrivateChannelApproval(
  input: PrivateChannelApprovalInput,
): PrivateChannelApprovalReceipt {
  assertNoForbiddenRuntimeRequest(input);
  validateInput(input);

  const policy = normalizePolicy(input.policy);
  const requesterContext = normalizeRequester(input.requester_context);
  const matchedRequesterRoleRefs = requesterContext.access_core_role_refs.filter((roleRef) =>
    policy.allowed_requester_role_refs.includes(roleRef),
  );
  const matchedRequesterTeamRefs = requesterContext.employee_team_refs.filter((teamRef) =>
    policy.allowed_requester_team_refs.includes(teamRef),
  );
  const requesterPolicyMatched =
    matchedRequesterRoleRefs.length > 0 || matchedRequesterTeamRefs.length > 0;
  const approvalAction = input.approval_action ? normalizeApprovalAction(input.approval_action) : undefined;
  const matchedApproverRoleRefs = approvalAction
    ? approvalAction.approver_role_refs.filter((roleRef) => policy.required_approver_role_refs.includes(roleRef)).sort()
    : [];
  const approverPolicyMatched =
    policy.mode === "AUTO_APPROVE_WHEN_POLICY_MATCHES"
      ? true
      : policy.required_approver_role_refs.length === 0 || matchedApproverRoleRefs.length > 0;
  const reviewReasons: string[] = [];
  const denyReasons: string[] = [];

  if (policy.mode === "DISABLED") {
    denyReasons.push("private_channel_requests_disabled_by_policy");
  }
  if (!requesterPolicyMatched) {
    reviewReasons.push("requester_role_or_team_not_policy_matched");
  }
  if (policy.require_business_justification && !input.business_justification?.trim()) {
    reviewReasons.push("business_justification_required");
  }
  if (
    typeof policy.max_initial_member_count === "number" &&
    input.initial_member_refs.length > policy.max_initial_member_count
  ) {
    reviewReasons.push("initial_member_count_exceeds_policy");
  }
  if (policy.mode === "REQUIRE_APPROVAL" && !approvalAction) {
    reviewReasons.push("approval_action_required");
  }
  if (approvalAction?.decision === "REJECTED") {
    denyReasons.push("approver_rejected_request");
  }
  if (approvalAction && !approverPolicyMatched) {
    reviewReasons.push("approver_role_not_policy_matched");
  }

  const decision = decide(policy.mode, requesterPolicyMatched, approverPolicyMatched, approvalAction, denyReasons, reviewReasons);
  const evidenceArtifacts = [
    `${SEED_ID}:workspace:${input.workspace_ref.trim()}`,
    `${SEED_ID}:requested_channel:${input.requested_channel_ref.trim()}`,
    `${SEED_ID}:policy:${policy.policy_ref}`,
    `${SEED_ID}:decision:${decision}`,
    ...requesterContext.evidence_refs.map((ref) => `${SEED_ID}:requester_evidence:${ref}`),
  ];
  if (approvalAction) {
    evidenceArtifacts.push(`${SEED_ID}:approval_evidence:${approvalAction.evidence_ref}`);
  }

  const digestPayload = {
    organization_id: input.organization_id.trim(),
    workspace_ref: input.workspace_ref.trim(),
    requested_channel_ref: input.requested_channel_ref.trim(),
    policy,
    requesterContext,
    approvalAction,
    decision,
    reviewReasons: reviewReasons.sort(),
    denyReasons: denyReasons.sort(),
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    workspace_ref: input.workspace_ref.trim(),
    requested_channel_ref: input.requested_channel_ref.trim(),
    policy_ref: policy.policy_ref,
    decision,
    requester_policy_matched: requesterPolicyMatched,
    approver_policy_matched: approverPolicyMatched,
    matched_requester_role_refs: matchedRequesterRoleRefs.sort(),
    matched_requester_team_refs: matchedRequesterTeamRefs.sort(),
    matched_approver_role_refs: matchedApproverRoleRefs,
    review_reasons: reviewReasons.sort(),
    deny_reasons: denyReasons.sort(),
    evidence_artifacts: dedupeStrings(evidenceArtifacts),
    channel_creation_performed: false,
    membership_mutation_performed: false,
    notification_send_performed: false,
    gatekeeper_bypass_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    event_dispatch_performed: false,
    frontend_route_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: DECISION_REFS,
    evaluated_by_user_id: input.evaluated_by_user_id.trim(),
    evaluated_at: new Date(input.evaluated_at).toISOString(),
    deterministic_digest: digest(digestPayload),
  };
}

function decide(
  mode: PrivateChannelApprovalMode,
  requesterPolicyMatched: boolean,
  approverPolicyMatched: boolean,
  approvalAction: PrivateChannelApprovalAction | undefined,
  denyReasons: string[],
  reviewReasons: string[],
): PrivateChannelApprovalDecision {
  if (denyReasons.length > 0) {
    return "PRIVATE_CHANNEL_DENIED";
  }
  if (reviewReasons.length > 0) {
    return mode === "REQUIRE_APPROVAL" && reviewReasons.every((reason) => reason === "approval_action_required")
      ? "PRIVATE_CHANNEL_PENDING_APPROVAL"
      : "PRIVATE_CHANNEL_REVIEW_REQUIRED";
  }
  if (mode === "AUTO_APPROVE_WHEN_POLICY_MATCHES" && requesterPolicyMatched) {
    return "PRIVATE_CHANNEL_APPROVED";
  }
  if (mode === "REQUIRE_APPROVAL" && approvalAction?.decision === "APPROVED" && approverPolicyMatched) {
    return "PRIVATE_CHANNEL_APPROVED";
  }
  return "PRIVATE_CHANNEL_REVIEW_REQUIRED";
}

function validateInput(input: PrivateChannelApprovalInput): void {
  const requiredFields: Array<keyof PrivateChannelApprovalInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "workspace_ref",
    "requested_channel_ref",
    "requested_channel_name",
    "requested_at",
    "evaluated_by_user_id",
    "evaluated_at",
  ];
  for (const field of requiredFields) {
    assertNonEmptyString(input[field], field);
  }
  if (Number.isNaN(Date.parse(input.requested_at))) {
    throw new Error("requested_at must be an ISO-compatible timestamp");
  }
  if (Number.isNaN(Date.parse(input.evaluated_at))) {
    throw new Error("evaluated_at must be an ISO-compatible timestamp");
  }
  validatePolicy(input.policy);
  validateRequester(input.requester_context);
  validateStringArray(input.initial_member_refs, "initial_member_refs");
  if (input.approval_action) {
    validateApprovalAction(input.approval_action);
  }
}

function validatePolicy(policy: PrivateChannelApprovalPolicy): void {
  assertNonEmptyString(policy?.policy_ref, "policy.policy_ref");
  if (!MODES.has(policy.mode)) {
    throw new Error("policy.mode is not supported");
  }
  validateStringArray(policy.allowed_requester_role_refs, "policy.allowed_requester_role_refs");
  validateStringArray(policy.allowed_requester_team_refs, "policy.allowed_requester_team_refs");
  validateStringArray(policy.required_approver_role_refs, "policy.required_approver_role_refs");
  if (typeof policy.require_business_justification !== "boolean") {
    throw new Error("policy.require_business_justification must be boolean");
  }
  if (
    policy.max_initial_member_count !== undefined &&
    (!Number.isInteger(policy.max_initial_member_count) || policy.max_initial_member_count < 1)
  ) {
    throw new Error("policy.max_initial_member_count must be a positive integer when provided");
  }
}

function validateRequester(requester: PrivateChannelRequesterContext): void {
  assertNonEmptyString(requester?.requester_user_ref, "requester_context.requester_user_ref");
  if (requester.requester_person_ref !== undefined) {
    assertNonEmptyString(requester.requester_person_ref, "requester_context.requester_person_ref");
  }
  if (requester.requester_employee_ref !== undefined) {
    assertNonEmptyString(requester.requester_employee_ref, "requester_context.requester_employee_ref");
  }
  validateStringArray(requester.access_core_role_refs, "requester_context.access_core_role_refs");
  validateStringArray(requester.employee_team_refs, "requester_context.employee_team_refs");
  validateStringArray(requester.evidence_refs, "requester_context.evidence_refs");
}

function validateApprovalAction(action: PrivateChannelApprovalAction): void {
  assertNonEmptyString(action.approver_user_ref, "approval_action.approver_user_ref");
  validateStringArray(action.approver_role_refs, "approval_action.approver_role_refs");
  if (!ACTION_DECISIONS.has(action.decision)) {
    throw new Error("approval_action.decision is not supported");
  }
  assertNonEmptyString(action.reason, "approval_action.reason");
  assertNonEmptyString(action.evidence_ref, "approval_action.evidence_ref");
}

function normalizePolicy(policy: PrivateChannelApprovalPolicy): PrivateChannelApprovalPolicy {
  return {
    policy_ref: policy.policy_ref.trim(),
    mode: policy.mode,
    allowed_requester_role_refs: dedupeStrings(policy.allowed_requester_role_refs),
    allowed_requester_team_refs: dedupeStrings(policy.allowed_requester_team_refs),
    required_approver_role_refs: dedupeStrings(policy.required_approver_role_refs),
    require_business_justification: policy.require_business_justification,
    max_initial_member_count: policy.max_initial_member_count,
  };
}

function normalizeRequester(requester: PrivateChannelRequesterContext): PrivateChannelRequesterContext {
  return {
    requester_user_ref: requester.requester_user_ref.trim(),
    requester_person_ref: requester.requester_person_ref?.trim(),
    requester_employee_ref: requester.requester_employee_ref?.trim(),
    access_core_role_refs: dedupeStrings(requester.access_core_role_refs),
    employee_team_refs: dedupeStrings(requester.employee_team_refs),
    evidence_refs: dedupeStrings(requester.evidence_refs),
  };
}

function normalizeApprovalAction(action: PrivateChannelApprovalAction): PrivateChannelApprovalAction {
  return {
    approver_user_ref: action.approver_user_ref.trim(),
    approver_role_refs: dedupeStrings(action.approver_role_refs),
    decision: action.decision,
    reason: action.reason.trim(),
    evidence_ref: action.evidence_ref.trim(),
  };
}

function assertNoForbiddenRuntimeRequest(input: PrivateChannelApprovalInput): void {
  const forbidden: Array<[keyof PrivateChannelApprovalInput, string]> = [
    ["channel_creation_requested", "private channel creation is outside this FFET"],
    ["membership_mutation_requested", "membership mutation is outside this FFET"],
    ["notification_send_requested", "notification sending is outside this FFET"],
    ["gatekeeper_bypass_requested", "Gatekeeper bypass is forbidden"],
    ["schema_mutation_requested", "schema mutation is outside this FFET"],
    ["phase_6a_mutation_requested", "Phase 6A mutation is outside this FFET"],
    ["phase_6b_mutation_requested", "Phase 6B mutation is outside this FFET"],
    ["event_dispatch_requested", "event dispatch is outside this FFET"],
    ["frontend_route_requested", "frontend routing is outside this FFET"],
    ["ticket_flag_flip_requested", "ticket/execution flag mutation is forbidden"],
  ];
  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function validateStringArray(values: unknown, field: string): asserts values is string[] {
  if (!Array.isArray(values)) {
    throw new Error(`${field} must be an array`);
  }
  for (const value of values) {
    assertNonEmptyString(value, `${field}[]`);
  }
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function digest(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
