import { Module } from '@nestjs/common';

import { Phase6BController } from './phase_6b.controller';
import { Phase6BService } from './phase_6b.service';

@Module({
  controllers: [Phase6BController],
  providers: [Phase6BService],
  exports: [Phase6BService],
})
export class Phase6BModule {}
