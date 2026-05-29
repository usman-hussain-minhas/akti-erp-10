import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import { SearchService, type SearchIndexTargetKey } from './search.service';

const docSource = readFileSync(
  '../../docs/process/AKTI_ERP_Phase_5B1_Search_Scope_Contract_v1.md',
  'utf8',
);

function testSearchBaselineTargetsOnlyWorkflowSurfaces() {
  const baseline = new SearchService().searchSchemaIndexBaseline();

  assert.equal(baseline.engine, 'postgresql_fts');
  assert.equal(baseline.external_search_provider, 'deferred');
  assert.equal(baseline.semantic_vector_population, 'deferred');
  assert.deepEqual(
    baseline.targets.map((target) => target.target_key),
    ['workflow_definition', 'workflow_instance'],
  );
  assert.deepEqual(
    baseline.targets.map((target) => target.model_name),
    ['WorkflowDefinition', 'WorkflowInstance'],
  );
  assert.equal(baseline.targets.every((target) => target.tenant_scoped), true);
  assert.equal(baseline.targets.every((target) => target.capability_filter_required), true);
  assert.equal(baseline.targets.every((target) => target.uses_business_module_data === false), true);
}

function testSearchPlanRejectsOutOfScopeTargets() {
  const service = new SearchService();
  const outOfScopeTargets = [
    'lead_record',
    'crm_record',
    'file_document',
    'notification',
    'finance_ledger',
  ];

  for (const target of outOfScopeTargets) {
    assert.throws(
      () =>
        service.buildTenantCapabilitySearchPlan({
          organization_id: 'org-019',
          actor_user_id: 'actor-019',
          capability_keys: ['platform.search.query'],
          query: 'workflow',
          target_keys: [target as SearchIndexTargetKey],
        }),
      BadRequestException,
      `${target} must remain out of Phase 5B1 search scope`,
    );
  }
}

function testSearchResponsePreservesTenantCapabilityGate() {
  const response = new SearchService().search({
    organization_id: 'org-019',
    actor_user_id: 'actor-019',
    capability_keys: ['platform.search.query'],
    query: 'approval',
  });

  assert.equal(response.capability.required, 'platform.search.query');
  assert.deepEqual(response.capability.target_capability_filter, ['platform.search.query']);
  assert.equal(response.tenant_context.organization_id, 'org-019');
  assert.equal(response.tenant_context.actor_user_id, 'actor-019');
  assert.equal(response.query_plan.tenant_filter_required, true);
  assert.equal(response.query_plan.capability_filter_required, true);
  assert.deepEqual(response.request.target_keys, ['workflow_definition', 'workflow_instance']);
  assert.deepEqual(response.items, []);
}

function testSearchScopeContractDocumentsNonScope() {
  assert.match(docSource, /WorkflowDefinition/);
  assert.match(docSource, /WorkflowInstance/);
  assert.match(docSource, /CRM \/ Lead Desk records/);
  assert.match(docSource, /files or documents/);
  assert.match(docSource, /notifications/);
  assert.match(docSource, /future business modules/);
  assert.match(docSource, /cross-tenant records/);
}

testSearchBaselineTargetsOnlyWorkflowSurfaces();
testSearchPlanRejectsOutOfScopeTargets();
testSearchResponsePreservesTenantCapabilityGate();
testSearchScopeContractDocumentsNonScope();

console.log('P5B1-019 search scope contract tests passed.');
