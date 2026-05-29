import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  ImportExportService,
  type ExportValidationInput,
  type ImportValidationInput,
} from './import-export.service';

function validImport(overrides?: Partial<ImportValidationInput>): ImportValidationInput {
  return {
    organization_id: 'org-024c',
    actor_user_id: 'actor-024c',
    source_module: 'core.workflow',
    import_key: 'workflow.definition.import',
    source_type: 'json_upload',
    target_model: 'WorkflowDefinition',
    payload_schema_key: 'workflow.definition.import.v1',
    sample_rows: [
      {
        workflow_key: 'platform.approval_flow',
      },
    ],
    idempotency_key: 'import-024c',
    risk_classification: 'high',
    dry_run: true,
    ...overrides,
  };
}

function validExport(overrides?: Partial<ExportValidationInput>): ExportValidationInput {
  return {
    organization_id: 'org-024c',
    actor_user_id: 'actor-024c',
    source_module: 'core.reporting',
    export_key: 'workflow.summary.export',
    export_type: 'json_download',
    source_read_model_key: 'workflow.instance.summary',
    payload_schema_key: 'workflow.summary.export.v1',
    requested_fields: ['workflow_key', 'current_state'],
    idempotency_key: 'export-024c',
    risk_classification: 'high',
    dry_run: true,
    ...overrides,
  };
}

function testImportAndExportValidationCarryAuditAndGatekeeperSafetyMetadata() {
  const service = new ImportExportService();
  const importResult = service.validateImport(validImport());
  const exportResult = service.validateExport(validExport());

  assert.equal(importResult.gatekeeper.preflight_required, true);
  assert.equal(importResult.gatekeeper.high_risk_review_required, true);
  assert.equal(importResult.gatekeeper.capability_key, 'platform.import.validate');
  assert.equal(importResult.audit.event_type, 'import.validation.completed');
  assert.equal(importResult.audit.audit_required, true);
  assert.equal(importResult.dry_run_required, true);
  assert.equal(importResult.runtime_ingestion_started, false);

  assert.equal(exportResult.gatekeeper.preflight_required, true);
  assert.equal(exportResult.gatekeeper.high_risk_review_required, true);
  assert.equal(exportResult.gatekeeper.capability_key, 'platform.export.validate');
  assert.equal(exportResult.audit.event_type, 'export.validation.completed');
  assert.equal(exportResult.audit.audit_required, true);
  assert.equal(exportResult.dry_run_required, true);
  assert.equal(exportResult.runtime_export_started, false);
}

function testImportAndExportValidationRejectNonDryRunRuntimeExecution() {
  const service = new ImportExportService();

  assert.throws(() => service.validateImport(validImport({ dry_run: false })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ dry_run: false })), BadRequestException);
}

function testImportAndExportValidationRejectBusinessModuleOrMarketplaceLeakage() {
  const service = new ImportExportService();

  assert.throws(() => service.validateImport(validImport({ target_model: 'AdmissionsApplication' })), BadRequestException);
  assert.throws(() => service.validateImport(validImport({ target_model: 'PayrollRun' })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ source_read_model_key: 'hr.employee.summary' })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ source_read_model_key: 'marketplace.module.summary' })), BadRequestException);
}

function testImportAndExportValidationKeepPersistenceConditionalAndUncreated() {
  const service = new ImportExportService();
  const importResult = service.validateImport(validImport({ risk_classification: 'low' }));
  const exportResult = service.validateExport(validExport({ risk_classification: 'low' }));

  assert.equal(importResult.persistence_required, false);
  assert.equal(importResult.schema_model_created, false);
  assert.equal(importResult.business_module_import, false);
  assert.equal(importResult.gatekeeper.high_risk_review_required, false);

  assert.equal(exportResult.persistence_required, false);
  assert.equal(exportResult.schema_model_created, false);
  assert.equal(exportResult.business_report_export, false);
  assert.equal(exportResult.gatekeeper.high_risk_review_required, false);
}

function testImportAndExportValidationRejectMalformedSafetyInputs() {
  const service = new ImportExportService();

  assert.throws(() => service.validateImport(validImport({ sample_rows: [] })), BadRequestException);
  assert.throws(() => service.validateImport(validImport({ idempotency_key: '' })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ requested_fields: [] })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ requested_fields: ['field', 'field'] })), BadRequestException);
}

function run() {
  testImportAndExportValidationCarryAuditAndGatekeeperSafetyMetadata();
  testImportAndExportValidationRejectNonDryRunRuntimeExecution();
  testImportAndExportValidationRejectBusinessModuleOrMarketplaceLeakage();
  testImportAndExportValidationKeepPersistenceConditionalAndUncreated();
  testImportAndExportValidationRejectMalformedSafetyInputs();

  console.log('P5B-024c Import/export audit and safety tests passed.');
}

run();
