import { createHash } from 'node:crypto';

export const PHASE_6C_EMPLOYEE_PERSON_EXTENSION_SEED_ID = "seed_6c_001_employee_person_extension" as const;
export const PHASE_6C_EMPLOYEE_PERSON_EXTENSION_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_PERSON_EXTENSION_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_person_extension.recorded" as const;

export type EmployeePersonExtensionStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_ONBOARDING';

export type EmployeePersonExtensionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  person_identity_graph_ref: string;
  employee_record_ref: string;
  employee_number?: string;
  extension_status: EmployeePersonExtensionStatus;
  effective_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  source_record_ref?: string;
  control_metadata?: Record<string, unknown>;
  identity_anchor?: {
    organization_id: string;
    person_identity_graph_ref: string;
  };
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type EmployeePersonExtensionReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_PERSON_EXTENSION_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_PERSON_EXTENSION_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeePersonExtension";
  event_name: typeof EMPLOYEE_PERSON_EXTENSION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  person_identity_graph_ref: string;
  employee_record_ref: string;
  employee_number: string | null;
  extension_status: EmployeePersonExtensionStatus;
  effective_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  source_record_ref: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_status: 'RUNTIME_BEHAVIOR_RECORDED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  employee_person_extension_evidence_digest: string;
};

const VALID_STATUSES: readonly EmployeePersonExtensionStatus[] = ['ACTIVE', 'INACTIVE', 'PENDING_ONBOARDING'];

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for employee_person_extension runtime behavior.`);
  }
  return value.trim();
}

function optionalTrimmed(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for employee_person_extension runtime behavior.`);
  }
  return normalized;
}

function requireStatus(value: EmployeePersonExtensionStatus): EmployeePersonExtensionStatus {
  if (!VALID_STATUSES.includes(value)) {
    throw new Error('extension_status must be ACTIVE, INACTIVE, or PENDING_ONBOARDING for employee_person_extension runtime behavior.');
  }
  return value;
}

function stableMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!metadata) return {};
  return Object.fromEntries(Object.entries(metadata).sort(([left], [right]) => left.localeCompare(right)));
}

function digestReceipt(receiptWithoutDigest: Omit<EmployeePersonExtensionReceipt, 'employee_person_extension_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function recordEmployeePersonExtension(input: EmployeePersonExtensionInput): EmployeePersonExtensionReceipt {
  if (input.schema_mutation_requested === true) {
    throw new Error('employee_person_extension must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('employee_person_extension must reference, not mutate, Phase 6A Person/Identity Graph truth.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('employee_person_extension must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('employee_person_extension must not execute external runtime adapters.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const personIdentityGraphRef = requireNonEmpty(input.person_identity_graph_ref, 'person_identity_graph_ref');
  if (input.identity_anchor) {
    const anchorOrganizationId = requireNonEmpty(input.identity_anchor.organization_id, 'identity_anchor.organization_id');
    const anchorPersonRef = requireNonEmpty(input.identity_anchor.person_identity_graph_ref, 'identity_anchor.person_identity_graph_ref');
    if (anchorOrganizationId !== organizationId) {
      throw new Error('identity_anchor.organization_id must match organization_id for employee_person_extension runtime behavior.');
    }
    if (anchorPersonRef !== personIdentityGraphRef) {
      throw new Error('identity_anchor.person_identity_graph_ref must match person_identity_graph_ref for employee_person_extension runtime behavior.');
    }
  }

  const sourceRecordRef = optionalTrimmed(input.source_record_ref) ?? requireNonEmpty(input.employee_record_ref, 'employee_record_ref');
  const receiptWithoutDigest: Omit<EmployeePersonExtensionReceipt, 'employee_person_extension_evidence_digest'> = {
    seed_id: PHASE_6C_EMPLOYEE_PERSON_EXTENSION_SEED_ID,
    component_id: PHASE_6C_EMPLOYEE_PERSON_EXTENSION_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CEmployeePersonExtension",
    event_name: EMPLOYEE_PERSON_EXTENSION_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    person_identity_graph_ref: personIdentityGraphRef,
    employee_record_ref: requireNonEmpty(input.employee_record_ref, 'employee_record_ref'),
    employee_number: optionalTrimmed(input.employee_number),
    extension_status: requireStatus(input.extension_status),
    effective_at: requireTimestamp(input.effective_at, 'effective_at'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    source_record_ref: sourceRecordRef,
    decision_refs: ["6C-HR-EMP-006", "6C-SCHEMA-006", "6C-NON-007"],
    dependency_refs: ["seed_6a_service_manifest_contract", "6A.05", "6A.06"],
    control_metadata: stableMetadata(input.control_metadata),
    runtime_status: 'RUNTIME_BEHAVIOR_RECORDED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
  };

  return {
    ...receiptWithoutDigest,
    employee_person_extension_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
