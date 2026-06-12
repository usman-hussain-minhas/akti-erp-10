import { createHash } from 'node:crypto';

export const PHASE_6C_CANCELLATION_REFUND_DELEGATION_SEED_ID = "seed_6c_110_cancellation_refund_delegation" as const;
export const PHASE_6C_CANCELLATION_REFUND_DELEGATION_COMPONENT_ID = "6C.08" as const;
export const CANCELLATION_REFUND_DELEGATION_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.cancellation_refund_delegation.runtime_evaluated" as const;

type CancellationRefundState =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'refund_delegated'
  | 'refund_completed'
  | 'refund_failed';

type CancellationRefundDecision =
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

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for cancellation_refund_delegation runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for cancellation_refund_delegation.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for cancellation_refund_delegation.');
  }
  return normalized;
}

function assertForbiddenRequests(input: CancellationRefundDelegationInput): readonly string[] {
  const rejections = [
    ['direct_refund_execution_requested', input.direct_refund_execution_requested, 'refund execution is delegated to Finance/payment surfaces'],
    ['payment_mutation_requested', input.payment_mutation_requested, 'payment mutation is outside this cancellation evaluator'],
    ['invoice_mutation_requested', input.invoice_mutation_requested, 'invoice mutation is outside this cancellation evaluator'],
    ['ticket_reissue_requested', input.ticket_reissue_requested, 'ticket reissue is outside this cancellation evaluator'],
    ['provider_sync_requested', input.provider_sync_requested, 'provider sync is not authorized inside cancellation_refund_delegation'],
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
  state: CancellationRefundState;
  paidRegistration: boolean;
  refundEligible: boolean;
  refundRequestRef: string | null;
  refundRef: string | null;
  financeDelegationRef: string | null;
  failureReason: string | null;
}): CancellationRefundDecision {
  if (input.state === 'rejected') {
    return 'CANCELLATION_REJECTED';
  }
  if (!input.paidRegistration || !input.refundEligible) {
    return input.state === 'cancelled' || input.state === 'approved' ? 'CANCEL_WITHOUT_REFUND' : 'CANCELLATION_REJECTED';
  }
  if (input.state === 'refund_completed') {
    return input.refundRef === null ? 'REFUND_REQUIRES_REVIEW' : 'CANCELLATION_COMPLETE';
  }
  if (input.state === 'refund_failed') {
    return input.failureReason === null ? 'REFUND_REQUIRES_REVIEW' : 'DELEGATE_REFUND';
  }
  if (input.refundRequestRef === null && input.financeDelegationRef === null) {
    return 'DELEGATE_REFUND';
  }
  if (input.refundRef === null) {
    return 'AWAIT_REFUND';
  }
  return 'CANCELLATION_COMPLETE';
}

function digestRuntime(receiptWithoutDigest: Omit<CancellationRefundDelegationRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateCancellationRefundDelegation(input: CancellationRefundDelegationInput): CancellationRefundDelegationRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const cancellationRequestedAt = requireTimestamp(input.cancellation_requested_at, 'cancellation_requested_at');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  if (Date.parse(evaluatedAt) < Date.parse(cancellationRequestedAt)) {
    throw new Error('evaluated_at must be on or after cancellation_requested_at for cancellation_refund_delegation.');
  }
  const productCatalogueAnchorRef = optionalRef(input.product_catalogue_anchor_ref, 'product_catalogue_anchor_ref');
  if (input.paid_registration && productCatalogueAnchorRef === null) {
    throw new Error('product_catalogue_anchor_ref is required for paid cancellation_refund_delegation evaluation.');
  }

  const refundRequestRef = optionalRef(input.refund_request_ref, 'refund_request_ref');
  const refundRef = optionalRef(input.refund_ref, 'refund_ref');
  const financeDelegationRef = optionalRef(input.finance_delegation_ref, 'finance_delegation_ref');
  const failureReason = optionalRef(input.failure_reason, 'failure_reason');
  const decision = determineDecision({
    state: input.cancellation_state,
    paidRegistration: input.paid_registration,
    refundEligible: input.refund_eligible,
    refundRequestRef,
    refundRef,
    financeDelegationRef,
    failureReason,
  });

  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const receiptWithoutDigest: Omit<CancellationRefundDelegationRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_CANCELLATION_REFUND_DELEGATION_SEED_ID,
    component_id: PHASE_6C_CANCELLATION_REFUND_DELEGATION_COMPONENT_ID,
    component_slug: "events_configuration_and_registration_service",
    model_name: "Phase6CCancellationRefundDelegation",
    event_name: CANCELLATION_REFUND_DELEGATION_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: serviceManifestContract,
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_type_ref: requireNonEmpty(input.ticket_type_ref, 'ticket_type_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    cancellation_state: input.cancellation_state,
    cancellation_requested_at: cancellationRequestedAt,
    cancellation_reason: requireNonEmpty(input.cancellation_reason, 'cancellation_reason'),
    paid_registration: input.paid_registration,
    refund_eligible: input.refund_eligible,
    decision,
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      product_catalogue_anchor_ref: productCatalogueAnchorRef,
      invoice_ref: optionalRef(input.invoice_ref, 'invoice_ref'),
      payment_ref: optionalRef(input.payment_ref, 'payment_ref'),
      ticket_issue_ref: optionalRef(input.ticket_issue_ref, 'ticket_issue_ref'),
      refund_request_ref: refundRequestRef,
      refund_ref: refundRef,
      finance_delegation_ref: financeDelegationRef,
      registration_invoice_saga_ref: optionalRef(input.registration_invoice_saga_ref, 'registration_invoice_saga_ref'),
      crm_handoff_ref: optionalRef(input.crm_handoff_ref, 'crm_handoff_ref'),
      workspace_calendar_ref: optionalRef(input.workspace_calendar_ref, 'workspace_calendar_ref'),
    },
    decision_refs: ["6C-EVENT-REG-014", "6C-EVENT-REG-003", "6C-ADL-003", "6C-BILL-007"],
    adl_refs: ["ADL-001"],
    forbidden_behavior_rejections: forbiddenBehaviorRejections,
    failure_reason: failureReason,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
