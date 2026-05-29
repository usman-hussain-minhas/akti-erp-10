import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { SearchService, type SearchFixtureRecord, type SearchLoadSimulationBaselineInput } from './search.service';

function fixtureRecords(): SearchFixtureRecord[] {
  return [
    {
      record_id: 'workflow-definition-visible',
      organization_id: 'org-032b',
      target_key: 'workflow_definition',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval workflow definition for load simulation',
    },
    {
      record_id: 'workflow-instance-visible',
      organization_id: 'org-032b',
      target_key: 'workflow_instance',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval workflow instance for load simulation',
    },
    {
      record_id: 'workflow-cross-tenant',
      organization_id: 'org-other',
      target_key: 'workflow_definition',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval workflow from another tenant',
    },
  ];
}

function baseInput(): SearchLoadSimulationBaselineInput {
  return {
    simulation_key: 'p5b-032b-load-simulation',
    fixture_key: 'p5b-032b-search-performance',
    organization_id: 'org-032b',
    actor_user_id: 'actor-032b',
    capability_keys: ['platform.workflow.read'],
    virtual_users: 4,
    iterations_per_user: 5,
    records: fixtureRecords(),
    latency_samples_ms: [6, 7, 8, 9, 10, 12, 15, 18, 21, 24, 31, 36, 42, 55, 66, 77, 91, 110, 129, 144],
    p95_threshold_ms: 200,
    queries: [
      {
        query: 'approval workflow',
        target_keys: ['workflow_definition', 'workflow_instance'],
        expected_result_ids: ['workflow-definition-visible', 'workflow-instance-visible'],
      },
      {
        query: 'definition',
        target_keys: ['workflow_definition'],
        expected_result_ids: ['workflow-definition-visible'],
      },
    ],
  };
}

function testLoadSimulationBaselinePassesWithoutExternalRunner() {
  const service = new SearchService();
  const result = service.runLoadSimulationBaseline(baseInput());

  assert.equal(result.simulation_key, 'p5b-032b-load-simulation');
  assert.equal(result.fixture_key, 'p5b-032b-search-performance');
  assert.equal(result.engine, 'postgresql_fts');
  assert.equal(result.load_model, 'deterministic_fixture');
  assert.equal(result.external_load_runner, 'not_required');
  assert.equal(result.virtual_users, 4);
  assert.equal(result.iterations_per_user, 5);
  assert.equal(result.query_templates, 2);
  assert.equal(result.total_query_executions, 40);
  assert.equal(result.p95_ms, 129);
  assert.equal(result.p95_threshold_ms, 200);
  assert.equal(result.p95_passed, true);
  assert.equal(result.expected_results_matched, true);
  assert.equal(result.load_simulation_passed, true);
  assert.equal(result.tenant_isolation_enforced, true);
  assert.equal(result.capability_filter_enforced, true);
  assert.deepEqual(result.slo_alignment, {
    latency_target_ms: 200,
    target_met: true,
  });
}

function testLoadSimulationFailsWhenP95Fails() {
  const service = new SearchService();
  const result = service.runLoadSimulationBaseline({
    ...baseInput(),
    latency_samples_ms: [10, 20, 30, 40, 275],
  });

  assert.equal(result.p95_ms, 275);
  assert.equal(result.p95_passed, false);
  assert.equal(result.load_simulation_passed, false);
  assert.equal(result.slo_alignment.target_met, false);
}

function testLoadSimulationRejectsMalformedLoadInputs() {
  const service = new SearchService();

  assert.throws(() => service.runLoadSimulationBaseline({ ...baseInput(), simulation_key: '' }), BadRequestException);
  assert.throws(() => service.runLoadSimulationBaseline({ ...baseInput(), virtual_users: 0 }), BadRequestException);
  assert.throws(() => service.runLoadSimulationBaseline({ ...baseInput(), iterations_per_user: 0 }), BadRequestException);
  assert.throws(
    () =>
      service.runLoadSimulationBaseline({
        ...baseInput(),
        queries: [],
      }),
    BadRequestException,
  );
}

function run() {
  testLoadSimulationBaselinePassesWithoutExternalRunner();
  testLoadSimulationFailsWhenP95Fails();
  testLoadSimulationRejectsMalformedLoadInputs();

  console.log('P5B-032b load simulation baseline tests passed.');
}

run();
