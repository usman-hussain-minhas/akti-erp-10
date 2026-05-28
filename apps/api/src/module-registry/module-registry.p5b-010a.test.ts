import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ModuleRegistryService } from './module-registry.service';
import type { PrismaService } from '../prisma/prisma.service';

const schema = readFileSync('../../prisma/schema.prisma', 'utf8');
const metadata = JSON.parse(readFileSync('../../prisma/entity-registry.metadata.json', 'utf8')) as {
  models: Record<string, Record<string, unknown>>;
};
const generatedRegistry = JSON.parse(readFileSync('../../generated/entity-registry.generated.json', 'utf8')) as {
  entities: Array<{ model_name: string; owner_module: string; tenant_scoped: boolean }>;
};

function testPrismaSchemaDefinesModuleLifecycleEventBaseline() {
  assert.match(schema, /model ModuleRegistryEntry\s+\{[\s\S]*lifecycle_events\s+ModuleLifecycleEvent\[\]/);
  assert.match(schema, /model ModuleRegistryEntry\s+\{[\s\S]*@@index\(\[status\]\)/);
  assert.match(schema, /model ModuleRegistryEntry\s+\{[\s\S]*@@index\(\[version\]\)/);
  assert.match(schema, /model ModuleRegistryEntry\s+\{[\s\S]*@@index\(\[status, version\]\)/);

  assert.match(schema, /model ModuleLifecycleEvent\s+\{/);
  assert.match(schema, /organization_id\s+String\?/);
  assert.match(schema, /module_key\s+String/);
  assert.match(schema, /from_status\s+String\?/);
  assert.match(schema, /to_status\s+String/);
  assert.match(schema, /action_key\s+String/);
  assert.match(schema, /actor_user_id\s+String\?/);
  assert.match(schema, /metadata\s+Json/);
  assert.match(schema, /created_at\s+DateTime\s+@default\(now\(\)\)/);
  assert.match(schema, /@@index\(\[module_key, to_status, created_at\]\)/);
  assert.match(schema, /@@index\(\[organization_id, module_key, created_at\]\)/);
}

function testRegistryMetadataOwnsLifecycleEventAsFoundryPlatformModel() {
  assert.equal(metadata.models.ModuleRegistryEntry.owner_module, 'core.registry');
  assert.equal(metadata.models.ModuleRegistryEntry.tenant_scoped, false);
  assert.equal(metadata.models.ModuleLifecycleEvent.owner_module, 'core.foundry');
  assert.equal(metadata.models.ModuleLifecycleEvent.tenant_scoped, true);
  assert.equal(metadata.models.ModuleLifecycleEvent.organization_id_required, true);
  assert.equal(metadata.models.ModuleLifecycleEvent.audit_required, true);
}

function testGeneratedRegistryIncludesLifecycleEvent() {
  const lifecycleEvent = generatedRegistry.entities.find((entity) => entity.model_name === 'ModuleLifecycleEvent');

  assert.ok(lifecycleEvent);
  assert.equal(lifecycleEvent.owner_module, 'core.foundry');
  assert.equal(lifecycleEvent.tenant_scoped, true);
}

function testModuleRegistryServiceReportsSchemaBaseline() {
  const service = new ModuleRegistryService({} as PrismaService);
  const baseline = service.getSchemaBaseline();

  assert.equal(baseline.registry_model, 'ModuleRegistryEntry');
  assert.equal(baseline.lifecycle_event_model, 'ModuleLifecycleEvent');
  assert.equal(baseline.registry_scope, 'global');
  assert.equal(baseline.lifecycle_event_scope, 'global_or_tenant_scoped');
  assert.equal(baseline.lifecycle_event_organization_id_required_when_tenant_scoped, true);
  assert.deepEqual(baseline.registry_indexes, ['module_key', 'status', 'version', 'status+version']);
  assert.ok(baseline.lifecycle_event_indexes.includes('organization_id+module_key+created_at'));
}

function run() {
  testPrismaSchemaDefinesModuleLifecycleEventBaseline();
  testRegistryMetadataOwnsLifecycleEventAsFoundryPlatformModel();
  testGeneratedRegistryIncludesLifecycleEvent();
  testModuleRegistryServiceReportsSchemaBaseline();

  console.log('P5B-010a module registry schema/model baseline tests passed.');
}

run();
