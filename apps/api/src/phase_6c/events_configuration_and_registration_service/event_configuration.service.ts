import { createHash } from 'node:crypto';

export const PHASE_6C_EVENT_CONFIGURATION_SEED_ID = 'seed_6c_096_event_configuration' as const;
export const PHASE_6C_EVENT_CONFIGURATION_COMPONENT_ID = '6C.08' as const;
export const EVENT_CONFIGURATION_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.event_configuration.runtime_evaluated' as const;

export type EventConfigurationLifecycleStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED';
export type EventConfigurationRegistrationMode = 'INFORMATION_ONLY' | 'FREE_REGISTRATION' | 'PAID_REGISTRATION' | 'APPROVAL_REQUIRED' | 'INVITE_ONLY';
export type EventConfigurationTicketingMode = 'NONE' | 'PRODUCT_CATALOGUE_TICKET_TYPES';
export type EventConfigurationCapacityMode = 'UNLIMITED' | 'FIXED_CAPACITY' | 'PER_TICKET_TYPE';
export type EventConfigurationAudienceVisibility = 'PRIVATE' | 'PUBLIC' | 'LINK_ONLY';
export type EventConfigurationDecision = 'CONFIGURATION_READY' | 'DRAFT_CONFIGURATION_READY' | 'CONFIGURATION_REQUIRES_REVIEW';

export type EventConfigurationTicketTypeRef = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  capacity?: number;
  active: boolean;
};

export type EventConfigurationPaidRegistrationPolicy = {
  invoice_required: boolean;
  payment_required: boolean;
  registration_invoice_saga_ref?: string;
  finance_invoice_ref?: string;
  payment_collection_ref?: string;
};

export type EventConfigurationConditionalRef = {
  enabled: boolean;
  condition: 'event_crm_handoff_active' | 'workspace_calendar_active';
  target_ref?: string;
};

export type EventConfigurationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  configured_by_user_id: string;
  evaluated_at: string;
  event_name: string;
  event_code: string;
  lifecycle_status: EventConfigurationLifecycleStatus;
  registration_mode: EventConfigurationRegistrationMode;
  ticketing_mode: EventConfigurationTicketingMode;
  capacity_mode: EventConfigurationCapacityMode;
  audience_visibility: EventConfigurationAudienceVisibility;
  timezone: string;
  starts_at?: string;
  ends_at?: string;
  max_capacity?: number;
  product_catalogue_ref?: string;
  ticket_type_refs?: readonly EventConfigurationTicketTypeRef[];
  paid_registration_policy?: EventConfigurationPaidRegistrationPolicy;
  crm_handoff?: EventConfigurationConditionalRef;
  calendar_schedule?: EventConfigurationConditionalRef;
  employee_owner_ref?: string;
  control_metadata?: Record<string, unknown>;
  product_catalogue_write_requested?: boolean;
  finance_invoice_write_requested?: boolean;
  payment_capture_requested?: boolean;
  crm_direct_write_requested?: boolean;
  calendar_direct_write_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type EventConfigurationRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EVENT_CONFIGURATION_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_CONFIGURATION_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CEventConfiguration';
  event_name: typeof EVENT_CONFIGURATION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  configured_by_user_id: string;
  evaluated_at: string;
  normalized_event_code: string;
  lifecycle_status: EventConfigurationLifecycleStatus;
  registration_mode: EventConfigurationRegistrationMode;
  ticketing_mode: EventConfigurationTicketingMode;
  capacity_mode: EventConfigurationCapacityMode;
  audience_visibility: EventConfigurationAudienceVisibility;
  timezone: string;
  decision: EventConfigurationDecision;
  product_catalogue_anchor_required: boolean;
  product_catalogue_ref?: string;
  active_ticket_type_count: number;
  fixed_capacity?: number;
  registration_invoice_saga_required: boolean;
  registration_invoice_saga_ref?: string;
  crm_handoff_condition?: 'event_crm_handoff_active';
  crm_handoff_target_ref?: string;
  calendar_schedule_condition?: 'workspace_calendar_active';
  calendar_target_ref?: string;
  employee_owner_ref?: string;
  refs_events_only: true;
  direct_cross_module_write_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  event_configuration_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-001', '6C-EVENT-REG-002', '6C-EVENT-REG-003', '6C-EVENT-REG-009', '6C-EVENT-REG-012', '6C-BILL-007', '6C-GLOBAL-018'] as const;
const ADL_REFS = ['ADL-001'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for event_configuration runtime evaluation.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for event_configuration runtime evaluation.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return requireTimestamp(value, field);
}

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value <= 0) {
    throw new Error(field + ' must be a positive integer for event_configuration runtime evaluation.');
  }
  return value;
}

function normalizeEventCode(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'event_code').toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{1,62}[A-Z0-9]$/.test(normalized)) {
    throw new Error('event_code must be 3-64 characters using letters, numbers, underscores, or hyphens.');
  }
  return normalized;
}

function assertForbidden(input: EventConfigurationInput): void {
  const forbidden: Array<[keyof EventConfigurationInput, string]> = [
    ['product_catalogue_write_requested', 'event_configuration must reference Product Catalogue anchors, not write Product Catalogue data.'],
    ['finance_invoice_write_requested', 'event_configuration must use Saga/evidence refs, not write Finance invoices.'],
    ['payment_capture_requested', 'event_configuration must not capture payment.'],
    ['crm_direct_write_requested', 'event_configuration must emit/reference CRM handoff evidence, not write CRM data directly.'],
    ['calendar_direct_write_requested', 'event_configuration must reference Workspace Calendar conditionally, not write calendar data directly.'],
    ['provider_adapter_requested', 'event_configuration must not execute provider adapters.'],
    ['persistence_requested', 'event_configuration FFET must not persist records.'],
    ['schema_mutation_requested', 'event_configuration FFET must not mutate schema.'],
    ['frontend_requested', 'event_configuration FFET must not create frontend surfaces.'],
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

function digestRuntime(receiptWithoutDigest: Omit<EventConfigurationRuntimeReceipt, 'event_configuration_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function validateSchedule(input: EventConfigurationInput): void {
  const startsAt = optionalTimestamp(input.starts_at, 'starts_at');
  const endsAt = optionalTimestamp(input.ends_at, 'ends_at');
  if (startsAt && endsAt && Date.parse(startsAt) >= Date.parse(endsAt)) {
    throw new Error('ends_at must be after starts_at for event_configuration runtime evaluation.');
  }
}

function validateTicketTypes(input: EventConfigurationInput): { productCatalogueAnchorRequired: boolean; activeTicketTypeCount: number; fixedCapacity?: number; productCatalogueRef?: string } {
  const productCatalogueAnchorRequired = input.ticketing_mode === 'PRODUCT_CATALOGUE_TICKET_TYPES' || input.registration_mode === 'PAID_REGISTRATION';
  const ticketTypeRefs = input.ticket_type_refs ?? [];
  const activeTicketTypeRefs = ticketTypeRefs.filter((ticketType) => ticketType.active === true);

  if (productCatalogueAnchorRequired) {
    const productCatalogueRef = requireNonEmpty(input.product_catalogue_ref, 'product_catalogue_ref');
    if (activeTicketTypeRefs.length === 0) {
      throw new Error('at least one active ticket_type_ref is required when Product Catalogue ticketing is enabled.');
    }
    for (const ticketType of activeTicketTypeRefs) {
      requireNonEmpty(ticketType.ticket_type_ref, 'ticket_type_ref');
      requireNonEmpty(ticketType.product_catalogue_item_ref, 'product_catalogue_item_ref');
      if (input.capacity_mode === 'PER_TICKET_TYPE') {
        requirePositiveInteger(ticketType.capacity, 'ticket_type_ref.capacity');
      }
    }
    return { productCatalogueAnchorRequired, activeTicketTypeCount: activeTicketTypeRefs.length, productCatalogueRef };
  }

  if (ticketTypeRefs.length > 0) {
    throw new Error('ticket_type_refs require Product Catalogue ticketing mode.');
  }
  if (input.product_catalogue_ref !== undefined) {
    throw new Error('product_catalogue_ref requires Product Catalogue ticketing mode.');
  }

  if (input.capacity_mode === 'PER_TICKET_TYPE') {
    throw new Error('PER_TICKET_TYPE capacity requires Product Catalogue ticketing mode.');
  }

  return { productCatalogueAnchorRequired, activeTicketTypeCount: 0 };
}

function validateCapacity(input: EventConfigurationInput): number | undefined {
  if (input.capacity_mode === 'FIXED_CAPACITY') {
    return requirePositiveInteger(input.max_capacity, 'max_capacity');
  }
  if (input.max_capacity !== undefined) {
    throw new Error('max_capacity is only valid for FIXED_CAPACITY event configuration.');
  }
  return undefined;
}

function validatePaidRegistration(input: EventConfigurationInput): { sagaRequired: boolean; sagaRef?: string } {
  if (input.registration_mode !== 'PAID_REGISTRATION') {
    if (input.paid_registration_policy !== undefined) {
      throw new Error('paid_registration_policy is only valid for PAID_REGISTRATION event configuration.');
    }
    return { sagaRequired: false };
  }

  const policy = input.paid_registration_policy;
  if (!policy || (policy.invoice_required !== true && policy.payment_required !== true)) {
    throw new Error('PAID_REGISTRATION requires invoice_required or payment_required policy.');
  }

  return {
    sagaRequired: true,
    sagaRef: requireNonEmpty(policy.registration_invoice_saga_ref, 'registration_invoice_saga_ref'),
  };
}

function validateConditionalRef(ref: EventConfigurationConditionalRef | undefined, expectedCondition: 'event_crm_handoff_active' | 'workspace_calendar_active', label: string): string | undefined {
  if (!ref || ref.enabled === false) {
    return undefined;
  }
  if (ref.condition !== expectedCondition) {
    throw new Error(label + ' must use condition ' + expectedCondition + '.');
  }
  return requireNonEmpty(ref.target_ref, label + '.target_ref');
}

function deriveDecision(status: EventConfigurationLifecycleStatus, registrationMode: EventConfigurationRegistrationMode): EventConfigurationDecision {
  if (status === 'DRAFT') {
    return 'DRAFT_CONFIGURATION_READY';
  }
  if (status === 'ARCHIVED' && registrationMode !== 'INFORMATION_ONLY') {
    return 'CONFIGURATION_REQUIRES_REVIEW';
  }
  return 'CONFIGURATION_READY';
}

export function evaluateEventConfiguration(input: EventConfigurationInput): EventConfigurationRuntimeReceipt {
  assertForbidden(input);
  validateSchedule(input);
  const ticketing = validateTicketTypes(input);
  const fixedCapacity = validateCapacity(input);
  const paidRegistration = validatePaidRegistration(input);
  const crmTargetRef = validateConditionalRef(input.crm_handoff, 'event_crm_handoff_active', 'crm_handoff');
  const calendarTargetRef = validateConditionalRef(input.calendar_schedule, 'workspace_calendar_active', 'calendar_schedule');

  const receiptWithoutDigest: Omit<EventConfigurationRuntimeReceipt, 'event_configuration_runtime_digest'> = {
    seed_id: PHASE_6C_EVENT_CONFIGURATION_SEED_ID,
    component_id: PHASE_6C_EVENT_CONFIGURATION_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CEventConfiguration',
    event_name: EVENT_CONFIGURATION_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    normalized_event_code: normalizeEventCode(input.event_code),
    lifecycle_status: input.lifecycle_status,
    registration_mode: input.registration_mode,
    ticketing_mode: input.ticketing_mode,
    capacity_mode: input.capacity_mode,
    audience_visibility: input.audience_visibility,
    timezone: requireNonEmpty(input.timezone, 'timezone'),
    decision: deriveDecision(input.lifecycle_status, input.registration_mode),
    product_catalogue_anchor_required: ticketing.productCatalogueAnchorRequired,
    product_catalogue_ref: ticketing.productCatalogueRef,
    active_ticket_type_count: ticketing.activeTicketTypeCount,
    fixed_capacity: fixedCapacity,
    registration_invoice_saga_required: paidRegistration.sagaRequired,
    registration_invoice_saga_ref: paidRegistration.sagaRef,
    crm_handoff_condition: crmTargetRef ? 'event_crm_handoff_active' : undefined,
    crm_handoff_target_ref: crmTargetRef,
    calendar_schedule_condition: calendarTargetRef ? 'workspace_calendar_active' : undefined,
    calendar_target_ref: calendarTargetRef,
    employee_owner_ref: optionalNonEmpty(input.employee_owner_ref, 'employee_owner_ref'),
    refs_events_only: true,
    direct_cross_module_write_allowed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    frontend_surface_created: false,
    decision_refs: DECISION_REFS,
    adl_refs: paidRegistration.sagaRequired ? ADL_REFS : [],
    evidence_artifacts: ['event_configuration_runtime_receipt', 'event_configuration_validation_result', 'event_configuration_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    event_configuration_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
