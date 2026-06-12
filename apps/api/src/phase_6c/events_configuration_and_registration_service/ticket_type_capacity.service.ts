import { createHash } from 'node:crypto';

export const PHASE_6C_TICKET_TYPE_CAPACITY_SEED_ID = 'seed_6c_099_ticket_type_capacity' as const;
export const PHASE_6C_TICKET_TYPE_CAPACITY_COMPONENT_ID = '6C.08' as const;
export const TICKET_TYPE_CAPACITY_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.ticket_type_capacity.runtime_evaluated' as const;

export type TicketTypeCapacityDecision = 'CAPACITY_AVAILABLE' | 'CAPACITY_EXHAUSTED' | 'CAPACITY_REQUIRES_REVIEW';
export type TicketTypeCapacityStatus = 'AVAILABLE' | 'EXHAUSTED' | 'INACTIVE' | 'OVER_ALLOCATED';

export type TicketTypeCapacityRow = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  active: boolean;
  capacity: number;
  sold_count: number;
  held_count: number;
  reserved_count?: number;
};

export type TicketTypeCapacityRequest = {
  ticket_type_ref: string;
  requested_quantity: number;
};

export type TicketTypeCapacityInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  product_catalogue_ref: string;
  ticket_types: readonly TicketTypeCapacityRow[];
  capacity_request?: TicketTypeCapacityRequest;
  control_metadata?: Record<string, unknown>;
  product_catalogue_write_requested?: boolean;
  ticket_inventory_mutation_requested?: boolean;
  payment_capture_requested?: boolean;
  registration_creation_requested?: boolean;
  waitlist_promotion_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type TicketTypeCapacityEvaluation = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  active: boolean;
  capacity: number;
  committed_count: number;
  remaining_capacity: number;
  status: TicketTypeCapacityStatus;
};

export type TicketTypeCapacityRuntimeReceipt = {
  seed_id: typeof PHASE_6C_TICKET_TYPE_CAPACITY_SEED_ID;
  component_id: typeof PHASE_6C_TICKET_TYPE_CAPACITY_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CTicketTypeCapacity';
  event_name: typeof TICKET_TYPE_CAPACITY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  product_catalogue_ref: string;
  ticket_type_count: number;
  total_capacity: number;
  total_committed_count: number;
  total_remaining_capacity: number;
  evaluations: readonly TicketTypeCapacityEvaluation[];
  requested_ticket_type_ref?: string;
  requested_quantity?: number;
  requested_remaining_after_hold?: number;
  decision: TicketTypeCapacityDecision;
  refs_events_only: true;
  product_catalogue_write_allowed: false;
  ticket_inventory_mutation_performed: false;
  payment_capture_allowed: false;
  registration_creation_allowed: false;
  waitlist_promotion_performed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  ticket_type_capacity_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-016', '6C-EVENT-REG-002', '6C-BILL-007', '6C-GLOBAL-018'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for ticket_type_capacity runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for ticket_type_capacity runtime evaluation.');
  }
  return normalized;
}

function requireNonNegativeInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value < 0) {
    throw new Error(field + ' must be a non-negative integer for ticket_type_capacity runtime evaluation.');
  }
  return value;
}

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value <= 0) {
    throw new Error(field + ' must be a positive integer for ticket_type_capacity runtime evaluation.');
  }
  return value;
}

function assertForbidden(input: TicketTypeCapacityInput): void {
  const forbidden: Array<[keyof TicketTypeCapacityInput, string]> = [
    ['product_catalogue_write_requested', 'ticket_type_capacity must reference Product Catalogue anchors, not write Product Catalogue data.'],
    ['ticket_inventory_mutation_requested', 'ticket_type_capacity must evaluate capacity, not mutate ticket inventory.'],
    ['payment_capture_requested', 'ticket_type_capacity must not capture payment.'],
    ['registration_creation_requested', 'ticket_type_capacity must not create registrations.'],
    ['waitlist_promotion_requested', 'ticket_type_capacity must not promote waitlist entries.'],
    ['provider_adapter_requested', 'ticket_type_capacity must not execute provider adapters.'],
    ['persistence_requested', 'ticket_type_capacity FFET must not persist records.'],
    ['schema_mutation_requested', 'ticket_type_capacity FFET must not mutate schema.'],
    ['frontend_requested', 'ticket_type_capacity FFET must not create frontend surfaces.'],
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

function digestRuntime(receiptWithoutDigest: Omit<TicketTypeCapacityRuntimeReceipt, 'ticket_type_capacity_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function evaluateTicketRows(ticketTypes: readonly TicketTypeCapacityRow[]): readonly TicketTypeCapacityEvaluation[] {
  if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) {
    throw new Error('at least one ticket_type is required for ticket_type_capacity runtime evaluation.');
  }
  const seen = new Set<string>();
  return ticketTypes.map((ticketType, index) => {
    const ticketTypeRef = requireNonEmpty(ticketType.ticket_type_ref, 'ticket_types[' + index + '].ticket_type_ref');
    if (seen.has(ticketTypeRef)) {
      throw new Error('ticket_type_ref values must be unique for ticket_type_capacity runtime evaluation.');
    }
    seen.add(ticketTypeRef);
    const capacity = requirePositiveInteger(ticketType.capacity, 'ticket_types[' + index + '].capacity');
    const soldCount = requireNonNegativeInteger(ticketType.sold_count, 'ticket_types[' + index + '].sold_count');
    const heldCount = requireNonNegativeInteger(ticketType.held_count, 'ticket_types[' + index + '].held_count');
    const reservedCount = requireNonNegativeInteger(ticketType.reserved_count ?? 0, 'ticket_types[' + index + '].reserved_count');
    const committedCount = soldCount + heldCount + reservedCount;
    const remainingCapacity = Math.max(0, capacity - committedCount);
    const status: TicketTypeCapacityStatus = ticketType.active === false
      ? 'INACTIVE'
      : committedCount > capacity
        ? 'OVER_ALLOCATED'
        : remainingCapacity === 0
          ? 'EXHAUSTED'
          : 'AVAILABLE';

    return {
      ticket_type_ref: ticketTypeRef,
      product_catalogue_item_ref: requireNonEmpty(ticketType.product_catalogue_item_ref, 'ticket_types[' + index + '].product_catalogue_item_ref'),
      active: ticketType.active,
      capacity,
      committed_count: committedCount,
      remaining_capacity: remainingCapacity,
      status,
    };
  });
}

function evaluateRequest(input: TicketTypeCapacityInput, evaluations: readonly TicketTypeCapacityEvaluation[]): { requestedTicketTypeRef?: string; requestedQuantity?: number; requestedRemainingAfterHold?: number; decision: TicketTypeCapacityDecision } {
  if (!input.capacity_request) {
    return {
      decision: evaluations.some((evaluation) => evaluation.status === 'OVER_ALLOCATED') ? 'CAPACITY_REQUIRES_REVIEW' : 'CAPACITY_AVAILABLE',
    };
  }

  const requestedTicketTypeRef = requireNonEmpty(input.capacity_request.ticket_type_ref, 'capacity_request.ticket_type_ref');
  const requestedQuantity = requirePositiveInteger(input.capacity_request.requested_quantity, 'capacity_request.requested_quantity');
  const evaluation = evaluations.find((item) => item.ticket_type_ref === requestedTicketTypeRef);
  if (!evaluation) {
    throw new Error('capacity_request.ticket_type_ref must match a declared ticket_type_ref.');
  }
  if (evaluation.status === 'INACTIVE' || evaluation.status === 'OVER_ALLOCATED') {
    return { requestedTicketTypeRef, requestedQuantity, requestedRemainingAfterHold: evaluation.remaining_capacity, decision: 'CAPACITY_REQUIRES_REVIEW' };
  }
  if (requestedQuantity > evaluation.remaining_capacity) {
    return { requestedTicketTypeRef, requestedQuantity, requestedRemainingAfterHold: evaluation.remaining_capacity - requestedQuantity, decision: 'CAPACITY_EXHAUSTED' };
  }
  return { requestedTicketTypeRef, requestedQuantity, requestedRemainingAfterHold: evaluation.remaining_capacity - requestedQuantity, decision: 'CAPACITY_AVAILABLE' };
}

export function evaluateTicketTypeCapacity(input: TicketTypeCapacityInput): TicketTypeCapacityRuntimeReceipt {
  assertForbidden(input);
  const evaluations = evaluateTicketRows(input.ticket_types);
  const request = evaluateRequest(input, evaluations);
  const totalCapacity = evaluations.reduce((sum, evaluation) => sum + evaluation.capacity, 0);
  const totalCommittedCount = evaluations.reduce((sum, evaluation) => sum + evaluation.committed_count, 0);
  const totalRemainingCapacity = evaluations.reduce((sum, evaluation) => sum + evaluation.remaining_capacity, 0);

  const receiptWithoutDigest: Omit<TicketTypeCapacityRuntimeReceipt, 'ticket_type_capacity_runtime_digest'> = {
    seed_id: PHASE_6C_TICKET_TYPE_CAPACITY_SEED_ID,
    component_id: PHASE_6C_TICKET_TYPE_CAPACITY_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CTicketTypeCapacity',
    event_name: TICKET_TYPE_CAPACITY_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    product_catalogue_ref: requireNonEmpty(input.product_catalogue_ref, 'product_catalogue_ref'),
    ticket_type_count: evaluations.length,
    total_capacity: totalCapacity,
    total_committed_count: totalCommittedCount,
    total_remaining_capacity: totalRemainingCapacity,
    evaluations,
    requested_ticket_type_ref: request.requestedTicketTypeRef,
    requested_quantity: request.requestedQuantity,
    requested_remaining_after_hold: request.requestedRemainingAfterHold,
    decision: request.decision,
    refs_events_only: true,
    product_catalogue_write_allowed: false,
    ticket_inventory_mutation_performed: false,
    payment_capture_allowed: false,
    registration_creation_allowed: false,
    waitlist_promotion_performed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    frontend_surface_created: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: ['ticket_type_capacity_runtime_receipt', 'ticket_type_capacity_validation_result', 'ticket_type_capacity_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    ticket_type_capacity_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
