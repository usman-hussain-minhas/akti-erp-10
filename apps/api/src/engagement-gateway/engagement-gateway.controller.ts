import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';

import { EngagementGatewayService } from './engagement-gateway.service';
import { HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

function validateOrganizationIdParam(raw: string) {
  const value = raw?.trim();
  if (!value) {
    throw new BadRequestException('organization_id is required');
  }
  return value;
}

@Controller('platform/engagement-gateway')
export class EngagementGatewayController {
  constructor(private readonly engagementGatewayService: EngagementGatewayService) {}

  @Post('organizations/:organization_id/requests')
  createRequest(
    @Param('organization_id') organizationIdRaw: string,
    @Body() body: unknown,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = validateOrganizationIdParam(organizationIdRaw);
    return this.engagementGatewayService.createRequest(
      organizationId,
      body,
      this.resolveActorUserId(headers, organizationId),
    );
  }

  @Get('organizations/:organization_id/health')
  readHealth(
    @Param('organization_id') organizationIdRaw: string,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = validateOrganizationIdParam(organizationIdRaw);
    return this.engagementGatewayService.readHealth(organizationId, this.resolveActorUserId(headers, organizationId));
  }

  private resolveActorUserId(headers: HeaderRecord, organizationId: string): string {
    return resolveTrustedRequestContext(headers, { routeOrganizationId: organizationId }).actor_user_id;
  }
}
