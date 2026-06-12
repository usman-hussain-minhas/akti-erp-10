import { createHash } from 'node:crypto';

export const PHASE_6C_REGISTRATION_INVOICE_SAGA_SEED_ID = "seed_6c_108_registration_invoice_saga" as const;
export const PHASE_6C_REGISTRATION_INVOICE_SAGA_COMPONENT_ID = "6C.08" as const;
export const REGISTRATION_INVOICE_SAGA_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.registration_invoice_saga.runtime_evaluated" as const;

type RegistrationInvoiceSagaStage =
  | 'registration_accepted'
  | 'invoice_requested'
  | 'invoice_issued'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'ticket_issued'
  | 'failed'
  | 'compensated';

type RegistrationInvoiceSagaDecision =
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

type RegistrationInvoiceSagaStep = {
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

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for registration_invoice_saga runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for registration_invoice_saga.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for registration_invoice_saga.');
  }
  return normalized;
}

function assertForbiddenRequests(input: RegistrationInvoiceSagaInput): readonly string[] {
  const rejections = [
    ['two_phase_commit_requested', input.two_phase_commit_requested, 'ADL-001 forbids two-phase commit for registration invoice/payment Saga'],
    ['direct_invoice_mutation_requested', input.direct_invoice_mutation_requested, 'invoice mutation belongs to accepted Phase 6B finance surfaces'],
    ['direct_payment_capture_requested', input.direct_payment_capture_requested, 'payment capture belongs to accepted Phase 6B payment surfaces'],
    ['direct_ticket_issue_requested', input.direct_ticket_issue_requested, 'ticket issue mutation is outside this evaluator'],
    ['outbox_dispatch_requested', input.outbox_dispatch_requested, 'outbox dispatch is deferred to the event bus wiring layer'],
    ['dlq_replay_requested', input.dlq_replay_requested, 'DLQ replay is deferred to accepted recovery surfaces'],
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
  paidRegistration: boolean;
  stage: RegistrationInvoiceSagaStage;
  invoiceRef: string | null;
  paymentRef: string | null;
  ticketIssueRef: string | null;
  failureReason: string | null;
  compensationRef: string | null;
}): RegistrationInvoiceSagaDecision {
  if (input.stage === 'compensated') {
    return 'SAGA_COMPLETE';
  }
  if (input.stage === 'failed') {
    return input.compensationRef === null ? 'COMPENSATION_REQUIRED' : 'SAGA_REQUIRES_REVIEW';
  }
  if (input.stage === 'ticket_issued') {
    return input.ticketIssueRef === null ? 'SAGA_REQUIRES_REVIEW' : 'SAGA_COMPLETE';
  }
  if (!input.paidRegistration) {
    return input.ticketIssueRef === null ? 'ISSUE_TICKET' : 'SAGA_COMPLETE';
  }
  if (input.invoiceRef === null && (input.stage === 'registration_accepted' || input.stage === 'invoice_requested')) {
    return input.stage === 'registration_accepted' ? 'REQUEST_INVOICE' : 'AWAIT_INVOICE';
  }
  if (input.invoiceRef !== null && input.paymentRef === null) {
    return 'AWAIT_PAYMENT';
  }
  if (input.paymentRef !== null && input.ticketIssueRef === null) {
    return 'ISSUE_TICKET';
  }
  if (input.paymentRef !== null && input.ticketIssueRef !== null) {
    return 'SAGA_COMPLETE';
  }
  return input.failureReason === null ? 'SAGA_REQUIRES_REVIEW' : 'COMPENSATION_REQUIRED';
}

function buildSteps(input: {
  paidRegistration: boolean;
  registrationRef: string;
  invoiceRef: string | null;
  paymentRef: string | null;
  ticketIssueRef: string | null;
  compensationRef: string | null;
  decision: RegistrationInvoiceSagaDecision;
}): readonly RegistrationInvoiceSagaStep[] {
  const invoiceStatus = input.paidRegistration
    ? input.invoiceRef === null ? 'pending' : 'satisfied'
    : 'not_applicable';
  const paymentStatus = input.paidRegistration
    ? input.paymentRef === null ? 'pending' : 'satisfied'
    : 'not_applicable';
  const ticketStatus = input.ticketIssueRef === null
    ? input.decision === 'ISSUE_TICKET' ? 'pending' : 'blocked'
    : 'satisfied';
  const compensationStatus = input.decision === 'COMPENSATION_REQUIRED'
    ? 'pending'
    : input.compensationRef === null ? 'not_applicable' : 'satisfied';

  return [
    { step_name: 'registration', status: 'satisfied', evidence_ref: input.registrationRef },
    { step_name: 'invoice', status: invoiceStatus, evidence_ref: input.invoiceRef },
    { step_name: 'payment', status: paymentStatus, evidence_ref: input.paymentRef },
    { step_name: 'ticket', status: ticketStatus, evidence_ref: input.ticketIssueRef },
    { step_name: 'compensation', status: compensationStatus, evidence_ref: input.compensationRef },
  ];
}

function digestRuntime(receiptWithoutDigest: Omit<RegistrationInvoiceSagaRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateRegistrationInvoiceSaga(input: RegistrationInvoiceSagaInput): RegistrationInvoiceSagaRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const registrationRef = requireNonEmpty(input.registration_ref, 'registration_ref');
  const productCatalogueAnchorRef = optionalRef(input.product_catalogue_anchor_ref, 'product_catalogue_anchor_ref');
  if (input.paid_registration && productCatalogueAnchorRef === null) {
    throw new Error('product_catalogue_anchor_ref is required for paid registration_invoice_saga evaluation.');
  }

  const invoiceRef = optionalRef(input.invoice_ref, 'invoice_ref');
  const paymentRef = optionalRef(input.payment_ref, 'payment_ref');
  const ticketIssueRef = optionalRef(input.ticket_issue_ref, 'ticket_issue_ref');
  const compensationRef = optionalRef(input.compensation_ref, 'compensation_ref');
  const failureReason = optionalRef(input.failure_reason, 'failure_reason');
  if (input.saga_stage === 'failed' && failureReason === null) {
    throw new Error('failure_reason is required when registration_invoice_saga stage is failed.');
  }

  const decision = determineDecision({
    paidRegistration: input.paid_registration,
    stage: input.saga_stage,
    invoiceRef,
    paymentRef,
    ticketIssueRef,
    failureReason,
    compensationRef,
  });
  const sagaSteps = buildSteps({
    paidRegistration: input.paid_registration,
    registrationRef,
    invoiceRef,
    paymentRef,
    ticketIssueRef,
    compensationRef,
    decision,
  });

  const receiptWithoutDigest: Omit<RegistrationInvoiceSagaRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_REGISTRATION_INVOICE_SAGA_SEED_ID,
    component_id: PHASE_6C_REGISTRATION_INVOICE_SAGA_COMPONENT_ID,
    component_slug: "events_configuration_and_registration_service",
    model_name: "Phase6CRegistrationInvoiceSaga",
    event_name: REGISTRATION_INVOICE_SAGA_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContract,
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    registration_ref: registrationRef,
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_type_ref: requireNonEmpty(input.ticket_type_ref, 'ticket_type_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    paid_registration: input.paid_registration,
    saga_stage: input.saga_stage,
    decision,
    saga_steps: sagaSteps,
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      product_catalogue_anchor_ref: productCatalogueAnchorRef,
      invoice_ref: invoiceRef,
      payment_ref: paymentRef,
      ticket_issue_ref: ticketIssueRef,
      outbox_message_ref: optionalRef(input.outbox_message_ref, 'outbox_message_ref'),
      dlq_recovery_ref: optionalRef(input.dlq_recovery_ref, 'dlq_recovery_ref'),
      compensation_ref: compensationRef,
      crm_handoff_ref: optionalRef(input.crm_handoff_ref, 'crm_handoff_ref'),
      workspace_calendar_ref: optionalRef(input.workspace_calendar_ref, 'workspace_calendar_ref'),
    },
    adl_refs: ["ADL-001", "ADL-002"],
    decision_refs: ["6C-EVENT-REG-003", "6C-ADL-003", "6C-HR-OPS-011", "6C-ADL-002", "6C-ADL-004", "6C-BILL-007"],
    forbidden_behavior_rejections: forbiddenBehaviorRejections,
    failure_reason: failureReason,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
