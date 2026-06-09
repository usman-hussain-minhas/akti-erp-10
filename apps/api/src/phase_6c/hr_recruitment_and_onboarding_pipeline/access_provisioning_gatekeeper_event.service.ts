import { createHash } from 'node:crypto';

export const PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_SEED_ID = 'seed_6c_018_access_provisioning_gatekeeper_event' as const;
export const PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_COMPONENT_ID = '6C.02' as const;
export const ACCESS_PROVISIONING_GATEKEEPER_EVENT_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.access_provisioning_gatekeeper_event.requested' as const;

export type AccessProvisioningGrantKind = 'ROLE' | 'CAPABILITY' | 'MODULE_MEMBERSHIP';
export type GatekeeperRequiredOutcome = 'ALLOW_OR_APPROVAL_REQUIRED';

export type AccessProvisioningGrantRequest = {
  grant_ref: string;
  grant_kind: AccessProvisioningGrantKind;
  target_ref: string;
  reason: string;
};

export type AccessProvisioningGatekeeperEventInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  applicant_ref?: string;
  offer_ref?: string;
  requested_by_user_id: string;
  evaluated_at: string;
  gatekeeper_policy_ref: string;
  event_bus_topic: string;
  grants: readonly AccessProvisioningGrantRequest[];
  control_metadata?: Record<string, unknown>;
  gatekeeper_bypass_requested?: boolean;
  direct_access_grant_requested?: boolean;
  access_core_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type AccessProvisioningGatekeeperPayload = {
  employee_ref: string;
  applicant_ref?: string;
  offer_ref?: string;
  gatekeeper_policy_ref: string;
  grants: readonly AccessProvisioningGrantRequest[];
  required_outcome: GatekeeperRequiredOutcome;
};

export type AccessProvisioningGatekeeperEventReceipt = {
  seed_id: typeof PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CAccessProvisioningGatekeeperEvent';
  event_name: typeof ACCESS_PROVISIONING_GATEKEEPER_EVENT_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'ACCESS_PROVISIONING_GATEKEEPER_EVENT_READY';
  gatekeeper_required: true;
  gatekeeper_bypass_allowed: false;
  direct_access_grant_allowed: false;
  access_core_mutation_executed: false;
  event_bus_topic: string;
  gatekeeper_payload: AccessProvisioningGatekeeperPayload;
  grant_count: number;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  requested_by_user_id: string;
  evaluated_at: string;
  access_provisioning_gatekeeper_event_evidence_digest: string;
};

type AccessProvisioningGatekeeperEventReceiptWithoutDigest = Omit<AccessProvisioningGatekeeperEventReceipt, 'access_provisioning_gatekeeper_event_evidence_digest'>;

const GRANT_KINDS = new Set<AccessProvisioningGrantKind>(['ROLE', 'CAPABILITY', 'MODULE_MEMBERSHIP']);
const GATEKEEPER_POLICY_REF_PREFIX = 'gatekeeper_policy:';
const EVENT_BUS_TOPIC_PREFIX = 'phase_6c.access_provisioning.';

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for access_provisioning_gatekeeper_event runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for access_provisioning_gatekeeper_event runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: AccessProvisioningGatekeeperEventInput): void {
  if (input.gatekeeper_bypass_requested === true) {
    throw new Error('access_provisioning_gatekeeper_event runtime must not bypass Gatekeeper.');
  }
  if (input.direct_access_grant_requested === true) {
    throw new Error('access_provisioning_gatekeeper_event runtime must not grant access directly.');
  }
  if (input.access_core_mutation_requested === true) {
    throw new Error('access_provisioning_gatekeeper_event runtime must not mutate Access Core.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('access_provisioning_gatekeeper_event runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('access_provisioning_gatekeeper_event runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('access_provisioning_gatekeeper_event runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('access_provisioning_gatekeeper_event runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('access_provisioning_gatekeeper_event runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeGrants(grants: readonly AccessProvisioningGrantRequest[]): AccessProvisioningGrantRequest[] {
  if (!Array.isArray(grants) || grants.length === 0) {
    throw new Error('at least one access provisioning grant request is required for access_provisioning_gatekeeper_event runtime.');
  }
  const grantRefs = new Set<string>();
  const normalized: AccessProvisioningGrantRequest[] = [];
  for (const grant of grants) {
    const grantRef = requireNonEmpty(grant.grant_ref, 'grant_ref');
    if (grantRefs.has(grantRef)) {
      throw new Error('grant_ref must be unique for access_provisioning_gatekeeper_event runtime: ' + grantRef);
    }
    grantRefs.add(grantRef);
    if (!GRANT_KINDS.has(grant.grant_kind)) {
      throw new Error('grant_kind is not supported for access_provisioning_gatekeeper_event runtime: ' + grantRef);
    }
    normalized.push({
      grant_ref: grantRef,
      grant_kind: grant.grant_kind,
      target_ref: requireNonEmpty(grant.target_ref, 'target_ref'),
      reason: requireNonEmpty(grant.reason, 'grant reason'),
    });
  }
  return normalized;
}

function digestReceipt(receiptWithoutDigest: AccessProvisioningGatekeeperEventReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateAccessProvisioningGatekeeperEventRuntime(input: AccessProvisioningGatekeeperEventInput): AccessProvisioningGatekeeperEventReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const applicantRef = input.applicant_ref === undefined ? undefined : requireNonEmpty(input.applicant_ref, 'applicant_ref');
  const offerRef = input.offer_ref === undefined ? undefined : requireNonEmpty(input.offer_ref, 'offer_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const gatekeeperPolicyRef = requireNonEmpty(input.gatekeeper_policy_ref, 'gatekeeper_policy_ref');
  if (!gatekeeperPolicyRef.startsWith(GATEKEEPER_POLICY_REF_PREFIX)) {
    throw new Error('gatekeeper_policy_ref must identify a Gatekeeper policy for access_provisioning_gatekeeper_event runtime.');
  }
  const eventBusTopic = requireNonEmpty(input.event_bus_topic, 'event_bus_topic');
  if (!eventBusTopic.startsWith(EVENT_BUS_TOPIC_PREFIX)) {
    throw new Error('event_bus_topic must use the Phase 6C access provisioning namespace.');
  }
  const grants = normalizeGrants(input.grants);

  const gatekeeperPayload: AccessProvisioningGatekeeperPayload = {
    employee_ref: employeeRef,
    ...(applicantRef === undefined ? {} : { applicant_ref: applicantRef }),
    ...(offerRef === undefined ? {} : { offer_ref: offerRef }),
    gatekeeper_policy_ref: gatekeeperPolicyRef,
    grants,
    required_outcome: 'ALLOW_OR_APPROVAL_REQUIRED',
  };

  const receiptWithoutDigest: AccessProvisioningGatekeeperEventReceiptWithoutDigest = {
    seed_id: PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_SEED_ID,
    component_id: PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6CAccessProvisioningGatekeeperEvent',
    event_name: ACCESS_PROVISIONING_GATEKEEPER_EVENT_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    runtime_status: 'ACCESS_PROVISIONING_GATEKEEPER_EVENT_READY',
    gatekeeper_required: true,
    gatekeeper_bypass_allowed: false,
    direct_access_grant_allowed: false,
    access_core_mutation_executed: false,
    event_bus_topic: eventBusTopic,
    gatekeeper_payload: gatekeeperPayload,
    grant_count: grants.length,
    decision_refs: ['6C-RECRUIT-010'],
    evidence_artifacts: [
      'access_provisioning_gatekeeper_event_runtime_receipt',
      'access_provisioning_gatekeeper_event_validation_result',
      'access_provisioning_gatekeeper_event_forbidden_behavior_rejection_evidence',
    ],
    control_metadata: input.control_metadata ?? {},
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    access_provisioning_gatekeeper_event_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
