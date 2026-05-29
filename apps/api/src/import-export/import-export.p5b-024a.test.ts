import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import { ImportExportService, type ImportValidationInput } from './import-export.service';

const schemaSource = readFileSync('../../prisma/schema.prisma', 'utf8');

function validImport(overrides?: Partial<ImportValidationInput>): ImportValidationInput {
  return {
    organization_id: 'org-024a',
    actor_user_id: 'actor-024a',
    source_module: 'core.workflow',
    import_key: 'workflow.definition.import',
    source_type: 'csv_upload',
    target_model: 'WorkflowDefinition',
    payload_schema_key: 'workflow.definition.import.v1',
    sample_rows: [
      {
        workflow_key: 'platform.approval_flow',
        version: '1.0.0',
      },
    ],
    idempotency_key: 'import-024a',
    risk_classification: 'medium',
    dry_run: true,
    ...overrides,
  };
}

function testImportBaselineUsesStatelessValidationWithoutPersistence() {
  const result = new ImportExportService().validateImport(validImport());

  assert.equal(result.baseline, 'stateless_import_validation');
  assert.equal(result.organization_id, 'org-024a');
  assert.equal(result.actor_user_id, 'actor-024a');
  assert.equal(result.source_module, 'core.workflow');
  assert.equal(result.import_key, 'workflow.definition.import');
  assert.equal(result.source_type, 'csv_upload');
  assert.equal(result.target_model, 'WorkflowDefinition');
  assert.equal(result.payload_schema_key, 'workflow.definition.import.v1');
  assert.equal(result.sample_row_count, 1);
  assert.equal(result.status, 'validated');
  assert.equal(result.persistence_required, false);
  assert.equal(result.schema_model_created, false);
  assert.equal(result.runtime_ingestion_started, false);
  assert.equal(result.business_module_import, false);
  assert.equal(result.gatekeeper.preflight_required, true);
  assert.equal(result.gatekeeper.high_risk_review_required, false);
  assert.equal(result.gatekeeper.capability_key, 'platform.import.validate');
  assert.equal(result.audit.event_type, 'import.validation.completed');
  assert.equal(result.audit.audit_required, true);
}

function testImportBaselineAllowsApprovedSourceTypesAndHighRiskReview() {
  const service = new ImportExportService();

  assert.equal(service.validateImport(validImport({ source_type: 'json_upload' })).source_type, 'json_upload');
  assert.equal(service.validateImport(validImport({ source_type: 'api_stub' })).source_type, 'api_stub');
  assert.equal(service.validateImport(validImport({ risk_classification: 'high' })).gatekeeper.high_risk_review_required, true);
}

function testImportBaselineRejectsUnsafeOrIncompleteInputs() {
  const service = new ImportExportService();

  assert.throws(() => service.validateImport(validImport({ organization_id: '' })), BadRequestException);
  assert.throws(() => service.validateImport(validImport({ source_type: 'live_provider' as ImportValidationInput['source_type'] })), BadRequestException);
  assert.throws(() => service.validateImport(validImport({ target_model: 'LeadRecord' })), BadRequestException);
  assert.throws(() => service.validateImport(validImport({ target_model: 'FinanceLedger' })), BadRequestException);
  assert.throws(() => service.validateImport(validImport({ target_model: 'Golden_Module_Seed' })), BadRequestException);
  assert.throws(() => service.validateImport(validImport({ sample_rows: [] })), BadRequestException);
  assert.throws(() => service.validateImport(validImport({ sample_rows: [[] as never] })), BadRequestException);
  assert.throws(
    () => service.validateImport(validImport({ risk_classification: 'critical' as ImportValidationInput['risk_classification'] })),
    BadRequestException,
  );
}

function testImportJobPersistenceWasNotCreatedForStatelessDecision() {
  assert.equal(schemaSource.includes('model ImportJob'), false);
}

function run() {
  testImportBaselineUsesStatelessValidationWithoutPersistence();
  testImportBaselineAllowsApprovedSourceTypesAndHighRiskReview();
  testImportBaselineRejectsUnsafeOrIncompleteInputs();
  testImportJobPersistenceWasNotCreatedForStatelessDecision();

  console.log('P5B-024a Import service baseline tests passed.');
}

run();
