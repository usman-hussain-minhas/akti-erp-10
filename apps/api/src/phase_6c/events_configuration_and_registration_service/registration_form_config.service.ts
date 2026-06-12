import { createHash } from 'node:crypto';

export const PHASE_6C_REGISTRATION_FORM_CONFIG_SEED_ID = 'seed_6c_100_registration_form_config' as const;
export const PHASE_6C_REGISTRATION_FORM_CONFIG_COMPONENT_ID = '6C.08' as const;
export const REGISTRATION_FORM_CONFIG_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.registration_form_config.runtime_evaluated' as const;

export type RegistrationFormFieldType = 'TEXT' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'CHECKBOX' | 'FILE_REF';
export type RegistrationFormDataClass = 'PUBLIC' | 'CONTACT' | 'SENSITIVE';
export type RegistrationFormDecision = 'FORM_CONFIG_READY' | 'FORM_CONFIG_REQUIRES_REVIEW';

export type RegistrationFormOption = {
  option_key: string;
  label: string;
  active: boolean;
};

export type RegistrationFormFieldConfig = {
  field_key: string;
  label: string;
  field_type: RegistrationFormFieldType;
  required: boolean;
  data_class: RegistrationFormDataClass;
  sensitive_field_purpose_ref?: string;
  options?: readonly RegistrationFormOption[];
  min_value?: number;
  max_value?: number;
};

export type RegistrationFormConfigInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  registration_form_config_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  configuration_engine_ref: string;
  form_version: string;
  fields: readonly RegistrationFormFieldConfig[];
  control_metadata?: Record<string, unknown>;
  frontend_render_requested?: boolean;
  submission_processing_requested?: boolean;
  configuration_write_requested?: boolean;
  dynamic_code_requested?: boolean;
  file_upload_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
};

export type RegistrationFormConfigRuntimeReceipt = {
  seed_id: typeof PHASE_6C_REGISTRATION_FORM_CONFIG_SEED_ID;
  component_id: typeof PHASE_6C_REGISTRATION_FORM_CONFIG_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CRegistrationFormConfig';
  event_name: typeof REGISTRATION_FORM_CONFIG_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  registration_form_config_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  configuration_engine_ref: string;
  form_version: string;
  field_count: number;
  required_field_count: number;
  sensitive_field_count: number;
  selectable_field_count: number;
  file_ref_field_count: number;
  normalized_field_keys: readonly string[];
  decision: RegistrationFormDecision;
  review_reasons: readonly string[];
  configuration_engine_driven: true;
  frontend_render_performed: false;
  submission_processing_performed: false;
  configuration_write_performed: false;
  dynamic_code_allowed: false;
  file_upload_performed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  registration_form_config_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-004', '6C-GLOBAL-018'] as const;
const SELECTABLE_TYPES = new Set<RegistrationFormFieldType>(['SELECT', 'MULTI_SELECT', 'CHECKBOX']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for registration_form_config runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for registration_form_config runtime evaluation.');
  }
  return normalized;
}

function normalizeFieldKey(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toLowerCase();
  if (!/^[a-z][a-z0-9_]{1,62}$/.test(normalized)) {
    throw new Error(field + ' must use lower-snake key format with 2-63 characters.');
  }
  return normalized;
}

function assertForbidden(input: RegistrationFormConfigInput): void {
  const forbidden: Array<[keyof RegistrationFormConfigInput, string]> = [
    ['frontend_render_requested', 'registration_form_config must not render frontend screens.'],
    ['submission_processing_requested', 'registration_form_config must not process submissions.'],
    ['configuration_write_requested', 'registration_form_config must evaluate Configuration Engine data, not write configuration.'],
    ['dynamic_code_requested', 'registration_form_config must not execute dynamic code.'],
    ['file_upload_requested', 'registration_form_config may reference file fields, not upload files.'],
    ['provider_adapter_requested', 'registration_form_config must not execute provider adapters.'],
    ['persistence_requested', 'registration_form_config FFET must not persist records.'],
    ['schema_mutation_requested', 'registration_form_config FFET must not mutate schema.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function digestRuntime(receiptWithoutDigest: Omit<RegistrationFormConfigRuntimeReceipt, 'registration_form_config_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function validateOptions(field: RegistrationFormFieldConfig, fieldKey: string): void {
  const hasOptions = Array.isArray(field.options) && field.options.length > 0;
  if (SELECTABLE_TYPES.has(field.field_type)) {
    if (!hasOptions) {
      throw new Error('selectable field ' + fieldKey + ' requires active options.');
    }
    const optionKeys = new Set<string>();
    for (const [index, option] of field.options!.entries()) {
      const optionKey = normalizeFieldKey(option.option_key, 'fields.' + fieldKey + '.options[' + index + '].option_key');
      requireNonEmpty(option.label, 'fields.' + fieldKey + '.options[' + index + '].label');
      if (optionKeys.has(optionKey)) {
        throw new Error('selectable field ' + fieldKey + ' must not contain duplicate option keys.');
      }
      optionKeys.add(optionKey);
    }
    if (!field.options!.some((option) => option.active === true)) {
      throw new Error('selectable field ' + fieldKey + ' requires at least one active option.');
    }
    return;
  }
  if (hasOptions) {
    throw new Error('non-selectable field ' + fieldKey + ' must not declare options.');
  }
}

function validateNumberBounds(field: RegistrationFormFieldConfig, fieldKey: string): void {
  if (field.field_type !== 'NUMBER') {
    if (field.min_value !== undefined || field.max_value !== undefined) {
      throw new Error('min_value and max_value are only valid for NUMBER fields.');
    }
    return;
  }
  if (field.min_value !== undefined && !Number.isFinite(field.min_value)) {
    throw new Error('NUMBER field ' + fieldKey + ' min_value must be finite.');
  }
  if (field.max_value !== undefined && !Number.isFinite(field.max_value)) {
    throw new Error('NUMBER field ' + fieldKey + ' max_value must be finite.');
  }
  if (field.min_value !== undefined && field.max_value !== undefined && field.min_value > field.max_value) {
    throw new Error('NUMBER field ' + fieldKey + ' min_value must not exceed max_value.');
  }
}

function validateFields(fields: readonly RegistrationFormFieldConfig[]): {
  normalizedFieldKeys: readonly string[];
  requiredFieldCount: number;
  sensitiveFieldCount: number;
  selectableFieldCount: number;
  fileRefFieldCount: number;
  reviewReasons: readonly string[];
} {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('at least one field is required for registration_form_config runtime evaluation.');
  }

  const fieldKeys = new Set<string>();
  const normalizedFieldKeys: string[] = [];
  const reviewReasons: string[] = [];
  let requiredFieldCount = 0;
  let sensitiveFieldCount = 0;
  let selectableFieldCount = 0;
  let fileRefFieldCount = 0;

  for (const [index, field] of fields.entries()) {
    const fieldKey = normalizeFieldKey(field.field_key, 'fields[' + index + '].field_key');
    if (fieldKeys.has(fieldKey)) {
      throw new Error('field_key values must be unique for registration_form_config runtime evaluation.');
    }
    fieldKeys.add(fieldKey);
    normalizedFieldKeys.push(fieldKey);
    requireNonEmpty(field.label, 'fields.' + fieldKey + '.label');
    if (field.required === true) {
      requiredFieldCount += 1;
    }
    if (field.data_class === 'SENSITIVE') {
      sensitiveFieldCount += 1;
      if (!field.sensitive_field_purpose_ref) {
        reviewReasons.push('sensitive field ' + fieldKey + ' requires sensitive_field_purpose_ref');
      }
    }
    if (field.data_class !== 'SENSITIVE' && field.sensitive_field_purpose_ref !== undefined) {
      throw new Error('sensitive_field_purpose_ref is only valid for SENSITIVE fields.');
    }
    if (SELECTABLE_TYPES.has(field.field_type)) {
      selectableFieldCount += 1;
    }
    if (field.field_type === 'FILE_REF') {
      fileRefFieldCount += 1;
    }
    validateOptions(field, fieldKey);
    validateNumberBounds(field, fieldKey);
  }

  return { normalizedFieldKeys, requiredFieldCount, sensitiveFieldCount, selectableFieldCount, fileRefFieldCount, reviewReasons };
}

export function evaluateRegistrationFormConfig(input: RegistrationFormConfigInput): RegistrationFormConfigRuntimeReceipt {
  assertForbidden(input);
  const fields = validateFields(input.fields);

  const receiptWithoutDigest: Omit<RegistrationFormConfigRuntimeReceipt, 'registration_form_config_runtime_digest'> = {
    seed_id: PHASE_6C_REGISTRATION_FORM_CONFIG_SEED_ID,
    component_id: PHASE_6C_REGISTRATION_FORM_CONFIG_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CRegistrationFormConfig',
    event_name: REGISTRATION_FORM_CONFIG_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    registration_form_config_id: requireNonEmpty(input.registration_form_config_id, 'registration_form_config_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    configuration_engine_ref: requireNonEmpty(input.configuration_engine_ref, 'configuration_engine_ref'),
    form_version: requireNonEmpty(input.form_version, 'form_version'),
    field_count: input.fields.length,
    required_field_count: fields.requiredFieldCount,
    sensitive_field_count: fields.sensitiveFieldCount,
    selectable_field_count: fields.selectableFieldCount,
    file_ref_field_count: fields.fileRefFieldCount,
    normalized_field_keys: fields.normalizedFieldKeys,
    decision: fields.reviewReasons.length === 0 ? 'FORM_CONFIG_READY' : 'FORM_CONFIG_REQUIRES_REVIEW',
    review_reasons: fields.reviewReasons,
    configuration_engine_driven: true,
    frontend_render_performed: false,
    submission_processing_performed: false,
    configuration_write_performed: false,
    dynamic_code_allowed: false,
    file_upload_performed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: ['registration_form_config_runtime_receipt', 'registration_form_config_validation_result', 'registration_form_config_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    registration_form_config_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
