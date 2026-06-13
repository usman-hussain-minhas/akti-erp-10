import { Module } from '@nestjs/common';

import { Phase6CController } from './phase_6c.controller';
import { Phase6CService } from './phase_6c.service';

@Module({
  controllers: [Phase6CController],
  providers: [Phase6CService],
  exports: [Phase6CService],
})
export class Phase6CModule {}
