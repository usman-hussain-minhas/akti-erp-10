import { Controller, Get, Headers } from '@nestjs/common';

import { DataControlsService } from './data-controls.service';
import { type HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

@Controller('platform/data-controls')
export class DataControlsController {
  constructor(private readonly dataControlsService: DataControlsService) {}

  @Get('status')
  getStatus(@Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);

    return this.dataControlsService.getStatus({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
    });
  }
}
