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
