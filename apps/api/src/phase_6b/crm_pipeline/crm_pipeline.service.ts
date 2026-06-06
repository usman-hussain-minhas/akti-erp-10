import { Injectable } from '@nestjs/common';

export type CrmPipelineScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.06';
  component_key: 'crm_pipeline';
  display_name: 'CRM Pipeline';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const CrmPipelineScaffoldMetadata: CrmPipelineScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.06',
  component_key: 'crm_pipeline',
  display_name: 'CRM Pipeline',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BPipelineStage',
  'Phase6BPipelineTimelineEntry',
  ],
};

@Injectable()
export class CrmPipelineService {
  getScaffoldMetadata(): CrmPipelineScaffoldMetadata {
    return CrmPipelineScaffoldMetadata;
  }
}
