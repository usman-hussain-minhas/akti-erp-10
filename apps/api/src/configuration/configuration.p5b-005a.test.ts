import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ConfigurationService,
  TENANT_CONFIG_SCHEMA_MODEL_BASELINE,
} from './configuration.service';

const schema = readFileSync(resolve(process.cwd(), '../../prisma/schema.prisma'), 'utf8');

function modelBody(modelName: string) {
  const start = schema.indexOf(`model ${modelName} {`);
  assert.notEqual(start, -1, `${modelName} model must exist in Prisma schema`);
  const rest = schema.slice(start);
  const end = rest.indexOf('\n}');
  assert.notEqual(end, -1, `${modelName} model must have a closing brace`);
  return rest.slice(0, end);
}

function testModelDecisionReusesExistingTenantScopedModels() {
  assert.equal(TENANT_CONFIG_SCHEMA_MODEL_BASELINE.decision, 'reuse_existing_models');
  assert.equal(TENANT_CONFIG_SCHEMA_MODEL_BASELINE.setting_model, 'OrganizationSetting');
  assert.equal(TENANT_CONFIG_SCHEMA_MODEL_BASELINE.domain_model, 'OrganizationDomain');
  assert.equal(TENANT_CONFIG_SCHEMA_MODEL_BASELINE.rejected_new_model, 'PlatformTenantConfig');
  assert.equal(schema.includes('model PlatformTenantConfig'), false);
}

function testOrganizationSettingSatisfiesTenantConfigBaseline() {
  const body = modelBody('OrganizationSetting');

  for (const field of ['organization_id String', 'key             String', 'value_json      Json', 'updated_at      DateTime']) {
    assert.ok(body.includes(field), `OrganizationSetting must include ${field}`);
  }

  assert.ok(body.includes('organization    Organization @relation(fields: [organization_id], references: [id])'));
  assert.ok(body.includes('@@unique([organization_id, key])'));
  assert.ok(body.includes('@@index([organization_id])'));
}

function testOrganizationDomainSatisfiesDomainIdentityBaseline() {
  const body = modelBody('OrganizationDomain');

  for (const field of ['organization_id String', 'domain          String       @unique', 'is_primary      Boolean', 'verified_at     DateTime?']) {
    assert.ok(body.includes(field), `OrganizationDomain must include ${field}`);
  }

  assert.ok(body.includes('organization    Organization @relation(fields: [organization_id], references: [id])'));
  assert.ok(body.includes('@@unique([organization_id, domain])'));
  assert.ok(body.includes('@@index([organization_id])'));
  assert.ok(body.includes('@@index([domain])'));
}

function testServiceExposesBaselineDecisionWithoutRuntimeMutation() {
  const service = Object.create(ConfigurationService.prototype) as ConfigurationService;
  const baseline = service.getTenantConfigSchemaModelBaseline();

  assert.deepEqual(baseline, TENANT_CONFIG_SCHEMA_MODEL_BASELINE);
  assert.equal(baseline.tenant_isolation_field, 'organization_id');
  assert.deepEqual(baseline.setting_key_examples, ['portal.mode']);
}

function run() {
  testModelDecisionReusesExistingTenantScopedModels();
  testOrganizationSettingSatisfiesTenantConfigBaseline();
  testOrganizationDomainSatisfiesDomainIdentityBaseline();
  testServiceExposesBaselineDecisionWithoutRuntimeMutation();

  console.log('P5B-005a tenant config schema/model baseline tests passed.');
}

run();
