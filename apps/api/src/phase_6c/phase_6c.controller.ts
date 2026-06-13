import { Controller, Get, Inject } from '@nestjs/common';

import { Phase6CService } from './phase_6c.service';

@Controller('platform/phase-6c')
export class Phase6CController {
  constructor(@Inject(Phase6CService) private readonly phase6CService: Phase6CService) {}

  @Get('scaffold-control/readiness')
  getReadiness() {
    return this.phase6CService.getScaffoldReadiness();
  }

  @Get('runtime/status')
  getRuntimeStatus() {
    return this.phase6CService.getRuntimeCapabilityStatus();
  }
}
