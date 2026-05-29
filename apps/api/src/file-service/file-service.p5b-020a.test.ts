import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import { FileService, type FileDocumentMetadataInput } from './file-service.service';

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
  '../../prisma/migrations/20260529050000_p5b020a_file_document_metadata/migration.sql',
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

function validMetadataInput(overrides?: Partial<FileDocumentMetadataInput>): FileDocumentMetadataInput {
  return {
    organization_id: 'org-020a',
    file_key: 'file_020a_contract',
    storage_key: 'org-020a/core-file-service/file_020a_contract.pdf',
    owner_module: 'core.workflow',
    owner_entity_type: 'workflow.instance',
    owner_entity_id: 'workflow-020a',
    display_name: 'Platform evidence contract',
    mime_type: 'application/pdf',
    byte_size: 4096,
    checksum_sha256: 'a'.repeat(64),
    classification: 'restricted',
    retention_policy: 'per_file_document_policy',
    access_policy: {
      capability_key: 'platform.file.read',
      tenant_scoped: true,
    },
    storage_provider: 's3-compatible',
    status: 'active',
    created_by_user_id: 'actor-020a',
    ...overrides,
  };
}

function testPrismaSchemaDeclaresFileDocumentMetadataModel() {
  const model = modelBlock('FileDocumentMetadata');

  for (const field of [
    'organization_id',
    'file_key',
    'storage_key',
    'owner_module',
    'display_name',
    'mime_type',
    'byte_size',
    'classification',
    'retention_policy',
    'access_policy',
    'storage_provider',
    'status',
    'created_at',
  ]) {
    assert.match(model, new RegExp(`\\b${field}\\b`));
  }

  assert.match(model, /@@unique\(\[organization_id, file_key\]\)/);
  assert.match(model, /@@unique\(\[organization_id, storage_key\]\)/);
  assert.match(model, /@@index\(\[organization_id, owner_module, created_at\]\)/);
  assert.match(model, /@@index\(\[organization_id, classification, created_at\]\)/);
  assert.match(model, /organization\s+Organization\s+@relation/);
}

function testMetadataAndGeneratedRegistryCoverFileDocumentMetadata() {
  const entry = metadata.models.FileDocumentMetadata;
  const entity = registryEntity('FileDocumentMetadata');

  assert.equal(entry.owner_module, 'core.file');
  assert.equal(entry.tenant_scoped, true);
  assert.equal(entry.organization_id_required, true);
  assert.equal(entry.audit_required, true);
  assert.equal(entity.owner_module, 'core.file');
  assert.equal(entity.tenant_scoped, true);
  assert.equal(entity.organization_id_field, 'organization_id');
  assert.ok(entity.fields.some((field) => field.field_name === 'storage_key'));
  assert.ok(entity.fields.some((field) => field.field_name === 'access_policy'));
  assert.ok(entity.unique_constraints.some((constraint) => constraint.fields.join(',') === 'organization_id,file_key'));
  assert.ok(entity.indexes.some((index) => index.fields.join(',') === 'organization_id,owner_module,created_at'));
}

function testMigrationIsAdditiveTenantScopedAndCredentialFree() {
  assert.match(migrationSource, /CREATE TABLE "FileDocumentMetadata"/);
  assert.match(migrationSource, /"organization_id" TEXT NOT NULL/);
  assert.match(migrationSource, /"storage_key" TEXT NOT NULL/);
  assert.match(migrationSource, /"access_policy" JSONB NOT NULL/);
  assert.match(migrationSource, /"classification" TEXT NOT NULL/);
  assert.match(migrationSource, /CREATE UNIQUE INDEX "FileDocumentMetadata_organization_id_file_key_key"/);
  assert.match(migrationSource, /CREATE INDEX "FileDocumentMetadata_organization_id_owner_module_creat_idx"/);
  assert.doesNotMatch(migrationSource, /\b(DROP|TRUNCATE|DELETE FROM|DROP COLUMN)\b/i);
  assert.doesNotMatch(migrationSource, /access_key|secret|password|private_key|token/i);
}

function testFileServiceBaselineAndInputValidation() {
  const service = new FileService();
  const baseline = service.fileDocumentMetadataModelBaseline();
  const result = service.validateMetadataInput(validMetadataInput());

  assert.equal(baseline.model_name, 'FileDocumentMetadata');
  assert.equal(baseline.owner_module, 'core.file');
  assert.equal(baseline.tenant_scoped, true);
  assert.equal(baseline.organization_id_required, true);
  assert.equal(baseline.storage_credentials_exposed, false);
  assert.equal(baseline.classification_required, true);
  assert.equal(baseline.retention_required, true);
  assert.equal(baseline.access_policy_required, true);
  assert.equal(result.valid, true);
  assert.equal(result.tenant_scoped, true);
  assert.equal(result.storage_key_abstracted, true);
  assert.equal(result.storage_credentials_exposed, false);
  assert.deepEqual(result.errors, []);
}

function testFileServiceRejectsUnsafeMetadataInputs() {
  const service = new FileService();

  assert.throws(() => service.assertMetadataInput(validMetadataInput({ organization_id: ' ' })), BadRequestException);
  assert.throws(() => service.assertMetadataInput(validMetadataInput({ byte_size: -1 })), BadRequestException);
  assert.throws(() => service.assertMetadataInput(validMetadataInput({ access_policy: [] as never })), BadRequestException);
  assert.throws(
    () => service.assertMetadataInput(validMetadataInput({ storage_key: 'secret-access-key-value' })),
    BadRequestException,
  );
  assert.throws(
    () => service.assertMetadataInput(validMetadataInput({ storage_provider: 's3-secret-provider' })),
    BadRequestException,
  );
}

function run() {
  testPrismaSchemaDeclaresFileDocumentMetadataModel();
  testMetadataAndGeneratedRegistryCoverFileDocumentMetadata();
  testMigrationIsAdditiveTenantScopedAndCredentialFree();
  testFileServiceBaselineAndInputValidation();
  testFileServiceRejectsUnsafeMetadataInputs();

  console.log('P5B-020a File/document metadata model tests passed.');
}

run();
