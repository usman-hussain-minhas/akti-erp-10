import { createHash } from 'node:crypto';

export const PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_SEED_ID = 'seed_6c_025_biometric_device_boundary' as const;
export const PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_COMPONENT_ID = '6C.03' as const;
export const BIOMETRIC_DEVICE_BOUNDARY_RUNTIME_EVENT = 'phase_6c.hr_attendance_leave_and_time_tracking.biometric_device_boundary.evaluated' as const;

export type BiometricDeviceFamily = 'FINGERPRINT' | 'FACE' | 'PALM' | 'VOICE';
export type BiometricBoundaryDecision = 'BOUNDARY_ACCEPTED' | 'BOUNDARY_REJECTED';

export type BiometricDeviceBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  device_boundary_ref: string;
  provider_neutral_device_ref: string;
  device_family: BiometricDeviceFamily;
  biometric_evidence_ref: string;
  captured_at: string;
  received_at: string;
  fallback_method_ref?: string;
  evaluated_by_user_id: string;
  control_metadata?: Record<string, unknown>;
  real_brand_adapter_requested?: boolean;
  provider_credentials_requested?: boolean;
  raw_biometric_capture_requested?: boolean;
  biometric_template_storage_requested?: boolean;
  external_device_call_requested?: boolean;
  attendance_record_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type BiometricDeviceBoundaryReceipt = {
  seed_id: typeof PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_COMPONENT_ID;
  component_slug: 'hr_attendance_leave_and_time_tracking';
  model_name: 'Phase6CBiometricDeviceBoundary';
  event_name: typeof BIOMETRIC_DEVICE_BOUNDARY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  runtime_status: 'BIOMETRIC_DEVICE_BOUNDARY_EVALUATED';
  decision: BiometricBoundaryDecision;
  rejection_reasons: readonly string[];
  provider_neutral_only: true;
  real_brand_adapter_allowed: false;
  provider_credentials_allowed: false;
  raw_biometric_capture_allowed: false;
  biometric_template_storage_allowed: false;
  external_device_call_allowed: false;
  fallback_methods_allowed: true;
  device_boundary_ref: string;
  provider_neutral_device_ref: string;
  device_family: BiometricDeviceFamily;
  biometric_evidence_ref: string;
  fallback_method_ref: string | null;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  received_at: string;
  biometric_device_boundary_evidence_digest: string;
};

type ReceiptWithoutDigest = Omit<BiometricDeviceBoundaryReceipt, 'biometric_device_boundary_evidence_digest'>;

const DEVICE_FAMILIES = new Set<BiometricDeviceFamily>(['FINGERPRINT', 'FACE', 'PALM', 'VOICE']);
const DECISION_REFS = ['6C-ATT-001', '6C-ATT-002', '6C-ATT-003', '6C-ATT-019', '6C-ATT-020'] as const;
const EVIDENCE_ARTIFACTS = [
  'biometric_device_boundary_runtime_receipt',
  'biometric_device_boundary_validation_result',
  'biometric_device_boundary_forbidden_behavior_rejection_evidence',
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for biometric_device_boundary runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for biometric_device_boundary runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: BiometricDeviceBoundaryInput): void {
  if (input.real_brand_adapter_requested === true) {
    throw new Error('biometric_device_boundary runtime must not execute real biometric brand adapters.');
  }
  if (input.provider_credentials_requested === true) {
    throw new Error('biometric_device_boundary runtime must not handle provider credentials.');
  }
  if (input.raw_biometric_capture_requested === true) {
    throw new Error('biometric_device_boundary runtime must not capture raw biometric samples.');
  }
  if (input.biometric_template_storage_requested === true) {
    throw new Error('biometric_device_boundary runtime must not store biometric templates.');
  }
  if (input.external_device_call_requested === true) {
    throw new Error('biometric_device_boundary runtime must not call external devices.');
  }
  if (input.attendance_record_mutation_requested === true) {
    throw new Error('biometric_device_boundary runtime must emit boundary evidence, not mutate attendance records.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('biometric_device_boundary runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('biometric_device_boundary runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('biometric_device_boundary runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('biometric_device_boundary runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('biometric_device_boundary runtime must not flip ticket or execution authorization flags.');
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateBiometricDeviceBoundaryRuntime(input: BiometricDeviceBoundaryInput): BiometricDeviceBoundaryReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const deviceBoundaryRef = requireNonEmpty(input.device_boundary_ref, 'device_boundary_ref');
  if (!deviceBoundaryRef.startsWith('biometric_boundary:')) {
    throw new Error('device_boundary_ref must use biometric_boundary: prefix.');
  }
  const providerNeutralDeviceRef = requireNonEmpty(input.provider_neutral_device_ref, 'provider_neutral_device_ref');
  if (!providerNeutralDeviceRef.startsWith('provider_neutral_device:')) {
    throw new Error('provider_neutral_device_ref must use provider_neutral_device: prefix.');
  }
  if (!DEVICE_FAMILIES.has(input.device_family)) {
    throw new Error('device_family is not supported for biometric_device_boundary runtime: ' + input.device_family);
  }
  const biometricEvidenceRef = requireNonEmpty(input.biometric_evidence_ref, 'biometric_evidence_ref');
  if (!biometricEvidenceRef.startsWith('biometric_evidence:')) {
    throw new Error('biometric_evidence_ref must use biometric_evidence: prefix.');
  }
  const capturedAt = requireTimestamp(input.captured_at, 'captured_at');
  const receivedAt = requireTimestamp(input.received_at, 'received_at');
  const fallbackMethodRef = input.fallback_method_ref === undefined ? null : requireNonEmpty(input.fallback_method_ref, 'fallback_method_ref');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');

  const rejectionReasons = [
    Date.parse(capturedAt) > Date.parse(receivedAt) ? 'CAPTURED_AT_AFTER_RECEIVED_AT' : null,
    fallbackMethodRef !== null && !fallbackMethodRef.startsWith('attendance_fallback:') ? 'INVALID_FALLBACK_METHOD_REF' : null,
  ].filter((reason): reason is string => reason !== null).sort();

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_SEED_ID,
    component_id: PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_COMPONENT_ID,
    component_slug: 'hr_attendance_leave_and_time_tracking',
    model_name: 'Phase6CBiometricDeviceBoundary',
    event_name: BIOMETRIC_DEVICE_BOUNDARY_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    employee_ref: employeeRef,
    runtime_status: 'BIOMETRIC_DEVICE_BOUNDARY_EVALUATED',
    decision: rejectionReasons.length === 0 ? 'BOUNDARY_ACCEPTED' : 'BOUNDARY_REJECTED',
    rejection_reasons: rejectionReasons,
    provider_neutral_only: true,
    real_brand_adapter_allowed: false,
    provider_credentials_allowed: false,
    raw_biometric_capture_allowed: false,
    biometric_template_storage_allowed: false,
    external_device_call_allowed: false,
    fallback_methods_allowed: true,
    device_boundary_ref: deviceBoundaryRef,
    provider_neutral_device_ref: providerNeutralDeviceRef,
    device_family: input.device_family,
    biometric_evidence_ref: biometricEvidenceRef,
    fallback_method_ref: fallbackMethodRef,
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: evaluatedByUserId,
    received_at: receivedAt,
  };

  return {
    ...receiptWithoutDigest,
    biometric_device_boundary_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
