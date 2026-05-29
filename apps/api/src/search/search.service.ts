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
