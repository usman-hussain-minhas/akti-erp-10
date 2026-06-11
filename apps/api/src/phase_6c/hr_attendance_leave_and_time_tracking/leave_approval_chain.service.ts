import { createHash } from 'node:crypto';

export const PHASE_6C_LEAVE_APPROVAL_CHAIN_SEED_ID = "seed_6c_037_leave_approval_chain" as const;
export const PHASE_6C_LEAVE_APPROVAL_CHAIN_COMPONENT_ID = "6C.03" as const;
export const LEAVE_APPROVAL_CHAIN_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.leave_approval_chain.evaluated" as const;

export type LeaveApprovalMode = "SEQUENTIAL" | "PARALLEL_ALL" | "PARALLEL_ANY";
export type LeaveApproverKind = "MANAGER" | "ROLE" | "USER" | "GROUP";
export type LeaveApprovalDecision = "APPROVED" | "REJECTED";
export type LeaveApprovalChainStatus = "APPROVAL_PENDING" | "APPROVED" | "REJECTED" | "ESCALATION_REQUIRED";

export type LeaveApprovalStep = {
  step_order: number;
  approver_kind: LeaveApproverKind;
  approver_ref: string;
  min_leave_units?: number;
  max_leave_units?: number;
  escalation_after_hours?: number;
  required: boolean;
};

export type LeaveApprovalRecordedDecision = {
  step_order: number;
  approver_ref: string;
  decision: LeaveApprovalDecision;
  decided_at: string;
};

export type LeaveApprovalChainInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  leave_request_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  policy_ref: string;
  approval_mode: LeaveApprovalMode;
  requested_leave_units: number;
  submitted_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  steps: readonly LeaveApprovalStep[];
  decisions?: readonly LeaveApprovalRecordedDecision[];
  control_metadata?: Record<string, unknown>;
  approval_mutation_requested?: boolean;
  notification_send_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type LeaveApprovalChainReceipt = {
  seed_id: typeof PHASE_6C_LEAVE_APPROVAL_CHAIN_SEED_ID;
  component_id: typeof PHASE_6C_LEAVE_APPROVAL_CHAIN_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CLeaveApprovalChain";
  event_name: typeof LEAVE_APPROVAL_CHAIN_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  leave_request_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  policy_ref: string;
  approval_mode: LeaveApprovalMode;
  requested_leave_units: number;
  applicable_step_orders: readonly number[];
  completed_step_orders: readonly number[];
  next_step_orders: readonly number[];
  next_approver_refs: readonly string[];
  rejected_by_refs: readonly string[];
  status: LeaveApprovalChainStatus;
  approval_mutation_allowed: false;
  notification_send_allowed: false;
  provider_neutral_only: true;
  runtime_status: "LEAVE_APPROVAL_CHAIN_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  leave_approval_chain_evidence_digest: string;
};

const VALID_MODES: readonly LeaveApprovalMode[] = ["SEQUENTIAL", "PARALLEL_ALL", "PARALLEL_ANY"];
const VALID_APPROVER_KINDS: readonly LeaveApproverKind[] = ["MANAGER", "ROLE", "USER", "GROUP"];
const VALID_DECISIONS: readonly LeaveApprovalDecision[] = ["APPROVED", "REJECTED"];
const DECISION_REFS = ["6C-ATT-016"] as const;
const EVIDENCE_ARTIFACTS = [
  "leave_approval_chain_decision_receipt",
  "leave_approval_step_evidence",
  "leave_approval_escalation_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for leave_approval_chain.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for leave_approval_chain.');
  }
  return normalized;
}

function requireNonNegativeNumber(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for leave_approval_chain.');
  }
  return value;
}

function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for leave_approval_chain.');
  }
  return value;
}

function requirePositiveNumber(value: number | undefined, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(field + ' must be a positive finite number for leave_approval_chain.');
  }
  return value;
}

function requireMode(value: LeaveApprovalMode): LeaveApprovalMode {
  if (!VALID_MODES.includes(value)) {
    throw new Error('approval_mode is not allowed for leave_approval_chain.');
  }
  return value;
}

function requireApproverKind(value: LeaveApproverKind): LeaveApproverKind {
  if (!VALID_APPROVER_KINDS.includes(value)) {
    throw new Error('approver_kind is not allowed for leave_approval_chain.');
  }
  return value;
}

function requireDecision(value: LeaveApprovalDecision): LeaveApprovalDecision {
  if (!VALID_DECISIONS.includes(value)) {
    throw new Error('decision is not allowed for leave_approval_chain.');
  }
  return value;
}

function rejectForbiddenRequests(input: LeaveApprovalChainInput): void {
  const forbiddenFlags: Array<[keyof LeaveApprovalChainInput, string]> = [
    ['approval_mutation_requested', 'leave_approval_chain must evaluate approval state and must not mutate approval records.'],
    ['notification_send_requested', 'leave_approval_chain must not send notifications directly.'],
    ['provider_specific_adapter_requested', 'leave_approval_chain must remain provider-neutral.'],
    ['schema_mutation_requested', 'leave_approval_chain must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'leave_approval_chain must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'leave_approval_chain must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'leave_approval_chain must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'leave_approval_chain must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function normalizeSteps(inputSteps: readonly LeaveApprovalStep[], requestedLeaveUnits: number): LeaveApprovalStep[] {
  if (!Array.isArray(inputSteps) || inputSteps.length === 0) {
    throw new Error('steps must contain at least one approval step for leave_approval_chain.');
  }
  const seen = new Set<number>();
  const normalized = inputSteps.map((step) => {
    const stepOrder = requirePositiveInteger(step.step_order, 'step_order');
    if (seen.has(stepOrder)) {
      throw new Error('step_order values must be unique for leave_approval_chain.');
    }
    seen.add(stepOrder);
    const minLeaveUnits = step.min_leave_units === undefined ? 0 : requireNonNegativeNumber(step.min_leave_units, 'min_leave_units');
    const maxLeaveUnits = requirePositiveNumber(step.max_leave_units, 'max_leave_units');
    if (maxLeaveUnits !== undefined && minLeaveUnits > maxLeaveUnits) {
      throw new Error('min_leave_units cannot exceed max_leave_units for leave_approval_chain.');
    }
    return {
      step_order: stepOrder,
      approver_kind: requireApproverKind(step.approver_kind),
      approver_ref: requireNonEmpty(step.approver_ref, 'approver_ref'),
      min_leave_units: minLeaveUnits,
      max_leave_units: maxLeaveUnits,
      escalation_after_hours: requirePositiveNumber(step.escalation_after_hours, 'escalation_after_hours'),
      required: step.required === true,
    } satisfies LeaveApprovalStep;
  });
  return normalized
    .filter((step) => step.required && requestedLeaveUnits >= (step.min_leave_units ?? 0) && (step.max_leave_units === undefined || requestedLeaveUnits <= step.max_leave_units))
    .sort((left, right) => left.step_order - right.step_order);
}

function normalizeDecisions(decisions: readonly LeaveApprovalRecordedDecision[] | undefined, applicableSteps: readonly LeaveApprovalStep[]): LeaveApprovalRecordedDecision[] {
  const stepApprovers = new Map(applicableSteps.map((step) => [step.step_order + ':' + step.approver_ref, step]));
  return (decisions ?? []).map((decision) => {
    const stepOrder = requirePositiveInteger(decision.step_order, 'decision.step_order');
    const approverRef = requireNonEmpty(decision.approver_ref, 'decision.approver_ref');
    if (!stepApprovers.has(stepOrder + ':' + approverRef)) {
      throw new Error('decision references a non-applicable approval step for leave_approval_chain.');
    }
    return {
      step_order: stepOrder,
      approver_ref: approverRef,
      decision: requireDecision(decision.decision),
      decided_at: requireTimestamp(decision.decided_at, 'decided_at'),
    } satisfies LeaveApprovalRecordedDecision;
  });
}

function hoursBetween(start: string, end: string): number {
  return (Date.parse(end) - Date.parse(start)) / 3600000;
}

function digestApprovalChain(receiptWithoutDigest: Omit<LeaveApprovalChainReceipt, 'leave_approval_chain_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateLeaveApprovalChain(input: LeaveApprovalChainInput): LeaveApprovalChainReceipt {
  rejectForbiddenRequests(input);

  const approvalMode = requireMode(input.approval_mode);
  const requestedLeaveUnits = requireNonNegativeNumber(input.requested_leave_units, 'requested_leave_units');
  const submittedAt = requireTimestamp(input.submitted_at, 'submitted_at');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  if (Date.parse(submittedAt) > Date.parse(evaluatedAt)) {
    throw new Error('submitted_at must be on or before evaluated_at for leave_approval_chain.');
  }

  const applicableSteps = normalizeSteps(input.steps, requestedLeaveUnits);
  const decisions = normalizeDecisions(input.decisions, applicableSteps);
  const rejectedByRefs = decisions.filter((decision) => decision.decision === "REJECTED").map((decision) => decision.approver_ref);
  const approvedStepOrders = new Set(decisions.filter((decision) => decision.decision === "APPROVED").map((decision) => decision.step_order));
  const completedStepOrders = [...new Set(decisions.map((decision) => decision.step_order))].sort((left, right) => left - right);

  let nextSteps: LeaveApprovalStep[] = [];
  let status: LeaveApprovalChainStatus;

  if (applicableSteps.length === 0) {
    status = "APPROVED";
  } else if (rejectedByRefs.length > 0) {
    status = "REJECTED";
  } else if (approvalMode === "PARALLEL_ANY" && decisions.some((decision) => decision.decision === "APPROVED")) {
    status = "APPROVED";
  } else if (applicableSteps.every((step) => approvedStepOrders.has(step.step_order))) {
    status = "APPROVED";
  } else {
    if (approvalMode === "SEQUENTIAL") {
      const firstPending = applicableSteps.find((step) => !approvedStepOrders.has(step.step_order));
      nextSteps = firstPending === undefined ? [] : [firstPending];
    } else {
      nextSteps = applicableSteps.filter((step) => !approvedStepOrders.has(step.step_order));
    }
    const elapsedHours = hoursBetween(submittedAt, evaluatedAt);
    const escalationDue = nextSteps.some((step) => step.escalation_after_hours !== undefined && elapsedHours >= step.escalation_after_hours);
    status = escalationDue ? "ESCALATION_REQUIRED" : "APPROVAL_PENDING";
  }

  const receiptWithoutDigest: Omit<LeaveApprovalChainReceipt, 'leave_approval_chain_evidence_digest'> = {
    seed_id: PHASE_6C_LEAVE_APPROVAL_CHAIN_SEED_ID,
    component_id: PHASE_6C_LEAVE_APPROVAL_CHAIN_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CLeaveApprovalChain",
    event_name: LEAVE_APPROVAL_CHAIN_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    leave_request_ref: requireNonEmpty(input.leave_request_ref, 'leave_request_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    leave_type_ref: requireNonEmpty(input.leave_type_ref, 'leave_type_ref'),
    policy_ref: requireNonEmpty(input.policy_ref, 'policy_ref'),
    approval_mode: approvalMode,
    requested_leave_units: requestedLeaveUnits,
    applicable_step_orders: applicableSteps.map((step) => step.step_order),
    completed_step_orders: completedStepOrders,
    next_step_orders: nextSteps.map((step) => step.step_order),
    next_approver_refs: nextSteps.map((step) => step.approver_ref),
    rejected_by_refs: rejectedByRefs,
    status,
    approval_mutation_allowed: false,
    notification_send_allowed: false,
    provider_neutral_only: true,
    runtime_status: "LEAVE_APPROVAL_CHAIN_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    leave_approval_chain_evidence_digest: digestApprovalChain(receiptWithoutDigest),
  };
}
