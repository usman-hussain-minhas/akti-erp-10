import { Module } from '@nestjs/common';

import { CrmPipelineController } from './crm_pipeline.controller';
import { CrmPipelineService } from './crm_pipeline.service';

@Module({
  controllers: [CrmPipelineController],
  providers: [CrmPipelineService],
  exports: [CrmPipelineService],
})
export class CrmPipelineModule {}
