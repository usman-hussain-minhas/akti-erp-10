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
