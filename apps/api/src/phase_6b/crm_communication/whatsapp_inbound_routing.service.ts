export const PHASE_6B_WHATSAPP_INBOUND_ROUTING_SEED_ID = 'seed_6b_07_whatsapp_inbound_routing' as const;
export const PHASE_6B_WHATSAPP_INBOUND_ROUTING_COMPONENT_ID = '6B.07' as const;

export const WHATSAPP_INBOUND_ROUTING_EVENT = 'phase_6b.crm_communication.whatsapp_inbound_routing.routed' as const;

export type WhatsappInboundRoutingDecision = 'CREATE_LEAD' | 'ATTACH_TO_EXISTING_LEAD' | 'ROUTE_TO_PIPELINE_STAGE' | 'MANUAL_REVIEW';
export type WhatsappInboundMessageKind = 'TEXT' | 'MEDIA_EVIDENCE' | 'TEMPLATE_REPLY' | 'INTERACTIVE_REPLY' | 'UNKNOWN';

export type WhatsappInboundRoutingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  inbound_message_id: string;
  channel_account_ref: string;
  sender_contact_ref: string;
  conversation_ref: string;
  lead_record_authority_id: string;
  pipeline_stage_model_ref: string;
  pipeline_stage_key: string;
  message_kind: WhatsappInboundMessageKind;
  normalized_message_body: string;
  received_at: string;
  routing_decision: WhatsappInboundRoutingDecision;
  route_reason: string;
  assigned_work_queue_ref?: string;
  global_opt_out_registry_ref?: string;
  evidence_refs: string[];
  outbound_send_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type WhatsappInboundRoutingReceipt = {
  seed_id: typeof PHASE_6B_WHATSAPP_INBOUND_ROUTING_SEED_ID;
  component_id: typeof PHASE_6B_WHATSAPP_INBOUND_ROUTING_COMPONENT_ID;
  event_name: typeof WHATSAPP_INBOUND_ROUTING_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  inbound_message_id: string;
  channel_account_ref: string;
  sender_contact_ref: string;
  conversation_ref: string;
  lead_record_authority_id: string;
  pipeline_stage_model_ref: string;
  pipeline_stage_key: string;
  message_kind: WhatsappInboundMessageKind;
  normalized_message_body: string;
  received_at: string;
  routing_decision: WhatsappInboundRoutingDecision;
  route_reason: string;
  assigned_work_queue_ref?: string;
  global_opt_out_registry_ref?: string;
  evidence_refs: readonly string[];
  evidence_count: number;
  opt_out_dependency_tier: 'CONDITIONAL_CAPTURE_REFERENCE';
  inbound_capture_only: true;
  outbound_send_allowed: false;
  provider_callback_processing_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
};

const ROUTING_DECISIONS: readonly WhatsappInboundRoutingDecision[] = ['CREATE_LEAD', 'ATTACH_TO_EXISTING_LEAD', 'ROUTE_TO_PIPELINE_STAGE', 'MANUAL_REVIEW'] as const;
const MESSAGE_KINDS: readonly WhatsappInboundMessageKind[] = ['TEXT', 'MEDIA_EVIDENCE', 'TEMPLATE_REPLY', 'INTERACTIVE_REPLY', 'UNKNOWN'] as const;
const MAX_MESSAGE_LENGTH = 4096;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for whatsapp inbound routing.`);
  }
  return value.trim();
}

function normalizeOptional(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireReceivedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'received_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('received_at must be a valid ISO-compatible timestamp for whatsapp inbound routing.');
  }
  return normalized;
}

function normalizeMessageBody(value: string): string {
  const normalized = requireNonEmpty(value, 'normalized_message_body');
  if (normalized.length > MAX_MESSAGE_LENGTH) {
    throw new Error('normalized_message_body must not exceed 4096 characters for whatsapp inbound routing.');
  }
  return normalized;
}

function normalizeMessageKind(value: WhatsappInboundMessageKind): WhatsappInboundMessageKind {
  if (!MESSAGE_KINDS.includes(value)) {
    throw new Error('message_kind is not supported for whatsapp inbound routing.');
  }
  return value;
}

function normalizeRoutingDecision(value: WhatsappInboundRoutingDecision): WhatsappInboundRoutingDecision {
  if (!ROUTING_DECISIONS.includes(value)) {
    throw new Error('routing_decision is not supported for whatsapp inbound routing.');
  }
  return value;
}

function normalizeEvidenceRefs(evidenceRefs: string[]): readonly string[] {
  if (!Array.isArray(evidenceRefs) || evidenceRefs.length === 0) {
    throw new Error('evidence_refs must contain at least one evidence reference for whatsapp inbound routing.');
  }
  const normalized = evidenceRefs.map((evidenceRef, index) => requireNonEmpty(evidenceRef, `evidence_refs.${index}`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('evidence_refs must not contain duplicate values for whatsapp inbound routing.');
  }
  return Object.freeze(normalized);
}

export function routeWhatsappInboundMessage(input: WhatsappInboundRoutingInput): WhatsappInboundRoutingReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('whatsapp inbound routing must not send outbound messages.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('whatsapp inbound routing must not process provider callbacks.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('whatsapp inbound routing must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('whatsapp inbound routing must not perform irreversible actions.');
  }

  const evidenceRefs = normalizeEvidenceRefs(input.evidence_refs);

  return {
    seed_id: PHASE_6B_WHATSAPP_INBOUND_ROUTING_SEED_ID,
    component_id: PHASE_6B_WHATSAPP_INBOUND_ROUTING_COMPONENT_ID,
    event_name: WHATSAPP_INBOUND_ROUTING_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    inbound_message_id: requireNonEmpty(input.inbound_message_id, 'inbound_message_id'),
    channel_account_ref: requireNonEmpty(input.channel_account_ref, 'channel_account_ref'),
    sender_contact_ref: requireNonEmpty(input.sender_contact_ref, 'sender_contact_ref'),
    conversation_ref: requireNonEmpty(input.conversation_ref, 'conversation_ref'),
    lead_record_authority_id: requireNonEmpty(input.lead_record_authority_id, 'lead_record_authority_id'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    pipeline_stage_key: requireNonEmpty(input.pipeline_stage_key, 'pipeline_stage_key'),
    message_kind: normalizeMessageKind(input.message_kind),
    normalized_message_body: normalizeMessageBody(input.normalized_message_body),
    received_at: requireReceivedAt(input.received_at),
    routing_decision: normalizeRoutingDecision(input.routing_decision),
    route_reason: requireNonEmpty(input.route_reason, 'route_reason'),
    assigned_work_queue_ref: normalizeOptional(input.assigned_work_queue_ref, 'assigned_work_queue_ref'),
    global_opt_out_registry_ref: normalizeOptional(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    evidence_refs: evidenceRefs,
    evidence_count: evidenceRefs.length,
    opt_out_dependency_tier: 'CONDITIONAL_CAPTURE_REFERENCE',
    inbound_capture_only: true,
    outbound_send_allowed: false,
    provider_callback_processing_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
  };
}
