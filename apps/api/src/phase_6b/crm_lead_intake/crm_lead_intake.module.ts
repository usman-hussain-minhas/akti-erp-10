import { Module } from '@nestjs/common';

import { CrmLeadIntakeController } from './crm_lead_intake.controller';
import { CrmLeadIntakeService } from './crm_lead_intake.service';

@Module({
  controllers: [CrmLeadIntakeController],
  providers: [CrmLeadIntakeService],
  exports: [CrmLeadIntakeService],
})
export class CrmLeadIntakeModule {}
