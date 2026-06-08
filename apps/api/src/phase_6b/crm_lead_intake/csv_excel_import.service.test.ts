import assert from 'node:assert/strict';
import { recordCsvExcelImport, type CsvExcelImportInput } from './csv_excel_import.service';

const baseInput: CsvExcelImportInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  access_gatekeeper_decision_id: 'gatekeeper_allow_001',
  visual_workflow_definition_id: 'workflow_csv_excel_import',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_csv_excel_to_lead',
  import_batch_id: 'csv_excel_import_batch_001',
  source_file_name: 'admissions-leads.csv',
  source_file_type: 'CSV' as const,
  uploaded_by_user_id: 'user_import_operator',
  imported_at: '2026-06-07T16:05:00.000Z',
  rows: [
    {
      row_number: 1,
      lead_record_id: 'lead_record_import_001',
      person_identity_graph_id: 'person_graph_import_001',
      consent_basis_id: 'consent_basis_import_upload',
      assignment_state_id: 'assignment_state_new',
      field_values: {
        full_name: 'Student Seven',
        phone: '+924444444444',
      },
    },
    {
      row_number: 2,
      lead_record_id: 'lead_record_import_002',
      person_identity_graph_id: 'person_graph_import_002',
      consent_basis_id: 'consent_basis_import_upload',
      assignment_state_id: 'assignment_state_new',
      field_values: {
        full_name: 'Student Eight',
        email: 'student8@example.test',
      },
      opt_out_observation: 'OBSERVED_OPTED_OUT' as const,
    },
  ],
};

const receipt = recordCsvExcelImport(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_csv_excel_import');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.csv_excel_import.recorded');
assert.equal(receipt.source_system, 'CSV_EXCEL_IMPORT');
assert.equal(receipt.imported_row_count, 2);
assert.equal(receipt.imported_rows[0].conditional_opt_out_dependency_observed, false);
assert.equal(receipt.imported_rows[1].conditional_opt_out_dependency_observed, true);
assert.equal(receipt.imported_rows[0].normalized_field_count, 2);
assert.deepEqual(receipt.imported_rows[0].normalized_fields, {
  full_name: 'Student Seven',
  phone: '+924444444444',
});
assert.equal(receipt.direct_provider_messaging_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const excelReceipt = recordCsvExcelImport({ ...baseInput, source_file_type: 'XLSX', source_file_name: 'admissions-leads.xlsx' });
assert.equal(excelReceipt.source_file_type, 'XLSX');

assert.throws(
  () => recordCsvExcelImport({ ...baseInput, organization_id: ' ' }),
  /organization_id is required/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, access_gatekeeper_decision_id: '' }),
  /access_gatekeeper_decision_id is required/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, visual_workflow_definition_id: '' }),
  /visual_workflow_definition_id is required/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, source_file_type: 'PDF' as never }),
  /source_file_type is not supported/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, imported_at: 'not-a-date' }),
  /imported_at must be a valid ISO-compatible timestamp/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, rows: [] }),
  /rows must contain at least one CSV\/Excel lead row/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, rows: [{ ...baseInput.rows[0], row_number: 0 }] }),
  /row_number must be a positive integer/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, rows: [{ ...baseInput.rows[0], lead_record_id: '' }] }),
  /lead_record_id for row 1 is required/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, rows: [{ ...baseInput.rows[0], field_values: {} }] }),
  /field_values must contain at least one mapped field for CSV\/Excel import row 1/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, rows: [{ ...baseInput.rows[0], field_values: { ' ': 'value' } }] }),
  /field_values key for row 1 is required/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, rows: [{ ...baseInput.rows[0], field_values: { full_name: ' ' } }] }),
  /field_values.full_name for row 1 is required/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, rows: [{ ...baseInput.rows[0] }, { ...baseInput.rows[1], row_number: 1 }] }),
  /row_number 1 is duplicated/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, rows: [{ ...baseInput.rows[0], opt_out_observation: 'SEND_ALLOWED' as never }] }),
  /opt_out_observation is not supported/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, direct_provider_messaging_requested: true }),
  /must not perform direct provider messaging/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, provider_callback_processing_requested: true }),
  /does not process provider callbacks/,
);
assert.throws(
  () => recordCsvExcelImport({ ...baseInput, credential_material_included: true }),
  /must not include credential material/,
);

console.log('P6B-FFET-031 csv excel import service test passed.');
