import { Controller, Get } from '@nestjs/common';

import { CrmCommunicationService } from './crm_communication.service';

@Controller('phase-6b/crm-communication/scaffold')
export class CrmCommunicationController {
  constructor(private readonly crm_communicationService: CrmCommunicationService) {}

  @Get()
  getScaffoldMetadata() {
    return this.crm_communicationService.getScaffoldMetadata();
  }
}
