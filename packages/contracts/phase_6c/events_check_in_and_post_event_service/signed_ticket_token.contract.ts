export const PHASE_6C_SIGNED_TICKET_TOKEN_SEED_ID = "seed_6c_112_signed_ticket_token" as const;
export const PHASE_6C_SIGNED_TICKET_TOKEN_COMPONENT_ID = "6C.09" as const;
export const SIGNED_TICKET_TOKEN_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.signed_ticket_token.runtime_evaluated" as const;

export type SignedTicketTokenAlgorithm = 'HS256';

export type SignedTicketTokenInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  qr_payload_digest: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  signing_key_ref: string;
  signing_key_material: string;
  issued_at: string;
  not_before: string;
  expires_at: string;
  issuer: string;
  audience: string;
  ticket_issue_ref?: string;
  person_identity_ref?: string;
  access_audit_ref?: string;
  control_metadata?: Record<string, unknown>;
  production_secret_lookup_requested?: boolean;
  token_persistence_requested?: boolean;
  token_delivery_requested?: boolean;
  check_in_validation_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type SignedTicketTokenRuntimeReceipt = {
  seed_id: typeof PHASE_6C_SIGNED_TICKET_TOKEN_SEED_ID;
  component_id: typeof PHASE_6C_SIGNED_TICKET_TOKEN_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CSignedTicketToken";
  event_name: typeof SIGNED_TICKET_TOKEN_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  algorithm: SignedTicketTokenAlgorithm;
  signing_key_ref: string;
  token: string;
  token_header_digest: string;
  token_payload_digest: string;
  token_signature_digest: string;
  verification_result: 'SIGNATURE_VALID';
  dependency_trace: {
    service_manifest_contract: string;
    registration_context: '6C.08';
    qr_ticket_issuing_seed: 'seed_6c_111_qr_ticket_issuing';
    ticket_issue_ref: string | null;
    person_identity_ref: string | null;
    access_audit_ref: string | null;
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
