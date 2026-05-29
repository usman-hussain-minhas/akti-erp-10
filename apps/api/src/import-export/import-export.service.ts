import { BadRequestException, Injectable } from '@nestjs/common';

export type ImportSourceType = 'csv_upload' | 'json_upload' | 'api_stub';
export type ImportRiskClassification = 'low' | 'medium' | 'high';
export type ExportTargetType = 'csv_download' | 'json_download' | 'api_stub';
export type ExportRiskClassification = 'low' | 'medium' | 'high';

export type ImportValidationInput = {
  organization_id: string;
  actor_user_id: string;
  source_module: string;
  import_key: string;
  source_type: ImportSourceType;
  target_model: string;
  payload_schema_key: string;
  sample_rows: Array<Record<string, unknown>>;
  idempotency_key: string;
  risk_classification: ImportRiskClassification;
  dry_run: boolean;
};

export type ImportValidationResult = {
  baseline: 'stateless_import_validation';
  organization_id: string;
  actor_user_id: string;
  source_module: string;
  import_key: string;
  source_type: ImportSourceType;
  target_model: string;
  payload_schema_key: string;
  sample_row_count: number;
  idempotency_key: string;
  risk_classification: ImportRiskClassification;
  status: 'validated';
  persistence_required: false;
  schema_model_created: false;
  runtime_ingestion_started: false;
  business_module_import: false;
  dry_run_required: true;
  gatekeeper: {
    preflight_required: true;
    high_risk_review_required: boolean;
    capability_key: 'platform.import.validate';
  };
  audit: {
    event_type: 'import.validation.completed';
    audit_required: true;
  };
};

export type ExportValidationInput = {
  organization_id: string;
  actor_user_id: string;
  source_module: string;
  export_key: string;
  export_type: ExportTargetType;
  source_read_model_key: string;
  payload_schema_key: string;
  requested_fields: string[];
  idempotency_key: string;
  risk_classification: ExportRiskClassification;
  dry_run: boolean;
};

export type ExportValidationResult = {
  baseline: 'stateless_export_validation';
  organization_id: string;
  actor_user_id: string;
  source_module: string;
  export_key: string;
  export_type: ExportTargetType;
  source_read_model_key: string;
  payload_schema_key: string;
  requested_fields: string[];
  idempotency_key: string;
  risk_classification: ExportRiskClassification;
  status: 'validated';
  persistence_required: false;
  schema_model_created: false;
  runtime_export_started: false;
  business_report_export: false;
  dry_run_required: true;
  gatekeeper: {
    preflight_required: true;
    high_risk_review_required: boolean;
    capability_key: 'platform.export.validate';
  };
  audit: {
    event_type: 'export.validation.completed';
    audit_required: true;
  };
};

const ALLOWED_IMPORT_SOURCE_TYPES = new Set<ImportSourceType>(['csv_upload', 'json_upload', 'api_stub']);
const ALLOWED_IMPORT_RISK = new Set<ImportRiskClassification>(['low', 'medium', 'high']);
const ALLOWED_EXPORT_TARGET_TYPES = new Set<ExportTargetType>(['csv_download', 'json_download', 'api_stub']);
const ALLOWED_EXPORT_RISK = new Set<ExportRiskClassification>(['low', 'medium', 'high']);
const FORBIDDEN_TARGET_MARKERS = ['lead', 'admission', 'finance', 'hr', 'payroll', 'marketplace', 'golden_module'];

@Injectable()
export class ImportExportService {
  validateImport(input: ImportValidationInput): ImportValidationResult {
    const sourceType = this.importSourceType(input.source_type);
    const riskClassification = this.importRiskClassification(input.risk_classification);
    const targetModel = this.targetModel(input.target_model);
    const sampleRows = this.sampleRows(input.sample_rows);
    this.requireDryRun(input.dry_run, 'import');

    return {
      baseline: 'stateless_import_validation',
      organization_id: this.required(input.organization_id, 'organization_id'),
      actor_user_id: this.required(input.actor_user_id, 'actor_user_id'),
      source_module: this.required(input.source_module, 'source_module'),
      import_key: this.required(input.import_key, 'import_key'),
      source_type: sourceType,
      target_model: targetModel,
      payload_schema_key: this.required(input.payload_schema_key, 'payload_schema_key'),
      sample_row_count: sampleRows.length,
      idempotency_key: this.required(input.idempotency_key, 'idempotency_key'),
      risk_classification: riskClassification,
      status: 'validated',
      persistence_required: false,
      schema_model_created: false,
      runtime_ingestion_started: false,
      business_module_import: false,
      dry_run_required: true,
      gatekeeper: {
        preflight_required: true,
        high_risk_review_required: riskClassification === 'high',
        capability_key: 'platform.import.validate',
      },
      audit: {
        event_type: 'import.validation.completed',
        audit_required: true,
      },
    };
  }

  validateExport(input: ExportValidationInput): ExportValidationResult {
    const exportType = this.exportTargetType(input.export_type);
    const riskClassification = this.exportRiskClassification(input.risk_classification);
    const sourceReadModelKey = this.sourceReadModelKey(input.source_read_model_key);
    const requestedFields = this.requestedFields(input.requested_fields);
    this.requireDryRun(input.dry_run, 'export');

    return {
      baseline: 'stateless_export_validation',
      organization_id: this.required(input.organization_id, 'organization_id'),
      actor_user_id: this.required(input.actor_user_id, 'actor_user_id'),
      source_module: this.required(input.source_module, 'source_module'),
      export_key: this.required(input.export_key, 'export_key'),
      export_type: exportType,
      source_read_model_key: sourceReadModelKey,
      payload_schema_key: this.required(input.payload_schema_key, 'payload_schema_key'),
      requested_fields: requestedFields,
      idempotency_key: this.required(input.idempotency_key, 'idempotency_key'),
      risk_classification: riskClassification,
      status: 'validated',
      persistence_required: false,
      schema_model_created: false,
      runtime_export_started: false,
      business_report_export: false,
      dry_run_required: true,
      gatekeeper: {
        preflight_required: true,
        high_risk_review_required: riskClassification === 'high',
        capability_key: 'platform.export.validate',
      },
      audit: {
        event_type: 'export.validation.completed',
        audit_required: true,
      },
    };
  }

  private importSourceType(input: ImportSourceType): ImportSourceType {
    const value = this.required(input, 'source_type') as ImportSourceType;
    if (!ALLOWED_IMPORT_SOURCE_TYPES.has(value)) {
      throw new BadRequestException('import source_type is invalid');
    }

    return value;
  }

  private importRiskClassification(input: ImportRiskClassification): ImportRiskClassification {
    const value = this.required(input, 'risk_classification') as ImportRiskClassification;
    if (!ALLOWED_IMPORT_RISK.has(value)) {
      throw new BadRequestException('import risk_classification is invalid');
    }

    return value;
  }

  private exportTargetType(input: ExportTargetType): ExportTargetType {
    const value = this.required(input, 'export_type') as ExportTargetType;
    if (!ALLOWED_EXPORT_TARGET_TYPES.has(value)) {
      throw new BadRequestException('export export_type is invalid');
    }

    return value;
  }

  private exportRiskClassification(input: ExportRiskClassification): ExportRiskClassification {
    const value = this.required(input, 'risk_classification') as ExportRiskClassification;
    if (!ALLOWED_EXPORT_RISK.has(value)) {
      throw new BadRequestException('export risk_classification is invalid');
    }

    return value;
  }

  private sourceReadModelKey(input: string): string {
    const value = this.required(input, 'source_read_model_key');
    const normalized = value.toLowerCase();
    if (FORBIDDEN_TARGET_MARKERS.some((marker) => normalized.includes(marker))) {
      throw new BadRequestException('export source_read_model_key cannot target Phase 6 business or marketplace data');
    }

    return value;
  }

  private requestedFields(input: string[]): string[] {
    if (!Array.isArray(input) || input.length === 0 || input.length > 100) {
      throw new BadRequestException('export requested_fields must include between 1 and 100 fields');
    }

    const fields = input.map((field) => this.required(field, 'requested_fields'));
    if (new Set(fields).size !== fields.length) {
      throw new BadRequestException('export requested_fields must be unique');
    }

    return fields;
  }

  private targetModel(input: string): string {
    const value = this.required(input, 'target_model');
    const normalized = value.toLowerCase();
    if (FORBIDDEN_TARGET_MARKERS.some((marker) => normalized.includes(marker))) {
      throw new BadRequestException('import target_model cannot be a Phase 6 business or marketplace model');
    }

    return value;
  }

  private sampleRows(input: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    if (!Array.isArray(input) || input.length === 0 || input.length > 100) {
      throw new BadRequestException('import sample_rows must include between 1 and 100 rows');
    }

    for (const row of input) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        throw new BadRequestException('import sample_rows must contain objects');
      }
    }

    return input;
  }

  private requireDryRun(input: boolean, prefix: 'import' | 'export'): void {
    if (input !== true) {
      throw new BadRequestException(`${prefix} baseline validation must run as dry_run`);
    }
  }

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`import ${field} is required`);
    }

    return input.trim();
  }
}
