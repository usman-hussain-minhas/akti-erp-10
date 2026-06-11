import { createHash } from 'node:crypto';

export const PHASE_6C_OFFBOARDING_SAGA_SEED_ID = "seed_6c_051_offboarding_saga" as const;
export const PHASE_6C_OFFBOARDING_SAGA_COMPONENT_ID = "6C.04" as const;
export const OFFBOARDING_SAGA_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_saga.evaluated" as const;

export type OffboardingSagaStepKind =
  | "ACCESS_REVOKE"
  | "ASSET_RECOVERY"
  | "FINAL_PAYROLL_HANDOFF"
  | "POLICY_ACK_REVIEW"
  | "KNOWLEDGE_TRANSFER"
  | "DATA_RETENTION_HOLD";

export type OffboardingSagaStepStatus = "PENDING" | "COMPLETED" | "FAILED" | "SKIPPED";

export type OffboardingSagaDecision =
  | "OFFBOARDING_SAGA_COMPLETE"
  | "OFFBOARDING_SAGA_IN_PROGRESS"
  | "OFFBOARDING_SAGA_COMPENSATION_REQUIRED"
  | "OFFBOARDING_SAGA_DLQ_ROUTED"
  | "OFFBOARDING_SAGA_REQUIRES_REVIEW";

export type OffboardingSagaStep = {
  step_id: string;
  order: number;
  kind: OffboardingSagaStepKind;
  status: OffboardingSagaStepStatus;
  idempotency_key: string;
  max_retries: number;
  retry_count: number;
  compensation_action?: string;
  failure_reason?: string;
  evidence_refs: readonly string[];
};

export type OffboardingSagaInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  saga_ref: string;
  employee_ref: string;
  initiated_by_user_id: string;
  initiated_at: string;
  steps: readonly OffboardingSagaStep[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  two_phase_commit_requested?: boolean;
  external_deprovisioning_requested?: boolean;
  payroll_mutation_requested?: boolean;
  access_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  dlq_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OffboardingSagaCompensationPlan = {
  step_id: string;
  compensation_action: string;
  reason: string;
  idempotency_key: string;
};

export type OffboardingSagaDlqRoute = {
  step_id: string;
  reason: string;
  retry_count: number;
  max_retries: number;
  idempotency_key: string;
};

export type OffboardingSagaReceipt = {
  seed_id: typeof PHASE_6C_OFFBOARDING_SAGA_SEED_ID;
  component_id: typeof PHASE_6C_OFFBOARDING_SAGA_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6COffboardingSaga";
  event_name: typeof OFFBOARDING_SAGA_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  saga_ref: string;
  employee_ref: string;
  step_count: number;
  completed_step_count: number;
  pending_step_count: number;
  failed_step_count: number;
  next_step_id: string | null;
  compensation_plan: readonly OffboardingSagaCompensationPlan[];
  dlq_routes: readonly OffboardingSagaDlqRoute[];
  decision: OffboardingSagaDecision;
  two_phase_commit_allowed: false;
  external_deprovisioning_allowed: false;
  payroll_mutation_allowed: false;
  access_mutation_allowed: false;
  event_dispatch_allowed: false;
  dlq_write_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  adl_refs: readonly string[];
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  offboarding_saga_digest: string;
};

type ReceiptWithoutDigest = Omit<OffboardingSagaReceipt, 'offboarding_saga_digest'>;

type NormalizedStep = OffboardingSagaStep & {
  step_id: string;
  idempotency_key: string;
  failure_reason?: string;
  compensation_action?: string;
  evidence_refs: readonly string[];
};

const DECISION_REFS = ["6C-HR-OPS-011", "6C-ADL-002", "6C-ADL-004"] as const;
const ADL_REFS = ["ADL-001", "ADL-002"] as const;
const EVIDENCE_ARTIFACTS = [
  "offboarding_saga_runtime_receipt",
  "no_2pc_saga_plan",
  "compensation_plan_evidence",
  "dlq_route_evidence",
  "deterministic_offboarding_saga_digest",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offboarding_saga.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offboarding_saga.');
  }
  return normalized;
}

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for offboarding_saga.');
  }
  return value;
}

function requireNonNegativeInteger(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(field + ' must be a non-negative integer for offboarding_saga.');
  }
  return value;
}

function requireStepKind(value: OffboardingSagaStepKind | undefined, field: string): OffboardingSagaStepKind {
  if (
    value !== "ACCESS_REVOKE" &&
    value !== "ASSET_RECOVERY" &&
    value !== "FINAL_PAYROLL_HANDOFF" &&
    value !== "POLICY_ACK_REVIEW" &&
    value !== "KNOWLEDGE_TRANSFER" &&
    value !== "DATA_RETENTION_HOLD"
  ) {
    throw new Error(field + ' must be a supported step kind for offboarding_saga.');
  }
  return value;
}

function requireStepStatus(value: OffboardingSagaStepStatus | undefined, field: string): OffboardingSagaStepStatus {
  if (value !== "PENDING" && value !== "COMPLETED" && value !== "FAILED" && value !== "SKIPPED") {
    throw new Error(field + ' must be a supported step status for offboarding_saga.');
  }
  return value;
}

function rejectForbiddenMutation(input: OffboardingSagaInput): void {
  const forbiddenRequests: Array<[keyof OffboardingSagaInput, string]> = [
    ['two_phase_commit_requested', 'two-phase commit'],
    ['external_deprovisioning_requested', 'external deprovisioning execution'],
    ['payroll_mutation_requested', 'payroll mutation'],
    ['access_mutation_requested', 'access mutation'],
    ['event_dispatch_requested', 'event dispatch'],
    ['dlq_write_requested', 'DLQ write'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbiddenRequests) {
    if (input[field] === true) {
      throw new Error('offboarding_saga must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizeSteps(steps: readonly OffboardingSagaStep[]): NormalizedStep[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('steps must contain at least one step for offboarding_saga.');
  }
  const seenStepIds = new Set<string>();
  const seenOrders = new Set<number>();

  return steps.map((step, index) => {
    const prefix = 'steps[' + index + ']';
    const stepId = requireNonEmpty(step.step_id, prefix + '.step_id');
    if (seenStepIds.has(stepId)) {
      throw new Error(prefix + '.step_id must be unique for offboarding_saga.');
    }
    seenStepIds.add(stepId);
    const order = requirePositiveInteger(step.order, prefix + '.order');
    if (seenOrders.has(order)) {
      throw new Error(prefix + '.order must be unique for offboarding_saga.');
    }
    seenOrders.add(order);
    const retryCount = requireNonNegativeInteger(step.retry_count, prefix + '.retry_count');
    const maxRetries = requireNonNegativeInteger(step.max_retries, prefix + '.max_retries');
    if (retryCount > maxRetries) {
      throw new Error(prefix + '.retry_count must not exceed max_retries for offboarding_saga.');
    }
    if (!Array.isArray(step.evidence_refs) || step.evidence_refs.length === 0) {
      throw new Error(prefix + '.evidence_refs must contain at least one evidence reference for offboarding_saga.');
    }

    return {
      step_id: stepId,
      order,
      kind: requireStepKind(step.kind, prefix + '.kind'),
      status: requireStepStatus(step.status, prefix + '.status'),
      idempotency_key: requireNonEmpty(step.idempotency_key, prefix + '.idempotency_key'),
      max_retries: maxRetries,
      retry_count: retryCount,
      ...(step.compensation_action === undefined ? {} : { compensation_action: requireNonEmpty(step.compensation_action, prefix + '.compensation_action') }),
      ...(step.failure_reason === undefined ? {} : { failure_reason: requireNonEmpty(step.failure_reason, prefix + '.failure_reason') }),
      evidence_refs: step.evidence_refs.map((ref: string, refIndex: number) => requireNonEmpty(ref, prefix + '.evidence_refs[' + refIndex + ']')),
    };
  }).sort((a, b) => a.order - b.order);
}

export function coordinateOffboardingSaga(input: OffboardingSagaInput): OffboardingSagaReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const sagaRef = requireNonEmpty(input.saga_ref, 'saga_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  requireNonEmpty(input.initiated_by_user_id, 'initiated_by_user_id');
  requireTimestamp(input.initiated_at, 'initiated_at');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const steps = normalizeSteps(input.steps);

  const pendingSteps = steps.filter((step) => step.status === "PENDING");
  const failedSteps = steps.filter((step) => step.status === "FAILED");
  const compensationPlan: OffboardingSagaCompensationPlan[] = [];
  const dlqRoutes: OffboardingSagaDlqRoute[] = [];

  for (const step of failedSteps) {
    const failureReason = step.failure_reason ?? 'step failed without explicit reason';
    if (step.compensation_action !== undefined && step.retry_count < step.max_retries) {
      compensationPlan.push({
        step_id: step.step_id,
        compensation_action: step.compensation_action,
        reason: failureReason,
        idempotency_key: step.idempotency_key,
      });
    } else {
      dlqRoutes.push({
        step_id: step.step_id,
        reason: failureReason,
        retry_count: step.retry_count,
        max_retries: step.max_retries,
        idempotency_key: step.idempotency_key,
      });
    }
  }

  const completedStepCount = steps.filter((step) => step.status === "COMPLETED" || step.status === "SKIPPED").length;
  const decision: OffboardingSagaDecision = dlqRoutes.length > 0
    ? "OFFBOARDING_SAGA_DLQ_ROUTED"
    : compensationPlan.length > 0
      ? "OFFBOARDING_SAGA_COMPENSATION_REQUIRED"
      : pendingSteps.length > 0
        ? "OFFBOARDING_SAGA_IN_PROGRESS"
        : completedStepCount === steps.length
          ? "OFFBOARDING_SAGA_COMPLETE"
          : "OFFBOARDING_SAGA_REQUIRES_REVIEW";

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_OFFBOARDING_SAGA_SEED_ID,
    component_id: PHASE_6C_OFFBOARDING_SAGA_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6COffboardingSaga",
    event_name: OFFBOARDING_SAGA_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    saga_ref: sagaRef,
    employee_ref: employeeRef,
    step_count: steps.length,
    completed_step_count: completedStepCount,
    pending_step_count: pendingSteps.length,
    failed_step_count: failedSteps.length,
    next_step_id: pendingSteps[0]?.step_id ?? null,
    compensation_plan: compensationPlan,
    dlq_routes: dlqRoutes,
    decision,
    two_phase_commit_allowed: false,
    external_deprovisioning_allowed: false,
    payroll_mutation_allowed: false,
    access_mutation_allowed: false,
    event_dispatch_allowed: false,
    dlq_write_allowed: false,
    schema_mutation_allowed: false,
    phase_6a_mutation_allowed: false,
    phase_6b_mutation_allowed: false,
    runtime_adapter_allowed: false,
    ticket_flag_flip_allowed: false,
    adl_refs: ADL_REFS,
    decision_refs: DECISION_REFS,
    control_metadata: input.control_metadata ?? {},
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    offboarding_saga_digest: digestReceipt(receiptWithoutDigest),
  };
}
