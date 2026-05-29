import { BadRequestException, Body, Controller, Get, Headers, Param, Put } from '@nestjs/common';

import {
  ConfigurationValidationError,
  validateOrganizationIdParam,
  validateUpdatePortalModeBody,
} from './dto/configuration.dto';
import { ConfigurationService } from './configuration.service';
import { HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

@Controller('platform')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('configuration/organizations/:organization_id/portal-mode')
  getPortalMode(
    @Param('organization_id') organizationIdRaw: string,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = this.validate(() => validateOrganizationIdParam(organizationIdRaw));
    return this.configurationService.getPortalMode(organizationId, this.resolveActorUserId(headers, organizationId));
  }

  @Get('configuration/organizations/:organization_id/tenant-config')
  getTenantConfiguration(
    @Param('organization_id') organizationIdRaw: string,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = this.validate(() => validateOrganizationIdParam(organizationIdRaw));
    return this.configurationService.getTenantConfiguration(organizationId, this.resolveActorUserId(headers, organizationId));
  }

  @Get('branding/effective')
  getEffectiveBranding(@Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);
    return this.configurationService.getEffectiveBranding(context.organization_id, context.actor_user_id);
  }

  @Put('configuration/organizations/:organization_id/portal-mode')
  updatePortalMode(
    @Param('organization_id') organizationIdRaw: string,
    @Body() body: unknown,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = this.validate(() => validateOrganizationIdParam(organizationIdRaw));
    const input = this.validate(() => validateUpdatePortalModeBody(body));
    return this.configurationService.updatePortalMode(organizationId, input, this.resolveActorUserId(headers, organizationId));
  }

  private validate<T>(fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      if (error instanceof ConfigurationValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private resolveActorUserId(headers: HeaderRecord, organizationId: string): string {
    return resolveTrustedRequestContext(headers, { routeOrganizationId: organizationId }).actor_user_id;
  }
}
