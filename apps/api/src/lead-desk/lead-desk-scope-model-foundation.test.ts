import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function loadSchemaSource() {
  return readFileSync('prisma/schema.prisma', 'utf8');
}

function testLeadRecordSupportsOwnUnitScope() {
  const schema = loadSchemaSource();

  assert.equal(schema.includes('organization_unit_id String?'), true);
  assert.equal(
    schema.includes('organization_unit OrganizationUnit? @relation(fields: [organization_id, organization_unit_id], references: [organization_id, id])'),
    true,
  );
}

function testLeadRecordCrossOrgUnitAttachmentIsPreventedByCompositeRelation() {
  const schema = loadSchemaSource();

  assert.equal(
    schema.includes('organization_unit OrganizationUnit? @relation(fields: [organization_id, organization_unit_id], references: [organization_id, id])'),
    true,
  );
}

function testLeadRecordHasScopeFilterIndexes() {
  const schema = loadSchemaSource();

  assert.equal(schema.includes('@@index([organization_id, organization_unit_id, created_at])'), true);
  assert.equal(schema.includes('@@index([organization_id, organization_unit_id, status, created_at])'), true);
  assert.equal(
    schema.includes('@@index([organization_id, organization_unit_id, assigned_user_id, created_at])'),
    true,
  );
}

function run() {
  testLeadRecordSupportsOwnUnitScope();
  testLeadRecordCrossOrgUnitAttachmentIsPreventedByCompositeRelation();
  testLeadRecordHasScopeFilterIndexes();

  console.log('lead-desk-scope-model-foundation tests passed');
}

run();
