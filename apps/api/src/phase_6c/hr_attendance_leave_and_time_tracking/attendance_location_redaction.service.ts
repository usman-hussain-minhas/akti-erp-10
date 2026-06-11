import { createHash } from 'node:crypto';

export const PHASE_6C_ATTENDANCE_LOCATION_REDACTION_SEED_ID = "seed_6c_039_attendance_location_redaction" as const;
export const PHASE_6C_ATTENDANCE_LOCATION_REDACTION_COMPONENT_ID = "6C.03" as const;
export const ATTENDANCE_LOCATION_REDACTION_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.attendance_location_redaction.evaluated" as const;

export type AttendanceLocationRedactionProfile = "HASH_ONLY" | "COARSE_COORDINATES" | "REGION_ONLY" | "AUDIT_EXACT";
export type AttendanceLocationRequesterPurpose = "EMPLOYEE_SELF" | "MANAGER_REVIEW" | "PAYROLL_EVIDENCE" | "AUDIT_SUPPORT_WINDOW";
export type AttendanceLocationRedactionDecision = "LOCATION_HASHED" | "LOCATION_COARSENED" | "LOCATION_REGION_ONLY" | "LOCATION_AUDIT_EXACT_ALLOWED";

export type AttendanceLocationRedactionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  attendance_event_ref: string;
  employee_ref: string;
  requester_ref: string;
  requester_purpose: AttendanceLocationRequesterPurpose;
  redaction_profile: AttendanceLocationRedactionProfile;
  latitude?: number;
  longitude?: number;
  location_label?: string;
  region_code?: string;
  provider_location_ref?: string;
  captured_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  raw_location_disclosure_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type AttendanceLocationRedactionReceipt = {
  seed_id: typeof PHASE_6C_ATTENDANCE_LOCATION_REDACTION_SEED_ID;
  component_id: typeof PHASE_6C_ATTENDANCE_LOCATION_REDACTION_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CAttendanceLocationRedaction";
  event_name: typeof ATTENDANCE_LOCATION_REDACTION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  attendance_event_ref: string;
  employee_ref: string;
  requester_ref: string;
  requester_purpose: AttendanceLocationRequesterPurpose;
  redaction_profile: AttendanceLocationRedactionProfile;
  redacted_latitude: number | null;
  redacted_longitude: number | null;
  redacted_location_label: string | null;
  region_code: string | null;
  provider_location_ref_hash: string | null;
  raw_location_hash: string;
  captured_at: string;
  decision: AttendanceLocationRedactionDecision;
  raw_location_disclosure_allowed: boolean;
  provider_neutral_only: true;
  runtime_status: "ATTENDANCE_LOCATION_REDACTION_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  attendance_location_redaction_evidence_digest: string;
};

const VALID_PROFILES: readonly AttendanceLocationRedactionProfile[] = ["HASH_ONLY", "COARSE_COORDINATES", "REGION_ONLY", "AUDIT_EXACT"];
const VALID_PURPOSES: readonly AttendanceLocationRequesterPurpose[] = ["EMPLOYEE_SELF", "MANAGER_REVIEW", "PAYROLL_EVIDENCE", "AUDIT_SUPPORT_WINDOW"];
const DECISION_REFS = ["6C-ATT-020"] as const;
const EVIDENCE_ARTIFACTS = [
  "attendance_location_redaction_receipt",
  "attendance_location_privacy_evidence",
  "provider_location_hash_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for attendance_location_redaction.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for attendance_location_redaction.');
  }
  return normalized;
}

function requireLatitude(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value < -90 || value > 90) {
    throw new Error('latitude must be between -90 and 90 for attendance_location_redaction.');
  }
  return value;
}

function requireLongitude(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value < -180 || value > 180) {
    throw new Error('longitude must be between -180 and 180 for attendance_location_redaction.');
  }
  return value;
}

function requireProfile(value: AttendanceLocationRedactionProfile): AttendanceLocationRedactionProfile {
  if (!VALID_PROFILES.includes(value)) {
    throw new Error('redaction_profile is not allowed for attendance_location_redaction.');
  }
  return value;
}

function requirePurpose(value: AttendanceLocationRequesterPurpose): AttendanceLocationRequesterPurpose {
  if (!VALID_PURPOSES.includes(value)) {
    throw new Error('requester_purpose is not allowed for attendance_location_redaction.');
  }
  return value;
}

function sha256(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function rejectForbiddenRequests(input: AttendanceLocationRedactionInput, profile: AttendanceLocationRedactionProfile, purpose: AttendanceLocationRequesterPurpose): void {
  if ((input.raw_location_disclosure_requested === true || profile === "AUDIT_EXACT") && !(profile === "AUDIT_EXACT" && purpose === "AUDIT_SUPPORT_WINDOW")) {
    throw new Error('attendance_location_redaction must not disclose raw location outside an audited support window.');
  }
  const forbiddenFlags: Array<[keyof AttendanceLocationRedactionInput, string]> = [
    ['provider_specific_adapter_requested', 'attendance_location_redaction must remain provider-neutral.'],
    ['schema_mutation_requested', 'attendance_location_redaction must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'attendance_location_redaction must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'attendance_location_redaction must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'attendance_location_redaction must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'attendance_location_redaction must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function roundCoordinate(value: number): number {
  return Number(value.toFixed(2));
}

function digestRedaction(receiptWithoutDigest: Omit<AttendanceLocationRedactionReceipt, 'attendance_location_redaction_evidence_digest'>): string {
  return sha256(receiptWithoutDigest);
}

export function evaluateAttendanceLocationRedaction(input: AttendanceLocationRedactionInput): AttendanceLocationRedactionReceipt {
  const profile = requireProfile(input.redaction_profile);
  const purpose = requirePurpose(input.requester_purpose);
  rejectForbiddenRequests(input, profile, purpose);

  const latitude = requireLatitude(input.latitude);
  const longitude = requireLongitude(input.longitude);
  const regionCode = input.region_code === undefined ? null : requireNonEmpty(input.region_code, 'region_code').toUpperCase();
  const providerLocationRefHash = input.provider_location_ref === undefined ? null : sha256(requireNonEmpty(input.provider_location_ref, 'provider_location_ref'));
  const rawLocationHash = sha256({ latitude, longitude, location_label: input.location_label ?? null, region_code: regionCode, provider_location_ref: input.provider_location_ref ?? null });

  let redactedLatitude: number | null = null;
  let redactedLongitude: number | null = null;
  let redactedLocationLabel: string | null = null;
  let decision: AttendanceLocationRedactionDecision = "LOCATION_HASHED";
  let rawLocationDisclosureAllowed = false;

  if (profile === "COARSE_COORDINATES") {
    redactedLatitude = roundCoordinate(latitude);
    redactedLongitude = roundCoordinate(longitude);
    redactedLocationLabel = regionCode;
    decision = "LOCATION_COARSENED";
  } else if (profile === "REGION_ONLY") {
    redactedLocationLabel = regionCode;
    decision = "LOCATION_REGION_ONLY";
  } else if (profile === "AUDIT_EXACT" && purpose === "AUDIT_SUPPORT_WINDOW") {
    redactedLatitude = Number(latitude.toFixed(6));
    redactedLongitude = Number(longitude.toFixed(6));
    redactedLocationLabel = input.location_label === undefined ? null : requireNonEmpty(input.location_label, 'location_label');
    decision = "LOCATION_AUDIT_EXACT_ALLOWED";
    rawLocationDisclosureAllowed = true;
  }

  const receiptWithoutDigest: Omit<AttendanceLocationRedactionReceipt, 'attendance_location_redaction_evidence_digest'> = {
    seed_id: PHASE_6C_ATTENDANCE_LOCATION_REDACTION_SEED_ID,
    component_id: PHASE_6C_ATTENDANCE_LOCATION_REDACTION_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CAttendanceLocationRedaction",
    event_name: ATTENDANCE_LOCATION_REDACTION_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    attendance_event_ref: requireNonEmpty(input.attendance_event_ref, 'attendance_event_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    requester_ref: requireNonEmpty(input.requester_ref, 'requester_ref'),
    requester_purpose: purpose,
    redaction_profile: profile,
    redacted_latitude: redactedLatitude,
    redacted_longitude: redactedLongitude,
    redacted_location_label: redactedLocationLabel,
    region_code: regionCode,
    provider_location_ref_hash: providerLocationRefHash,
    raw_location_hash: rawLocationHash,
    captured_at: requireTimestamp(input.captured_at, 'captured_at'),
    decision,
    raw_location_disclosure_allowed: rawLocationDisclosureAllowed,
    provider_neutral_only: true,
    runtime_status: "ATTENDANCE_LOCATION_REDACTION_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    attendance_location_redaction_evidence_digest: digestRedaction(receiptWithoutDigest),
  };
}
