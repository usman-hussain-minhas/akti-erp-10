import { Injectable } from '@nestjs/common';

export type CrmLeadIntakeScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.04';
  component_key: 'crm_lead_intake';
  display_name: 'CRM Lead Intake';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const CrmLeadIntakeScaffoldMetadata: CrmLeadIntakeScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.04',
  component_key: 'crm_lead_intake',
  display_name: 'CRM Lead Intake',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BLeadSource',
  'Phase6BLeadEvidence',
  ],
};

@Injectable()
export class CrmLeadIntakeService {
  getScaffoldMetadata(): CrmLeadIntakeScaffoldMetadata {
    return CrmLeadIntakeScaffoldMetadata;
  }
}
