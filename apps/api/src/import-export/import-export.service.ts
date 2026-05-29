import { BadRequestException, Injectable } from '@nestjs/common';

export type ImportSourceType = 'csv_upload' | 'json_upload' | 'api_stub';
export type ImportRiskClassification = 'low' | 'medium' | 'high';

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

const ALLOWED_IMPORT_SOURCE_TYPES = new Set<ImportSourceType>(['csv_upload', 'json_upload', 'api_stub']);
const ALLOWED_IMPORT_RISK = new Set<ImportRiskClassification>(['low', 'medium', 'high']);
const FORBIDDEN_TARGET_MARKERS = ['lead', 'admission', 'finance', 'hr', 'payroll', 'marketplace', 'golden_module'];

@Injectable()
export class ImportExportService {
  validateImport(input: ImportValidationInput): ImportValidationResult {
    const sourceType = this.importSourceType(input.source_type);
    const riskClassification = this.importRiskClassification(input.risk_classification);
    const targetModel = this.targetModel(input.target_model);
    const sampleRows = this.sampleRows(input.sample_rows);

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

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`import ${field} is required`);
    }

    return input.trim();
  }
}
