import { Module } from '@nestjs/common';

import { CrmScoringReportingController } from './crm_scoring_reporting.controller';
import { CrmScoringReportingService } from './crm_scoring_reporting.service';

@Module({
  controllers: [CrmScoringReportingController],
  providers: [CrmScoringReportingService],
  exports: [CrmScoringReportingService],
})
export class CrmScoringReportingModule {}
