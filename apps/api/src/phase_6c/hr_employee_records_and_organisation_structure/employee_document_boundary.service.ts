import { createHash } from 'node:crypto';

export const PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_SEED_ID = "seed_6c_006_employee_document_boundary" as const;
export const PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_DOCUMENT_BOUNDARY_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_document_boundary.runtime_evaluated" as const;

export type EmployeeDocumentType = 'CONTRACT' | 'IDENTITY_PROOF' | 'CERTIFICATION' | 'VISA' | 'POLICY_ACKNOWLEDGEMENT' | 'OTHER';
export type EmployeeDocumentSensitivity = 'STANDARD' | 'CONFIDENTIAL' | 'RESTRICTED';
export type EmployeeDocumentLifecycleStatus = 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';

export type EmployeeDocumentReference = {
  document_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  file_service_object_ref: string;
  document_type: EmployeeDocumentType;
  sensitivity: EmployeeDocumentSensitivity;
  issued_at?: string;
  expires_at?: string;
  retention_policy_ref: string;
  evidence_hash: string;
};

export type EmployeeDocumentBoundaryRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  documents: readonly EmployeeDocumentReference[];
  control_metadata?: Record<string, unknown>;
  raw_file_bytes_requested?: boolean;
  direct_storage_uri_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedEmployeeDocumentReference = EmployeeDocumentReference & {
  lifecycle_status: EmployeeDocumentLifecycleStatus;
};

export type EmployeeDocumentBoundaryRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeDocumentBoundary";
  event_name: typeof EMPLOYEE_DOCUMENT_BOUNDARY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYEE_DOCUMENT_BOUNDARY_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  documents: readonly NormalizedEmployeeDocumentReference[];
  document_counts: {
    total_documents: number;
    confidential_or_restricted: number;
    expired_documents: number;
    expiring_soon_documents: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

const EXPIRING_SOON_WINDOW_DAYS = 30;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for employee_document_boundary runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for employee_document_boundary runtime.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : requireTimestamp(value, field);
}

function requireDocumentType(value: EmployeeDocumentType): EmployeeDocumentType {
  const allowed = new Set<EmployeeDocumentType>(['CONTRACT', 'IDENTITY_PROOF', 'CERTIFICATION', 'VISA', 'POLICY_ACKNOWLEDGEMENT', 'OTHER']);
  if (!allowed.has(value)) {
    throw new Error('document_type must be supported for employee_document_boundary runtime.');
  }
  return value;
}

function requireSensitivity(value: EmployeeDocumentSensitivity): EmployeeDocumentSensitivity {
  if (value !== 'STANDARD' && value !== 'CONFIDENTIAL' && value !== 'RESTRICTED') {
    throw new Error('sensitivity must be STANDARD, CONFIDENTIAL, or RESTRICTED for employee_document_boundary runtime.');
  }
  return value;
}

function requireOpaqueFileServiceRef(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'file_service_object_ref');
  if (/^(s3|gs|https?|file):/i.test(normalized) || normalized.includes('/') || normalized.includes('..')) {
    throw new Error('file_service_object_ref must be an opaque 6A file-service reference, not a direct storage URI or path.');
  }
  return normalized;
}

function requireEvidenceHash(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'evidence_hash').toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error('evidence_hash must be a SHA-256 hex digest for employee_document_boundary runtime.');
  }
  return normalized;
}

function assertUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(field + ' must be unique for employee_document_boundary runtime: ' + value);
    }
    seen.add(value);
  }
}

function documentStatus(document: EmployeeDocumentReference, evaluatedAt: string): EmployeeDocumentLifecycleStatus {
  if (document.expires_at === undefined) {
    return 'ACTIVE';
  }
  const evaluatedTime = Date.parse(evaluatedAt);
  const expiresTime = Date.parse(document.expires_at);
  if (expiresTime < evaluatedTime) {
    return 'EXPIRED';
  }
  const daysUntilExpiry = (expiresTime - evaluatedTime) / 86_400_000;
  return daysUntilExpiry <= EXPIRING_SOON_WINDOW_DAYS ? 'EXPIRING_SOON' : 'ACTIVE';
}

function digestRuntime(receiptWithoutDigest: Omit<EmployeeDocumentBoundaryRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateEmployeeDocumentBoundaryRuntime(input: EmployeeDocumentBoundaryRuntimeInput): EmployeeDocumentBoundaryRuntimeReceipt {
  if (input.raw_file_bytes_requested === true) {
    throw new Error('employee_document_boundary runtime must not handle raw file bytes; use the 6A file service boundary.');
  }
  if (input.direct_storage_uri_requested === true) {
    throw new Error('employee_document_boundary runtime must not write direct storage URIs; use opaque 6A file-service refs.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('employee_document_boundary runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('employee_document_boundary runtime must not mutate Phase 6A file or identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('employee_document_boundary runtime must not mutate Phase 6B finance or billing records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('employee_document_boundary runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('employee_document_boundary runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const documents = input.documents.map((document) => {
    const issuedAt = optionalTimestamp(document.issued_at, 'document_issued_at');
    const expiresAt = optionalTimestamp(document.expires_at, 'document_expires_at');
    if (issuedAt !== undefined && expiresAt !== undefined && Date.parse(expiresAt) < Date.parse(issuedAt)) {
      throw new Error('document expires_at must not be before issued_at for employee_document_boundary runtime.');
    }
    const normalizedDocument: EmployeeDocumentReference = {
      document_ref: requireNonEmpty(document.document_ref, 'document_ref'),
      employee_record_ref: requireNonEmpty(document.employee_record_ref, 'employee_record_ref'),
      person_identity_anchor_id: requireNonEmpty(document.person_identity_anchor_id, 'person_identity_anchor_id'),
      file_service_object_ref: requireOpaqueFileServiceRef(document.file_service_object_ref),
      document_type: requireDocumentType(document.document_type),
      sensitivity: requireSensitivity(document.sensitivity),
      issued_at: issuedAt,
      expires_at: expiresAt,
      retention_policy_ref: requireNonEmpty(document.retention_policy_ref, 'retention_policy_ref'),
      evidence_hash: requireEvidenceHash(document.evidence_hash),
    };
    return {
      ...normalizedDocument,
      lifecycle_status: documentStatus(normalizedDocument, evaluatedAt),
    };
  }).sort((left, right) => left.employee_record_ref.localeCompare(right.employee_record_ref) || left.document_ref.localeCompare(right.document_ref));
  assertUnique(documents.map((document) => document.document_ref), 'document_ref');
  assertUnique(documents.map((document) => document.file_service_object_ref), 'file_service_object_ref');

  const receiptWithoutDigest: Omit<EmployeeDocumentBoundaryRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_SEED_ID,
    component_id: PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CEmployeeDocumentBoundary",
    event_name: EMPLOYEE_DOCUMENT_BOUNDARY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'EMPLOYEE_DOCUMENT_BOUNDARY_VALIDATED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-HR-EMP-009", "6C-SCHEMA-006", "6C-NON-007", "6C-GLOBAL-018"],
    documents,
    document_counts: {
      total_documents: documents.length,
      confidential_or_restricted: documents.filter((document) => document.sensitivity !== 'STANDARD').length,
      expired_documents: documents.filter((document) => document.lifecycle_status === 'EXPIRED').length,
      expiring_soon_documents: documents.filter((document) => document.lifecycle_status === 'EXPIRING_SOON').length,
    },
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
