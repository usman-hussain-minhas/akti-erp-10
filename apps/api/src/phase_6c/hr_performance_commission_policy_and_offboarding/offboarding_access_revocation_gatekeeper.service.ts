import { createHash } from 'node:crypto';

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

const ALLOWED_SURFACES: readonly OffboardingAccessRevocationSurface[] = [
  "DIRECTORY_ACCOUNT",
  "APPLICATION_ROLE",
  "DATA_GROUP",
  "API_TOKEN",
  "SSO_SESSION",
  "VPN_ACCESS",
  "DEVICE_TRUST",
  "PRIVILEGED_ADMIN",
] as const;

const ALLOWED_ACTIONS: readonly OffboardingAccessRevocationAction[] = [
  "REVOKE_ROLE",
  "REMOVE_GROUP_MEMBERSHIP",
  "DISABLE_LOGIN",
  "END_SESSION",
  "ROTATE_TOKEN",
  "SUSPEND_ACCOUNT",
  "REMOVE_DEVICE_TRUST",
] as const;

const ALLOWED_RISKS: readonly OffboardingAccessRevocationRisk[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offboarding_access_revocation_gatekeeper.');
  }
  return value.trim();
}

function requireOptionalNonEmpty(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offboarding_access_revocation_gatekeeper.');
  }
  return normalized;
}

function requireNonNegativeInteger(value: number | undefined, field: string): number {
  if (value === undefined) {
    return 0;
  }
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(field + ' must be a non-negative integer for offboarding_access_revocation_gatekeeper.');
  }
  return value;
}

function requireEvidenceRefs(value: string[] | undefined, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(field + ' must include at least one evidence reference for offboarding_access_revocation_gatekeeper.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, field + '[' + index + ']'));
  return Array.from(new Set(refs)).sort();
}

function requireSurface(value: OffboardingAccessRevocationSurface): OffboardingAccessRevocationSurface {
  if (!ALLOWED_SURFACES.includes(value)) {
    throw new Error('surface must be a supported access revocation surface.');
  }
  return value;
}

function requireAction(value: OffboardingAccessRevocationAction): OffboardingAccessRevocationAction {
  if (!ALLOWED_ACTIONS.includes(value)) {
    throw new Error('action must be a supported access revocation action.');
  }
  return value;
}

function requireRisk(value: OffboardingAccessRevocationRisk): OffboardingAccessRevocationRisk {
  if (!ALLOWED_RISKS.includes(value)) {
    throw new Error('risk must be LOW, MEDIUM, HIGH, or CRITICAL.');
  }
  return value;
}

function rejectForbiddenMutation(input: OffboardingAccessRevocationGatekeeperInput): void {
  const forbidden: Array<[keyof OffboardingAccessRevocationGatekeeperInput, string]> = [
    ['gatekeeper_mutation_requested', 'Gatekeeper mutation'],
    ['access_mutation_requested', 'access mutation'],
    ['account_disable_requested', 'account disable execution'],
    ['event_dispatch_requested', 'event dispatch'],
    ['dlq_write_requested', 'DLQ write'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbidden) {
    if (input[field] === true) {
      throw new Error('offboarding_access_revocation_gatekeeper must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<OffboardingAccessRevocationGatekeeperReceipt, 'gatekeeper_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function evaluateGateOutcome(revocation: OffboardingAccessRevocationRequest, requestedEffectiveAt: string, activeSessionCount: number): {
  outcome: OffboardingAccessRevocationGatekeeperOutcome;
  reason: string;
} {
  const approvalRef = requireOptionalNonEmpty(revocation.approval_ref, 'approval_ref');
  const sensitiveDataAccess = revocation.sensitive_data_access === true;
  const breakGlassActive = revocation.break_glass_active === true;
  const privilegedAccess = revocation.privileged_access === true || revocation.surface === "PRIVILEGED_ADMIN" || revocation.risk === "CRITICAL";
  const highRisk = revocation.risk === "HIGH" || revocation.risk === "CRITICAL";
  const requestedInPast = Date.parse(requestedEffectiveAt) < Date.parse(new Date(0).toISOString());

  if (requestedInPast) {
    return {
      outcome: "DENY",
      reason: 'Requested effective timestamp is outside the valid execution window.',
    };
  }

  if (breakGlassActive) {
    return {
      outcome: "STOP_FOR_REVIEW",
      reason: 'Break-glass access is active; revocation requires immutable STOP_FOR_REVIEW handling.',
    };
  }

  if (privilegedAccess && approvalRef === null) {
    return {
      outcome: "STOP_FOR_REVIEW",
      reason: 'Privileged or critical access revocation requires explicit approval evidence before execution.',
    };
  }

  if (!revocation.evidence_ready) {
    return {
      outcome: "APPROVAL_REQUIRED",
      reason: 'Revocation evidence is not ready; approval is required before downstream execution.',
    };
  }

  if (highRisk || sensitiveDataAccess || activeSessionCount > 0) {
    return {
      outcome: approvalRef === null ? "APPROVAL_REQUIRED" : "ALLOW",
      reason: approvalRef === null
        ? 'High-risk, sensitive, or active-session revocation requires approval evidence.'
        : 'Approval evidence is present for high-risk or active-session revocation.',
    };
  }

  return {
    outcome: "ALLOW",
    reason: 'Access revocation request satisfies evidence and risk gates for downstream execution.',
  };
}

function normalizeDecision(
  revocation: OffboardingAccessRevocationRequest,
  decisionIndex: number,
): OffboardingAccessRevocationGatekeeperDecision {
  const accessRef = requireNonEmpty(revocation.access_ref, 'revocations[' + decisionIndex + '].access_ref');
  const surface = requireSurface(revocation.surface);
  const action = requireAction(revocation.action);
  const risk = requireRisk(revocation.risk);
  const requestedEffectiveAt = requireTimestamp(revocation.requested_effective_at, 'revocations[' + decisionIndex + '].requested_effective_at');
  const activeSessionCount = requireNonNegativeInteger(revocation.active_session_count, 'revocations[' + decisionIndex + '].active_session_count');
  const evidenceRefs = requireEvidenceRefs(revocation.evidence_refs, 'revocations[' + decisionIndex + '].evidence_refs');
  requireNonEmpty(revocation.revocation_reason, 'revocations[' + decisionIndex + '].revocation_reason');

  const outcome = evaluateGateOutcome({ ...revocation, surface, action, risk }, requestedEffectiveAt, activeSessionCount);

  return {
    decision_index: decisionIndex,
    access_ref: accessRef,
    surface,
    action,
    risk,
    outcome: outcome.outcome,
    requested_effective_at: requestedEffectiveAt,
    evidence_ready: revocation.evidence_ready === true,
    sensitive_data_access: revocation.sensitive_data_access === true,
    active_session_count: activeSessionCount,
    break_glass_active: revocation.break_glass_active === true,
    privileged_access: revocation.privileged_access === true || surface === "PRIVILEGED_ADMIN" || risk === "CRITICAL",
    approval_ref: requireOptionalNonEmpty(revocation.approval_ref, 'revocations[' + decisionIndex + '].approval_ref'),
    evidence_refs: evidenceRefs,
    reason: outcome.reason,
  };
}

export function evaluateOffboardingAccessRevocationGatekeeper(input: OffboardingAccessRevocationGatekeeperInput): OffboardingAccessRevocationGatekeeperReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const offboardingCaseRef = requireNonEmpty(input.offboarding_case_ref, 'offboarding_case_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.revocations) || input.revocations.length === 0) {
    throw new Error('revocations must include at least one access revocation request for offboarding_access_revocation_gatekeeper.');
  }

  const decisions = input.revocations.map((revocation, index) => normalizeDecision(revocation, index));
  const allowCount = decisions.filter((decision) => decision.outcome === "ALLOW").length;
  const denyCount = decisions.filter((decision) => decision.outcome === "DENY").length;
  const approvalRequiredCount = decisions.filter((decision) => decision.outcome === "APPROVAL_REQUIRED").length;
  const stopForReviewCount = decisions.filter((decision) => decision.outcome === "STOP_FOR_REVIEW").length;
  const privilegedCount = decisions.filter((decision) => decision.privileged_access).length;
  const activeSessionTotal = decisions.reduce((sum, decision) => sum + decision.active_session_count, 0);

  const receiptWithoutDigest: Omit<OffboardingAccessRevocationGatekeeperReceipt, 'gatekeeper_evidence_digest'> = {
    seed_id: PHASE_6C_OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_SEED_ID,
    component_id: PHASE_6C_OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6COffboardingAccessRevocationGatekeeper",
    event_name: OFFBOARDING_ACCESS_REVOCATION_GATEKEEPER_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    offboarding_case_ref: offboardingCaseRef,
    employee_ref: employeeRef,
    revocation_count: decisions.length,
    allow_count: allowCount,
    deny_count: denyCount,
    approval_required_count: approvalRequiredCount,
    stop_for_review_count: stopForReviewCount,
    privileged_count: privilegedCount,
    active_session_total: activeSessionTotal,
    decisions,
    gatekeeper_mutation_performed: false,
    access_mutation_performed: false,
    account_disable_performed: false,
    event_dispatch_performed: false,
    dlq_write_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: ["6C-HR-OPS-013", "6C-HR-OPS-011", "6C-ADL-002", "6C-ADL-004"],
    adl_refs: ["ADL-001", "ADL-002"],
    evidence_artifacts: [
      "offboarding_access_revocation_gatekeeper_runtime_receipt",
      "offboarding_access_revocation_gatekeeper_validation_result",
      "offboarding_access_revocation_gatekeeper_forbidden_behavior_rejection_evidence",
    ],
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    gatekeeper_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
