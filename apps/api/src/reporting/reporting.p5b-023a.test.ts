import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import { buildEventEnvelope } from '../platform-observability/event-outbox.service';
import { ReportingService } from './reporting.service';

type EntityRegistry = {
  entities: Array<{
    model_name: string;
    owner_module: string;
    tenant_scoped: boolean;
    organization_id_field: string | null;
    fields: Array<{ field_name: string; is_relation: boolean }>;
    indexes: Array<{ fields: string[]; is_unique: boolean }>;
    unique_constraints: Array<{ fields: string[] }>;
  }>;
};

const schemaSource = readFileSync('../../prisma/schema.prisma', 'utf8');
const metadata = JSON.parse(readFileSync('../../prisma/entity-registry.metadata.json', 'utf8')) as {
  models: Record<string, { owner_module: string; tenant_scoped: boolean; organization_id_required: boolean; audit_required: boolean }>;
};
const generatedRegistry = JSON.parse(readFileSync('../../generated/entity-registry.generated.json', 'utf8')) as EntityRegistry;
const migrationSource = readFileSync(
  '../../prisma/migrations/20260529060000_p5b023a_read_model_event_consumer/migration.sql',
  'utf8',
);

function modelBlock(modelName: string): string {
  const start = schemaSource.indexOf(`model ${modelName} {`);
  assert.notEqual(start, -1, `${modelName} model exists`);
  const nextModel = schemaSource.indexOf('\nmodel ', start + 1);
  return schemaSource.slice(start, nextModel === -1 ? undefined : nextModel);
}

function registryEntity(modelName: string) {
  const entity = generatedRegistry.entities.find((item) => item.model_name === modelName);
  assert.ok(entity, `${modelName} exists in generated registry`);
  return entity;
}

function eventEnvelope() {
  return buildEventEnvelope({
    organization_id: 'org-023a',
    event_type: 'workflow.instance.updated',
    idempotency_key: 'event-023a-workflow-instance-updated',
    source_module: 'core.workflow',
    occurred_at: new Date('2026-05-29T03:00:00.000Z'),
    subject: {
      entity_type: 'WorkflowInstance',
      entity_id: 'workflow-instance-023a',
    },
    payload: {
      workflow_key: 'platform.approval_flow',
      current_state: 'review_requested',
    },
    compliance: {
      privacy_class: 'confidential',
      retention_class: 'audit',
      redaction_policy: 'standard',
      audit_required: true,
      replay_allowed: true,
    },
    context: {
      actor_user_id: 'actor-023a',
      correlation_id: 'corr-023a',
      request_id: 'req-023a',
      workflow_key: 'platform.approval_flow',
      integration_ref: null,
    },
  });
}

function testPrismaSchemaDeclaresReadModelEntryAndCursor() {
  const entry = modelBlock('ReadModelEntry');
  const cursor = modelBlock('ReadModelCursor');

  for (const field of [
    'organization_id',
    'read_model_key',
    'source_event_id',
    'source_event_type',
    'source_event_version',
    'source_event_occurred_at',
    'source_event_cursor',
    'payload',
    'updated_at',
  ]) {
    assert.match(entry, new RegExp(`\\b${field}\\b`));
  }

  for (const field of ['organization_id', 'read_model_key', 'source_module', 'event_type', 'cursor_value', 'updated_at']) {
    assert.match(cursor, new RegExp(`\\b${field}\\b`));
  }

  assert.match(entry, /@@unique\(\[organization_id, read_model_key, source_event_id\]\)/);
  assert.match(cursor, /@@unique\(\[organization_id, read_model_key, source_module, event_type\]\)/);
  assert.match(entry, /organization\s+Organization\s+@relation/);
  assert.match(cursor, /organization\s+Organization\s+@relation/);
}

function testMetadataAndGeneratedRegistryCoverReadModelTables() {
  for (const modelName of ['ReadModelEntry', 'ReadModelCursor']) {
    const entry = metadata.models[modelName];
    const entity = registryEntity(modelName);

    assert.equal(entry.owner_module, 'core.reporting');
    assert.equal(entry.tenant_scoped, true);
    assert.equal(entry.organization_id_required, true);
    assert.equal(entry.audit_required, true);
    assert.equal(entity.owner_module, 'core.reporting');
    assert.equal(entity.tenant_scoped, true);
    assert.equal(entity.organization_id_field, 'organization_id');
    assert.ok(entity.fields.some((field) => field.field_name === 'read_model_key'));
    assert.ok(entity.indexes.some((index) => index.fields.includes('organization_id')));
  }

  assert.ok(
    registryEntity('ReadModelEntry').unique_constraints.some(
      (constraint) => constraint.fields.join(',') === 'organization_id,read_model_key,source_event_id',
    ),
  );
}

function testMigrationIsAdditiveTenantScopedAndReportFree() {
  assert.match(migrationSource, /CREATE TABLE "ReadModelEntry"/);
  assert.match(migrationSource, /CREATE TABLE "ReadModelCursor"/);
  assert.match(migrationSource, /"organization_id" TEXT NOT NULL/);
  assert.match(migrationSource, /CREATE UNIQUE INDEX "ReadModelEntry_organization_id_read_model_key_source_ev_key"/);
  assert.match(migrationSource, /CREATE UNIQUE INDEX "ReadModelCursor_organization_id_read_model_key_source__key"/);
  assert.doesNotMatch(migrationSource, /\b(DROP|TRUNCATE|DELETE FROM|DROP COLUMN)\b/i);
  assert.doesNotMatch(migrationSource, /LeadRecord|Admissions|Finance|HR|business_report/i);
}

function testReportingServiceConsumesEventsIntoReadModelWriteIntent() {
  const projection = new ReportingService().consumeEventForReadModel({
    read_model_key: 'workflow.instance.summary',
    event: eventEnvelope(),
    projection_payload: {
      workflow_key: 'platform.approval_flow',
      current_state: 'review_requested',
    },
  });

  assert.equal(projection.entry.model_name, 'ReadModelEntry');
  assert.equal(projection.cursor.model_name, 'ReadModelCursor');
  assert.equal(projection.entry.organization_id, 'org-023a');
  assert.equal(projection.cursor.organization_id, 'org-023a');
  assert.equal(projection.entry.read_model_key, 'workflow.instance.summary');
  assert.equal(projection.entry.source_event_type, 'workflow.instance.updated');
  assert.equal(projection.entry.source_event_version, '1.0.0');
  assert.equal(projection.entry.subject_type, 'WorkflowInstance');
  assert.equal(projection.entry.subject_id, 'workflow-instance-023a');
  assert.equal(projection.entry.privacy_class, 'confidential');
  assert.equal(projection.entry.retention_class, 'audit');
  assert.equal(projection.entry.direct_cross_module_table_read, false);
  assert.equal(projection.entry.fake_operational_data, false);
  assert.equal(projection.cursor.source_module, 'core.workflow');
  assert.equal(projection.cursor.event_type, 'workflow.instance.updated');
  assert.match(projection.cursor.cursor_value, /^2026-05-29T03:00:00.000Z:/);
  assert.equal(projection.audit.event_type, 'read_model.event.consumed');
  assert.equal(projection.audit.audit_required, true);
  assert.equal(projection.query_contract.route, 'GET /platform/read-models/:key');
  assert.equal(projection.query_contract.implemented_in_this_ticket, false);
}

function testReportingServiceRejectsInvalidReadModelInputs() {
  const service = new ReportingService();

  assert.throws(
    () =>
      service.consumeEventForReadModel({
        read_model_key: '',
        event: eventEnvelope(),
        projection_payload: {},
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.consumeEventForReadModel({
        read_model_key: 'workflow.instance.summary',
        event: eventEnvelope(),
        projection_payload: [] as never,
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.consumeEventForReadModel({
        read_model_key: 'workflow.instance.summary',
        event: {
          ...eventEnvelope(),
          organization_id: '',
        },
        projection_payload: {},
      }),
    BadRequestException,
  );
}

function run() {
  testPrismaSchemaDeclaresReadModelEntryAndCursor();
  testMetadataAndGeneratedRegistryCoverReadModelTables();
  testMigrationIsAdditiveTenantScopedAndReportFree();
  testReportingServiceConsumesEventsIntoReadModelWriteIntent();
  testReportingServiceRejectsInvalidReadModelInputs();

  console.log('P5B-023a Reporting/read-model event consumer tests passed.');
}

run();
