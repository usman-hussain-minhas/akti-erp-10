import { Injectable } from '@nestjs/common';

export type CrmCommunicationScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.07';
  component_key: 'crm_communication';
  display_name: 'CRM Communication';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
};

export const CrmCommunicationScaffoldMetadata: CrmCommunicationScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.07',
  component_key: 'crm_communication',
  display_name: 'CRM Communication',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
};

@Injectable()
export class CrmCommunicationService {
  getScaffoldMetadata(): CrmCommunicationScaffoldMetadata {
    return CrmCommunicationScaffoldMetadata;
  }
}
