import { Injectable } from '@nestjs/common';

export type CrmPipelineScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.06';
  component_key: 'crm_pipeline';
  display_name: 'CRM Pipeline';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
};

export const CrmPipelineScaffoldMetadata: CrmPipelineScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.06',
  component_key: 'crm_pipeline',
  display_name: 'CRM Pipeline',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
};

@Injectable()
export class CrmPipelineService {
  getScaffoldMetadata(): CrmPipelineScaffoldMetadata {
    return CrmPipelineScaffoldMetadata;
  }
}
