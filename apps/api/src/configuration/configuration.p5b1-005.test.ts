import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schema = readFileSync(resolve(process.cwd(), '../../prisma/schema.prisma'), 'utf8');
const migration = readFileSync(
  resolve(process.cwd(), '../../prisma/migrations/20260529070000_p5b1_005_organization_short_name/migration.sql'),
  'utf8',
);
const registry = JSON.parse(readFileSync(resolve(process.cwd(), '../../generated/entity-registry.generated.json'), 'utf8')) as {
  entities: Array<{
    model_name: string;
    fields: Array<{
      field_name: string;
      type: string;
      is_required: boolean;
      is_relation: boolean;
    }>;
  }>;
};

function modelBody(modelName: string) {
  const start = schema.indexOf(`model ${modelName} {`);
  assert.notEqual(start, -1, `${modelName} model must exist in Prisma schema`);
  const rest = schema.slice(start);
  const end = rest.indexOf('\n}');
  assert.notEqual(end, -1, `${modelName} model must have a closing brace`);
  return rest.slice(0, end);
}

function testOrganizationShortNameIsNullable() {
  const organization = modelBody('Organization');

  assert.match(organization, /display_name\s+String/);
  assert.match(organization, /short_name\s+String\?/);
}

function testMigrationIsAdditiveOnly() {
  assert.match(migration, /ALTER TABLE "Organization" ADD COLUMN "short_name" TEXT;/);
  assert.doesNotMatch(migration, /DROP TABLE|DROP COLUMN|ALTER COLUMN|SET NOT NULL/i);
}

function testGeneratedRegistryContainsShortName() {
  const organization = registry.entities.find((entity) => entity.model_name === 'Organization');
  assert.ok(organization, 'Organization entity must exist in generated registry');

  const shortName = organization.fields.find((field) => field.field_name === 'short_name');
  assert.ok(shortName, 'Organization.short_name must exist in generated registry');
  assert.equal(shortName.type, 'String');
  assert.equal(shortName.is_required, false);
  assert.equal(shortName.is_relation, false);
}

function run() {
  testOrganizationShortNameIsNullable();
  testMigrationIsAdditiveOnly();
  testGeneratedRegistryContainsShortName();

  console.log('P5B1-005 organization short_name schema substrate tests passed.');
}

run();
