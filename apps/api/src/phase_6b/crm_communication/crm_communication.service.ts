import { Injectable } from '@nestjs/common';

export type CrmCommunicationScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.07';
  component_key: 'crm_communication';
  display_name: 'CRM Communication';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const CrmCommunicationScaffoldMetadata: CrmCommunicationScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.07',
  component_key: 'crm_communication',
  display_name: 'CRM Communication',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BCommunicationTemplate',
  'Phase6BCommunicationAttempt',
  'Phase6BCommunicationSequenceEnrollment',
  ],
};

@Injectable()
export class CrmCommunicationService {
  getScaffoldMetadata(): CrmCommunicationScaffoldMetadata {
    return CrmCommunicationScaffoldMetadata;
  }
}
