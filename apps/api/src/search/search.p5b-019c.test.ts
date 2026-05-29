import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { SearchService, type SearchFixtureRecord, type SearchIndexTargetKey } from './search.service';

function fixtureRecords(): SearchFixtureRecord[] {
  return [
    {
      record_id: 'workflow-definition-visible',
      organization_id: 'org-019c',
      target_key: 'workflow_definition',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval flow definition for workflow review',
    },
    {
      record_id: 'workflow-instance-visible',
      organization_id: 'org-019c',
      target_key: 'workflow_instance',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval flow instance pending review',
    },
    {
      record_id: 'workflow-definition-cross-tenant',
      organization_id: 'org-other',
      target_key: 'workflow_definition',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Approval flow definition in another tenant',
    },
    {
      record_id: 'workflow-instance-unauthorized',
      organization_id: 'org-019c',
      target_key: 'workflow_instance',
      capability_key: 'platform.workflow.admin',
      searchable_text: 'Approval flow instance requiring a different capability',
    },
    {
      record_id: 'workflow-definition-nonmatch',
      organization_id: 'org-019c',
      target_key: 'workflow_definition',
      capability_key: 'platform.workflow.read',
      searchable_text: 'Unrelated lifecycle text',
    },
  ];
}

function passingLatencySamples(): number[] {
  return [8, 9, 10, 11, 12, 13, 14, 15, 21, 24, 27, 31, 36, 43, 51, 69, 88, 121, 151, 190];
}

function testTenantIsolationAndCapabilityFilteringExcludeUnsafeRecords() {
  const service = new SearchService();
  const result = service.runTenantIsolationFixture({
    organization_id: 'org-019c',
    actor_user_id: 'actor-019c',
    capability_keys: ['platform.workflow.read'],
    query: 'approval',
    target_keys: ['workflow_definition', 'workflow_instance'],
    records: fixtureRecords(),
    latency_samples_ms: passingLatencySamples(),
  });

  assert.deepEqual(result.result_ids, ['workflow-definition-visible', 'workflow-instance-visible']);
  assert.deepEqual(result.excluded_cross_tenant_ids, ['workflow-definition-cross-tenant']);
  assert.deepEqual(result.excluded_unauthorized_ids, ['workflow-instance-unauthorized']);
  assert.equal(result.tenant_isolation_enforced, true);
  assert.equal(result.capability_filter_enforced, true);
  assert.equal(result.records_examined, fixtureRecords().length);
  assert.equal(result.p95_ms, 151);
  assert.equal(result.p95_threshold_ms, 200);
  assert.equal(result.p95_passed, true);
}

function testTargetFilterLimitsSearchSurface() {
  const service = new SearchService();
  const result = service.runTenantIsolationFixture({
    organization_id: 'org-019c',
    actor_user_id: 'actor-019c',
    capability_keys: ['platform.workflow.read'],
    query: 'approval',
    target_keys: ['workflow_definition'],
    records: fixtureRecords(),
    latency_samples_ms: passingLatencySamples(),
  });

  assert.deepEqual(result.result_ids, ['workflow-definition-visible']);
  assert.deepEqual(
    result.plan.targets.map((target) => target.target_key),
    ['workflow_definition'],
  );
}

function testP95FixtureFailsWhenMeasuredSamplesExceedTarget() {
  const service = new SearchService();
  const result = service.runTenantIsolationFixture({
    organization_id: 'org-019c',
    actor_user_id: 'actor-019c',
    capability_keys: ['platform.workflow.read'],
    query: 'approval',
    records: fixtureRecords(),
    latency_samples_ms: [10, 20, 30, 40, 250],
    p95_threshold_ms: 200,
  });

  assert.equal(result.p95_ms, 250);
  assert.equal(result.p95_passed, false);
}

function testFixtureRejectsUnsafeOrMalformedProofInputs() {
  const service = new SearchService();

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: '',
        actor_user_id: 'actor-019c',
        capability_keys: ['platform.workflow.read'],
        query: 'approval',
        records: fixtureRecords(),
        latency_samples_ms: passingLatencySamples(),
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-019c',
        actor_user_id: 'actor-019c',
        capability_keys: ['platform.workflow.read'],
        query: 'approval',
        records: [],
        latency_samples_ms: passingLatencySamples(),
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-019c',
        actor_user_id: 'actor-019c',
        capability_keys: ['platform.workflow.read'],
        query: 'approval',
        records: [
          {
            ...fixtureRecords()[0],
            target_key: 'lead_record' as SearchIndexTargetKey,
          },
        ],
        latency_samples_ms: passingLatencySamples(),
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-019c',
        actor_user_id: 'actor-019c',
        capability_keys: ['platform.workflow.read'],
        query: 'approval',
        records: fixtureRecords(),
        latency_samples_ms: [],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-019c',
        actor_user_id: 'actor-019c',
        capability_keys: ['platform.workflow.read'],
        query: 'approval',
        records: fixtureRecords(),
        latency_samples_ms: [1, -1],
      }),
    BadRequestException,
  );
}

function run() {
  testTenantIsolationAndCapabilityFilteringExcludeUnsafeRecords();
  testTargetFilterLimitsSearchSurface();
  testP95FixtureFailsWhenMeasuredSamplesExceedTarget();
  testFixtureRejectsUnsafeOrMalformedProofInputs();

  console.log('P5B-019c Search tenant isolation and p95 fixture proof tests passed.');
}

run();
