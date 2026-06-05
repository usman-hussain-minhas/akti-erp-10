import { Controller, Get } from '@nestjs/common';

import { CrmPipelineService } from './crm_pipeline.service';

@Controller('phase-6b/crm-pipeline/scaffold')
export class CrmPipelineController {
  constructor(private readonly crm_pipelineService: CrmPipelineService) {}

  @Get()
  getScaffoldMetadata() {
    return this.crm_pipelineService.getScaffoldMetadata();
  }
}
