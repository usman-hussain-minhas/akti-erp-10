import { Injectable } from '@nestjs/common';

export type CrmDeduplicationScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.05';
  component_key: 'crm_deduplication';
  display_name: 'CRM Deduplication';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const CrmDeduplicationScaffoldMetadata: CrmDeduplicationScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.05',
  component_key: 'crm_deduplication',
  display_name: 'CRM Deduplication',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BLeadMatchCandidate',
  'Phase6BLeadMergeRecord',
  ],
};

@Injectable()
export class CrmDeduplicationService {
  getScaffoldMetadata(): CrmDeduplicationScaffoldMetadata {
    return CrmDeduplicationScaffoldMetadata;
  }
}
