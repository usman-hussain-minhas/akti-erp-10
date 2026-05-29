import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { SearchService, type SearchFixtureRecord } from '../search/search.service';
import { WorkflowService, type WorkflowTenantIsolationFixtureRecord } from './workflow.service';

function workflowRecords(): WorkflowTenantIsolationFixtureRecord[] {
  return [
    {
      workflow_id: 'workflow-visible-026e',
      organization_id: 'org-026e',
      workflow_key: 'platform.review',
      current_state: 'pending_review',
    },
    {
      workflow_id: 'workflow-cross-tenant-026e',
      organization_id: 'org-foreign',
      workflow_key: 'platform.review',
      current_state: 'pending_review',
    },
  ];
}

function searchRecords(): SearchFixtureRecord[] {
  return [
    {
      record_id: 'search-visible-026e',
      organization_id: 'org-026e',
      target_key: 'workflow_instance',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Workflow approval pending review',
    },
    {
      record_id: 'search-cross-tenant-026e',
      organization_id: 'org-foreign',
      target_key: 'workflow_instance',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Workflow approval pending review',
    },
    {
      record_id: 'search-unauthorized-026e',
      organization_id: 'org-026e',
      target_key: 'workflow_instance',
      capability_key: 'platform.workflow.admin',
      searchable_text: 'Workflow approval pending review',
    },
  ];
}

function testWorkflowFixtureExcludesCrossTenantRecords() {
  const service = new WorkflowService();
  const result = service.runTenantIsolationFixture({
    organization_id: 'org-026e',
    actor_user_id: 'actor-026e',
    records: workflowRecords(),
  });

  assert.deepEqual(result.visible_workflow_ids, ['workflow-visible-026e']);
  assert.deepEqual(result.excluded_cross_tenant_ids, ['workflow-cross-tenant-026e']);
  assert.equal(result.tenant_isolation_enforced, true);
  assert.equal(result.records_examined, workflowRecords().length);
}

function testWorkflowFixtureRejectsMalformedTenantInputs() {
  const service = new WorkflowService();

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: '',
        actor_user_id: 'actor-026e',
        records: workflowRecords(),
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026e',
        actor_user_id: 'actor-026e',
        records: [],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026e',
        actor_user_id: 'actor-026e',
        records: [{ ...workflowRecords()[0], organization_id: '' }],
      }),
    BadRequestException,
  );
}

function testSearchFixtureStillExcludesCrossTenantAndUnauthorizedWorkflowRecords() {
  const service = new SearchService();
  const result = service.runTenantIsolationFixture({
    organization_id: 'org-026e',
    actor_user_id: 'actor-026e',
    capability_keys: ['platform.workflow.read'],
    query: 'approval',
    target_keys: ['workflow_instance'],
    records: searchRecords(),
    latency_samples_ms: [8, 9, 10, 11, 12, 13, 14, 15, 18, 20],
  });

  assert.deepEqual(result.result_ids, ['search-visible-026e']);
  assert.deepEqual(result.excluded_cross_tenant_ids, ['search-cross-tenant-026e']);
  assert.deepEqual(result.excluded_unauthorized_ids, ['search-unauthorized-026e']);
  assert.equal(result.tenant_isolation_enforced, true);
  assert.equal(result.capability_filter_enforced, true);
}

function run() {
  testWorkflowFixtureExcludesCrossTenantRecords();
  testWorkflowFixtureRejectsMalformedTenantInputs();
  testSearchFixtureStillExcludesCrossTenantAndUnauthorizedWorkflowRecords();

  console.log('P5B-026e workflow/search cross-tenant negative tests passed.');
}

run();
