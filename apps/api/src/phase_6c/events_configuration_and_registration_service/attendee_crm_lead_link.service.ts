import { createHash } from 'node:crypto';

export const PHASE_6C_ATTENDEE_CRM_LEAD_LINK_SEED_ID = "seed_6c_106_attendee_crm_lead_link" as const;
export const PHASE_6C_ATTENDEE_CRM_LEAD_LINK_COMPONENT_ID = "6C.08" as const;
export const ATTENDEE_CRM_LEAD_LINK_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.attendee_crm_lead_link.runtime_evaluated" as const;

type AttendeeCrmLeadLinkDecision =
  | 'CRM_LINK_NOT_APPLICABLE'
  | 'CRM_LINK_PENDING'
  | 'CRM_LEAD_LINKED'
  | 'CRM_LINK_CONFLICT'
  | 'CRM_LINK_REQUIRES_REVIEW';

type AttendeeCrmLeadLinkStatus = 'not_applicable' | 'pending' | 'linked' | 'failed' | 'conflict';

export type AttendeeCrmLeadLinkInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  crm_handoff_active: boolean;
  crm_lead_ref?: string;
  crm_contact_ref?: string;
  crm_campaign_ref?: string;
  lead_source_ref?: string;
  attendee_identity_ref?: string;
  link_status?: AttendeeCrmLeadLinkStatus;
  conflict_refs?: readonly string[];
  product_catalogue_anchor_ref?: string;
  invoice_saga_ref?: string;
  payment_saga_ref?: string;
  workspace_calendar_ref?: string;
  control_metadata?: Record<string, unknown>;
  create_crm_lead_requested?: boolean;
  update_crm_lead_requested?: boolean;
  crm_provider_sync_requested?: boolean;
  registration_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type AttendeeCrmLeadLinkRuntimeReceipt = {
  seed_id: typeof PHASE_6C_ATTENDEE_CRM_LEAD_LINK_SEED_ID;
  component_id: typeof PHASE_6C_ATTENDEE_CRM_LEAD_LINK_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CAttendeeCrmLeadLink";
  event_name: typeof ATTENDEE_CRM_LEAD_LINK_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  decision: AttendeeCrmLeadLinkDecision;
  crm_handoff_active: boolean;
  link_status: AttendeeCrmLeadLinkStatus;
  crm_lead_ref: string | null;
  crm_contact_ref: string | null;
  crm_campaign_ref: string | null;
  lead_source_ref: string | null;
  attendee_identity_ref: string | null;
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
    throw new Error(field + ' is required for attendee_crm_lead_link runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for attendee_crm_lead_link.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for attendee_crm_lead_link.');
  }
  return normalized;
}

function normalizeConflicts(conflictRefs: readonly string[] | undefined): readonly string[] {
  const normalized = (conflictRefs ?? []).map((ref, index) => requireNonEmpty(ref, 'conflict_refs[' + index + ']'));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('conflict_refs must be unique for attendee_crm_lead_link.');
  }
  return normalized;
}

function assertForbiddenRequests(input: AttendeeCrmLeadLinkInput): readonly string[] {
  const rejections = [
    ['create_crm_lead_requested', input.create_crm_lead_requested, 'CRM lead creation is delegated to the CRM handoff surface'],
    ['update_crm_lead_requested', input.update_crm_lead_requested, 'CRM lead update is delegated to the CRM handoff surface'],
    ['crm_provider_sync_requested', input.crm_provider_sync_requested, 'CRM provider sync is not authorized inside attendee_crm_lead_link'],
    ['registration_mutation_requested', input.registration_mutation_requested, 'registration mutation is outside this reference evaluator'],
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

function determineDecision(input: {
  crmHandoffActive: boolean;
  linkStatus: AttendeeCrmLeadLinkStatus;
  crmLeadRef: string | null;
  crmContactRef: string | null;
  leadSourceRef: string | null;
  conflicts: readonly string[];
}): AttendeeCrmLeadLinkDecision {
  if (!input.crmHandoffActive) {
    return 'CRM_LINK_NOT_APPLICABLE';
  }
  if (input.conflicts.length > 0 || input.linkStatus === 'conflict') {
    return 'CRM_LINK_CONFLICT';
  }
  if (input.linkStatus === 'failed') {
    return 'CRM_LINK_REQUIRES_REVIEW';
  }
  if (input.linkStatus === 'linked') {
    if (input.crmLeadRef === null && input.crmContactRef === null) {
      return 'CRM_LINK_REQUIRES_REVIEW';
    }
    return 'CRM_LEAD_LINKED';
  }
  if (input.crmLeadRef !== null || input.crmContactRef !== null || input.leadSourceRef !== null) {
    return 'CRM_LINK_PENDING';
  }
  return 'CRM_LINK_PENDING';
}

function digestRuntime(receiptWithoutDigest: Omit<AttendeeCrmLeadLinkRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateAttendeeCrmLeadLink(input: AttendeeCrmLeadLinkInput): AttendeeCrmLeadLinkRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const linkStatus = input.link_status ?? (input.crm_handoff_active ? 'pending' : 'not_applicable');
  if (!input.crm_handoff_active && linkStatus !== 'not_applicable') {
    throw new Error('link_status must be not_applicable when crm_handoff_active is false.');
  }

  const crmLeadRef = optionalRef(input.crm_lead_ref, 'crm_lead_ref');
  const crmContactRef = optionalRef(input.crm_contact_ref, 'crm_contact_ref');
  const crmCampaignRef = optionalRef(input.crm_campaign_ref, 'crm_campaign_ref');
  const leadSourceRef = optionalRef(input.lead_source_ref, 'lead_source_ref');
  const attendeeIdentityRef = optionalRef(input.attendee_identity_ref, 'attendee_identity_ref');
  const conflicts = normalizeConflicts(input.conflict_refs);
  const decision = determineDecision({
    crmHandoffActive: input.crm_handoff_active,
    linkStatus,
    crmLeadRef,
    crmContactRef,
    leadSourceRef,
    conflicts,
  });

  const receiptWithoutDigest: Omit<AttendeeCrmLeadLinkRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_ATTENDEE_CRM_LEAD_LINK_SEED_ID,
    component_id: PHASE_6C_ATTENDEE_CRM_LEAD_LINK_COMPONENT_ID,
    component_slug: "events_configuration_and_registration_service",
    model_name: "Phase6CAttendeeCrmLeadLink",
    event_name: ATTENDEE_CRM_LEAD_LINK_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    crm_handoff_active: input.crm_handoff_active,
    link_status: linkStatus,
    crm_lead_ref: crmLeadRef,
    crm_contact_ref: crmContactRef,
    crm_campaign_ref: crmCampaignRef,
    lead_source_ref: leadSourceRef,
    attendee_identity_ref: attendeeIdentityRef,
    conflict_refs: conflicts,
    dependency_trace: {
      service_manifest_contract: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
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
