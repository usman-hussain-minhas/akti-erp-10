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
