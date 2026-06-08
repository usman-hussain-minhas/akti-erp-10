import { createHash } from 'node:crypto';

export const PHASE_6B_FBR_INVOICE_FORMAT_SEED_ID = 'seed_6b_09_fbr_invoice_format' as const;
export const PHASE_6B_FBR_INVOICE_FORMAT_COMPONENT_ID = '6B.09' as const;

export const FBR_INVOICE_FORMAT_EVENT = 'phase_6b.finance_invoice_receivables.fbr_invoice_format.rendered' as const;

export type FbrInvoiceFieldValueType = 'STRING' | 'NUMBER' | 'BOOLEAN';

export type FbrInvoiceFieldMapping = {
  mapping_id: string;
  source_field_ref: string;
  fbr_field_name: string;
  value_type: FbrInvoiceFieldValueType;
  required: boolean;
  evidence_label: string;
};

export type FbrInvoiceFieldValue = {
  source_field_ref: string;
  value: string | number | boolean;
};

export type FbrInvoiceFormatInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  format_profile_id: string;
  fbr_format_version: string;
  invoice_record_ref: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  field_mappings: FbrInvoiceFieldMapping[];
  invoice_values: FbrInvoiceFieldValue[];
  rendered_by_user_id: string;
  rendered_at: string;
  api_submission_requested?: boolean;
  credential_material_requested?: boolean;
  tax_law_validation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type FbrInvoicePayloadField = {
  fbr_field_name: string;
  source_field_ref: string;
  value: string | number | boolean;
  evidence_label: string;
};

export type FbrInvoiceFormatReceipt = {
  seed_id: typeof PHASE_6B_FBR_INVOICE_FORMAT_SEED_ID;
  component_id: typeof PHASE_6B_FBR_INVOICE_FORMAT_COMPONENT_ID;
  event_name: typeof FBR_INVOICE_FORMAT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  format_profile_id: string;
  fbr_format_version: string;
  invoice_record_ref: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  payload_fields: FbrInvoicePayloadField[];
  required_field_count: number;
  payload_field_count: number;
  format_evidence_digest: string;
  api_submission_allowed: false;
  credential_material_allowed: false;
  tax_law_validation_allowed: false;
  irreversible_action_allowed: false;
  rendered_by_user_id: string;
  rendered_at: string;
};

const VALUE_TYPES: readonly FbrInvoiceFieldValueType[] = ['STRING', 'NUMBER', 'BOOLEAN'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for FBR invoice format.`);
  }
  return value.trim();
}

function requireRenderedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'rendered_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('rendered_at must be a valid ISO-compatible timestamp for FBR invoice format.');
  }
  return normalized;
}

function normalizeValueType(value: FbrInvoiceFieldValueType): FbrInvoiceFieldValueType {
  if (!VALUE_TYPES.includes(value)) {
    throw new Error('value_type is not supported for FBR invoice format.');
  }
  return value;
}

function normalizeMapping(mapping: FbrInvoiceFieldMapping): FbrInvoiceFieldMapping {
  return {
    mapping_id: requireNonEmpty(mapping.mapping_id, 'field_mappings.mapping_id'),
    source_field_ref: requireNonEmpty(mapping.source_field_ref, 'field_mappings.source_field_ref'),
    fbr_field_name: requireNonEmpty(mapping.fbr_field_name, 'field_mappings.fbr_field_name'),
    value_type: normalizeValueType(mapping.value_type),
    required: mapping.required === true,
    evidence_label: requireNonEmpty(mapping.evidence_label, 'field_mappings.evidence_label'),
  };
}

function normalizeMappings(mappings: FbrInvoiceFieldMapping[]): FbrInvoiceFieldMapping[] {
  if (!Array.isArray(mappings) || mappings.length === 0) {
    throw new Error('field_mappings must include at least one mapping for FBR invoice format.');
  }
  const normalized = mappings.map(normalizeMapping);
  for (const key of ['mapping_id', 'source_field_ref', 'fbr_field_name'] as const) {
    const values = normalized.map((mapping) => mapping[key]);
    if (new Set(values).size !== values.length) {
      throw new Error(`field_mappings must not repeat ${key} for FBR invoice format.`);
    }
  }
  return normalized;
}

function normalizeValues(values: FbrInvoiceFieldValue[]): Map<string, FbrInvoiceFieldValue> {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('invoice_values must include at least one value for FBR invoice format.');
  }
  const valueMap = new Map<string, FbrInvoiceFieldValue>();
  for (const value of values) {
    const sourceFieldRef = requireNonEmpty(value.source_field_ref, 'invoice_values.source_field_ref');
    if (!['string', 'number', 'boolean'].includes(typeof value.value)) {
      throw new Error('invoice_values.value must be a string, number, or boolean for FBR invoice format.');
    }
    if (valueMap.has(sourceFieldRef)) {
      throw new Error('invoice_values must not repeat source_field_ref for FBR invoice format.');
    }
    valueMap.set(sourceFieldRef, { source_field_ref: sourceFieldRef, value: value.value });
  }
  return valueMap;
}

function assertValueType(mapping: FbrInvoiceFieldMapping, value: FbrInvoiceFieldValue): void {
  const expectedType = mapping.value_type.toLowerCase();
  if (typeof value.value !== expectedType) {
    throw new Error('invoice_values.value type must match field_mappings.value_type for FBR invoice format.');
  }
}

function digestPayload(payloadFields: FbrInvoicePayloadField[]): string {
  return createHash('sha256').update(JSON.stringify(payloadFields)).digest('hex');
}

export function renderFbrInvoiceFormat(input: FbrInvoiceFormatInput): FbrInvoiceFormatReceipt {
  if (input.api_submission_requested === true) {
    throw new Error('FBR invoice format must not submit to FBR APIs.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('FBR invoice format must not handle credential material.');
  }
  if (input.tax_law_validation_requested === true) {
    throw new Error('FBR invoice format must not claim tax law validation.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('FBR invoice format must not perform irreversible actions.');
  }

  const mappings = normalizeMappings(input.field_mappings);
  const valueMap = normalizeValues(input.invoice_values);
  const payloadFields = mappings.flatMap((mapping) => {
    const value = valueMap.get(mapping.source_field_ref);
    if (!value) {
      if (mapping.required) {
        throw new Error('required FBR invoice format mapping is missing an invoice value.');
      }
      return [];
    }
    assertValueType(mapping, value);
    return [{
      fbr_field_name: mapping.fbr_field_name,
      source_field_ref: mapping.source_field_ref,
      value: value.value,
      evidence_label: mapping.evidence_label,
    }];
  });

  return {
    seed_id: PHASE_6B_FBR_INVOICE_FORMAT_SEED_ID,
    component_id: PHASE_6B_FBR_INVOICE_FORMAT_COMPONENT_ID,
    event_name: FBR_INVOICE_FORMAT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    format_profile_id: requireNonEmpty(input.format_profile_id, 'format_profile_id'),
    fbr_format_version: requireNonEmpty(input.fbr_format_version, 'fbr_format_version'),
    invoice_record_ref: requireNonEmpty(input.invoice_record_ref, 'invoice_record_ref'),
    product_record_authority_ref: requireNonEmpty(input.product_record_authority_ref, 'product_record_authority_ref'),
    product_price_history_ref: requireNonEmpty(input.product_price_history_ref, 'product_price_history_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    payload_fields: payloadFields,
    required_field_count: mappings.filter((mapping) => mapping.required).length,
    payload_field_count: payloadFields.length,
    format_evidence_digest: digestPayload(payloadFields),
    api_submission_allowed: false,
    credential_material_allowed: false,
    tax_law_validation_allowed: false,
    irreversible_action_allowed: false,
    rendered_by_user_id: requireNonEmpty(input.rendered_by_user_id, 'rendered_by_user_id'),
    rendered_at: requireRenderedAt(input.rendered_at),
  };
}
