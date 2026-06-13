import { Controller, Get, Headers, Inject } from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { type HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

@Controller('platform/notifications')
export class NotificationsController {
  constructor(@Inject(NotificationsService) private readonly notificationsService: NotificationsService) {}

  @Get('summary')
  getSummary(@Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);

    return this.notificationsService.getSummary({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
    });
  }
}
