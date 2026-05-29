import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { ImportExportService } from '../import-export/import-export.service';
import { buildEventEnvelope } from '../platform-observability/event-outbox.service';
import { ReportingService, type ReportingReadModelEntryWrite } from './reporting.service';

function entryFor(
  organizationId: string,
  readModelKey = 'workflow.instance.summary',
  idempotencyKey = `event-026g-${organizationId}-${readModelKey}`,
): ReportingReadModelEntryWrite {
  return new ReportingService().consumeEventForReadModel({
    read_model_key: readModelKey,
    event: buildEventEnvelope({
      organization_id: organizationId,
      event_type: 'workflow.instance.updated',
      idempotency_key: idempotencyKey,
      source_module: 'core.workflow',
      occurred_at: new Date('2026-05-29T08:00:00.000Z'),
      subject: {
        entity_type: 'WorkflowInstance',
        entity_id: `workflow-instance-${organizationId}`,
      },
      payload: {
        workflow_key: 'platform.review',
      },
    }),
    projection_payload: {
      workflow_key: 'platform.review',
      current_state: 'pending_review',
    },
  }).entry;
}

function testReportingFixtureExcludesCrossTenantAndOtherReadModelEntries() {
  const service = new ReportingService();
  const visibleEntry = entryFor('org-026g', 'workflow.instance.summary', 'event-026g-visible');
  const crossTenantEntry = entryFor('org-foreign', 'workflow.instance.summary', 'event-026g-cross-tenant');
  const otherReadModelEntry = entryFor('org-026g', 'workflow.instance.detail', 'event-026g-other-read-model');
  const result = service.runTenantIsolationFixture({
    organization_id: 'org-026g',
    actor_user_id: 'actor-026g',
    read_model_key: 'workflow.instance.summary',
    capability_keys: ['platform.reporting.read'],
    entries: [visibleEntry, crossTenantEntry, otherReadModelEntry],
  });

  assert.deepEqual(result.visible_source_event_ids, [visibleEntry.source_event_id]);
  assert.deepEqual(result.excluded_cross_tenant_source_event_ids, [crossTenantEntry.source_event_id]);
  assert.deepEqual(result.excluded_other_read_model_source_event_ids, [otherReadModelEntry.source_event_id]);
  assert.equal(result.tenant_isolation_enforced, true);
  assert.equal(result.read_model_filter_enforced, true);
  assert.equal(result.direct_cross_module_table_read, false);
  assert.equal(result.fake_operational_data, false);
}

function testReportingFixtureRejectsUnsafeProjectionEntries() {
  const service = new ReportingService();
  const entry = entryFor('org-026g');

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026g',
        actor_user_id: 'actor-026g',
        read_model_key: 'workflow.instance.summary',
        capability_keys: ['platform.reporting.read'],
        entries: [{ ...entry, direct_cross_module_table_read: true as false }],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026g',
        actor_user_id: 'actor-026g',
        read_model_key: 'workflow.instance.summary',
        capability_keys: ['platform.reporting.read'],
        entries: [],
      }),
    BadRequestException,
  );
}

function testImportExportValidationRemainsTenantScopedAndStateless() {
  const service = new ImportExportService();
  const importResult = service.validateImport({
    organization_id: 'org-026g',
    actor_user_id: 'actor-026g',
    source_module: 'core.workflow',
    import_key: 'workflow.definition.import',
    source_type: 'json_upload',
    target_model: 'WorkflowDefinition',
    payload_schema_key: 'workflow.definition.import.v1',
    sample_rows: [{ workflow_key: 'platform.review' }],
    idempotency_key: 'import-026g',
    risk_classification: 'medium',
    dry_run: true,
  });
  const exportResult = service.validateExport({
    organization_id: 'org-026g',
    actor_user_id: 'actor-026g',
    source_module: 'core.reporting',
    export_key: 'workflow.summary.export',
    export_type: 'json_download',
    source_read_model_key: 'workflow.instance.summary',
    payload_schema_key: 'workflow.summary.export.v1',
    requested_fields: ['workflow_key', 'current_state'],
    idempotency_key: 'export-026g',
    risk_classification: 'medium',
    dry_run: true,
  });

  assert.equal(importResult.organization_id, 'org-026g');
  assert.equal(importResult.runtime_ingestion_started, false);
  assert.equal(importResult.business_module_import, false);
  assert.equal(exportResult.organization_id, 'org-026g');
  assert.equal(exportResult.runtime_export_started, false);
  assert.equal(exportResult.business_report_export, false);
}

function testImportExportRejectsBusinessOrRuntimeLeakage() {
  const service = new ImportExportService();

  assert.throws(
    () =>
      service.validateImport({
        organization_id: 'org-026g',
        actor_user_id: 'actor-026g',
        source_module: 'core.workflow',
        import_key: 'business.import',
        source_type: 'json_upload',
        target_model: 'FinanceLedger',
        payload_schema_key: 'finance.ledger.import.v1',
        sample_rows: [{ ledger_key: 'blocked' }],
        idempotency_key: 'import-blocked-026g',
        risk_classification: 'medium',
        dry_run: true,
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.validateExport({
        organization_id: 'org-026g',
        actor_user_id: 'actor-026g',
        source_module: 'core.reporting',
        export_key: 'business.export',
        export_type: 'json_download',
        source_read_model_key: 'hr.employee.summary',
        payload_schema_key: 'hr.employee.export.v1',
        requested_fields: ['employee_key'],
        idempotency_key: 'export-blocked-026g',
        risk_classification: 'medium',
        dry_run: true,
      }),
    BadRequestException,
  );
}

function run() {
  testReportingFixtureExcludesCrossTenantAndOtherReadModelEntries();
  testReportingFixtureRejectsUnsafeProjectionEntries();
  testImportExportValidationRemainsTenantScopedAndStateless();
  testImportExportRejectsBusinessOrRuntimeLeakage();

  console.log('P5B-026g reporting/read-model/import-export negative tests passed.');
}

run();
