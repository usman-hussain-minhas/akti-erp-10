export const PHASE_6C_SIGNED_TICKET_TOKEN_SEED_ID = "seed_6c_112_signed_ticket_token" as const;
export const PHASE_6C_SIGNED_TICKET_TOKEN_COMPONENT_ID = "6C.09" as const;
export const SIGNED_TICKET_TOKEN_SCAFFOLD_EVENT = "phase_6c.events_check_in_and_post_event_service.signed_ticket_token.scaffold_control_evaluated" as const;

export type SignedTicketTokenScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type SignedTicketTokenScaffoldReceipt = {
  seed_id: typeof PHASE_6C_SIGNED_TICKET_TOKEN_SEED_ID;
  component_id: typeof PHASE_6C_SIGNED_TICKET_TOKEN_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CSignedTicketToken";
  event_name: typeof SIGNED_TICKET_TOKEN_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
