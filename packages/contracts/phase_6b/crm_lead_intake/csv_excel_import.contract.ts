export const PHASE_6B_CSV_EXCEL_IMPORT_SEED_ID = 'seed_6b_04_csv_excel_import' as const;
export const PHASE_6B_CSV_EXCEL_IMPORT_COMPONENT_ID = '6B.04' as const;

export const CSV_EXCEL_IMPORT_EVENT = 'phase_6b.crm_lead_intake.csv_excel_import.recorded' as const;

export type CsvExcelImportFileType = 'CSV' | 'XLS' | 'XLSX';
export type LeadOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';

export type CsvExcelImportLeadRowInput = {
  row_number: number;
  lead_record_id: string;
  person_identity_graph_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  field_values: Record<string, string>;
  opt_out_observation?: LeadOptOutObservation;
};

export type CsvExcelImportInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  access_gatekeeper_decision_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  intake_mapping_id: string;
  import_batch_id: string;
  source_file_name: string;
  source_file_type: CsvExcelImportFileType;
  uploaded_by_user_id: string;
  imported_at: string;
  rows: readonly CsvExcelImportLeadRowInput[];
  direct_provider_messaging_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type CsvExcelImportLeadRowReceipt = {
  row_number: number;
  lead_record_id: string;
  person_identity_graph_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  normalized_field_count: number;
  normalized_fields: Readonly<Record<string, string>>;
  opt_out_observation: LeadOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
};

export type CsvExcelImportReceipt = {
  seed_id: typeof PHASE_6B_CSV_EXCEL_IMPORT_SEED_ID;
  component_id: typeof PHASE_6B_CSV_EXCEL_IMPORT_COMPONENT_ID;
  event_name: typeof CSV_EXCEL_IMPORT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  access_gatekeeper_decision_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  intake_mapping_id: string;
  source_system: 'CSV_EXCEL_IMPORT';
  import_batch_id: string;
  source_file_name: string;
  source_file_type: CsvExcelImportFileType;
  uploaded_by_user_id: string;
  imported_at: string;
  imported_row_count: number;
  imported_rows: readonly CsvExcelImportLeadRowReceipt[];
  direct_provider_messaging_allowed: false;
  provider_callback_processing_allowed: false;
};

const FILE_TYPES: readonly CsvExcelImportFileType[] = ['CSV', 'XLS', 'XLSX'] as const;
const OPT_OUT_OBSERVATIONS: readonly LeadOptOutObservation[] = ['NOT_OBSERVED', 'OBSERVED_OPTED_OUT', 'OBSERVED_OPTED_IN'] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for CSV/Excel import.`);
  }
  return value.trim();
}

function requireFileType(value: CsvExcelImportFileType): CsvExcelImportFileType {
  if (!FILE_TYPES.includes(value)) {
    throw new Error('source_file_type is not supported for CSV/Excel import.');
  }
  return value;
}

function normalizeOptOutObservation(value: LeadOptOutObservation | undefined): LeadOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for CSV/Excel import.');
  }
  return value;
}

function requireImportedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'imported_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('imported_at must be a valid ISO-compatible timestamp for CSV/Excel import.');
  }
  return normalized;
}

function requireRowNumber(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('row_number must be a positive integer for CSV/Excel import.');
  }
  return value;
}

function normalizeFields(fields: Record<string, string>, rowNumber: number): Readonly<Record<string, string>> {
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`field_values must be an object for CSV/Excel import row ${rowNumber}.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `field_values key for row ${rowNumber}`);
    const normalizedValue = requireNonEmpty(value, `field_values.${normalizedKey} for row ${rowNumber}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (Object.keys(normalized).length === 0) {
    throw new Error(`field_values must contain at least one mapped field for CSV/Excel import row ${rowNumber}.`);
  }
  return Object.freeze(normalized);
}

function normalizeRow(row: CsvExcelImportLeadRowInput): CsvExcelImportLeadRowReceipt {
  const rowNumber = requireRowNumber(row.row_number);
  const normalizedFields = normalizeFields(row.field_values, rowNumber);
  const optOutObservation = normalizeOptOutObservation(row.opt_out_observation);

  return {
    row_number: rowNumber,
    lead_record_id: requireNonEmpty(row.lead_record_id, `lead_record_id for row ${rowNumber}`),
    person_identity_graph_id: requireNonEmpty(row.person_identity_graph_id, `person_identity_graph_id for row ${rowNumber}`),
    consent_basis_id: requireNonEmpty(row.consent_basis_id, `consent_basis_id for row ${rowNumber}`),
    assignment_state_id: requireNonEmpty(row.assignment_state_id, `assignment_state_id for row ${rowNumber}`),
    normalized_field_count: Object.keys(normalizedFields).length,
    normalized_fields: normalizedFields,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
  };
}

export function recordCsvExcelImport(input: CsvExcelImportInput): CsvExcelImportReceipt {
  if (input.direct_provider_messaging_requested === true) {
    throw new Error('CSV/Excel import must not perform direct provider messaging.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('CSV/Excel import FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('CSV/Excel import must not include credential material.');
  }
  if (!Array.isArray(input.rows) || input.rows.length === 0) {
    throw new Error('rows must contain at least one CSV/Excel lead row.');
  }

  const importedRows = input.rows.map(normalizeRow);
  const rowNumbers = new Set<number>();
  for (const row of importedRows) {
    if (rowNumbers.has(row.row_number)) {
      throw new Error(`row_number ${row.row_number} is duplicated in CSV/Excel import.`);
    }
    rowNumbers.add(row.row_number);
  }

  return {
    seed_id: PHASE_6B_CSV_EXCEL_IMPORT_SEED_ID,
    component_id: PHASE_6B_CSV_EXCEL_IMPORT_COMPONENT_ID,
    event_name: CSV_EXCEL_IMPORT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    access_gatekeeper_decision_id: requireNonEmpty(input.access_gatekeeper_decision_id, 'access_gatekeeper_decision_id'),
    visual_workflow_definition_id: requireNonEmpty(input.visual_workflow_definition_id, 'visual_workflow_definition_id'),
    product_record_authority_id: requireNonEmpty(input.product_record_authority_id, 'product_record_authority_id'),
    intake_mapping_id: requireNonEmpty(input.intake_mapping_id, 'intake_mapping_id'),
    source_system: 'CSV_EXCEL_IMPORT',
    import_batch_id: requireNonEmpty(input.import_batch_id, 'import_batch_id'),
    source_file_name: requireNonEmpty(input.source_file_name, 'source_file_name'),
    source_file_type: requireFileType(input.source_file_type),
    uploaded_by_user_id: requireNonEmpty(input.uploaded_by_user_id, 'uploaded_by_user_id'),
    imported_at: requireImportedAt(input.imported_at),
    imported_row_count: importedRows.length,
    imported_rows: importedRows,
    direct_provider_messaging_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
