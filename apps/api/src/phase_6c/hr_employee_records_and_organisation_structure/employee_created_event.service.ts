import { createHash } from 'node:crypto';

export const PHASE_6C_EMPLOYEE_CREATED_EVENT_SEED_ID = "seed_6c_010_employee_created_event" as const;
export const PHASE_6C_EMPLOYEE_CREATED_EVENT_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_CREATED_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_created" as const;

export type EmployeeCreationOrigin = 'DIRECT_HR_CREATE' | 'RECRUITMENT_OFFER_ACCEPTANCE_RECOMMENDATION' | 'BULK_IMPORT';
export type EmployeeCreatedEventTarget = 'WORKSPACE_FOUNDATION_REFERENCE' | 'PHASE_6B_PAYROLL_FOUNDATION_REFERENCE';

export type EmployeeCreatedEventInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  employee_number_ref: string;
  lifecycle_anchor: 'active' | 'inactive';
  creation_origin: EmployeeCreationOrigin;
  event_targets: readonly EmployeeCreatedEventTarget[];
  control_metadata?: Record<string, unknown>;
  workspace_provisioning_requested?: boolean;
  payroll_record_creation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type EmployeeCreatedEventEnvelope = {
  event_ref: string;
  event_name: typeof EMPLOYEE_CREATED_EVENT;
  event_target: EmployeeCreatedEventTarget;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  employee_number_ref: string;
  creation_origin: EmployeeCreationOrigin;
  evidence_mode: 'REFERENCE_ONLY';
  evidence_hash: string;
};

export type EmployeeCreatedEventReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_CREATED_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_CREATED_EVENT_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeCreatedEvent";
  event_name: typeof EMPLOYEE_CREATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYEE_CREATED_EVENT_EMITTED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  workspace_provisioning_allowed: false;
  payroll_record_creation_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  employee_record_ref: string;
  person_identity_anchor_id: string;
  employee_number_ref: string;
  lifecycle_anchor: 'active' | 'inactive';
  creation_origin: EmployeeCreationOrigin;
  event_envelopes: readonly EmployeeCreatedEventEnvelope[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for employee_created_event runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for employee_created_event runtime.');
  }
  return normalized;
}

function requireCreationOrigin(value: EmployeeCreationOrigin): EmployeeCreationOrigin {
  const allowed = new Set<EmployeeCreationOrigin>(['DIRECT_HR_CREATE', 'RECRUITMENT_OFFER_ACCEPTANCE_RECOMMENDATION', 'BULK_IMPORT']);
  if (!allowed.has(value)) {
    throw new Error('creation_origin must be supported for employee_created_event runtime.');
  }
  return value;
}

function requireLifecycleAnchor(value: 'active' | 'inactive'): 'active' | 'inactive' {
  if (value !== 'active' && value !== 'inactive') {
    throw new Error('employee_created_event lifecycle_anchor must be active or inactive.');
  }
  return value;
}

function requireTarget(value: EmployeeCreatedEventTarget): EmployeeCreatedEventTarget {
  const allowed = new Set<EmployeeCreatedEventTarget>(['WORKSPACE_FOUNDATION_REFERENCE', 'PHASE_6B_PAYROLL_FOUNDATION_REFERENCE']);
  if (!allowed.has(value)) {
    throw new Error('event target must be supported for employee_created_event runtime.');
  }
  return value;
}

function assertUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(field + ' must be unique for employee_created_event runtime: ' + value);
    }
    seen.add(value);
  }
}

function sha256(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function eventEnvelope(input: {
  target: EmployeeCreatedEventTarget;
  employeeRecordRef: string;
  personIdentityAnchorId: string;
  employeeNumberRef: string;
  creationOrigin: EmployeeCreationOrigin;
  evaluatedAt: string;
}): EmployeeCreatedEventEnvelope {
  const evidencePayload = {
    event_name: EMPLOYEE_CREATED_EVENT,
    event_target: input.target,
    employee_record_ref: input.employeeRecordRef,
    person_identity_anchor_id: input.personIdentityAnchorId,
    employee_number_ref: input.employeeNumberRef,
    creation_origin: input.creationOrigin,
    evaluated_at: input.evaluatedAt,
  };
  return {
    event_ref: 'employee_created_' + sha256(evidencePayload).slice(0, 24),
    event_name: EMPLOYEE_CREATED_EVENT,
    event_target: input.target,
    employee_record_ref: input.employeeRecordRef,
    person_identity_anchor_id: input.personIdentityAnchorId,
    employee_number_ref: input.employeeNumberRef,
    creation_origin: input.creationOrigin,
    evidence_mode: 'REFERENCE_ONLY',
    evidence_hash: sha256(evidencePayload),
  };
}

function digestRuntime(receiptWithoutDigest: Omit<EmployeeCreatedEventReceipt, 'runtime_evidence_digest'>): string {
  return sha256(receiptWithoutDigest);
}

export function evaluateEmployeeCreatedEventRuntime(input: EmployeeCreatedEventInput): EmployeeCreatedEventReceipt {
  if (input.workspace_provisioning_requested === true) {
    throw new Error('employee_created_event runtime must not provision Workspace accounts.');
  }
  if (input.payroll_record_creation_requested === true) {
    throw new Error('employee_created_event runtime must not create Phase 6B payroll records.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('employee_created_event runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('employee_created_event runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('employee_created_event runtime must not mutate Phase 6B records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('employee_created_event runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('employee_created_event runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const employeeRecordRef = requireNonEmpty(input.employee_record_ref, 'employee_record_ref');
  const personIdentityAnchorId = requireNonEmpty(input.person_identity_anchor_id, 'person_identity_anchor_id');
  const employeeNumberRef = requireNonEmpty(input.employee_number_ref, 'employee_number_ref');
  const creationOrigin = requireCreationOrigin(input.creation_origin);
  const lifecycleAnchor = requireLifecycleAnchor(input.lifecycle_anchor);
  const targets = input.event_targets.map(requireTarget).sort();
  assertUnique(targets, 'event_targets');
  if (targets.length === 0) {
    throw new Error('employee_created_event requires at least one event target.');
  }

  const eventEnvelopes = targets.map((target) => eventEnvelope({
    target,
    employeeRecordRef,
    personIdentityAnchorId,
    employeeNumberRef,
    creationOrigin,
    evaluatedAt,
  }));

  const receiptWithoutDigest: Omit<EmployeeCreatedEventReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_EMPLOYEE_CREATED_EVENT_SEED_ID,
    component_id: PHASE_6C_EMPLOYEE_CREATED_EVENT_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CEmployeeCreatedEvent",
    event_name: EMPLOYEE_CREATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'EMPLOYEE_CREATED_EVENT_EMITTED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    workspace_provisioning_allowed: false,
    payroll_record_creation_allowed: false,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-HR-EMP-015", "6C-SCHEMA-006", "6C-NON-007", "6C-GLOBAL-018"],
    employee_record_ref: employeeRecordRef,
    person_identity_anchor_id: personIdentityAnchorId,
    employee_number_ref: employeeNumberRef,
    lifecycle_anchor: lifecycleAnchor,
    creation_origin: creationOrigin,
    event_envelopes: eventEnvelopes,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
