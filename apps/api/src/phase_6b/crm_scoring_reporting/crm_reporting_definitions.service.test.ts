import assert from 'node:assert/strict';
import { registerCrmReportingDefinition, type CrmReportingDefinitionInput } from './crm_reporting_definitions.service';

const baseInput: CrmReportingDefinitionInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_scoring_reporting',
  report_definition_id: 'crm_report_definition_001',
  report_name: 'Lead score performance report',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  whatsapp_template_management_ref: 'whatsapp_template_management_001',
  optimization_fact_store_ref: 'optimization_fact_store_001',
  lifecycle_status: 'ACTIVE',
  metrics: [
    {
      metric_id: 'metric_lead_count',
      fact_key: 'lead_count',
      aggregation: 'COUNT',
      evidence_label: 'lead_count_report_evidence',
    },
    {
      metric_id: 'metric_average_score',
      fact_key: 'normalized_score',
      aggregation: 'AVERAGE',
      evidence_label: 'average_score_report_evidence',
    },
  ],
  filters: [
    {
      filter_id: 'filter_score_band',
      fact_key: 'score_band',
      operator: 'IN',
      allowed_values: ['HIGH', 'MEDIUM'],
    },
  ],
  sorts: [
    {
      sort_id: 'sort_score_desc',
      fact_key: 'normalized_score',
      direction: 'DESC',
    },
  ],
  configured_by_user_id: 'user_reporting_owner_001',
  configured_at: '2026-06-08T22:05:00.000Z',
};

const receipt = registerCrmReportingDefinition(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_08_crm_reporting_definitions');
assert.equal(receipt.component_id, '6B.08');
assert.equal(receipt.event_name, 'phase_6b.crm_scoring_reporting.crm_reporting_definition.registered');
assert.equal(receipt.lifecycle_status, 'ACTIVE');
assert.equal(receipt.metric_count, 2);
assert.equal(receipt.filter_count, 1);
assert.equal(receipt.sort_count, 1);
assert.equal(receipt.query_execution_allowed, false);
assert.equal(receipt.raw_sql_allowed, false);
assert.equal(receipt.frontend_render_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const draftReceipt = registerCrmReportingDefinition({
  ...baseInput,
  report_definition_id: 'crm_report_definition_002',
  lifecycle_status: 'DRAFT',
  filters: [],
  sorts: [],
});
assert.equal(draftReceipt.lifecycle_status, 'DRAFT');
assert.equal(draftReceipt.filter_count, 0);
assert.equal(draftReceipt.sort_count, 0);

assert.throws(() => registerCrmReportingDefinition({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, report_definition_id: '' }), /report_definition_id is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, report_name: '' }), /report_name is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, whatsapp_template_management_ref: '' }), /whatsapp_template_management_ref is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, optimization_fact_store_ref: '' }), /optimization_fact_store_ref is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, lifecycle_status: 'DELETED' as never }), /lifecycle_status is not supported/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, metrics: [] }), /metrics must include at least one metric/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, metrics: [{ ...baseInput.metrics[0]!, metric_id: '' }] }), /metrics.metric_id is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, metrics: [{ ...baseInput.metrics[0]!, fact_key: '' }] }), /metrics.fact_key is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, metrics: [{ ...baseInput.metrics[0]!, aggregation: 'MEDIAN' as never }] }), /aggregation is not supported/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, metrics: [{ ...baseInput.metrics[0]!, evidence_label: '' }] }), /metrics.evidence_label is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, metrics: [{ ...baseInput.metrics[0]!, metric_id: 'duplicate' }, { ...baseInput.metrics[1]!, metric_id: 'duplicate' }] }), /metrics must not contain duplicate ids/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, filters: [{ ...baseInput.filters[0]!, filter_id: '' }] }), /filters.filter_id is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, filters: [{ ...baseInput.filters[0]!, fact_key: '' }] }), /filters.fact_key is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, filters: [{ ...baseInput.filters[0]!, operator: 'CONTAINS' as never }] }), /operator is not supported/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, filters: [{ ...baseInput.filters[0]!, allowed_values: [] }] }), /filters.allowed_values must include at least one value/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, filters: [{ ...baseInput.filters[0]!, allowed_values: [{} as never] }] }), /filters.allowed_values must contain only string, number, or boolean values/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, filters: [{ ...baseInput.filters[0]!, filter_id: 'duplicate' }, { ...baseInput.filters[0]!, filter_id: 'duplicate' }] }), /filters must not contain duplicate ids/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, sorts: [{ ...baseInput.sorts[0]!, sort_id: '' }] }), /sorts.sort_id is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, sorts: [{ ...baseInput.sorts[0]!, fact_key: '' }] }), /sorts.fact_key is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, sorts: [{ ...baseInput.sorts[0]!, direction: 'SIDEWAYS' as never }] }), /direction is not supported/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, sorts: [{ ...baseInput.sorts[0]!, sort_id: 'duplicate' }, { ...baseInput.sorts[0]!, sort_id: 'duplicate' }] }), /sorts must not contain duplicate ids/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, query_execution_requested: true }), /must not execute report queries/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, raw_sql_requested: true }), /must not accept raw SQL/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, frontend_render_requested: true }), /must not render frontend reports/);
assert.throws(() => registerCrmReportingDefinition({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-062 crm reporting definitions service test passed.');
