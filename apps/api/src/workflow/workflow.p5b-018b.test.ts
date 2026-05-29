import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { WorkflowService } from './workflow.service';

type RegistryModel = {
  owner_module: string;
  tenant_scoped: boolean;
  organization_id_required: boolean;
  rls_required: boolean;
  audit_required: boolean;
};

type GeneratedEntity = {
  model_name: string;
  owner_module: string;
  tenant_scoped: boolean;
  organization_id_required: boolean;
  fields: Array<{ field_name: string; type: string; is_relation: boolean; relation_model?: string }>;
  indexes: Array<{ fields: string[]; is_unique: boolean }>;
  unique_constraints: Array<{ fields: string[] }>;
};

const schema = readFileSync('../../prisma/schema.prisma', 'utf8');
const metadata = JSON.parse(readFileSync('../../prisma/entity-registry.metadata.json', 'utf8')) as {
  models: Record<string, RegistryModel>;
};
const generatedRegistry = JSON.parse(readFileSync('../../generated/entity-registry.generated.json', 'utf8')) as {
  entities: GeneratedEntity[];
};

function generatedEntity(modelName: string): GeneratedEntity {
  const entity = generatedRegistry.entities.find((item) => item.model_name === modelName);
  assert.ok(entity, `${modelName} must exist in generated entity registry`);
  return entity;
}

function testWorkflowServiceExposesPersistenceBaselineDecision() {
  const service = new WorkflowService();
  const baseline = service.workflowPersistenceModelBaseline();

  assert.equal(baseline.owner_module, 'core.workflow');
  assert.deepEqual(baseline.models, ['WorkflowDefinition', 'WorkflowInstance', 'WorkflowStepInstance']);
  assert.equal(baseline.tenant_scoped, true);
  assert.equal(baseline.organization_id_required, true);
  assert.deepEqual(baseline.definition_unique_by, ['organization_id', 'workflow_key', 'version']);
  assert.equal(baseline.instance_links_definition, true);
  assert.equal(baseline.step_links_instance, true);
  assert.equal(baseline.gatekeeper_outcome_supported_on_steps, true);
}

function testPrismaSchemaDeclaresWorkflowBaselineModels() {
  for (const modelName of ['WorkflowDefinition', 'WorkflowInstance', 'WorkflowStepInstance']) {
    assert.equal(schema.includes(`model ${modelName} {`), true);
  }

  assert.match(schema, /workflow_key\s+String/);
  assert.match(schema, /version\s+String/);
  assert.match(schema, /status\s+String/);
  assert.match(schema, /definition_json\s+Json/);
  assert.match(schema, /workflow_definition\s+WorkflowDefinition/);
  assert.match(schema, /workflow_instance\s+WorkflowInstance/);
  assert.match(schema, /gatekeeper_outcome\s+GatekeeperDecisionOutcome\?/);
  assert.match(schema, /@@unique\(\[organization_id, workflow_key, version\]\)/);
  assert.match(schema, /@@unique\(\[organization_id, workflow_instance_id, step_key\]\)/);
}

function testRegistryMetadataMarksWorkflowModelsTenantScoped() {
  for (const modelName of ['WorkflowDefinition', 'WorkflowInstance', 'WorkflowStepInstance']) {
    const model = metadata.models[modelName];
    assert.ok(model, `${modelName} metadata must exist`);
    assert.equal(model.owner_module, 'core.workflow');
    assert.equal(model.tenant_scoped, true);
    assert.equal(model.organization_id_required, true);
    assert.equal(model.rls_required, true);
    assert.equal(model.audit_required, true);
  }
}

function testGeneratedRegistryReflectsWorkflowModelsAndRelations() {
  const definition = generatedEntity('WorkflowDefinition');
  const instance = generatedEntity('WorkflowInstance');
  const step = generatedEntity('WorkflowStepInstance');

  assert.equal(definition.owner_module, 'core.workflow');
  assert.equal(instance.owner_module, 'core.workflow');
  assert.equal(step.owner_module, 'core.workflow');
  assert.equal(definition.tenant_scoped, true);
  assert.equal(instance.organization_id_required, true);
  assert.equal(step.organization_id_required, true);

  assert.ok(definition.fields.some((field) => field.field_name === 'organization_id'));
  assert.ok(instance.fields.some((field) => field.field_name === 'workflow_definition_id'));
  assert.ok(step.fields.some((field) => field.field_name === 'workflow_instance_id'));
  assert.ok(step.fields.some((field) => field.field_name === 'gatekeeper_outcome' && field.type === 'GatekeeperDecisionOutcome'));

  assert.ok(definition.unique_constraints.some((constraint) => constraint.fields.join(',') === 'organization_id,workflow_key,version'));
  assert.ok(instance.unique_constraints.some((constraint) => constraint.fields.join(',') === 'organization_id,id'));
  assert.ok(step.unique_constraints.some((constraint) => constraint.fields.join(',') === 'organization_id,workflow_instance_id,step_key'));
}

function run() {
  testWorkflowServiceExposesPersistenceBaselineDecision();
  testPrismaSchemaDeclaresWorkflowBaselineModels();
  testRegistryMetadataMarksWorkflowModelsTenantScoped();
  testGeneratedRegistryReflectsWorkflowModelsAndRelations();

  console.log('P5B-018b workflow persistence/model baseline tests passed.');
}

run();
