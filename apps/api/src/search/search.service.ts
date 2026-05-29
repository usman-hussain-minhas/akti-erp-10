import { BadRequestException, Injectable } from '@nestjs/common';

const SEARCH_QUERY_MIN_LENGTH = 2;
const SEARCH_QUERY_MAX_LENGTH = 200;

export type SearchIndexTargetKey = 'workflow_definition' | 'workflow_instance';

export type SearchIndexTarget = {
  target_key: SearchIndexTargetKey;
  model_name: 'WorkflowDefinition' | 'WorkflowInstance';
  table_name: 'WorkflowDefinition' | 'WorkflowInstance';
  owner_module: 'core.workflow';
  tenant_scoped: true;
  organization_id_filter_required: true;
  capability_filter_required: true;
  tsvector_column: 'search_vector';
  gin_index_name: string;
  query_fields: string[];
  uses_business_module_data: false;
};

export type SearchSchemaIndexBaseline = {
  engine: 'postgresql_fts';
  query_function: 'plainto_tsquery';
  rank_function: 'ts_rank';
  external_search_provider: 'deferred';
  semantic_vector_population: 'deferred';
  targets: SearchIndexTarget[];
};

export type SearchQueryPlanInput = {
  organization_id: string;
  actor_user_id: string;
  capability_keys: string[];
  query: string;
  target_keys?: SearchIndexTargetKey[];
};

export type SearchQueryPlan = {
  engine: 'postgresql_fts';
  organization_id: string;
  actor_user_id: string;
  query: string;
  capability_keys: string[];
  query_function: 'plainto_tsquery';
  rank_function: 'ts_rank';
  targets: SearchIndexTarget[];
  tenant_filter_required: true;
  capability_filter_required: true;
};

export type SearchApiInput = SearchQueryPlanInput & {
  limit?: number;
  cursor?: string | null;
};

export type SearchApiResponse = {
  method: 'GET';
  route: '/platform/search';
  request: {
    query: string;
    target_keys: SearchIndexTargetKey[];
    limit: number;
    cursor: string | null;
  };
  response_shape: {
    items: 'SearchResultItem[]';
    page: '{ limit, cursor, next_cursor }';
  };
  capability: {
    required: 'platform.search.query';
    target_capability_filter: string[];
  };
  tenant_context: {
    organization_id: string;
    actor_user_id: string;
  };
  gatekeeper: {
    risk_check_required: true;
    capability_key: 'platform.search.query';
    exposure_surface: 'search_index_visibility';
  };
  audit: {
    event_type: 'search.query.executed';
    audit_required: true;
    outbox_event_required: false;
  };
  query_plan: SearchQueryPlan;
  items: [];
  page: {
    limit: number;
    cursor: string | null;
    next_cursor: null;
  };
};

export type SearchFixtureRecord = {
  record_id: string;
  organization_id: string;
  target_key: SearchIndexTargetKey;
  capability_key: string;
  searchable_text: string;
};

export type SearchTenantIsolationFixtureInput = SearchQueryPlanInput & {
  records: SearchFixtureRecord[];
  latency_samples_ms: number[];
  p95_threshold_ms?: number;
};

export type SearchTenantIsolationFixtureResult = {
  plan: SearchQueryPlan;
  result_ids: string[];
  excluded_cross_tenant_ids: string[];
  excluded_unauthorized_ids: string[];
  p95_ms: number;
  p95_threshold_ms: number;
  p95_passed: boolean;
  tenant_isolation_enforced: true;
  capability_filter_enforced: true;
  records_examined: number;
};

export type SearchQueryPerformanceFixtureInput = {
  fixture_key: string;
  organization_id: string;
  actor_user_id: string;
  capability_keys: string[];
  records: SearchFixtureRecord[];
  latency_samples_ms: number[];
  p95_threshold_ms?: number;
  queries: Array<{
    query: string;
    target_keys?: SearchIndexTargetKey[];
    expected_result_ids?: string[];
  }>;
};

export type SearchQueryPerformanceFixtureResult = {
  fixture_key: string;
  engine: 'postgresql_fts';
  external_search_provider: 'deferred';
  semantic_vector_population: 'deferred';
  query_count: number;
  records_examined: number;
  p95_ms: number;
  p95_threshold_ms: number;
  p95_passed: boolean;
  expected_results_matched: boolean;
  performance_fixture_passed: boolean;
  tenant_isolation_enforced: true;
  capability_filter_enforced: true;
  query_results: Array<{
    query: string;
    target_keys: SearchIndexTargetKey[];
    result_ids: string[];
    expected_result_ids: string[];
    expected_results_matched: boolean;
  }>;
};

export type SearchLoadSimulationBaselineInput = SearchQueryPerformanceFixtureInput & {
  simulation_key: string;
  virtual_users: number;
  iterations_per_user: number;
};

export type SearchLoadSimulationBaselineResult = {
  simulation_key: string;
  fixture_key: string;
  engine: 'postgresql_fts';
  load_model: 'deterministic_fixture';
  external_load_runner: 'not_required';
  virtual_users: number;
  iterations_per_user: number;
  query_templates: number;
  total_query_executions: number;
  p95_ms: number;
  p95_threshold_ms: number;
  p95_passed: boolean;
  expected_results_matched: boolean;
  load_simulation_passed: boolean;
  tenant_isolation_enforced: true;
  capability_filter_enforced: true;
  slo_alignment: {
    latency_target_ms: number;
    target_met: boolean;
  };
};

@Injectable()
export class SearchService {
  searchSchemaIndexBaseline(): SearchSchemaIndexBaseline {
    return {
      engine: 'postgresql_fts',
      query_function: 'plainto_tsquery',
      rank_function: 'ts_rank',
      external_search_provider: 'deferred',
      semantic_vector_population: 'deferred',
      targets: [
        {
          target_key: 'workflow_definition',
          model_name: 'WorkflowDefinition',
          table_name: 'WorkflowDefinition',
          owner_module: 'core.workflow',
          tenant_scoped: true,
          organization_id_filter_required: true,
          capability_filter_required: true,
          tsvector_column: 'search_vector',
          gin_index_name: 'WorkflowDefinition_search_vector_idx',
          query_fields: ['workflow_key', 'version', 'owner', 'status'],
          uses_business_module_data: false,
        },
        {
          target_key: 'workflow_instance',
          model_name: 'WorkflowInstance',
          table_name: 'WorkflowInstance',
          owner_module: 'core.workflow',
          tenant_scoped: true,
          organization_id_filter_required: true,
          capability_filter_required: true,
          tsvector_column: 'search_vector',
          gin_index_name: 'WorkflowInstance_search_vector_idx',
          query_fields: ['workflow_key', 'version', 'status', 'current_state', 'subject_type', 'subject_id', 'correlation_id'],
          uses_business_module_data: false,
        },
      ],
    };
  }

  buildTenantCapabilitySearchPlan(input: SearchQueryPlanInput): SearchQueryPlan {
    const organizationId = this.nonEmpty(input.organization_id, 'organization_id');
    const actorUserId = this.nonEmpty(input.actor_user_id, 'actor_user_id');
    const query = this.searchQuery(input.query);
    const capabilityKeys = this.capabilityKeys(input.capability_keys);
    const targets = this.targets(input.target_keys);

    return {
      engine: 'postgresql_fts',
      organization_id: organizationId,
      actor_user_id: actorUserId,
      query,
      capability_keys: capabilityKeys,
      query_function: 'plainto_tsquery',
      rank_function: 'ts_rank',
      targets,
      tenant_filter_required: true,
      capability_filter_required: true,
    };
  }

  search(input: SearchApiInput): SearchApiResponse {
    const limit = this.limit(input.limit);
    const cursor = input.cursor === undefined ? null : this.optionalCursor(input.cursor);
    const queryPlan = this.buildTenantCapabilitySearchPlan(input);

    return {
      method: 'GET',
      route: '/platform/search',
      request: {
        query: queryPlan.query,
        target_keys: queryPlan.targets.map((target) => target.target_key),
        limit,
        cursor,
      },
      response_shape: {
        items: 'SearchResultItem[]',
        page: '{ limit, cursor, next_cursor }',
      },
      capability: {
        required: 'platform.search.query',
        target_capability_filter: queryPlan.capability_keys,
      },
      tenant_context: {
        organization_id: queryPlan.organization_id,
        actor_user_id: queryPlan.actor_user_id,
      },
      gatekeeper: {
        risk_check_required: true,
        capability_key: 'platform.search.query',
        exposure_surface: 'search_index_visibility',
      },
      audit: {
        event_type: 'search.query.executed',
        audit_required: true,
        outbox_event_required: false,
      },
      query_plan: queryPlan,
      items: [],
      page: {
        limit,
        cursor,
        next_cursor: null,
      },
    };
  }

  runTenantIsolationFixture(input: SearchTenantIsolationFixtureInput): SearchTenantIsolationFixtureResult {
    const plan = this.buildTenantCapabilitySearchPlan(input);
    const records = this.fixtureRecords(input.records);
    const targetKeys = new Set(plan.targets.map((target) => target.target_key));
    const capabilityKeys = new Set(plan.capability_keys);
    const normalizedQuery = plan.query.toLowerCase();
    const resultIds: string[] = [];
    const excludedCrossTenantIds: string[] = [];
    const excludedUnauthorizedIds: string[] = [];

    for (const record of records) {
      if (!targetKeys.has(record.target_key)) {
        continue;
      }
      if (record.organization_id !== plan.organization_id) {
        excludedCrossTenantIds.push(record.record_id);
        continue;
      }
      if (!capabilityKeys.has(record.capability_key)) {
        excludedUnauthorizedIds.push(record.record_id);
        continue;
      }
      if (record.searchable_text.toLowerCase().includes(normalizedQuery)) {
        resultIds.push(record.record_id);
      }
    }

    const p95ThresholdMs = input.p95_threshold_ms ?? 200;
    const p95Ms = this.p95(input.latency_samples_ms);

    return {
      plan,
      result_ids: resultIds.sort(),
      excluded_cross_tenant_ids: excludedCrossTenantIds.sort(),
      excluded_unauthorized_ids: excludedUnauthorizedIds.sort(),
      p95_ms: p95Ms,
      p95_threshold_ms: p95ThresholdMs,
      p95_passed: p95Ms < p95ThresholdMs,
      tenant_isolation_enforced: true,
      capability_filter_enforced: true,
      records_examined: records.length,
    };
  }

  runQueryPerformanceFixture(input: SearchQueryPerformanceFixtureInput): SearchQueryPerformanceFixtureResult {
    const fixtureKey = this.nonEmpty(input.fixture_key, 'fixture_key');
    const queries = this.fixtureQueries(input.queries);
    const queryResults = queries.map((query) => {
      const result = this.runTenantIsolationFixture({
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        capability_keys: input.capability_keys,
        query: query.query,
        target_keys: query.target_keys,
        records: input.records,
        latency_samples_ms: input.latency_samples_ms,
        p95_threshold_ms: input.p95_threshold_ms,
      });
      const expectedResultIds = [...(query.expected_result_ids ?? [])].sort();

      return {
        query: result.plan.query,
        target_keys: result.plan.targets.map((target) => target.target_key),
        result_ids: result.result_ids,
        expected_result_ids: expectedResultIds,
        expected_results_matched: expectedResultIds.length === 0 || this.sameStringSet(result.result_ids, expectedResultIds),
        p95_ms: result.p95_ms,
        p95_threshold_ms: result.p95_threshold_ms,
        p95_passed: result.p95_passed,
        records_examined: result.records_examined,
      };
    });
    const firstResult = queryResults[0];
    const p95Ms = Math.max(...queryResults.map((result) => result.p95_ms));
    const p95ThresholdMs = firstResult.p95_threshold_ms;
    const p95Passed = queryResults.every((result) => result.p95_passed);
    const expectedResultsMatched = queryResults.every((result) => result.expected_results_matched);

    return {
      fixture_key: fixtureKey,
      engine: 'postgresql_fts',
      external_search_provider: 'deferred',
      semantic_vector_population: 'deferred',
      query_count: queryResults.length,
      records_examined: firstResult.records_examined,
      p95_ms: p95Ms,
      p95_threshold_ms: p95ThresholdMs,
      p95_passed: p95Passed,
      expected_results_matched: expectedResultsMatched,
      performance_fixture_passed: p95Passed && expectedResultsMatched,
      tenant_isolation_enforced: true,
      capability_filter_enforced: true,
      query_results: queryResults.map(({ p95_ms, p95_threshold_ms, p95_passed, records_examined, ...result }) => result),
    };
  }

  runLoadSimulationBaseline(input: SearchLoadSimulationBaselineInput): SearchLoadSimulationBaselineResult {
    const simulationKey = this.nonEmpty(input.simulation_key, 'simulation_key');
    const virtualUsers = this.positiveInteger(input.virtual_users, 'virtual_users');
    const iterationsPerUser = this.positiveInteger(input.iterations_per_user, 'iterations_per_user');
    const performanceFixture = this.runQueryPerformanceFixture(input);
    const totalQueryExecutions = virtualUsers * iterationsPerUser * performanceFixture.query_count;
    const loadSimulationPassed = performanceFixture.p95_passed && performanceFixture.expected_results_matched;

    return {
      simulation_key: simulationKey,
      fixture_key: performanceFixture.fixture_key,
      engine: 'postgresql_fts',
      load_model: 'deterministic_fixture',
      external_load_runner: 'not_required',
      virtual_users: virtualUsers,
      iterations_per_user: iterationsPerUser,
      query_templates: performanceFixture.query_count,
      total_query_executions: totalQueryExecutions,
      p95_ms: performanceFixture.p95_ms,
      p95_threshold_ms: performanceFixture.p95_threshold_ms,
      p95_passed: performanceFixture.p95_passed,
      expected_results_matched: performanceFixture.expected_results_matched,
      load_simulation_passed: loadSimulationPassed,
      tenant_isolation_enforced: true,
      capability_filter_enforced: true,
      slo_alignment: {
        latency_target_ms: performanceFixture.p95_threshold_ms,
        target_met: loadSimulationPassed,
      },
    };
  }

  private targets(targetKeys?: SearchIndexTargetKey[]): SearchIndexTarget[] {
    const baselineTargets = this.searchSchemaIndexBaseline().targets;
    if (targetKeys === undefined) {
      return baselineTargets;
    }
    if (targetKeys.length === 0) {
      throw new BadRequestException('search target_keys must not be empty when provided');
    }

    const allowed = new Map(baselineTargets.map((target) => [target.target_key, target]));
    const seen = new Set<SearchIndexTargetKey>();
    const targets: SearchIndexTarget[] = [];

    for (const targetKey of targetKeys) {
      const target = allowed.get(targetKey);
      if (!target) {
        throw new BadRequestException(`search target ${targetKey} is not approved`);
      }
      if (seen.has(targetKey)) {
        throw new BadRequestException(`search target ${targetKey} is duplicated`);
      }
      seen.add(targetKey);
      targets.push(target);
    }

    return targets;
  }

  private capabilityKeys(input: string[]): string[] {
    if (!Array.isArray(input) || input.length === 0) {
      throw new BadRequestException('search capability_keys must not be empty');
    }
    const seen = new Set<string>();
    const keys: string[] = [];

    for (const item of input) {
      const value = this.nonEmpty(item, 'capability_key');
      if (seen.has(value)) {
        throw new BadRequestException(`search capability ${value} is duplicated`);
      }
      seen.add(value);
      keys.push(value);
    }

    return keys;
  }

  private searchQuery(input: string): string {
    const value = this.nonEmpty(input, 'query');
    if (value.length < SEARCH_QUERY_MIN_LENGTH) {
      throw new BadRequestException('search query is too short');
    }
    if (value.length > SEARCH_QUERY_MAX_LENGTH) {
      throw new BadRequestException('search query is too long');
    }

    return value;
  }

  private limit(input: number | undefined): number {
    if (input === undefined) {
      return 25;
    }
    if (!Number.isSafeInteger(input) || input < 1 || input > 100) {
      throw new BadRequestException('search limit must be an integer from 1 to 100');
    }

    return input;
  }

  private fixtureRecords(input: SearchFixtureRecord[]): SearchFixtureRecord[] {
    if (!Array.isArray(input) || input.length === 0) {
      throw new BadRequestException('search fixture records must not be empty');
    }

    return input.map((record) => ({
      record_id: this.nonEmpty(record.record_id, 'fixture record_id'),
      organization_id: this.nonEmpty(record.organization_id, 'fixture organization_id'),
      target_key: this.fixtureTarget(record.target_key),
      capability_key: this.nonEmpty(record.capability_key, 'fixture capability_key'),
      searchable_text: this.nonEmpty(record.searchable_text, 'fixture searchable_text'),
    }));
  }

  private fixtureTarget(input: SearchIndexTargetKey): SearchIndexTargetKey {
    const allowed = new Set(this.searchSchemaIndexBaseline().targets.map((target) => target.target_key));
    if (!allowed.has(input)) {
      throw new BadRequestException(`search fixture target ${input} is not approved`);
    }

    return input;
  }

  private fixtureQueries(input: SearchQueryPerformanceFixtureInput['queries']): SearchQueryPerformanceFixtureInput['queries'] {
    if (!Array.isArray(input) || input.length === 0) {
      throw new BadRequestException('search performance fixture queries must not be empty');
    }

    return input.map((query) => ({
      query: this.searchQuery(query.query),
      target_keys: query.target_keys === undefined ? undefined : query.target_keys.map((targetKey) => this.fixtureTarget(targetKey)),
      expected_result_ids: query.expected_result_ids?.map((resultId) => this.nonEmpty(resultId, 'expected_result_id')),
    }));
  }

  private sameStringSet(left: string[], right: string[]) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }

  private positiveInteger(input: unknown, field: string): number {
    if (!Number.isSafeInteger(input) || (input as number) < 1) {
      throw new BadRequestException(`search ${field} must be a positive integer`);
    }

    return input as number;
  }

  private p95(samples: number[]): number {
    if (!Array.isArray(samples) || samples.length === 0) {
      throw new BadRequestException('search latency_samples_ms must not be empty');
    }

    const sorted = samples
      .map((sample) => {
        if (!Number.isFinite(sample) || sample < 0) {
          throw new BadRequestException('search latency sample must be a non-negative number');
        }

        return sample;
      })
      .sort((left, right) => left - right);

    return sorted[Math.ceil(sorted.length * 0.95) - 1];
  }

  private optionalCursor(input: unknown): string | null {
    if (input === null) {
      return null;
    }

    return this.nonEmpty(input, 'cursor');
  }

  private nonEmpty(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`search ${field} is required`);
    }

    return input.trim();
  }
}
