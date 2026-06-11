import { createHash } from "crypto";

type MembershipEmployeeStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
type MembershipPolicyMode = "ANY_ROLE_OR_TEAM" | "ROLE_AND_TEAM" | "REQUIRED_TEAMS_ONLY";
type MembershipPolicyDecision = "MEMBERSHIP_GRANTED" | "MEMBERSHIP_DENIED" | "MEMBERSHIP_REVIEW_REQUIRED";

type MembershipPolicyRule = {
  policy_ref: string;
  mode: MembershipPolicyMode;
  allowed_role_refs: string[];
  denied_role_refs: string[];
  allowed_team_refs: string[];
  required_team_refs: string[];
  require_active_employee: boolean;
};

type MembershipPolicyCandidate = {
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

type MembershipPolicyCandidateEvaluation = {
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
  seed_id: "seed_6c_064_membership_policy";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.membership_policy.evaluated";
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

const SEED_ID = "seed_6c_064_membership_policy" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME = "phase_6c.workspace_messaging_and_collaboration.membership_policy.evaluated" as const;
const DECISION_REFS = ["6C-WORK-MSG-010", "6C-GLOBAL-018"] as const;
const MODES = new Set<MembershipPolicyMode>(["ANY_ROLE_OR_TEAM", "ROLE_AND_TEAM", "REQUIRED_TEAMS_ONLY"]);
const EMPLOYEE_STATUSES = new Set<MembershipEmployeeStatus>(["ACTIVE", "INACTIVE", "SUSPENDED"]);

export function evaluateMembershipPolicy(input: MembershipPolicyInput): MembershipPolicyReceipt {
  assertNoForbiddenRuntimeRequest(input);
  validateInput(input);

  const normalizedPolicy = normalizePolicy(input.policy);
  const evaluations = input.candidates
    .map((candidate) => evaluateCandidate(normalizedPolicy, candidate))
    .sort((a, b) => a.principal_ref.localeCompare(b.principal_ref));
  const grantCount = evaluations.filter((evaluation) => evaluation.decision === "MEMBERSHIP_GRANTED").length;
  const denyCount = evaluations.filter((evaluation) => evaluation.decision === "MEMBERSHIP_DENIED").length;
  const reviewCount = evaluations.filter((evaluation) => evaluation.decision === "MEMBERSHIP_REVIEW_REQUIRED").length;
  const evidenceArtifacts = [
    `${SEED_ID}:workspace:${input.workspace_ref.trim()}`,
    `${SEED_ID}:resource:${input.resource_ref.trim()}`,
    `${SEED_ID}:policy:${normalizedPolicy.policy_ref}`,
    ...evaluations.map((evaluation) => `${SEED_ID}:principal:${evaluation.principal_ref}:${evaluation.decision}`),
  ];
  const digestPayload = {
    organization_id: input.organization_id.trim(),
    workspace_ref: input.workspace_ref.trim(),
    resource_ref: input.resource_ref.trim(),
    policy: normalizedPolicy,
    evaluations,
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    workspace_ref: input.workspace_ref.trim(),
    resource_ref: input.resource_ref.trim(),
    policy_ref: normalizedPolicy.policy_ref,
    grant_count: grantCount,
    deny_count: denyCount,
    review_count: reviewCount,
    evaluations,
    access_core_mutation_performed: false,
    employee_team_mutation_performed: false,
    workspace_membership_mutation_performed: false,
    gatekeeper_bypass_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    event_dispatch_performed: false,
    frontend_route_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: dedupeStrings(evidenceArtifacts),
    evaluated_by_user_id: input.evaluated_by_user_id.trim(),
    evaluated_at: new Date(input.evaluated_at).toISOString(),
    deterministic_digest: digest(digestPayload),
  };
}

function evaluateCandidate(
  policy: MembershipPolicyRule,
  candidate: MembershipPolicyCandidate,
): MembershipPolicyCandidateEvaluation {
  validateCandidate(candidate);
  const roleRefs = dedupeStrings(candidate.access_core_role_refs);
  const teamRefs = dedupeStrings(candidate.employee_team_refs);
  const matchedRoleRefs = roleRefs.filter((roleRef) => policy.allowed_role_refs.includes(roleRef)).sort();
  const matchedTeamRefs = teamRefs
    .filter((teamRef) => policy.allowed_team_refs.includes(teamRef) || policy.required_team_refs.includes(teamRef))
    .sort();
  const missingRequiredTeamRefs = policy.required_team_refs
    .filter((teamRef) => !teamRefs.includes(teamRef))
    .sort();
  const denyReasons: string[] = [];
  const reviewReasons: string[] = [];

  const deniedRoleRefs = roleRefs.filter((roleRef) => policy.denied_role_refs.includes(roleRef)).sort();
  if (deniedRoleRefs.length > 0) {
    denyReasons.push(`denied_role:${deniedRoleRefs.join(",")}`);
  }
  if (policy.require_active_employee && candidate.employee_status !== "ACTIVE") {
    denyReasons.push(`employee_status:${candidate.employee_status}`);
  }
  if (candidate.evidence_refs.length === 0) {
    reviewReasons.push("missing_candidate_evidence");
  }
  if (policy.allowed_role_refs.length + policy.allowed_team_refs.length + policy.required_team_refs.length === 0) {
    reviewReasons.push("policy_has_no_membership_constraints");
  }
  if (missingRequiredTeamRefs.length > 0) {
    reviewReasons.push(`missing_required_team:${missingRequiredTeamRefs.join(",")}`);
  }

  const roleMatched = matchedRoleRefs.length > 0;
  const teamMatched = matchedTeamRefs.length > 0 && missingRequiredTeamRefs.length === 0;
  const modeMatched = matchByMode(policy.mode, roleMatched, teamMatched);
  if (!modeMatched && denyReasons.length === 0) {
    reviewReasons.push("no_access_role_or_employee_team_match");
  }

  const decision = decideCandidate(denyReasons, reviewReasons);
  return {
    principal_ref: candidate.principal_ref.trim(),
    person_ref: candidate.person_ref?.trim(),
    employee_ref: candidate.employee_ref?.trim(),
    decision,
    matched_role_refs: matchedRoleRefs,
    matched_team_refs: matchedTeamRefs,
    missing_required_team_refs: missingRequiredTeamRefs,
    deny_reasons: denyReasons.sort(),
    review_reasons: reviewReasons.sort(),
    evidence_refs: dedupeStrings(candidate.evidence_refs),
  };
}

function matchByMode(mode: MembershipPolicyMode, roleMatched: boolean, teamMatched: boolean): boolean {
  if (mode === "ANY_ROLE_OR_TEAM") {
    return roleMatched || teamMatched;
  }
  if (mode === "ROLE_AND_TEAM") {
    return roleMatched && teamMatched;
  }
  return teamMatched;
}

function decideCandidate(denyReasons: string[], reviewReasons: string[]): MembershipPolicyDecision {
  if (denyReasons.length > 0) {
    return "MEMBERSHIP_DENIED";
  }
  if (reviewReasons.length > 0) {
    return "MEMBERSHIP_REVIEW_REQUIRED";
  }
  return "MEMBERSHIP_GRANTED";
}

function validateInput(input: MembershipPolicyInput): void {
  const requiredFields: Array<keyof MembershipPolicyInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "workspace_ref",
    "resource_ref",
    "evaluated_by_user_id",
    "evaluated_at",
  ];
  for (const field of requiredFields) {
    assertNonEmptyString(input[field], field);
  }
  if (Number.isNaN(Date.parse(input.evaluated_at))) {
    throw new Error("evaluated_at must be an ISO-compatible timestamp");
  }
  validatePolicy(input.policy);
  if (!Array.isArray(input.candidates) || input.candidates.length === 0) {
    throw new Error("candidates must contain at least one membership candidate");
  }
}

function validatePolicy(policy: MembershipPolicyRule): void {
  assertNonEmptyString(policy?.policy_ref, "policy.policy_ref");
  if (!MODES.has(policy.mode)) {
    throw new Error("policy.mode is not supported");
  }
  validateStringArray(policy.allowed_role_refs, "policy.allowed_role_refs");
  validateStringArray(policy.denied_role_refs, "policy.denied_role_refs");
  validateStringArray(policy.allowed_team_refs, "policy.allowed_team_refs");
  validateStringArray(policy.required_team_refs, "policy.required_team_refs");
  if (typeof policy.require_active_employee !== "boolean") {
    throw new Error("policy.require_active_employee must be boolean");
  }
}

function validateCandidate(candidate: MembershipPolicyCandidate): void {
  assertNonEmptyString(candidate.principal_ref, "candidate.principal_ref");
  if (candidate.person_ref !== undefined) {
    assertNonEmptyString(candidate.person_ref, "candidate.person_ref");
  }
  if (candidate.employee_ref !== undefined) {
    assertNonEmptyString(candidate.employee_ref, "candidate.employee_ref");
  }
  validateStringArray(candidate.access_core_role_refs, "candidate.access_core_role_refs");
  validateStringArray(candidate.employee_team_refs, "candidate.employee_team_refs");
  validateStringArray(candidate.evidence_refs, "candidate.evidence_refs");
  if (!EMPLOYEE_STATUSES.has(candidate.employee_status)) {
    throw new Error("candidate.employee_status is not supported");
  }
}

function normalizePolicy(policy: MembershipPolicyRule): MembershipPolicyRule {
  return {
    policy_ref: policy.policy_ref.trim(),
    mode: policy.mode,
    allowed_role_refs: dedupeStrings(policy.allowed_role_refs),
    denied_role_refs: dedupeStrings(policy.denied_role_refs),
    allowed_team_refs: dedupeStrings(policy.allowed_team_refs),
    required_team_refs: dedupeStrings(policy.required_team_refs),
    require_active_employee: policy.require_active_employee,
  };
}

function assertNoForbiddenRuntimeRequest(input: MembershipPolicyInput): void {
  const forbidden: Array<[keyof MembershipPolicyInput, string]> = [
    ["access_core_mutation_requested", "Access Core mutation is outside this FFET"],
    ["employee_team_mutation_requested", "employee team mutation is outside this FFET"],
    ["workspace_membership_mutation_requested", "workspace membership mutation is outside this FFET"],
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
