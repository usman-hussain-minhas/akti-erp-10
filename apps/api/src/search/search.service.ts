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

  private nonEmpty(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`search ${field} is required`);
    }

    return input.trim();
  }
}
