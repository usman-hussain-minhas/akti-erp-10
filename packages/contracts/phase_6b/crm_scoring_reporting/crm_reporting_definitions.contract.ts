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
