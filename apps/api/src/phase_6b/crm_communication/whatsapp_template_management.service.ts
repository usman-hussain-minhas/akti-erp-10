export const PHASE_6B_WHATSAPP_TEMPLATE_MANAGEMENT_SEED_ID = 'seed_6b_07_whatsapp_template_management' as const;
export const PHASE_6B_WHATSAPP_TEMPLATE_MANAGEMENT_COMPONENT_ID = '6B.07' as const;

export const WHATSAPP_TEMPLATE_MANAGEMENT_EVENT = 'phase_6b.crm_communication.whatsapp_template_management.configured' as const;

export type WhatsappTemplateCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
export type WhatsappTemplateLifecycleStatus = 'DRAFT' | 'READY_FOR_PROVIDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RETIRED';

export type WhatsappTemplateVariable = {
  variable_name: string;
  sample_value: string;
  required: boolean;
};

export type WhatsappTemplateManagementInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  whatsapp_template_id: string;
  pipeline_stage_model_ref: string;
  template_key: string;
  display_name: string;
  category: WhatsappTemplateCategory;
  lifecycle_status: WhatsappTemplateLifecycleStatus;
  language_code: string;
  body_template: string;
  variables: WhatsappTemplateVariable[];
  approval_evidence_refs: string[];
  global_opt_out_registry_ref?: string;
  configured_by_user_id: string;
  configured_at: string;
  outbound_send_requested?: boolean;
  provider_submission_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type WhatsappTemplateManagementReceipt = {
  seed_id: typeof PHASE_6B_WHATSAPP_TEMPLATE_MANAGEMENT_SEED_ID;
  component_id: typeof PHASE_6B_WHATSAPP_TEMPLATE_MANAGEMENT_COMPONENT_ID;
  event_name: typeof WHATSAPP_TEMPLATE_MANAGEMENT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  whatsapp_template_id: string;
  pipeline_stage_model_ref: string;
  template_key: string;
  display_name: string;
  category: WhatsappTemplateCategory;
  lifecycle_status: WhatsappTemplateLifecycleStatus;
  language_code: string;
  body_template: string;
  variables: readonly WhatsappTemplateVariable[];
  variable_count: number;
  approval_evidence_refs: readonly string[];
  approval_evidence_count: number;
  global_opt_out_registry_ref?: string;
  opt_out_dependency_tier: 'CONDITIONAL_SETUP_REFERENCE';
  send_gateway_required_for_future_send: true;
  outbound_send_allowed: false;
  provider_submission_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};

const CATEGORIES: readonly WhatsappTemplateCategory[] = ['UTILITY', 'MARKETING', 'AUTHENTICATION'] as const;
const LIFECYCLE_STATUSES: readonly WhatsappTemplateLifecycleStatus[] = ['DRAFT', 'READY_FOR_PROVIDER_REVIEW', 'APPROVED', 'REJECTED', 'RETIRED'] as const;
const VARIABLE_PATTERN = /^[a-z][a-z0-9_]*$/;
const TEMPLATE_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;
const LANGUAGE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for whatsapp template management.`);
  }
  return value.trim();
}

function normalizeOptional(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireConfiguredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'configured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('configured_at must be a valid ISO-compatible timestamp for whatsapp template management.');
  }
  return normalized;
}

function normalizeTemplateKey(value: string): string {
  const normalized = requireNonEmpty(value, 'template_key');
  if (!TEMPLATE_KEY_PATTERN.test(normalized)) {
    throw new Error('template_key must be lower snake case for whatsapp template management.');
  }
  return normalized;
}

function normalizeLanguageCode(value: string): string {
  const normalized = requireNonEmpty(value, 'language_code');
  if (!LANGUAGE_PATTERN.test(normalized)) {
    throw new Error('language_code must use a supported language tag for whatsapp template management.');
  }
  return normalized;
}

function normalizeCategory(value: WhatsappTemplateCategory): WhatsappTemplateCategory {
  if (!CATEGORIES.includes(value)) {
    throw new Error('category is not supported for whatsapp template management.');
  }
  return value;
}

function normalizeLifecycleStatus(value: WhatsappTemplateLifecycleStatus): WhatsappTemplateLifecycleStatus {
  if (!LIFECYCLE_STATUSES.includes(value)) {
    throw new Error('lifecycle_status is not supported for whatsapp template management.');
  }
  return value;
}

function extractTemplateVariables(bodyTemplate: string): readonly string[] {
  const variables = new Set<string>();
  const matcher = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g;
  for (const match of bodyTemplate.matchAll(matcher)) {
    variables.add(match[1]!);
  }
  return Object.freeze([...variables].sort());
}

function normalizeVariable(variable: WhatsappTemplateVariable): WhatsappTemplateVariable {
  const variableName = requireNonEmpty(variable.variable_name, 'variable_name');
  if (!VARIABLE_PATTERN.test(variableName)) {
    throw new Error('variable_name must be lower snake case for whatsapp template management.');
  }
  return {
    variable_name: variableName,
    sample_value: requireNonEmpty(variable.sample_value, 'sample_value'),
    required: variable.required === true,
  };
}

function normalizeVariables(bodyTemplate: string, variables: WhatsappTemplateVariable[]): readonly WhatsappTemplateVariable[] {
  if (!Array.isArray(variables) || variables.length === 0) {
    throw new Error('variables must contain at least one variable for whatsapp template management.');
  }
  const normalized = variables.map(normalizeVariable).sort((left, right) => left.variable_name.localeCompare(right.variable_name));
  const declared = new Set(normalized.map((variable) => variable.variable_name));
  if (declared.size !== normalized.length) {
    throw new Error('variables must not contain duplicate variable_name values for whatsapp template management.');
  }
  const used = extractTemplateVariables(bodyTemplate);
  const undeclared = used.filter((variableName) => !declared.has(variableName));
  if (undeclared.length > 0) {
    throw new Error('body_template must not reference undeclared variables for whatsapp template management.');
  }
  const unused = normalized.filter((variable) => !used.includes(variable.variable_name));
  if (unused.length > 0) {
    throw new Error('variables must all be referenced by body_template for whatsapp template management.');
  }
  return Object.freeze(normalized);
}

function normalizeRefs(refs: string[], field: string): readonly string[] {
  if (!Array.isArray(refs)) {
    throw new Error(`${field} must be an array for whatsapp template management.`);
  }
  const normalized = refs.map((ref, index) => requireNonEmpty(ref, `${field}.${index}`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${field} must not contain duplicate values for whatsapp template management.`);
  }
  return Object.freeze(normalized);
}

export function configureWhatsappTemplateManagement(input: WhatsappTemplateManagementInput): WhatsappTemplateManagementReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('whatsapp template management must not send outbound messages.');
  }
  if (input.provider_submission_requested === true) {
    throw new Error('whatsapp template management must not submit templates to providers.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('whatsapp template management must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('whatsapp template management must not perform irreversible actions.');
  }

  const bodyTemplate = requireNonEmpty(input.body_template, 'body_template');
  const variables = normalizeVariables(bodyTemplate, input.variables);
  const approvalEvidenceRefs = normalizeRefs(input.approval_evidence_refs, 'approval_evidence_refs');

  return {
    seed_id: PHASE_6B_WHATSAPP_TEMPLATE_MANAGEMENT_SEED_ID,
    component_id: PHASE_6B_WHATSAPP_TEMPLATE_MANAGEMENT_COMPONENT_ID,
    event_name: WHATSAPP_TEMPLATE_MANAGEMENT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    whatsapp_template_id: requireNonEmpty(input.whatsapp_template_id, 'whatsapp_template_id'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    template_key: normalizeTemplateKey(input.template_key),
    display_name: requireNonEmpty(input.display_name, 'display_name'),
    category: normalizeCategory(input.category),
    lifecycle_status: normalizeLifecycleStatus(input.lifecycle_status),
    language_code: normalizeLanguageCode(input.language_code),
    body_template: bodyTemplate,
    variables,
    variable_count: variables.length,
    approval_evidence_refs: approvalEvidenceRefs,
    approval_evidence_count: approvalEvidenceRefs.length,
    global_opt_out_registry_ref: normalizeOptional(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    opt_out_dependency_tier: 'CONDITIONAL_SETUP_REFERENCE',
    send_gateway_required_for_future_send: true,
    outbound_send_allowed: false,
    provider_submission_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireConfiguredAt(input.configured_at),
  };
}
