import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import { SearchService, type SearchIndexTargetKey } from './search.service';

type EntityRegistry = {
  entities: Array<{
    model_name: string;
    tenant_scoped: boolean;
    organization_id_field: string | null;
    fields: Array<{ field_name: string; type: string; is_relation: boolean }>;
  }>;
};

const schemaSource = readFileSync('../../prisma/schema.prisma', 'utf8');
const migrationSource = readFileSync(
  '../../prisma/migrations/20260529040000_p5b019a_search_fts_baseline/migration.sql',
  'utf8',
);
const generatedRegistry = JSON.parse(readFileSync('../../generated/entity-registry.generated.json', 'utf8')) as EntityRegistry;

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

function testPrismaSchemaDeclaresWorkflowFtsSearchVectors() {
  const workflowDefinition = modelBlock('WorkflowDefinition');
  const workflowInstance = modelBlock('WorkflowInstance');

  assert.match(workflowDefinition, /search_vector\s+Unsupported\("tsvector"\)\?/);
  assert.match(workflowInstance, /search_vector\s+Unsupported\("tsvector"\)\?/);
}

function testMigrationAddsGeneratedTsvectorColumnsAndGinIndexes() {
  assert.match(migrationSource, /ALTER TABLE "WorkflowDefinition"\s+ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS/);
  assert.match(migrationSource, /ALTER TABLE "WorkflowInstance"\s+ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS/);
  assert.match(
    migrationSource,
    /CREATE INDEX "WorkflowDefinition_search_vector_idx" ON "WorkflowDefinition" USING GIN \("search_vector"\)/,
  );
  assert.match(
    migrationSource,
    /CREATE INDEX "WorkflowInstance_search_vector_idx" ON "WorkflowInstance" USING GIN \("search_vector"\)/,
  );
  assert.doesNotMatch(migrationSource, /\b(DROP|TRUNCATE|DELETE FROM|DROP COLUMN)\b/i);
  assert.doesNotMatch(migrationSource, /LeadRecord|LeadStatusHistory|LeadAssignmentHistory/);
}

function testGeneratedRegistryIncludesSearchVectorFields() {
  for (const modelName of ['WorkflowDefinition', 'WorkflowInstance']) {
    const entity = registryEntity(modelName);
    const searchVector = entity.fields.find((field) => field.field_name === 'search_vector');

    assert.equal(entity.tenant_scoped, true);
    assert.equal(entity.organization_id_field, 'organization_id');
    assert.ok(searchVector, `${modelName} search_vector field is in generated registry`);
    assert.equal(searchVector?.type, '[object Object]');
    assert.equal(searchVector?.is_relation, false);
  }
}

function testSearchBaselineTargetsTenantScopedWorkflowTablesOnly() {
  const baseline = new SearchService().searchSchemaIndexBaseline();

  assert.equal(baseline.engine, 'postgresql_fts');
  assert.equal(baseline.query_function, 'plainto_tsquery');
  assert.equal(baseline.rank_function, 'ts_rank');
  assert.equal(baseline.external_search_provider, 'deferred');
  assert.equal(baseline.semantic_vector_population, 'deferred');
  assert.deepEqual(
    baseline.targets.map((target) => target.model_name),
    ['WorkflowDefinition', 'WorkflowInstance'],
  );

  for (const target of baseline.targets) {
    assert.equal(target.owner_module, 'core.workflow');
    assert.equal(target.tenant_scoped, true);
    assert.equal(target.organization_id_filter_required, true);
    assert.equal(target.capability_filter_required, true);
    assert.equal(target.tsvector_column, 'search_vector');
    assert.equal(target.uses_business_module_data, false);
    assert.match(target.gin_index_name, /^Workflow(?:Definition|Instance)_search_vector_idx$/);
    assert.equal(target.query_fields.length > 0, true);
  }
}

function testSearchQueryPlanRequiresTenantCapabilityAndApprovedTargets() {
  const service = new SearchService();
  const plan = service.buildTenantCapabilitySearchPlan({
    organization_id: ' org-search ',
    actor_user_id: ' actor-search ',
    capability_keys: ['platform.workflow.read'],
    query: ' approval flow ',
    target_keys: ['workflow_definition'],
  });

  assert.equal(plan.organization_id, 'org-search');
  assert.equal(plan.actor_user_id, 'actor-search');
  assert.deepEqual(plan.capability_keys, ['platform.workflow.read']);
  assert.equal(plan.query, 'approval flow');
  assert.equal(plan.tenant_filter_required, true);
  assert.equal(plan.capability_filter_required, true);
  assert.deepEqual(
    plan.targets.map((target) => target.target_key),
    ['workflow_definition'],
  );

  assert.throws(
    () =>
      service.buildTenantCapabilitySearchPlan({
        organization_id: '',
        actor_user_id: 'actor-search',
        capability_keys: ['platform.workflow.read'],
        query: 'approval',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.buildTenantCapabilitySearchPlan({
        organization_id: 'org-search',
        actor_user_id: 'actor-search',
        capability_keys: [],
        query: 'approval',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.buildTenantCapabilitySearchPlan({
        organization_id: 'org-search',
        actor_user_id: 'actor-search',
        capability_keys: ['platform.workflow.read', 'platform.workflow.read'],
        query: 'approval',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.buildTenantCapabilitySearchPlan({
        organization_id: 'org-search',
        actor_user_id: 'actor-search',
        capability_keys: ['platform.workflow.read'],
        query: 'a',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.buildTenantCapabilitySearchPlan({
        organization_id: 'org-search',
        actor_user_id: 'actor-search',
        capability_keys: ['platform.workflow.read'],
        query: 'approval',
        target_keys: ['unknown_target' as SearchIndexTargetKey],
      }),
    BadRequestException,
  );
}

function run() {
  testPrismaSchemaDeclaresWorkflowFtsSearchVectors();
  testMigrationAddsGeneratedTsvectorColumnsAndGinIndexes();
  testGeneratedRegistryIncludesSearchVectorFields();
  testSearchBaselineTargetsTenantScopedWorkflowTablesOnly();
  testSearchQueryPlanRequiresTenantCapabilityAndApprovedTargets();

  console.log('P5B-019a PostgreSQL FTS search schema/index baseline tests passed.');
}

run();
