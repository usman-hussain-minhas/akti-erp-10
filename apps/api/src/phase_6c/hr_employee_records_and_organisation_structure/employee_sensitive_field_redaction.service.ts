import { createHash } from 'node:crypto';

export const PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_SEED_ID = "seed_6c_009_employee_sensitive_field_redaction" as const;
export const PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_SENSITIVE_FIELD_REDACTION_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_sensitive_field_redaction.runtime_evaluated" as const;
export const EMPLOYEE_SENSITIVE_FIELD_SET = ['compensation', 'national_id', 'bank', 'health', 'emergency_contact', 'performance', 'disciplinary'] as const;

export type EmployeeSensitiveFieldKey = typeof EMPLOYEE_SENSITIVE_FIELD_SET[number];
export type EmployeeSensitiveViewerRole = 'SELF' | 'HR_AUTHORIZED' | 'MANAGER' | 'WORKSPACE_ADMIN' | 'SUPPORT_OPERATOR';

export type EmployeeSensitiveRecord = {
  employee_record_ref: string;
  person_identity_anchor_id: string;
  sensitive_fields: Record<EmployeeSensitiveFieldKey, string>;
};

export type EmployeeSupportWindow = {
  support_window_ref: string;
  authorized_by_user_id: string;
  audit_reason_ref: string;
  expires_at: string;
};

export type EmployeeSensitiveFieldRedactionRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  viewer_role: EmployeeSensitiveViewerRole;
  viewer_employee_record_ref?: string;
  support_window?: EmployeeSupportWindow;
  records: readonly EmployeeSensitiveRecord[];
  control_metadata?: Record<string, unknown>;
  support_window_bypass_requested?: boolean;
  unrestricted_export_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type RedactedEmployeeSensitiveRecord = {
  employee_record_ref: string;
  person_identity_anchor_id: string;
  visible_fields: Partial<Record<EmployeeSensitiveFieldKey, string>>;
  redacted_fields: readonly EmployeeSensitiveFieldKey[];
};

export type EmployeeSensitiveFieldRedactionRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeSensitiveFieldRedaction";
  event_name: typeof EMPLOYEE_SENSITIVE_FIELD_REDACTION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYEE_SENSITIVE_FIELDS_REDACTED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  viewer_role: EmployeeSensitiveViewerRole;
  support_window_applied: boolean;
  support_window_ref?: string;
  redacted_records: readonly RedactedEmployeeSensitiveRecord[];
  redaction_counts: {
    records: number;
    visible_field_count: number;
    redacted_field_count: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for employee_sensitive_field_redaction runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for employee_sensitive_field_redaction runtime.');
  }
  return normalized;
}

function requireViewerRole(value: EmployeeSensitiveViewerRole): EmployeeSensitiveViewerRole {
  const allowed = new Set<EmployeeSensitiveViewerRole>(['SELF', 'HR_AUTHORIZED', 'MANAGER', 'WORKSPACE_ADMIN', 'SUPPORT_OPERATOR']);
  if (!allowed.has(value)) {
    throw new Error('viewer_role must be supported for employee_sensitive_field_redaction runtime.');
  }
  return value;
}

function assertOnlySensitiveFields(fields: Record<EmployeeSensitiveFieldKey, string>): Record<EmployeeSensitiveFieldKey, string> {
  const keys = Object.keys(fields);
  for (const key of keys) {
    if (!(EMPLOYEE_SENSITIVE_FIELD_SET as readonly string[]).includes(key)) {
      throw new Error('sensitive_fields contains a field outside the ratified sensitive set for employee_sensitive_field_redaction runtime: ' + key);
    }
  }
  const normalized = {} as Record<EmployeeSensitiveFieldKey, string>;
  for (const field of EMPLOYEE_SENSITIVE_FIELD_SET) {
    normalized[field] = requireNonEmpty(fields[field], field);
  }
  return normalized;
}

function validSupportWindow(window: EmployeeSupportWindow | undefined, evaluatedAt: string): EmployeeSupportWindow | undefined {
  if (window === undefined) {
    return undefined;
  }
  const normalizedWindow: EmployeeSupportWindow = {
    support_window_ref: requireNonEmpty(window.support_window_ref, 'support_window_ref'),
    authorized_by_user_id: requireNonEmpty(window.authorized_by_user_id, 'support_window_authorized_by_user_id'),
    audit_reason_ref: requireNonEmpty(window.audit_reason_ref, 'support_window_audit_reason_ref'),
    expires_at: requireTimestamp(window.expires_at, 'support_window_expires_at'),
  };
  if (Date.parse(normalizedWindow.expires_at) < Date.parse(evaluatedAt)) {
    throw new Error('support window must not be expired for employee_sensitive_field_redaction runtime.');
  }
  return normalizedWindow;
}

function canViewSensitiveFields(input: EmployeeSensitiveFieldRedactionRuntimeInput, record: EmployeeSensitiveRecord, supportWindow: EmployeeSupportWindow | undefined): boolean {
  if (input.viewer_role === 'HR_AUTHORIZED') {
    return true;
  }
  if (input.viewer_role === 'SELF') {
    return input.viewer_employee_record_ref === record.employee_record_ref;
  }
  if (input.viewer_role === 'WORKSPACE_ADMIN' || input.viewer_role === 'SUPPORT_OPERATOR') {
    return supportWindow !== undefined;
  }
  return false;
}

function redactRecord(input: EmployeeSensitiveFieldRedactionRuntimeInput, record: EmployeeSensitiveRecord, supportWindow: EmployeeSupportWindow | undefined): RedactedEmployeeSensitiveRecord {
  const fields = assertOnlySensitiveFields(record.sensitive_fields);
  const visible = canViewSensitiveFields(input, record, supportWindow);
  const visibleFields: Partial<Record<EmployeeSensitiveFieldKey, string>> = {};
  const redactedFields: EmployeeSensitiveFieldKey[] = [];
  for (const field of EMPLOYEE_SENSITIVE_FIELD_SET) {
    if (visible) {
      visibleFields[field] = fields[field];
    } else {
      redactedFields.push(field);
    }
  }
  return {
    employee_record_ref: requireNonEmpty(record.employee_record_ref, 'employee_record_ref'),
    person_identity_anchor_id: requireNonEmpty(record.person_identity_anchor_id, 'person_identity_anchor_id'),
    visible_fields: visibleFields,
    redacted_fields: redactedFields,
  };
}

function digestRuntime(receiptWithoutDigest: Omit<EmployeeSensitiveFieldRedactionRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateEmployeeSensitiveFieldRedactionRuntime(input: EmployeeSensitiveFieldRedactionRuntimeInput): EmployeeSensitiveFieldRedactionRuntimeReceipt {
  if (input.support_window_bypass_requested === true) {
    throw new Error('employee_sensitive_field_redaction runtime must not bypass audited support windows.');
  }
  if (input.unrestricted_export_requested === true) {
    throw new Error('employee_sensitive_field_redaction runtime must not perform unrestricted sensitive exports.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('employee_sensitive_field_redaction runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('employee_sensitive_field_redaction runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('employee_sensitive_field_redaction runtime must not mutate Phase 6B records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('employee_sensitive_field_redaction runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('employee_sensitive_field_redaction runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const viewerRole = requireViewerRole(input.viewer_role);
  const supportWindow = validSupportWindow(input.support_window, evaluatedAt);
  const redactedRecords = input.records.map((record) => redactRecord({ ...input, viewer_role: viewerRole }, record, supportWindow))
    .sort((left, right) => left.employee_record_ref.localeCompare(right.employee_record_ref));
  const visibleFieldCount = redactedRecords.reduce((total, record) => total + Object.keys(record.visible_fields).length, 0);
  const redactedFieldCount = redactedRecords.reduce((total, record) => total + record.redacted_fields.length, 0);

  const receiptWithoutDigest: Omit<EmployeeSensitiveFieldRedactionRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_SEED_ID,
    component_id: PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CEmployeeSensitiveFieldRedaction",
    event_name: EMPLOYEE_SENSITIVE_FIELD_REDACTION_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'EMPLOYEE_SENSITIVE_FIELDS_REDACTED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-HR-EMP-010", "6C-SEC-005", "6C-SEC-006", "6C-SCHEMA-006", "6C-NON-007"],
    viewer_role: viewerRole,
    support_window_applied: supportWindow !== undefined,
    support_window_ref: supportWindow?.support_window_ref,
    redacted_records: redactedRecords,
    redaction_counts: {
      records: redactedRecords.length,
      visible_field_count: visibleFieldCount,
      redacted_field_count: redactedFieldCount,
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
