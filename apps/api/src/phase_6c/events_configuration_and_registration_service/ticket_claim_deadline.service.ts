import { createHash } from 'node:crypto';

export const PHASE_6C_TICKET_CLAIM_DEADLINE_SEED_ID = 'seed_6c_103_ticket_claim_deadline' as const;
export const PHASE_6C_TICKET_CLAIM_DEADLINE_COMPONENT_ID = '6C.08' as const;
export const TICKET_CLAIM_DEADLINE_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.ticket_claim_deadline.runtime_evaluated' as const;

export type TicketClaimDeadlineDecision = 'CLAIM_NOT_YET_OPEN' | 'CLAIM_OPEN' | 'CLAIM_CAPTURED' | 'CLAIM_EXPIRED' | 'CLAIM_REQUIRES_REVIEW';

export type TicketClaimDeadlineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  ticket_claim_ref: string;
  ticket_type_ref: string;
  registration_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  issued_at: string;
  claim_opens_at?: string;
  claim_deadline_at: string;
  claimed_at?: string;
  grace_minutes?: number;
  control_metadata?: Record<string, unknown>;
  ticket_issue_mutation_requested?: boolean;
  ticket_claim_mutation_requested?: boolean;
  ticket_cancel_mutation_requested?: boolean;
  notification_send_requested?: boolean;
  scheduler_job_requested?: boolean;
  payment_capture_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type TicketClaimDeadlineRuntimeReceipt = {
  seed_id: typeof PHASE_6C_TICKET_CLAIM_DEADLINE_SEED_ID;
  component_id: typeof PHASE_6C_TICKET_CLAIM_DEADLINE_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CTicketClaimDeadline';
  event_name: typeof TICKET_CLAIM_DEADLINE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  ticket_claim_ref: string;
  ticket_type_ref: string;
  registration_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  issued_at: string;
  claim_opens_at: string;
  claim_deadline_at: string;
  effective_deadline_at: string;
  claimed_at?: string;
  grace_minutes: number;
  decision: TicketClaimDeadlineDecision;
  decision_reason: string;
  adl_refs: readonly string[];
  ticket_issue_mutation_performed: false;
  ticket_claim_mutation_performed: false;
  ticket_cancel_mutation_performed: false;
  notification_send_performed: false;
  scheduler_job_created: false;
  payment_capture_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  ticket_claim_deadline_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-007', '6C-GLOBAL-018'] as const;
const ADL_REFS = ['ADL-023'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for ticket_claim_deadline runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for ticket_claim_deadline runtime evaluation.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return requireTimestamp(value, field);
}

function requireNonNegativeInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value < 0) {
    throw new Error(field + ' must be a non-negative integer for ticket_claim_deadline runtime evaluation.');
  }
  return value;
}

function assertForbidden(input: TicketClaimDeadlineInput): void {
  const forbidden: Array<[keyof TicketClaimDeadlineInput, string]> = [
    ['ticket_issue_mutation_requested', 'ticket_claim_deadline must not issue tickets.'],
    ['ticket_claim_mutation_requested', 'ticket_claim_deadline must evaluate claim windows, not mutate claims.'],
    ['ticket_cancel_mutation_requested', 'ticket_claim_deadline must not cancel tickets.'],
    ['notification_send_requested', 'ticket_claim_deadline must not send notifications.'],
    ['scheduler_job_requested', 'ticket_claim_deadline must not create scheduler jobs.'],
    ['payment_capture_requested', 'ticket_claim_deadline must not capture payment.'],
    ['provider_adapter_requested', 'ticket_claim_deadline must not execute provider adapters.'],
    ['persistence_requested', 'ticket_claim_deadline FFET must not persist records.'],
    ['schema_mutation_requested', 'ticket_claim_deadline FFET must not mutate schema.'],
    ['frontend_requested', 'ticket_claim_deadline FFET must not create frontend surfaces.'],
  ];
  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function digestRuntime(receiptWithoutDigest: Omit<TicketClaimDeadlineRuntimeReceipt, 'ticket_claim_deadline_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function addMinutes(isoTimestamp: string, minutes: number): string {
  return new Date(Date.parse(isoTimestamp) + minutes * 60_000).toISOString();
}

function deriveDecision(evaluatedAt: string, claimOpensAt: string, effectiveDeadlineAt: string, claimedAt?: string): { decision: TicketClaimDeadlineDecision; reason: string } {
  const evaluatedAtMs = Date.parse(evaluatedAt);
  if (claimedAt) {
    const claimedAtMs = Date.parse(claimedAt);
    if (claimedAtMs < Date.parse(claimOpensAt)) {
      return { decision: 'CLAIM_REQUIRES_REVIEW', reason: 'ticket was claimed before the claim window opened' };
    }
    if (claimedAtMs > Date.parse(effectiveDeadlineAt)) {
      return { decision: 'CLAIM_REQUIRES_REVIEW', reason: 'ticket was claimed after the effective deadline' };
    }
    return { decision: 'CLAIM_CAPTURED', reason: 'ticket claim timestamp is inside the allowed window' };
  }
  if (evaluatedAtMs < Date.parse(claimOpensAt)) {
    return { decision: 'CLAIM_NOT_YET_OPEN', reason: 'claim window has not opened yet' };
  }
  if (evaluatedAtMs > Date.parse(effectiveDeadlineAt)) {
    return { decision: 'CLAIM_EXPIRED', reason: 'claim window has expired' };
  }
  return { decision: 'CLAIM_OPEN', reason: 'claim window is currently open' };
}

export function evaluateTicketClaimDeadline(input: TicketClaimDeadlineInput): TicketClaimDeadlineRuntimeReceipt {
  assertForbidden(input);
  const issuedAt = requireTimestamp(input.issued_at, 'issued_at');
  const claimOpensAt = optionalTimestamp(input.claim_opens_at, 'claim_opens_at') ?? issuedAt;
  const claimDeadlineAt = requireTimestamp(input.claim_deadline_at, 'claim_deadline_at');
  const claimedAt = optionalTimestamp(input.claimed_at, 'claimed_at');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const graceMinutes = requireNonNegativeInteger(input.grace_minutes ?? 0, 'grace_minutes');
  if (Date.parse(claimOpensAt) < Date.parse(issuedAt)) {
    throw new Error('claim_opens_at must not be before issued_at for ticket_claim_deadline runtime evaluation.');
  }
  if (Date.parse(claimDeadlineAt) <= Date.parse(claimOpensAt)) {
    throw new Error('claim_deadline_at must be after claim_opens_at for ticket_claim_deadline runtime evaluation.');
  }
  const effectiveDeadlineAt = addMinutes(claimDeadlineAt, graceMinutes);
  const decision = deriveDecision(evaluatedAt, claimOpensAt, effectiveDeadlineAt, claimedAt);

  const receiptWithoutDigest: Omit<TicketClaimDeadlineRuntimeReceipt, 'ticket_claim_deadline_runtime_digest'> = {
    seed_id: PHASE_6C_TICKET_CLAIM_DEADLINE_SEED_ID,
    component_id: PHASE_6C_TICKET_CLAIM_DEADLINE_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CTicketClaimDeadline',
    event_name: TICKET_CLAIM_DEADLINE_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    ticket_claim_ref: requireNonEmpty(input.ticket_claim_ref, 'ticket_claim_ref'),
    ticket_type_ref: requireNonEmpty(input.ticket_type_ref, 'ticket_type_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
    issued_at: issuedAt,
    claim_opens_at: claimOpensAt,
    claim_deadline_at: claimDeadlineAt,
    effective_deadline_at: effectiveDeadlineAt,
    claimed_at: claimedAt,
    grace_minutes: graceMinutes,
    decision: decision.decision,
    decision_reason: decision.reason,
    adl_refs: ADL_REFS,
    ticket_issue_mutation_performed: false,
    ticket_claim_mutation_performed: false,
    ticket_cancel_mutation_performed: false,
    notification_send_performed: false,
    scheduler_job_created: false,
    payment_capture_allowed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    frontend_surface_created: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: ['ticket_claim_deadline_runtime_receipt', 'ticket_claim_deadline_validation_result', 'ticket_claim_deadline_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    ticket_claim_deadline_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
