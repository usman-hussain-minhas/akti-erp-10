import { Controller, Get, Inject } from '@nestjs/common';

import { Phase6BService } from './phase_6b.service';

@Controller('platform/phase-6b')
export class Phase6BController {
  constructor(@Inject(Phase6BService) private readonly phase6BService: Phase6BService) {}

  @Get('scaffold-control/readiness')
  getReadiness() {
    return this.phase6BService.getScaffoldReadiness();
  }

  @Get('runtime/status')
  getRuntimeStatus() {
    return this.phase6BService.getRuntimeCapabilityStatus();
  }
}
