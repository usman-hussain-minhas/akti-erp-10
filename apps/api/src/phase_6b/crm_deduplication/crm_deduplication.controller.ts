import { Controller, Get } from '@nestjs/common';

import { CrmDeduplicationService } from './crm_deduplication.service';

@Controller('phase-6b/crm-deduplication/scaffold')
export class CrmDeduplicationController {
  constructor(private readonly crm_deduplicationService: CrmDeduplicationService) {}

  @Get()
  getScaffoldMetadata() {
    return this.crm_deduplicationService.getScaffoldMetadata();
  }
}
