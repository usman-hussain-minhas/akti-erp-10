import { Module } from '@nestjs/common';

import { CrmDeduplicationController } from './crm_deduplication.controller';
import { CrmDeduplicationService } from './crm_deduplication.service';

@Module({
  controllers: [CrmDeduplicationController],
  providers: [CrmDeduplicationService],
  exports: [CrmDeduplicationService],
})
export class CrmDeduplicationModule {}
