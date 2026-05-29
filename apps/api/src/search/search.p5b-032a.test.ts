import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { SearchService, type SearchFixtureRecord, type SearchIndexTargetKey } from './search.service';

function fixtureRecords(): SearchFixtureRecord[] {
  return [
    {
      record_id: 'workflow-definition-approval',
      organization_id: 'org-032a',
      target_key: 'workflow_definition',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval workflow definition ready for review',
    },
    {
      record_id: 'workflow-instance-approval',
      organization_id: 'org-032a',
      target_key: 'workflow_instance',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval workflow instance pending operator action',
    },
    {
      record_id: 'workflow-cross-tenant',
      organization_id: 'org-other',
      target_key: 'workflow_definition',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval workflow from another tenant',
    },
    {
      record_id: 'workflow-unauthorized',
      organization_id: 'org-032a',
      target_key: 'workflow_instance',
      capability_key: 'platform.workflow.admin',
      searchable_text: 'Approval workflow requiring another capability',
    },
  ];
}

function passingLatencySamples() {
  return [7, 8, 9, 10, 11, 12, 13, 15, 18, 20, 24, 29, 34, 41, 55, 72, 91, 119, 148, 176];
}

function testQueryPerformanceFixturePassesWithExpectedResultsAndP95() {
  const service = new SearchService();
  const result = service.runQueryPerformanceFixture({
    fixture_key: 'p5b-032a-search-performance',
    organization_id: 'org-032a',
    actor_user_id: 'actor-032a',
    capability_keys: ['platform.workflow.read'],
    records: fixtureRecords(),
    latency_samples_ms: passingLatencySamples(),
    p95_threshold_ms: 200,
    queries: [
      {
        query: 'approval workflow',
        target_keys: ['workflow_definition', 'workflow_instance'],
        expected_result_ids: ['workflow-definition-approval', 'workflow-instance-approval'],
      },
      {
        query: 'definition',
        target_keys: ['workflow_definition'],
        expected_result_ids: ['workflow-definition-approval'],
      },
    ],
  });

  assert.equal(result.fixture_key, 'p5b-032a-search-performance');
  assert.equal(result.engine, 'postgresql_fts');
  assert.equal(result.external_search_provider, 'deferred');
  assert.equal(result.semantic_vector_population, 'deferred');
  assert.equal(result.query_count, 2);
  assert.equal(result.records_examined, fixtureRecords().length);
  assert.equal(result.p95_ms, 148);
  assert.equal(result.p95_threshold_ms, 200);
  assert.equal(result.p95_passed, true);
  assert.equal(result.expected_results_matched, true);
  assert.equal(result.performance_fixture_passed, true);
  assert.equal(result.tenant_isolation_enforced, true);
  assert.equal(result.capability_filter_enforced, true);
  assert.deepEqual(result.query_results[0].result_ids, [
    'workflow-definition-approval',
    'workflow-instance-approval',
  ]);
}

function testFixtureFailsWhenExpectedResultsDoNotMatch() {
  const service = new SearchService();
  const result = service.runQueryPerformanceFixture({
    fixture_key: 'p5b-032a-expected-mismatch',
    organization_id: 'org-032a',
    actor_user_id: 'actor-032a',
    capability_keys: ['platform.workflow.read'],
    records: fixtureRecords(),
    latency_samples_ms: passingLatencySamples(),
    queries: [
      {
        query: 'approval workflow',
        expected_result_ids: ['workflow-definition-approval', 'workflow-instance-approval', 'workflow-unauthorized'],
      },
    ],
  });

  assert.equal(result.p95_passed, true);
  assert.equal(result.expected_results_matched, false);
  assert.equal(result.performance_fixture_passed, false);
}

function testFixtureFailsWhenP95ExceedsThreshold() {
  const service = new SearchService();
  const result = service.runQueryPerformanceFixture({
    fixture_key: 'p5b-032a-slow-query',
    organization_id: 'org-032a',
    actor_user_id: 'actor-032a',
    capability_keys: ['platform.workflow.read'],
    records: fixtureRecords(),
    latency_samples_ms: [20, 30, 40, 50, 260],
    p95_threshold_ms: 200,
    queries: [
      {
        query: 'approval workflow',
        expected_result_ids: ['workflow-definition-approval', 'workflow-instance-approval'],
      },
    ],
  });

  assert.equal(result.p95_ms, 260);
  assert.equal(result.p95_passed, false);
  assert.equal(result.expected_results_matched, true);
  assert.equal(result.performance_fixture_passed, false);
}

function testFixtureRejectsMalformedPerformanceInputs() {
  const service = new SearchService();

  assert.throws(
    () =>
      service.runQueryPerformanceFixture({
        fixture_key: '',
        organization_id: 'org-032a',
        actor_user_id: 'actor-032a',
        capability_keys: ['platform.workflow.read'],
        records: fixtureRecords(),
        latency_samples_ms: passingLatencySamples(),
        queries: [{ query: 'approval' }],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runQueryPerformanceFixture({
        fixture_key: 'p5b-032a-empty-queries',
        organization_id: 'org-032a',
        actor_user_id: 'actor-032a',
        capability_keys: ['platform.workflow.read'],
        records: fixtureRecords(),
        latency_samples_ms: passingLatencySamples(),
        queries: [],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runQueryPerformanceFixture({
        fixture_key: 'p5b-032a-bad-target',
        organization_id: 'org-032a',
        actor_user_id: 'actor-032a',
        capability_keys: ['platform.workflow.read'],
        records: fixtureRecords(),
        latency_samples_ms: passingLatencySamples(),
        queries: [{ query: 'approval', target_keys: ['lead_record' as SearchIndexTargetKey] }],
      }),
    BadRequestException,
  );
}

function run() {
  testQueryPerformanceFixturePassesWithExpectedResultsAndP95();
  testFixtureFailsWhenExpectedResultsDoNotMatch();
  testFixtureFailsWhenP95ExceedsThreshold();
  testFixtureRejectsMalformedPerformanceInputs();

  console.log('P5B-032a search/query performance fixture tests passed.');
}

run();
