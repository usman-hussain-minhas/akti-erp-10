import { createHash } from 'node:crypto';

export const PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_SEED_ID = 'seed_6c_102_waitlist_auto_promotion_timer' as const;
export const PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_COMPONENT_ID = '6C.08' as const;
export const WAITLIST_AUTO_PROMOTION_TIMER_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.waitlist_auto_promotion_timer.runtime_evaluated' as const;

export type WaitlistAutoPromotionTimerDecision = 'TIMER_DISABLED' | 'TIMER_NOT_DUE' | 'PROMOTION_ELIGIBLE' | 'PROMOTION_WINDOW_EXPIRED' | 'PROMOTION_REQUIRES_REVIEW';

export type WaitlistAutoPromotionTimerRule = {
  timer_ref: string;
  ticket_type_ref: string;
  auto_promotion_enabled: boolean;
  promotion_delay_minutes: number;
  promotion_window_minutes: number;
  max_promotions_per_run: number;
};

export type WaitlistAutoPromotionTimerCandidate = {
  waitlist_entry_ref: string;
  ticket_type_ref: string;
  entered_waitlist_at: string;
  priority_rank: number;
  capacity_available: number;
};

export type WaitlistAutoPromotionTimerInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  rule: WaitlistAutoPromotionTimerRule;
  candidate: WaitlistAutoPromotionTimerCandidate;
  control_metadata?: Record<string, unknown>;
  scheduler_job_requested?: boolean;
  waitlist_promotion_mutation_requested?: boolean;
  ticket_inventory_mutation_requested?: boolean;
  notification_send_requested?: boolean;
  payment_capture_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type WaitlistAutoPromotionTimerRuntimeReceipt = {
  seed_id: typeof PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_SEED_ID;
  component_id: typeof PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CWaitlistAutoPromotionTimer';
  event_name: typeof WAITLIST_AUTO_PROMOTION_TIMER_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  timer_ref: string;
  waitlist_entry_ref: string;
  ticket_type_ref: string;
  eligible_at: string;
  expires_at: string;
  capacity_available: number;
  priority_rank: number;
  max_promotions_per_run: number;
  decision: WaitlistAutoPromotionTimerDecision;
  decision_reason: string;
  adl_refs: readonly string[];
  scheduler_job_created: false;
  waitlist_promotion_performed: false;
  ticket_inventory_mutation_performed: false;
  notification_send_performed: false;
  payment_capture_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  waitlist_auto_promotion_timer_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-006', '6C-ADL-006', '6C-GLOBAL-018'] as const;
const ADL_REFS = ['ADL-023'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for waitlist_auto_promotion_timer runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for waitlist_auto_promotion_timer runtime evaluation.');
  }
  return normalized;
}

function requireNonNegativeInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value < 0) {
    throw new Error(field + ' must be a non-negative integer for waitlist_auto_promotion_timer runtime evaluation.');
  }
  return value;
}

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value <= 0) {
    throw new Error(field + ' must be a positive integer for waitlist_auto_promotion_timer runtime evaluation.');
  }
  return value;
}

function assertForbidden(input: WaitlistAutoPromotionTimerInput): void {
  const forbidden: Array<[keyof WaitlistAutoPromotionTimerInput, string]> = [
    ['scheduler_job_requested', 'waitlist_auto_promotion_timer must evaluate timer eligibility, not create scheduler jobs.'],
    ['waitlist_promotion_mutation_requested', 'waitlist_auto_promotion_timer must not mutate waitlist promotion state.'],
    ['ticket_inventory_mutation_requested', 'waitlist_auto_promotion_timer must not mutate ticket inventory.'],
    ['notification_send_requested', 'waitlist_auto_promotion_timer must not send notifications.'],
    ['payment_capture_requested', 'waitlist_auto_promotion_timer must not capture payment.'],
    ['provider_adapter_requested', 'waitlist_auto_promotion_timer must not execute provider adapters.'],
    ['persistence_requested', 'waitlist_auto_promotion_timer FFET must not persist records.'],
    ['schema_mutation_requested', 'waitlist_auto_promotion_timer FFET must not mutate schema.'],
    ['frontend_requested', 'waitlist_auto_promotion_timer FFET must not create frontend surfaces.'],
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

function digestRuntime(receiptWithoutDigest: Omit<WaitlistAutoPromotionTimerRuntimeReceipt, 'waitlist_auto_promotion_timer_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function addMinutes(isoTimestamp: string, minutes: number): string {
  return new Date(Date.parse(isoTimestamp) + minutes * 60_000).toISOString();
}

function deriveDecision(input: WaitlistAutoPromotionTimerInput, eligibleAt: string, expiresAt: string): { decision: WaitlistAutoPromotionTimerDecision; reason: string } {
  if (input.rule.auto_promotion_enabled === false) {
    return { decision: 'TIMER_DISABLED', reason: 'auto-promotion is disabled for this waitlist rule' };
  }
  if (input.rule.ticket_type_ref !== input.candidate.ticket_type_ref) {
    return { decision: 'PROMOTION_REQUIRES_REVIEW', reason: 'candidate ticket type does not match timer rule ticket type' };
  }
  if (input.candidate.capacity_available <= 0) {
    return { decision: 'PROMOTION_REQUIRES_REVIEW', reason: 'no capacity is available for promotion evaluation' };
  }
  const evaluatedAtMs = Date.parse(input.evaluated_at);
  if (evaluatedAtMs < Date.parse(eligibleAt)) {
    return { decision: 'TIMER_NOT_DUE', reason: 'promotion delay window has not elapsed' };
  }
  if (evaluatedAtMs > Date.parse(expiresAt)) {
    return { decision: 'PROMOTION_WINDOW_EXPIRED', reason: 'promotion window expired before evaluation' };
  }
  if (input.candidate.priority_rank > input.rule.max_promotions_per_run) {
    return { decision: 'PROMOTION_REQUIRES_REVIEW', reason: 'candidate priority rank is outside max_promotions_per_run' };
  }
  return { decision: 'PROMOTION_ELIGIBLE', reason: 'candidate is inside promotion timer window with available capacity' };
}

export function evaluateWaitlistAutoPromotionTimer(input: WaitlistAutoPromotionTimerInput): WaitlistAutoPromotionTimerRuntimeReceipt {
  assertForbidden(input);
  const enteredWaitlistAt = requireTimestamp(input.candidate.entered_waitlist_at, 'candidate.entered_waitlist_at');
  requireTimestamp(input.evaluated_at, 'evaluated_at');
  const promotionDelayMinutes = requireNonNegativeInteger(input.rule.promotion_delay_minutes, 'rule.promotion_delay_minutes');
  const promotionWindowMinutes = requirePositiveInteger(input.rule.promotion_window_minutes, 'rule.promotion_window_minutes');
  const maxPromotionsPerRun = requirePositiveInteger(input.rule.max_promotions_per_run, 'rule.max_promotions_per_run');
  const priorityRank = requirePositiveInteger(input.candidate.priority_rank, 'candidate.priority_rank');
  const capacityAvailable = requireNonNegativeInteger(input.candidate.capacity_available, 'candidate.capacity_available');
  const eligibleAt = addMinutes(enteredWaitlistAt, promotionDelayMinutes);
  const expiresAt = addMinutes(eligibleAt, promotionWindowMinutes);
  const decision = deriveDecision(input, eligibleAt, expiresAt);

  const receiptWithoutDigest: Omit<WaitlistAutoPromotionTimerRuntimeReceipt, 'waitlist_auto_promotion_timer_runtime_digest'> = {
    seed_id: PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_SEED_ID,
    component_id: PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CWaitlistAutoPromotionTimer',
    event_name: WAITLIST_AUTO_PROMOTION_TIMER_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    timer_ref: requireNonEmpty(input.rule.timer_ref, 'rule.timer_ref'),
    waitlist_entry_ref: requireNonEmpty(input.candidate.waitlist_entry_ref, 'candidate.waitlist_entry_ref'),
    ticket_type_ref: requireNonEmpty(input.rule.ticket_type_ref, 'rule.ticket_type_ref'),
    eligible_at: eligibleAt,
    expires_at: expiresAt,
    capacity_available: capacityAvailable,
    priority_rank: priorityRank,
    max_promotions_per_run: maxPromotionsPerRun,
    decision: decision.decision,
    decision_reason: decision.reason,
    adl_refs: ADL_REFS,
    scheduler_job_created: false,
    waitlist_promotion_performed: false,
    ticket_inventory_mutation_performed: false,
    notification_send_performed: false,
    payment_capture_allowed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    frontend_surface_created: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: ['waitlist_auto_promotion_timer_runtime_receipt', 'waitlist_auto_promotion_timer_validation_result', 'waitlist_auto_promotion_timer_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    waitlist_auto_promotion_timer_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
