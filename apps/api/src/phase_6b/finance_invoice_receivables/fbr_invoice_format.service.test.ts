import assert from 'node:assert/strict';
import { renderFbrInvoiceFormat, type FbrInvoiceFormatInput } from './fbr_invoice_format.service';

const baseInput: FbrInvoiceFormatInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_finance_invoice_receivables',
  format_profile_id: 'fbr_format_profile_001',
  fbr_format_version: 'tenant_configured_fbr_format_v1',
  invoice_record_ref: 'invoice_001',
  product_record_authority_ref: 'product_record_authority_001',
  product_price_history_ref: 'product_price_history_001',
  pricing_table_effective_date_ref: 'pricing_table_effective_date_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_001',
  field_mappings: [
    {
      mapping_id: 'mapping_invoice_number',
      source_field_ref: 'invoice_number',
      fbr_field_name: 'InvoiceNumber',
      value_type: 'STRING',
      required: true,
      evidence_label: 'invoice_number_format_evidence',
    },
    {
      mapping_id: 'mapping_invoice_total',
      source_field_ref: 'invoice_total_minor',
      fbr_field_name: 'InvoiceTotalMinor',
      value_type: 'NUMBER',
      required: true,
      evidence_label: 'invoice_total_format_evidence',
    },
    {
      mapping_id: 'mapping_tax_registered',
      source_field_ref: 'tax_registered',
      fbr_field_name: 'TaxRegistered',
      value_type: 'BOOLEAN',
      required: false,
      evidence_label: 'tax_registered_format_evidence',
    },
  ],
  invoice_values: [
    { source_field_ref: 'invoice_number', value: 'INV-2026-0001' },
    { source_field_ref: 'invoice_total_minor', value: 35000 },
    { source_field_ref: 'tax_registered', value: true },
  ],
  rendered_by_user_id: 'user_finance_owner_001',
  rendered_at: '2026-06-08T23:25:00.000Z',
};

const receipt = renderFbrInvoiceFormat(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_09_fbr_invoice_format');
assert.equal(receipt.component_id, '6B.09');
assert.equal(receipt.event_name, 'phase_6b.finance_invoice_receivables.fbr_invoice_format.rendered');
assert.equal(receipt.required_field_count, 2);
assert.equal(receipt.payload_field_count, 3);
assert.deepEqual(receipt.payload_fields.map((field) => field.fbr_field_name), ['InvoiceNumber', 'InvoiceTotalMinor', 'TaxRegistered']);
assert.match(receipt.format_evidence_digest, /^[a-f0-9]{64}$/);
assert.equal(receipt.api_submission_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.tax_law_validation_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const repeatReceipt = renderFbrInvoiceFormat(baseInput);
assert.equal(repeatReceipt.format_evidence_digest, receipt.format_evidence_digest);

const optionalSkippedReceipt = renderFbrInvoiceFormat({
  ...baseInput,
  invoice_values: baseInput.invoice_values.filter((value) => value.source_field_ref !== 'tax_registered'),
});
assert.equal(optionalSkippedReceipt.payload_field_count, 2);

assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, format_profile_id: '' }), /format_profile_id is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, fbr_format_version: '' }), /fbr_format_version is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, invoice_record_ref: '' }), /invoice_record_ref is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, product_record_authority_ref: '' }), /product_record_authority_ref is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, product_price_history_ref: '' }), /product_price_history_ref is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [] }), /field_mappings must include at least one mapping/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [{ ...baseInput.field_mappings[0]!, mapping_id: '' }] }), /field_mappings.mapping_id is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [{ ...baseInput.field_mappings[0]!, source_field_ref: '' }] }), /field_mappings.source_field_ref is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [{ ...baseInput.field_mappings[0]!, fbr_field_name: '' }] }), /field_mappings.fbr_field_name is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [{ ...baseInput.field_mappings[0]!, value_type: 'DATE' as never }] }), /value_type is not supported/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [{ ...baseInput.field_mappings[0]!, evidence_label: '' }] }), /field_mappings.evidence_label is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [{ ...baseInput.field_mappings[0]!, mapping_id: 'duplicate' }, { ...baseInput.field_mappings[1]!, mapping_id: 'duplicate' }] }), /field_mappings must not repeat mapping_id/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [{ ...baseInput.field_mappings[0]!, source_field_ref: 'duplicate' }, { ...baseInput.field_mappings[1]!, source_field_ref: 'duplicate' }] }), /field_mappings must not repeat source_field_ref/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, field_mappings: [{ ...baseInput.field_mappings[0]!, fbr_field_name: 'Duplicate' }, { ...baseInput.field_mappings[1]!, fbr_field_name: 'Duplicate' }] }), /field_mappings must not repeat fbr_field_name/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, invoice_values: [] }), /invoice_values must include at least one value/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, invoice_values: [{ source_field_ref: '', value: 'x' }] }), /invoice_values.source_field_ref is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, invoice_values: [{ source_field_ref: 'invoice_number', value: {} as never }] }), /invoice_values.value must be a string, number, or boolean/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, invoice_values: [{ source_field_ref: 'duplicate', value: 'a' }, { source_field_ref: 'duplicate', value: 'b' }] }), /invoice_values must not repeat source_field_ref/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, invoice_values: baseInput.invoice_values.filter((value) => value.source_field_ref !== 'invoice_number') }), /required FBR invoice format mapping is missing an invoice value/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, invoice_values: [{ source_field_ref: 'invoice_number', value: 123 }, ...baseInput.invoice_values.slice(1)] }), /invoice_values.value type must match/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, rendered_by_user_id: '' }), /rendered_by_user_id is required/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, rendered_at: 'not-a-date' }), /rendered_at must be a valid ISO-compatible timestamp/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, api_submission_requested: true }), /must not submit to FBR APIs/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, tax_law_validation_requested: true }), /must not claim tax law validation/);
assert.throws(() => renderFbrInvoiceFormat({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-067 FBR invoice format service test passed.');
