import { createHash } from 'node:crypto';

export const PHASE_6C_QR_TICKET_ISSUING_SEED_ID = "seed_6c_111_qr_ticket_issuing" as const;
export const PHASE_6C_QR_TICKET_ISSUING_COMPONENT_ID = "6C.09" as const;
export const QR_TICKET_ISSUING_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.qr_ticket_issuing.runtime_evaluated" as const;

type QrTicketRegistrationState = 'pending' | 'confirmed' | 'cancelled';
type QrTicketPaymentState = 'not_required' | 'pending' | 'paid' | 'failed';
type QrTicketStatus = 'not_issued' | 'issued' | 'voided';

type QrTicketIssuingDecision =
  | 'AWAIT_REGISTRATION'
  | 'AWAIT_PAYMENT'
  | 'ISSUE_QR_TICKET'
  | 'TICKET_ALREADY_ISSUED'
  | 'ISSUE_REQUIRES_REVIEW';

export type QrTicketIssuingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  registration_state: QrTicketRegistrationState;
  payment_state: QrTicketPaymentState;
  ticket_status: QrTicketStatus;
  ticket_issue_ref?: string;
  product_catalogue_anchor_ref?: string;
  registration_invoice_saga_ref?: string;
  person_identity_ref?: string;
  access_audit_ref?: string;
  crm_event_ref?: string;
  valid_from?: string;
  valid_until?: string;
  control_metadata?: Record<string, unknown>;
  qr_image_render_requested?: boolean;
  ticket_delivery_requested?: boolean;
  check_in_mark_requested?: boolean;
  payment_capture_requested?: boolean;
  ticket_persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type QrTicketPayload = {
  qr_payload_version: 'phase_6c_qr_ticket_v1';
  idempotency_key: string;
  organization_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  valid_from: string;
  valid_until: string;
  qr_payload_digest: string;
};

export type QrTicketIssuingRuntimeReceipt = {
  seed_id: typeof PHASE_6C_QR_TICKET_ISSUING_SEED_ID;
  component_id: typeof PHASE_6C_QR_TICKET_ISSUING_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CQrTicketIssuing";
  event_name: typeof QR_TICKET_ISSUING_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  registration_state: QrTicketRegistrationState;
  payment_state: QrTicketPaymentState;
  ticket_status: QrTicketStatus;
  decision: QrTicketIssuingDecision;
  qr_ticket_payload: QrTicketPayload | null;
  dependency_trace: {
    service_manifest_contract: string;
    registration_context: '6C.08';
    product_catalogue_anchor_ref: string | null;
    registration_invoice_saga_ref: string | null;
    person_identity_ref: string | null;
    access_audit_ref: string | null;
    crm_event_ref: string | null;
    ticket_issue_ref: string | null;
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
    throw new Error(field + ' is required for qr_ticket_issuing runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for qr_ticket_issuing.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for qr_ticket_issuing.');
  }
  return normalized;
}

function assertForbiddenRequests(input: QrTicketIssuingInput): readonly string[] {
  const rejections = [
    ['qr_image_render_requested', input.qr_image_render_requested, 'QR image rendering is deferred to delivery/runtime presentation layers'],
    ['ticket_delivery_requested', input.ticket_delivery_requested, 'ticket delivery is outside qr_ticket_issuing'],
    ['check_in_mark_requested', input.check_in_mark_requested, 'check-in marking belongs to check-in validation'],
    ['payment_capture_requested', input.payment_capture_requested, 'payment capture belongs to payment surfaces'],
    ['ticket_persistence_requested', input.ticket_persistence_requested, 'ticket persistence is outside the exact FFET scope'],
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
  registrationState: QrTicketRegistrationState;
  paymentState: QrTicketPaymentState;
  ticketStatus: QrTicketStatus;
  ticketIssueRef: string | null;
}): QrTicketIssuingDecision {
  if (input.registrationState !== 'confirmed') {
    return input.registrationState === 'pending' ? 'AWAIT_REGISTRATION' : 'ISSUE_REQUIRES_REVIEW';
  }
  if (input.paymentState === 'pending') {
    return 'AWAIT_PAYMENT';
  }
  if (input.paymentState === 'failed') {
    return 'ISSUE_REQUIRES_REVIEW';
  }
  if (input.ticketStatus === 'issued') {
    return input.ticketIssueRef === null ? 'ISSUE_REQUIRES_REVIEW' : 'TICKET_ALREADY_ISSUED';
  }
  if (input.ticketStatus === 'voided') {
    return 'ISSUE_REQUIRES_REVIEW';
  }
  return 'ISSUE_QR_TICKET';
}

function stableDigest(parts: readonly string[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

function buildPayload(input: {
  organizationId: string;
  eventConfigRef: string;
  registrationRef: string;
  attendeeRef: string;
  ticketTypeRef: string;
  validFrom: string;
  validUntil: string;
}): QrTicketPayload {
  const idempotencyKey = stableDigest([
    'phase_6c_qr_ticket_v1',
    input.organizationId,
    input.eventConfigRef,
    input.registrationRef,
    input.attendeeRef,
    input.ticketTypeRef,
  ]);
  return {
    qr_payload_version: 'phase_6c_qr_ticket_v1',
    idempotency_key: idempotencyKey,
    organization_id: input.organizationId,
    event_config_ref: input.eventConfigRef,
    registration_ref: input.registrationRef,
    attendee_ref: input.attendeeRef,
    ticket_type_ref: input.ticketTypeRef,
    valid_from: input.validFrom,
    valid_until: input.validUntil,
    qr_payload_digest: stableDigest([idempotencyKey, input.validFrom, input.validUntil]),
  };
}

function digestRuntime(receiptWithoutDigest: Omit<QrTicketIssuingRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateQrTicketIssuing(input: QrTicketIssuingInput): QrTicketIssuingRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const eventConfigRef = requireNonEmpty(input.event_config_ref, 'event_config_ref');
  const registrationRef = requireNonEmpty(input.registration_ref, 'registration_ref');
  const attendeeRef = requireNonEmpty(input.attendee_ref, 'attendee_ref');
  const ticketTypeRef = requireNonEmpty(input.ticket_type_ref, 'ticket_type_ref');
  const ticketIssueRef = optionalRef(input.ticket_issue_ref, 'ticket_issue_ref');
  const decision = determineDecision({
    registrationState: input.registration_state,
    paymentState: input.payment_state,
    ticketStatus: input.ticket_status,
    ticketIssueRef,
  });
  const validFrom = requireTimestamp(input.valid_from ?? input.evaluated_at, 'valid_from');
  const validUntil = requireTimestamp(input.valid_until ?? input.evaluated_at, 'valid_until');
  if (Date.parse(validUntil) <= Date.parse(validFrom)) {
    throw new Error('valid_until must be after valid_from for qr_ticket_issuing.');
  }
  const qrTicketPayload = decision === 'ISSUE_QR_TICKET'
    ? buildPayload({ organizationId, eventConfigRef, registrationRef, attendeeRef, ticketTypeRef, validFrom, validUntil })
    : null;

  const receiptWithoutDigest: Omit<QrTicketIssuingRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_QR_TICKET_ISSUING_SEED_ID,
    component_id: PHASE_6C_QR_TICKET_ISSUING_COMPONENT_ID,
    component_slug: "events_check_in_and_post_event_service",
    model_name: "Phase6CQrTicketIssuing",
    event_name: QR_TICKET_ISSUING_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContract,
    event_config_ref: eventConfigRef,
    registration_ref: registrationRef,
    attendee_ref: attendeeRef,
    ticket_type_ref: ticketTypeRef,
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    registration_state: input.registration_state,
    payment_state: input.payment_state,
    ticket_status: input.ticket_status,
    decision,
    qr_ticket_payload: qrTicketPayload,
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      registration_context: '6C.08',
      product_catalogue_anchor_ref: optionalRef(input.product_catalogue_anchor_ref, 'product_catalogue_anchor_ref'),
      registration_invoice_saga_ref: optionalRef(input.registration_invoice_saga_ref, 'registration_invoice_saga_ref'),
      person_identity_ref: optionalRef(input.person_identity_ref, 'person_identity_ref'),
      access_audit_ref: optionalRef(input.access_audit_ref, 'access_audit_ref'),
      crm_event_ref: optionalRef(input.crm_event_ref, 'crm_event_ref'),
      ticket_issue_ref: ticketIssueRef,
    },
    decision_refs: ["6C-EVENT-CHECK-001", "6C-EVENT-CHECK-014", "6C-EVENT-REG-012", "6C-GLOBAL-018"],
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
