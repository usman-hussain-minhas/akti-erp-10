import { createHash } from 'node:crypto';

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

const VENDOR_STATES: readonly VendorRecordState[] = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'DISABLED'] as const;
const IDENTITY_ANCHOR_TYPES: readonly VendorIdentityAnchorType[] = ['PERSON', 'ORGANIZATION'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for vendor record authority.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for vendor record authority.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'default_currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('default_currency_code must be a three-letter ISO-style code for vendor record authority.');
  }
  return currency;
}

function requireSourceSeed(value: string): typeof PHASE_6B_VENDOR_RECORD_AUTHORITY_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_VENDOR_RECORD_AUTHORITY_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_11_vendor_record_authority.');
  }
  return PHASE_6B_VENDOR_RECORD_AUTHORITY_SEED_ID;
}

function requireVendorState(value: VendorRecordState): VendorRecordState {
  if (!VENDOR_STATES.includes(value)) {
    throw new Error('vendor_record_state is not supported for vendor record authority.');
  }
  return value;
}

function requireIdentityAnchorType(value: VendorIdentityAnchorType): VendorIdentityAnchorType {
  if (!IDENTITY_ANCHOR_TYPES.includes(value)) {
    throw new Error('vendor_identity_anchor_type is not supported for vendor record authority.');
  }
  return value;
}

function normalizeEvidenceRefs(value: string[]): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('vendor_evidence_refs must include at least one evidence reference for vendor record authority.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, `vendor_evidence_refs[${index}]`));
  if (new Set(refs).size !== refs.length) {
    throw new Error('vendor_evidence_refs must not contain duplicates for vendor record authority.');
  }
  return refs;
}

function digestVendorRecord(receiptWithoutDigest: Omit<VendorRecordAuthorityReceipt, 'vendor_record_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function authorizeVendorRecord(input: VendorRecordAuthorityInput): VendorRecordAuthorityReceipt {
  if (input.global_identity_write_requested === true) {
    throw new Error('vendor record authority must reference, not write, global identity.');
  }
  if (input.vendor_payment_requested === true) {
    throw new Error('vendor record authority must not execute vendor payments.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('vendor record authority must not perform payment allocation math.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('vendor record authority must not process provider callbacks.');
  }
  if (input.gl_posting_requested === true) {
    throw new Error('vendor record authority must not post to general ledger.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('vendor record authority must not perform irreversible actions.');
  }

  const vendorLegalName = requireNonEmpty(input.vendor_legal_name, 'vendor_legal_name');
  const vendorDisplayName =
    input.vendor_display_name === undefined ? vendorLegalName : requireNonEmpty(input.vendor_display_name, 'vendor_display_name');
  const vendorEvidenceRefs = normalizeEvidenceRefs(input.vendor_evidence_refs);

  const receiptWithoutDigest: Omit<VendorRecordAuthorityReceipt, 'vendor_record_digest'> = {
    seed_id: PHASE_6B_VENDOR_RECORD_AUTHORITY_SEED_ID,
    component_id: PHASE_6B_VENDOR_RECORD_AUTHORITY_COMPONENT_ID,
    event_name: VENDOR_RECORD_AUTHORITY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_vendor_model: 'Phase6BVendor',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    vendor_record_ref: requireNonEmpty(input.vendor_record_ref, 'vendor_record_ref'),
    vendor_legal_name: vendorLegalName,
    vendor_display_name: vendorDisplayName,
    vendor_identity_anchor_type: requireIdentityAnchorType(input.vendor_identity_anchor_type),
    vendor_identity_graph_ref: requireNonEmpty(input.vendor_identity_graph_ref, 'vendor_identity_graph_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    onboarding_workflow_ref: requireNonEmpty(input.onboarding_workflow_ref, 'onboarding_workflow_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    payment_terms_ref: requireNonEmpty(input.payment_terms_ref, 'payment_terms_ref'),
    default_currency_code: normalizeCurrency(input.default_currency_code),
    vendor_record_state: requireVendorState(input.vendor_record_state),
    vendor_evidence_refs: vendorEvidenceRefs,
    evidence_count: vendorEvidenceRefs.length,
    activation_lifecycle_required: true,
    approval_capability_gated: true,
    global_identity_owned: false,
    global_identity_written: false,
    vendor_payment_performed: false,
    payment_allocation_performed: false,
    provider_callback_processed: false,
    gl_posting_performed: false,
    irreversible_action_allowed: false,
    updated_by_user_id: requireNonEmpty(input.updated_by_user_id, 'updated_by_user_id'),
    updated_at: requireTimestamp(input.updated_at, 'updated_at'),
  };

  return {
    ...receiptWithoutDigest,
    vendor_record_digest: digestVendorRecord(receiptWithoutDigest),
  };
}
