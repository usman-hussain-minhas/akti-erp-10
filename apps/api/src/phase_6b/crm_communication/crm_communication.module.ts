import { Module } from '@nestjs/common';

import { CrmCommunicationController } from './crm_communication.controller';
import { CrmCommunicationService } from './crm_communication.service';

@Module({
  controllers: [CrmCommunicationController],
  providers: [CrmCommunicationService],
  exports: [CrmCommunicationService],
})
export class CrmCommunicationModule {}
