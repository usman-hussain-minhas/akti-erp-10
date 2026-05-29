import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import { ImportExportService, type ExportValidationInput } from './import-export.service';

const schemaSource = readFileSync('../../prisma/schema.prisma', 'utf8');

function validExport(overrides?: Partial<ExportValidationInput>): ExportValidationInput {
  return {
    organization_id: 'org-024b',
    actor_user_id: 'actor-024b',
    source_module: 'core.reporting',
    export_key: 'workflow.summary.export',
    export_type: 'csv_download',
    source_read_model_key: 'workflow.instance.summary',
    payload_schema_key: 'workflow.summary.export.v1',
    requested_fields: ['workflow_key', 'current_state', 'updated_at'],
    idempotency_key: 'export-024b',
    risk_classification: 'medium',
    dry_run: true,
    ...overrides,
  };
}

function testExportBaselineUsesStatelessValidationWithoutPersistence() {
  const result = new ImportExportService().validateExport(validExport());

  assert.equal(result.baseline, 'stateless_export_validation');
  assert.equal(result.organization_id, 'org-024b');
  assert.equal(result.actor_user_id, 'actor-024b');
  assert.equal(result.source_module, 'core.reporting');
  assert.equal(result.export_key, 'workflow.summary.export');
  assert.equal(result.export_type, 'csv_download');
  assert.equal(result.source_read_model_key, 'workflow.instance.summary');
  assert.equal(result.payload_schema_key, 'workflow.summary.export.v1');
  assert.deepEqual(result.requested_fields, ['workflow_key', 'current_state', 'updated_at']);
  assert.equal(result.status, 'validated');
  assert.equal(result.persistence_required, false);
  assert.equal(result.schema_model_created, false);
  assert.equal(result.runtime_export_started, false);
  assert.equal(result.business_report_export, false);
  assert.equal(result.gatekeeper.preflight_required, true);
  assert.equal(result.gatekeeper.high_risk_review_required, false);
  assert.equal(result.gatekeeper.capability_key, 'platform.export.validate');
  assert.equal(result.audit.event_type, 'export.validation.completed');
  assert.equal(result.audit.audit_required, true);
}

function testExportBaselineAllowsApprovedExportTypesAndHighRiskReview() {
  const service = new ImportExportService();

  assert.equal(service.validateExport(validExport({ export_type: 'json_download' })).export_type, 'json_download');
  assert.equal(service.validateExport(validExport({ export_type: 'api_stub' })).export_type, 'api_stub');
  assert.equal(service.validateExport(validExport({ risk_classification: 'high' })).gatekeeper.high_risk_review_required, true);
}

function testExportBaselineRejectsUnsafeOrIncompleteInputs() {
  const service = new ImportExportService();

  assert.throws(() => service.validateExport(validExport({ organization_id: '' })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ export_type: 's3_live_provider' as ExportValidationInput['export_type'] })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ source_read_model_key: 'lead.pipeline.summary' })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ source_read_model_key: 'finance.ledger.summary' })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ source_read_model_key: 'marketplace.module.summary' })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ requested_fields: [] })), BadRequestException);
  assert.throws(() => service.validateExport(validExport({ requested_fields: ['workflow_key', 'workflow_key'] })), BadRequestException);
  assert.throws(
    () => service.validateExport(validExport({ risk_classification: 'critical' as ExportValidationInput['risk_classification'] })),
    BadRequestException,
  );
}

function testExportJobPersistenceWasNotCreatedForStatelessDecision() {
  assert.equal(schemaSource.includes('model ExportJob'), false);
}

function run() {
  testExportBaselineUsesStatelessValidationWithoutPersistence();
  testExportBaselineAllowsApprovedExportTypesAndHighRiskReview();
  testExportBaselineRejectsUnsafeOrIncompleteInputs();
  testExportJobPersistenceWasNotCreatedForStatelessDecision();

  console.log('P5B-024b Export service baseline tests passed.');
}

run();
