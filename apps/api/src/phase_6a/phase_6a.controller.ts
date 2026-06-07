import { Controller, Get } from '@nestjs/common';

import { Phase6AService } from './phase_6a.service';

@Controller('platform/phase-6a/scaffold-control')
export class Phase6AController {
  constructor(private readonly phase6AService: Phase6AService) {}

  @Get('readiness')
  getReadiness() {
    return this.phase6AService.getScaffoldReadiness();
  }
}
