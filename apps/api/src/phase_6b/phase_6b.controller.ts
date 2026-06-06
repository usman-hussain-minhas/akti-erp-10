import { Controller, Get } from '@nestjs/common';

import { Phase6BService } from './phase_6b.service';

@Controller('platform/phase-6b/scaffold-control')
export class Phase6BController {
  constructor(private readonly phase6BService: Phase6BService) {}

  @Get('readiness')
  getReadiness() {
    return this.phase6BService.getScaffoldReadiness();
  }
}
