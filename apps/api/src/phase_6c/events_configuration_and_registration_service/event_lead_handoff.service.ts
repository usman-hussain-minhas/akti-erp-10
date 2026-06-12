import { createHash } from 'node:crypto';

export const PHASE_6C_EVENT_LEAD_HANDOFF_SEED_ID = "seed_6c_107_event_lead_handoff" as const;
export const PHASE_6C_EVENT_LEAD_HANDOFF_COMPONENT_ID = "6C.08" as const;
export const EVENT_LEAD_HANDOFF_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.event_lead_handoff.runtime_evaluated" as const;
export const EVENT_LEAD_HANDOFF_READY_EVENT = "phase_6c.events_configuration_and_registration_service.event_lead_handoff.ready" as const;

type EventLeadHandoffDecision =
  | 'CRM_HANDOFF_INACTIVE'
  | 'HANDOFF_EVENT_PENDING'
  | 'HANDOFF_EVENT_READY'
  | 'HANDOFF_EVENT_CONFLICT'
  | 'HANDOFF_EVENT_REQUIRES_REVIEW';

type EventLeadHandoffStatus = 'not_applicable' | 'pending' | 'ready' | 'failed' | 'conflict';

export type EventLeadHandoffInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  crm_handoff_active: boolean;
  handoff_status?: EventLeadHandoffStatus;
  attendee_crm_lead_link_ref?: string;
  event_lead_ref?: string;
  crm_lead_ref?: string;
  crm_contact_ref?: string;
  crm_campaign_ref?: string;
  lead_source_ref?: string;
  attendee_identity_ref?: string;
  conflict_refs?: readonly string[];
  product_catalogue_anchor_ref?: string;
  invoice_saga_ref?: string;
  payment_saga_ref?: string;
  workspace_calendar_ref?: string;
  control_metadata?: Record<string, unknown>;
  crm_direct_write_requested?: boolean;
  crm_provider_sync_requested?: boolean;
  event_bus_publish_requested?: boolean;
  registration_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type EventLeadHandoffEnvelope = {
  event_name: typeof EVENT_LEAD_HANDOFF_READY_EVENT;
  idempotency_key: string;
  organization_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  attendee_crm_lead_link_ref: string | null;
  event_lead_ref: string | null;
  crm_lead_ref: string | null;
  crm_contact_ref: string | null;
  crm_campaign_ref: string | null;
  lead_source_ref: string | null;
  attendee_identity_ref: string | null;
};

export type EventLeadHandoffRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EVENT_LEAD_HANDOFF_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_LEAD_HANDOFF_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CEventLeadHandoff";
  event_name: typeof EVENT_LEAD_HANDOFF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  decision: EventLeadHandoffDecision;
  crm_handoff_active: boolean;
  handoff_status: EventLeadHandoffStatus;
  handoff_envelope: EventLeadHandoffEnvelope | null;
  conflict_refs: readonly string[];
  dependency_trace: {
    service_manifest_contract: string;
    product_catalogue_anchor_ref: string | null;
    invoice_saga_ref: string | null;
    payment_saga_ref: string | null;
    workspace_calendar_ref: string | null;
    crm_handoff_condition: 'event_crm_handoff_active' | 'event_crm_handoff_inactive';
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for event_lead_handoff runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for event_lead_handoff.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for event_lead_handoff.');
  }
  return normalized;
}

function normalizeConflicts(conflictRefs: readonly string[] | undefined): readonly string[] {
  const normalized = (conflictRefs ?? []).map((ref, index) => requireNonEmpty(ref, 'conflict_refs[' + index + ']'));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('conflict_refs must be unique for event_lead_handoff.');
  }
  return normalized;
}

function assertForbiddenRequests(input: EventLeadHandoffInput): readonly string[] {
  const rejections = [
    ['crm_direct_write_requested', input.crm_direct_write_requested, 'direct CRM writes are forbidden; this seed only prepares handoff events'],
    ['crm_provider_sync_requested', input.crm_provider_sync_requested, 'CRM provider sync is not authorized inside event_lead_handoff'],
    ['event_bus_publish_requested', input.event_bus_publish_requested, 'event bus publication is deferred to runtime wiring'],
    ['registration_mutation_requested', input.registration_mutation_requested, 'registration mutation is outside this handoff evaluator'],
    ['payment_mutation_requested', input.payment_mutation_requested, 'payment mutation is Saga-owned and outside this FFET'],
    ['persistence_requested', input.persistence_requested, 'persistence is outside the exact FFET scope'],
    ['schema_mutation_requested', input.schema_mutation_requested, 'schema mutation is forbidden for this runtime FFET'],
    ['frontend_requested', input.frontend_requested, 'frontend creation is outside the exact FFET scope'],
  ] as const;

  for (const [field, requested, message] of rejections) {
    if (requested === true) {
      throw new Error(field + ': ' + message + '.');
    }
  }

  return rejections.map(([field, , message]) => field + ': ' + message);
}

function stableKey(parts: readonly string[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

function determineDecision(input: {
  crmHandoffActive: boolean;
  handoffStatus: EventLeadHandoffStatus;
  conflicts: readonly string[];
  envelope: EventLeadHandoffEnvelope | null;
}): EventLeadHandoffDecision {
  if (!input.crmHandoffActive) {
    return 'CRM_HANDOFF_INACTIVE';
  }
  if (input.conflicts.length > 0 || input.handoffStatus === 'conflict') {
    return 'HANDOFF_EVENT_CONFLICT';
  }
  if (input.handoffStatus === 'failed') {
    return 'HANDOFF_EVENT_REQUIRES_REVIEW';
  }
  if (input.handoffStatus === 'ready' && input.envelope !== null) {
    return 'HANDOFF_EVENT_READY';
  }
  return 'HANDOFF_EVENT_PENDING';
}

function buildEnvelope(input: {
  organizationId: string;
  eventConfigRef: string;
  registrationRef: string;
  attendeeRef: string;
  attendeeCrmLeadLinkRef: string | null;
  eventLeadRef: string | null;
  crmLeadRef: string | null;
  crmContactRef: string | null;
  crmCampaignRef: string | null;
  leadSourceRef: string | null;
  attendeeIdentityRef: string | null;
}): EventLeadHandoffEnvelope {
  return {
    event_name: EVENT_LEAD_HANDOFF_READY_EVENT,
    idempotency_key: stableKey([
      EVENT_LEAD_HANDOFF_READY_EVENT,
      input.organizationId,
      input.eventConfigRef,
      input.registrationRef,
      input.attendeeRef,
      input.crmLeadRef ?? 'no_crm_lead',
      input.crmContactRef ?? 'no_crm_contact',
    ]),
    organization_id: input.organizationId,
    event_config_ref: input.eventConfigRef,
    registration_ref: input.registrationRef,
    attendee_ref: input.attendeeRef,
    attendee_crm_lead_link_ref: input.attendeeCrmLeadLinkRef,
    event_lead_ref: input.eventLeadRef,
    crm_lead_ref: input.crmLeadRef,
    crm_contact_ref: input.crmContactRef,
    crm_campaign_ref: input.crmCampaignRef,
    lead_source_ref: input.leadSourceRef,
    attendee_identity_ref: input.attendeeIdentityRef,
  };
}

function digestRuntime(receiptWithoutDigest: Omit<EventLeadHandoffRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateEventLeadHandoff(input: EventLeadHandoffInput): EventLeadHandoffRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const handoffStatus = input.handoff_status ?? (input.crm_handoff_active ? 'pending' : 'not_applicable');
  if (!input.crm_handoff_active && handoffStatus !== 'not_applicable') {
    throw new Error('handoff_status must be not_applicable when crm_handoff_active is false.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const eventConfigRef = requireNonEmpty(input.event_config_ref, 'event_config_ref');
  const registrationRef = requireNonEmpty(input.registration_ref, 'registration_ref');
  const attendeeRef = requireNonEmpty(input.attendee_ref, 'attendee_ref');
  const attendeeCrmLeadLinkRef = optionalRef(input.attendee_crm_lead_link_ref, 'attendee_crm_lead_link_ref');
  const eventLeadRef = optionalRef(input.event_lead_ref, 'event_lead_ref');
  const crmLeadRef = optionalRef(input.crm_lead_ref, 'crm_lead_ref');
  const crmContactRef = optionalRef(input.crm_contact_ref, 'crm_contact_ref');
  const crmCampaignRef = optionalRef(input.crm_campaign_ref, 'crm_campaign_ref');
  const leadSourceRef = optionalRef(input.lead_source_ref, 'lead_source_ref');
  const attendeeIdentityRef = optionalRef(input.attendee_identity_ref, 'attendee_identity_ref');
  const conflicts = normalizeConflicts(input.conflict_refs);

  const envelope = input.crm_handoff_active
    ? buildEnvelope({
        organizationId,
        eventConfigRef,
        registrationRef,
        attendeeRef,
        attendeeCrmLeadLinkRef,
        eventLeadRef,
        crmLeadRef,
        crmContactRef,
        crmCampaignRef,
        leadSourceRef,
        attendeeIdentityRef,
      })
    : null;
  const decision = determineDecision({ crmHandoffActive: input.crm_handoff_active, handoffStatus, conflicts, envelope });

  const receiptWithoutDigest: Omit<EventLeadHandoffRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_EVENT_LEAD_HANDOFF_SEED_ID,
    component_id: PHASE_6C_EVENT_LEAD_HANDOFF_COMPONENT_ID,
    component_slug: "events_configuration_and_registration_service",
    model_name: "Phase6CEventLeadHandoff",
    event_name: EVENT_LEAD_HANDOFF_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContract,
    event_config_ref: eventConfigRef,
    registration_ref: registrationRef,
    attendee_ref: attendeeRef,
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    crm_handoff_active: input.crm_handoff_active,
    handoff_status: handoffStatus,
    handoff_envelope: envelope,
    conflict_refs: conflicts,
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      product_catalogue_anchor_ref: optionalRef(input.product_catalogue_anchor_ref, 'product_catalogue_anchor_ref'),
      invoice_saga_ref: optionalRef(input.invoice_saga_ref, 'invoice_saga_ref'),
      payment_saga_ref: optionalRef(input.payment_saga_ref, 'payment_saga_ref'),
      workspace_calendar_ref: optionalRef(input.workspace_calendar_ref, 'workspace_calendar_ref'),
      crm_handoff_condition: input.crm_handoff_active ? 'event_crm_handoff_active' : 'event_crm_handoff_inactive',
    },
    decision_refs: ["6C-EVENT-REG-012", "6C-GLOBAL-018", "6C-EVENT-REG-003", "6C-BILL-007", "ADL-001"],
    forbidden_behavior_rejections: forbiddenBehaviorRejections,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
