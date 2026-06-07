import { Module } from '@nestjs/common';

import { Phase6AController } from './phase_6a.controller';
import { Phase6AService } from './phase_6a.service';

@Module({
  controllers: [Phase6AController],
  providers: [Phase6AService],
  exports: [Phase6AService],
})
export class Phase6AModule {}
