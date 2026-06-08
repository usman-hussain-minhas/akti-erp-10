import assert from 'node:assert/strict';
import { authorizeVendorRecord, type VendorRecordAuthorityInput } from './vendor_record_authority.service';

const baseInput: VendorRecordAuthorityInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_expense_purchase_vendor',
  source_seed_id: 'seed_6b_11_vendor_record_authority',
  vendor_record_ref: 'vendor_001',
  vendor_legal_name: 'Northwind Stationery Private Limited',
  vendor_identity_anchor_type: 'ORGANIZATION',
  vendor_identity_graph_ref: 'identity_graph_org_vendor_001',
  visual_workflow_builder_ref: 'workflow_vendor_onboarding',
  onboarding_workflow_ref: 'vendor_onboarding_step_approved',
  payment_allocation_balance_ref: 'payment_allocation_balance_vendor_001',
  payment_terms_ref: 'payment_terms_standard_vendor',
  default_currency_code: 'usd',
  vendor_record_state: 'ACTIVE',
  vendor_evidence_refs: ['vendor_registration_evidence_001', 'vendor_tax_profile_evidence_001'],
  updated_by_user_id: 'user_vendor_controller_001',
  updated_at: '2026-06-07T00:00:00.000Z',
};

const receipt = authorizeVendorRecord(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_11_vendor_record_authority');
assert.equal(receipt.component_id, '6B.11');
assert.equal(receipt.event_name, 'phase_6b.expense_purchase_vendor.vendor.updated');
assert.equal(receipt.phase_6b_vendor_model, 'Phase6BVendor');
assert.equal(receipt.source_seed_id, 'seed_6b_11_vendor_record_authority');
assert.equal(receipt.vendor_record_ref, 'vendor_001');
assert.equal(receipt.vendor_legal_name, 'Northwind Stationery Private Limited');
assert.equal(receipt.vendor_display_name, 'Northwind Stationery Private Limited');
assert.equal(receipt.vendor_identity_anchor_type, 'ORGANIZATION');
assert.equal(receipt.default_currency_code, 'USD');
assert.equal(receipt.vendor_record_state, 'ACTIVE');
assert.equal(receipt.evidence_count, 2);
assert.equal(receipt.activation_lifecycle_required, true);
assert.equal(receipt.approval_capability_gated, true);
assert.equal(receipt.global_identity_owned, false);
assert.equal(receipt.global_identity_written, false);
assert.equal(receipt.vendor_payment_performed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.gl_posting_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.vendor_record_digest.length, 64);

const personVendor = authorizeVendorRecord({
  ...baseInput,
  vendor_record_ref: 'vendor_person_001',
  vendor_legal_name: 'Ayesha Vendor',
  vendor_display_name: 'Ayesha Services',
  vendor_identity_anchor_type: 'PERSON',
  vendor_identity_graph_ref: 'identity_graph_person_vendor_001',
  vendor_record_state: 'UNDER_REVIEW',
});
assert.equal(personVendor.vendor_display_name, 'Ayesha Services');
assert.equal(personVendor.vendor_identity_anchor_type, 'PERSON');
assert.equal(personVendor.vendor_record_state, 'UNDER_REVIEW');

assert.throws(() => authorizeVendorRecord({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_record_ref: '' }), /vendor_record_ref is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_legal_name: '' }), /vendor_legal_name is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_display_name: '' }), /vendor_display_name is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_identity_anchor_type: 'ACCOUNT' as never }), /vendor_identity_anchor_type is not supported/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_identity_graph_ref: '' }), /vendor_identity_graph_ref is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, onboarding_workflow_ref: '' }), /onboarding_workflow_ref is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, payment_terms_ref: '' }), /payment_terms_ref is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, default_currency_code: 'US' }), /default_currency_code must be a three-letter/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_record_state: 'PAID' as never }), /vendor_record_state is not supported/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_evidence_refs: [] }), /vendor_evidence_refs must include at least one/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_evidence_refs: ['evidence_a', 'evidence_a'] }), /vendor_evidence_refs must not contain duplicates/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_evidence_refs: [' '] }), /vendor_evidence_refs\[0\] is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, updated_by_user_id: '' }), /updated_by_user_id is required/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, updated_at: 'not-a-date' }), /updated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, global_identity_write_requested: true }), /must reference, not write, global identity/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, vendor_payment_requested: true }), /must not execute vendor payments/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, gl_posting_requested: true }), /must not post to general ledger/);
assert.throws(() => authorizeVendorRecord({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-081 vendor record authority service test passed.');
