import { Controller, Get } from '@nestjs/common';

import { CrmLeadIntakeService } from './crm_lead_intake.service';

@Controller('phase-6b/crm-lead-intake/scaffold')
export class CrmLeadIntakeController {
  constructor(private readonly crm_lead_intakeService: CrmLeadIntakeService) {}

  @Get()
  getScaffoldMetadata() {
    return this.crm_lead_intakeService.getScaffoldMetadata();
  }
}
