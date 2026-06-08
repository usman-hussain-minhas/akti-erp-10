export const PHASE_6B_CRM_REPORTING_DEFINITIONS_SEED_ID = 'seed_6b_08_crm_reporting_definitions' as const;
export const PHASE_6B_CRM_REPORTING_DEFINITIONS_COMPONENT_ID = '6B.08' as const;

export const CRM_REPORTING_DEFINITION_EVENT = 'phase_6b.crm_scoring_reporting.crm_reporting_definition.registered' as const;

export type CrmReportDefinitionLifecycleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type CrmReportMetricAggregation = 'COUNT' | 'SUM' | 'AVERAGE' | 'MIN' | 'MAX';
export type CrmReportFilterOperator = 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'GTE' | 'LTE';
export type CrmReportSortDirection = 'ASC' | 'DESC';

export type CrmReportMetricDefinition = {
  metric_id: string;
  fact_key: string;
  aggregation: CrmReportMetricAggregation;
  evidence_label: string;
};

export type CrmReportFilterDefinition = {
  filter_id: string;
  fact_key: string;
  operator: CrmReportFilterOperator;
  allowed_values: Array<string | number | boolean>;
};

export type CrmReportSortDefinition = {
  sort_id: string;
  fact_key: string;
  direction: CrmReportSortDirection;
};

export type CrmReportingDefinitionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  report_definition_id: string;
  report_name: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  lifecycle_status: CrmReportDefinitionLifecycleStatus;
  metrics: CrmReportMetricDefinition[];
  filters: CrmReportFilterDefinition[];
  sorts: CrmReportSortDefinition[];
  configured_by_user_id: string;
  configured_at: string;
  query_execution_requested?: boolean;
  raw_sql_requested?: boolean;
  frontend_render_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type CrmReportingDefinitionReceipt = {
  seed_id: typeof PHASE_6B_CRM_REPORTING_DEFINITIONS_SEED_ID;
  component_id: typeof PHASE_6B_CRM_REPORTING_DEFINITIONS_COMPONENT_ID;
  event_name: typeof CRM_REPORTING_DEFINITION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  report_definition_id: string;
  report_name: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  lifecycle_status: CrmReportDefinitionLifecycleStatus;
  metrics: CrmReportMetricDefinition[];
  filters: CrmReportFilterDefinition[];
  sorts: CrmReportSortDefinition[];
  metric_count: number;
  filter_count: number;
  sort_count: number;
  query_execution_allowed: false;
  raw_sql_allowed: false;
  frontend_render_allowed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};

const LIFECYCLE_STATUSES: readonly CrmReportDefinitionLifecycleStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] as const;
const AGGREGATIONS: readonly CrmReportMetricAggregation[] = ['COUNT', 'SUM', 'AVERAGE', 'MIN', 'MAX'] as const;
const FILTER_OPERATORS: readonly CrmReportFilterOperator[] = ['EQUALS', 'NOT_EQUALS', 'IN', 'GTE', 'LTE'] as const;
const SORT_DIRECTIONS: readonly CrmReportSortDirection[] = ['ASC', 'DESC'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for crm reporting definitions.`);
  }
  return value.trim();
}

function requireConfiguredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'configured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('configured_at must be a valid ISO-compatible timestamp for crm reporting definitions.');
  }
  return normalized;
}

function normalizeLifecycleStatus(value: CrmReportDefinitionLifecycleStatus): CrmReportDefinitionLifecycleStatus {
  if (!LIFECYCLE_STATUSES.includes(value)) {
    throw new Error('lifecycle_status is not supported for crm reporting definitions.');
  }
  return value;
}

function normalizeAggregation(value: CrmReportMetricAggregation): CrmReportMetricAggregation {
  if (!AGGREGATIONS.includes(value)) {
    throw new Error('aggregation is not supported for crm reporting definitions.');
  }
  return value;
}

function normalizeFilterOperator(value: CrmReportFilterOperator): CrmReportFilterOperator {
  if (!FILTER_OPERATORS.includes(value)) {
    throw new Error('operator is not supported for crm reporting definitions.');
  }
  return value;
}

function normalizeSortDirection(value: CrmReportSortDirection): CrmReportSortDirection {
  if (!SORT_DIRECTIONS.includes(value)) {
    throw new Error('direction is not supported for crm reporting definitions.');
  }
  return value;
}

function normalizeMetric(metric: CrmReportMetricDefinition): CrmReportMetricDefinition {
  return {
    metric_id: requireNonEmpty(metric.metric_id, 'metrics.metric_id'),
    fact_key: requireNonEmpty(metric.fact_key, 'metrics.fact_key'),
    aggregation: normalizeAggregation(metric.aggregation),
    evidence_label: requireNonEmpty(metric.evidence_label, 'metrics.evidence_label'),
  };
}

function normalizeFilter(filter: CrmReportFilterDefinition): CrmReportFilterDefinition {
  if (!Array.isArray(filter.allowed_values) || filter.allowed_values.length === 0) {
    throw new Error('filters.allowed_values must include at least one value for crm reporting definitions.');
  }
  return {
    filter_id: requireNonEmpty(filter.filter_id, 'filters.filter_id'),
    fact_key: requireNonEmpty(filter.fact_key, 'filters.fact_key'),
    operator: normalizeFilterOperator(filter.operator),
    allowed_values: filter.allowed_values.map((value) => {
      if (!['string', 'number', 'boolean'].includes(typeof value)) {
        throw new Error('filters.allowed_values must contain only string, number, or boolean values for crm reporting definitions.');
      }
      return value;
    }),
  };
}

function normalizeSort(sort: CrmReportSortDefinition): CrmReportSortDefinition {
  return {
    sort_id: requireNonEmpty(sort.sort_id, 'sorts.sort_id'),
    fact_key: requireNonEmpty(sort.fact_key, 'sorts.fact_key'),
    direction: normalizeSortDirection(sort.direction),
  };
}

function assertUnique(ids: string[], label: string): void {
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} must not contain duplicate ids for crm reporting definitions.`);
  }
}

export function registerCrmReportingDefinition(input: CrmReportingDefinitionInput): CrmReportingDefinitionReceipt {
  if (input.query_execution_requested === true) {
    throw new Error('crm reporting definitions must not execute report queries.');
  }
  if (input.raw_sql_requested === true) {
    throw new Error('crm reporting definitions must not accept raw SQL.');
  }
  if (input.frontend_render_requested === true) {
    throw new Error('crm reporting definitions must not render frontend reports.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('crm reporting definitions must not perform irreversible actions.');
  }

  if (!Array.isArray(input.metrics) || input.metrics.length === 0) {
    throw new Error('metrics must include at least one metric for crm reporting definitions.');
  }
  const metrics = input.metrics.map(normalizeMetric);
  const filters = (input.filters || []).map(normalizeFilter);
  const sorts = (input.sorts || []).map(normalizeSort);
  assertUnique(metrics.map((metric) => metric.metric_id), 'metrics');
  assertUnique(filters.map((filter) => filter.filter_id), 'filters');
  assertUnique(sorts.map((sort) => sort.sort_id), 'sorts');

  return {
    seed_id: PHASE_6B_CRM_REPORTING_DEFINITIONS_SEED_ID,
    component_id: PHASE_6B_CRM_REPORTING_DEFINITIONS_COMPONENT_ID,
    event_name: CRM_REPORTING_DEFINITION_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    report_definition_id: requireNonEmpty(input.report_definition_id, 'report_definition_id'),
    report_name: requireNonEmpty(input.report_name, 'report_name'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    whatsapp_template_management_ref: requireNonEmpty(input.whatsapp_template_management_ref, 'whatsapp_template_management_ref'),
    optimization_fact_store_ref: requireNonEmpty(input.optimization_fact_store_ref, 'optimization_fact_store_ref'),
    lifecycle_status: normalizeLifecycleStatus(input.lifecycle_status),
    metrics,
    filters,
    sorts,
    metric_count: metrics.length,
    filter_count: filters.length,
    sort_count: sorts.length,
    query_execution_allowed: false,
    raw_sql_allowed: false,
    frontend_render_allowed: false,
    irreversible_action_allowed: false,
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireConfiguredAt(input.configured_at),
  };
}
