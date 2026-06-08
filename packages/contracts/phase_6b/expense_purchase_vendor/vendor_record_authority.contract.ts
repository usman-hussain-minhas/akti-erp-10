export const PHASE_6B_VENDOR_RECORD_AUTHORITY_SEED_ID = 'seed_6b_11_vendor_record_authority' as const;
export const PHASE_6B_VENDOR_RECORD_AUTHORITY_COMPONENT_ID = '6B.11' as const;

export const VENDOR_RECORD_AUTHORITY_EVENT = 'phase_6b.expense_purchase_vendor.vendor.updated' as const;

export type VendorRecordState = 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'DISABLED';
export type VendorIdentityAnchorType = 'PERSON' | 'ORGANIZATION';

export type VendorRecordAuthorityInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_VENDOR_RECORD_AUTHORITY_SEED_ID;
  vendor_record_ref: string;
  vendor_legal_name: string;
  vendor_display_name?: string;
  vendor_identity_anchor_type: VendorIdentityAnchorType;
  vendor_identity_graph_ref: string;
  visual_workflow_builder_ref: string;
  onboarding_workflow_ref: string;
  payment_allocation_balance_ref: string;
  payment_terms_ref: string;
  default_currency_code: string;
  vendor_record_state: VendorRecordState;
  vendor_evidence_refs: string[];
  updated_by_user_id: string;
  updated_at: string;
  global_identity_write_requested?: boolean;
  vendor_payment_requested?: boolean;
  payment_allocation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  gl_posting_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type VendorRecordAuthorityReceipt = {
  seed_id: typeof PHASE_6B_VENDOR_RECORD_AUTHORITY_SEED_ID;
  component_id: typeof PHASE_6B_VENDOR_RECORD_AUTHORITY_COMPONENT_ID;
  event_name: typeof VENDOR_RECORD_AUTHORITY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_vendor_model: 'Phase6BVendor';
  source_seed_id: typeof PHASE_6B_VENDOR_RECORD_AUTHORITY_SEED_ID;
  vendor_record_ref: string;
  vendor_legal_name: string;
  vendor_display_name: string;
  vendor_identity_anchor_type: VendorIdentityAnchorType;
  vendor_identity_graph_ref: string;
  visual_workflow_builder_ref: string;
  onboarding_workflow_ref: string;
  payment_allocation_balance_ref: string;
  payment_terms_ref: string;
  default_currency_code: string;
  vendor_record_state: VendorRecordState;
  vendor_evidence_refs: string[];
  evidence_count: number;
  activation_lifecycle_required: true;
  approval_capability_gated: true;
  global_identity_owned: false;
  global_identity_written: false;
  vendor_payment_performed: false;
  payment_allocation_performed: false;
  provider_callback_processed: false;
  gl_posting_performed: false;
  irreversible_action_allowed: false;
  vendor_record_digest: string;
  updated_by_user_id: string;
  updated_at: string;
};
