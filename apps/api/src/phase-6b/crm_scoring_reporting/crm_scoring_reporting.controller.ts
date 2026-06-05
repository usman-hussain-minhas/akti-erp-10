import { Controller, Get } from '@nestjs/common';

import { CrmScoringReportingService } from './crm_scoring_reporting.service';

@Controller('phase-6b/crm-scoring-reporting/scaffold')
export class CrmScoringReportingController {
  constructor(private readonly crm_scoring_reportingService: CrmScoringReportingService) {}

  @Get()
  getScaffoldMetadata() {
    return this.crm_scoring_reportingService.getScaffoldMetadata();
  }
}
