import { BadRequestException, Injectable } from '@nestjs/common';

export type NotificationSummaryRequest = {
  organization_id: string;
  actor_user_id: string;
};

export type NotificationSummaryResponse = {
  unread_count: 0;
  status: 'not_configured';
  tenant_context: {
    organization_id: string;
    actor_user_id: string;
  };
  capability: {
    required: 'platform.notifications.summary.view';
  };
  providers: {
    live_provider_enabled: false;
    notification_center_enabled: false;
  };
};

@Injectable()
export class NotificationsService {
  getSummary(input: NotificationSummaryRequest): NotificationSummaryResponse {
    const organizationId = this.nonEmpty(input.organization_id, 'organization_id');
    const actorUserId = this.nonEmpty(input.actor_user_id, 'actor_user_id');

    return {
      unread_count: 0,
      status: 'not_configured',
      tenant_context: {
        organization_id: organizationId,
        actor_user_id: actorUserId,
      },
      capability: {
        required: 'platform.notifications.summary.view',
      },
      providers: {
        live_provider_enabled: false,
        notification_center_enabled: false,
      },
    };
  }

  private nonEmpty(value: string, field: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`notification summary ${field} is required`);
    }

    return value.trim();
  }
}
