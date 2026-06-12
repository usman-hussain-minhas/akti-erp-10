export const PHASE_6C_REGISTRATION_INVOICE_SAGA_SEED_ID = "seed_6c_108_registration_invoice_saga" as const;
export const PHASE_6C_REGISTRATION_INVOICE_SAGA_COMPONENT_ID = "6C.08" as const;
export const REGISTRATION_INVOICE_SAGA_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.registration_invoice_saga.runtime_evaluated" as const;

export type RegistrationInvoiceSagaStage =
  | 'registration_accepted'
  | 'invoice_requested'
  | 'invoice_issued'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'ticket_issued'
  | 'failed'
  | 'compensated';

export type RegistrationInvoiceSagaDecision =
  | 'REQUEST_INVOICE'
  | 'AWAIT_INVOICE'
  | 'AWAIT_PAYMENT'
  | 'ISSUE_TICKET'
  | 'SAGA_COMPLETE'
  | 'COMPENSATION_REQUIRED'
  | 'SAGA_REQUIRES_REVIEW';

export type RegistrationInvoiceSagaInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  paid_registration: boolean;
  saga_stage: RegistrationInvoiceSagaStage;
  product_catalogue_anchor_ref?: string;
  invoice_ref?: string;
  payment_ref?: string;
  ticket_issue_ref?: string;
  outbox_message_ref?: string;
  dlq_recovery_ref?: string;
  compensation_ref?: string;
  failure_reason?: string;
  crm_handoff_ref?: string;
  workspace_calendar_ref?: string;
  control_metadata?: Record<string, unknown>;
  two_phase_commit_requested?: boolean;
  direct_invoice_mutation_requested?: boolean;
  direct_payment_capture_requested?: boolean;
  direct_ticket_issue_requested?: boolean;
  outbox_dispatch_requested?: boolean;
  dlq_replay_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type RegistrationInvoiceSagaStep = {
  step_name: 'registration' | 'invoice' | 'payment' | 'ticket' | 'compensation';
  status: 'satisfied' | 'pending' | 'blocked' | 'not_applicable';
  evidence_ref: string | null;
};

export type RegistrationInvoiceSagaRuntimeReceipt = {
  seed_id: typeof PHASE_6C_REGISTRATION_INVOICE_SAGA_SEED_ID;
  component_id: typeof PHASE_6C_REGISTRATION_INVOICE_SAGA_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CRegistrationInvoiceSaga";
  event_name: typeof REGISTRATION_INVOICE_SAGA_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  paid_registration: boolean;
  saga_stage: RegistrationInvoiceSagaStage;
  decision: RegistrationInvoiceSagaDecision;
  saga_steps: readonly RegistrationInvoiceSagaStep[];
  dependency_trace: {
    service_manifest_contract: string;
    product_catalogue_anchor_ref: string | null;
    invoice_ref: string | null;
    payment_ref: string | null;
    ticket_issue_ref: string | null;
    outbox_message_ref: string | null;
    dlq_recovery_ref: string | null;
    compensation_ref: string | null;
    crm_handoff_ref: string | null;
    workspace_calendar_ref: string | null;
  };
  adl_refs: readonly string[];
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  failure_reason: string | null;
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
