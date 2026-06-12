import { createHash } from 'node:crypto';

export const PHASE_6C_WAITLIST_RULE_SEED_ID = 'seed_6c_101_waitlist_rule' as const;
export const PHASE_6C_WAITLIST_RULE_COMPONENT_ID = '6C.08' as const;
export const WAITLIST_RULE_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.waitlist_rule.runtime_evaluated' as const;

export type WaitlistJoinPolicy = 'OPEN' | 'AFTER_SELL_OUT' | 'INVITE_ONLY' | 'MANUAL_REVIEW_ONLY';
export type WaitlistRankingStrategy = 'FIFO' | 'PRIORITY_SCORE' | 'MANUAL_REVIEW';
export type WaitlistRuleDecision = 'WAITLIST_ACCEPTED' | 'WAITLIST_DISABLED' | 'WAITLIST_FULL' | 'WAITLIST_NOT_NEEDED' | 'WAITLIST_REQUIRES_REVIEW';

export type WaitlistTicketRule = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  waitlist_enabled: boolean;
  max_waitlist_size: number;
  join_policy: WaitlistJoinPolicy;
  ranking_strategy: WaitlistRankingStrategy;
  min_priority_score?: number;
};

export type WaitlistCandidateRequest = {
  ticket_type_ref: string;
  requested_quantity: number;
  current_waitlist_count: number;
  active_capacity_remaining: number;
  invitation_ref?: string;
  priority_score?: number;
};

export type WaitlistRuleInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  product_catalogue_ref: string;
  waitlist_rules: readonly WaitlistTicketRule[];
  candidate_request?: WaitlistCandidateRequest;
  control_metadata?: Record<string, unknown>;
  waitlist_entry_mutation_requested?: boolean;
  ticket_inventory_mutation_requested?: boolean;
  auto_promotion_requested?: boolean;
  payment_capture_requested?: boolean;
  notification_send_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type WaitlistRuleEvaluation = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  waitlist_enabled: boolean;
  max_waitlist_size: number;
  join_policy: WaitlistJoinPolicy;
  ranking_strategy: WaitlistRankingStrategy;
};

export type WaitlistRuleRuntimeReceipt = {
  seed_id: typeof PHASE_6C_WAITLIST_RULE_SEED_ID;
  component_id: typeof PHASE_6C_WAITLIST_RULE_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CWaitlistRule';
  event_name: typeof WAITLIST_RULE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  product_catalogue_ref: string;
  rule_count: number;
  evaluations: readonly WaitlistRuleEvaluation[];
  requested_ticket_type_ref?: string;
  requested_quantity?: number;
  remaining_waitlist_slots?: number;
  decision: WaitlistRuleDecision;
  decision_reason: string;
  refs_events_only: true;
  waitlist_entry_mutation_performed: false;
  ticket_inventory_mutation_performed: false;
  auto_promotion_performed: false;
  payment_capture_allowed: false;
  notification_send_performed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  waitlist_rule_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-005', '6C-EVENT-REG-002', '6C-GLOBAL-018'] as const;
const ADL_REFS = ['ADL-023'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for waitlist_rule runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for waitlist_rule runtime evaluation.');
  }
  return normalized;
}

function requireNonNegativeInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value < 0) {
    throw new Error(field + ' must be a non-negative integer for waitlist_rule runtime evaluation.');
  }
  return value;
}

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value <= 0) {
    throw new Error(field + ' must be a positive integer for waitlist_rule runtime evaluation.');
  }
  return value;
}

function assertForbidden(input: WaitlistRuleInput): void {
  const forbidden: Array<[keyof WaitlistRuleInput, string]> = [
    ['waitlist_entry_mutation_requested', 'waitlist_rule must evaluate waitlist eligibility, not mutate waitlist entries.'],
    ['ticket_inventory_mutation_requested', 'waitlist_rule must not mutate ticket inventory.'],
    ['auto_promotion_requested', 'waitlist_rule must not execute auto-promotion.'],
    ['payment_capture_requested', 'waitlist_rule must not capture payment.'],
    ['notification_send_requested', 'waitlist_rule must not send notifications.'],
    ['provider_adapter_requested', 'waitlist_rule must not execute provider adapters.'],
    ['persistence_requested', 'waitlist_rule FFET must not persist records.'],
    ['schema_mutation_requested', 'waitlist_rule FFET must not mutate schema.'],
    ['frontend_requested', 'waitlist_rule FFET must not create frontend surfaces.'],
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

function digestRuntime(receiptWithoutDigest: Omit<WaitlistRuleRuntimeReceipt, 'waitlist_rule_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function normalizeRules(rules: readonly WaitlistTicketRule[]): readonly WaitlistRuleEvaluation[] {
  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error('at least one waitlist_rule is required for waitlist_rule runtime evaluation.');
  }
  const seen = new Set<string>();
  return rules.map((rule, index) => {
    const ticketTypeRef = requireNonEmpty(rule.ticket_type_ref, 'waitlist_rules[' + index + '].ticket_type_ref');
    if (seen.has(ticketTypeRef)) {
      throw new Error('waitlist_rules ticket_type_ref values must be unique.');
    }
    seen.add(ticketTypeRef);
    const maxWaitlistSize = requireNonNegativeInteger(rule.max_waitlist_size, 'waitlist_rules[' + index + '].max_waitlist_size');
    if (rule.waitlist_enabled && maxWaitlistSize === 0) {
      throw new Error('enabled waitlist_rule requires max_waitlist_size greater than zero.');
    }
    if (rule.ranking_strategy === 'PRIORITY_SCORE') {
      requireNonNegativeInteger(rule.min_priority_score, 'waitlist_rules[' + index + '].min_priority_score');
    } else if (rule.min_priority_score !== undefined) {
      throw new Error('min_priority_score is only valid for PRIORITY_SCORE ranking.');
    }
    return {
      ticket_type_ref: ticketTypeRef,
      product_catalogue_item_ref: requireNonEmpty(rule.product_catalogue_item_ref, 'waitlist_rules[' + index + '].product_catalogue_item_ref'),
      waitlist_enabled: rule.waitlist_enabled,
      max_waitlist_size: maxWaitlistSize,
      join_policy: rule.join_policy,
      ranking_strategy: rule.ranking_strategy,
    };
  });
}

function evaluateCandidate(input: WaitlistRuleInput, rules: readonly WaitlistTicketRule[]): {
  requestedTicketTypeRef?: string;
  requestedQuantity?: number;
  remainingWaitlistSlots?: number;
  decision: WaitlistRuleDecision;
  reason: string;
} {
  if (!input.candidate_request) {
    return { decision: 'WAITLIST_REQUIRES_REVIEW', reason: 'no candidate request supplied; rules validated only' };
  }
  const requestedTicketTypeRef = requireNonEmpty(input.candidate_request.ticket_type_ref, 'candidate_request.ticket_type_ref');
  const requestedQuantity = requirePositiveInteger(input.candidate_request.requested_quantity, 'candidate_request.requested_quantity');
  const currentWaitlistCount = requireNonNegativeInteger(input.candidate_request.current_waitlist_count, 'candidate_request.current_waitlist_count');
  const activeCapacityRemaining = requireNonNegativeInteger(input.candidate_request.active_capacity_remaining, 'candidate_request.active_capacity_remaining');
  const rule = rules.find((item) => item.ticket_type_ref === requestedTicketTypeRef);
  if (!rule) {
    throw new Error('candidate_request.ticket_type_ref must match a declared waitlist_rule.');
  }
  if (!rule.waitlist_enabled) {
    return { requestedTicketTypeRef, requestedQuantity, remainingWaitlistSlots: 0, decision: 'WAITLIST_DISABLED', reason: 'waitlist is disabled for the requested ticket type' };
  }
  if (activeCapacityRemaining > 0 && rule.join_policy === 'AFTER_SELL_OUT') {
    return { requestedTicketTypeRef, requestedQuantity, remainingWaitlistSlots: rule.max_waitlist_size - currentWaitlistCount, decision: 'WAITLIST_NOT_NEEDED', reason: 'active capacity remains and join policy is after sell-out' };
  }
  if (rule.join_policy === 'INVITE_ONLY' && !input.candidate_request.invitation_ref) {
    return { requestedTicketTypeRef, requestedQuantity, remainingWaitlistSlots: rule.max_waitlist_size - currentWaitlistCount, decision: 'WAITLIST_REQUIRES_REVIEW', reason: 'invite-only waitlist requires invitation_ref' };
  }
  if (rule.join_policy === 'MANUAL_REVIEW_ONLY' || rule.ranking_strategy === 'MANUAL_REVIEW') {
    return { requestedTicketTypeRef, requestedQuantity, remainingWaitlistSlots: rule.max_waitlist_size - currentWaitlistCount, decision: 'WAITLIST_REQUIRES_REVIEW', reason: 'manual review waitlist rule requires human review' };
  }
  if (rule.ranking_strategy === 'PRIORITY_SCORE') {
    const priorityScore = requireNonNegativeInteger(input.candidate_request.priority_score, 'candidate_request.priority_score');
    if (priorityScore < (rule.min_priority_score ?? 0)) {
      return { requestedTicketTypeRef, requestedQuantity, remainingWaitlistSlots: rule.max_waitlist_size - currentWaitlistCount, decision: 'WAITLIST_REQUIRES_REVIEW', reason: 'candidate priority score is below configured threshold' };
    }
  }
  const remainingWaitlistSlots = rule.max_waitlist_size - currentWaitlistCount;
  if (requestedQuantity > remainingWaitlistSlots) {
    return { requestedTicketTypeRef, requestedQuantity, remainingWaitlistSlots, decision: 'WAITLIST_FULL', reason: 'requested quantity exceeds remaining waitlist slots' };
  }
  return { requestedTicketTypeRef, requestedQuantity, remainingWaitlistSlots: remainingWaitlistSlots - requestedQuantity, decision: 'WAITLIST_ACCEPTED', reason: 'candidate satisfies configured waitlist rule' };
}

export function evaluateWaitlistRule(input: WaitlistRuleInput): WaitlistRuleRuntimeReceipt {
  assertForbidden(input);
  const evaluations = normalizeRules(input.waitlist_rules);
  const candidate = evaluateCandidate(input, input.waitlist_rules);

  const receiptWithoutDigest: Omit<WaitlistRuleRuntimeReceipt, 'waitlist_rule_runtime_digest'> = {
    seed_id: PHASE_6C_WAITLIST_RULE_SEED_ID,
    component_id: PHASE_6C_WAITLIST_RULE_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CWaitlistRule',
    event_name: WAITLIST_RULE_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    product_catalogue_ref: requireNonEmpty(input.product_catalogue_ref, 'product_catalogue_ref'),
    rule_count: evaluations.length,
    evaluations,
    requested_ticket_type_ref: candidate.requestedTicketTypeRef,
    requested_quantity: candidate.requestedQuantity,
    remaining_waitlist_slots: candidate.remainingWaitlistSlots,
    decision: candidate.decision,
    decision_reason: candidate.reason,
    refs_events_only: true,
    waitlist_entry_mutation_performed: false,
    ticket_inventory_mutation_performed: false,
    auto_promotion_performed: false,
    payment_capture_allowed: false,
    notification_send_performed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    frontend_surface_created: false,
    decision_refs: DECISION_REFS,
    adl_refs: ADL_REFS,
    evidence_artifacts: ['waitlist_rule_runtime_receipt', 'waitlist_rule_validation_result', 'waitlist_rule_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    waitlist_rule_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
