export const PHASE_6C_QR_TICKET_ISSUING_SEED_ID = "seed_6c_111_qr_ticket_issuing" as const;
export const PHASE_6C_QR_TICKET_ISSUING_COMPONENT_ID = "6C.09" as const;
export const QR_TICKET_ISSUING_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.qr_ticket_issuing.runtime_evaluated" as const;

export type QrTicketRegistrationState = 'pending' | 'confirmed' | 'cancelled';
export type QrTicketPaymentState = 'not_required' | 'pending' | 'paid' | 'failed';
export type QrTicketStatus = 'not_issued' | 'issued' | 'voided';

export type QrTicketIssuingDecision =
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
