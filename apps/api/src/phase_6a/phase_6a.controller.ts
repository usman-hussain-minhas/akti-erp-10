import { Controller, Get } from '@nestjs/common';

import { Phase6AService } from './phase_6a.service';

@Controller('platform/phase-6a')
export class Phase6AController {
  constructor(private readonly phase6AService: Phase6AService) {}

  @Get('scaffold-control/readiness')
  getReadiness() {
    return this.phase6AService.getScaffoldReadiness();
  }

  @Get('runtime/status')
  getRuntimeStatus() {
    return this.phase6AService.getRuntimeCapabilityStatus();
  }
}
