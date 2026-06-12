export const PHASE_6C_CANCELLATION_REFUND_DELEGATION_SEED_ID = "seed_6c_110_cancellation_refund_delegation" as const;
export const PHASE_6C_CANCELLATION_REFUND_DELEGATION_COMPONENT_ID = "6C.08" as const;
export const CANCELLATION_REFUND_DELEGATION_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.cancellation_refund_delegation.runtime_evaluated" as const;

export type CancellationRefundState =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'refund_delegated'
  | 'refund_completed'
  | 'refund_failed';

export type CancellationRefundDecision =
  | 'CANCELLATION_REJECTED'
  | 'CANCEL_WITHOUT_REFUND'
  | 'DELEGATE_REFUND'
  | 'AWAIT_REFUND'
  | 'CANCELLATION_COMPLETE'
  | 'REFUND_REQUIRES_REVIEW';

export type CancellationRefundDelegationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  cancellation_state: CancellationRefundState;
  cancellation_requested_at: string;
  paid_registration: boolean;
  refund_eligible: boolean;
  cancellation_reason: string;
  product_catalogue_anchor_ref?: string;
  invoice_ref?: string;
  payment_ref?: string;
  ticket_issue_ref?: string;
  refund_request_ref?: string;
  refund_ref?: string;
  finance_delegation_ref?: string;
  registration_invoice_saga_ref?: string;
  crm_handoff_ref?: string;
  workspace_calendar_ref?: string;
  failure_reason?: string;
  control_metadata?: Record<string, unknown>;
  direct_refund_execution_requested?: boolean;
  payment_mutation_requested?: boolean;
  invoice_mutation_requested?: boolean;
  ticket_reissue_requested?: boolean;
  provider_sync_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type CancellationRefundDelegationRuntimeReceipt = {
  seed_id: typeof PHASE_6C_CANCELLATION_REFUND_DELEGATION_SEED_ID;
  component_id: typeof PHASE_6C_CANCELLATION_REFUND_DELEGATION_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CCancellationRefundDelegation";
  event_name: typeof CANCELLATION_REFUND_DELEGATION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  cancellation_state: CancellationRefundState;
  cancellation_requested_at: string;
  cancellation_reason: string;
  paid_registration: boolean;
  refund_eligible: boolean;
  decision: CancellationRefundDecision;
  dependency_trace: {
    service_manifest_contract: string;
    product_catalogue_anchor_ref: string | null;
    invoice_ref: string | null;
    payment_ref: string | null;
    ticket_issue_ref: string | null;
    refund_request_ref: string | null;
    refund_ref: string | null;
    finance_delegation_ref: string | null;
    registration_invoice_saga_ref: string | null;
    crm_handoff_ref: string | null;
    workspace_calendar_ref: string | null;
  };
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  failure_reason: string | null;
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
