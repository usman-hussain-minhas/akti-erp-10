import { Injectable } from '@nestjs/common';

export type CrmScoringReportingScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.08';
  component_key: 'crm_scoring_reporting';
  display_name: 'CRM Scoring Reporting';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const CrmScoringReportingScaffoldMetadata: CrmScoringReportingScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.08',
  component_key: 'crm_scoring_reporting',
  display_name: 'CRM Scoring Reporting',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BLeadScore',
  'Phase6BFollowUpTask',
  ],
};

@Injectable()
export class CrmScoringReportingService {
  getScaffoldMetadata(): CrmScoringReportingScaffoldMetadata {
    return CrmScoringReportingScaffoldMetadata;
  }
}
