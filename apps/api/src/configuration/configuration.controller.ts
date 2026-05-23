import { BadRequestException, Body, Controller, Get, Headers, Param, Put } from '@nestjs/common';

import {
  ConfigurationValidationError,
  validateOrganizationIdParam,
  validateUpdatePortalModeBody,
} from './dto/configuration.dto';
import { ConfigurationService } from './configuration.service';

@Controller('platform/configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('organizations/:organization_id/portal-mode')
  getPortalMode(
    @Param('organization_id') organizationIdRaw: string,
    @Headers('x-actor-user-id') actorUserIdRaw?: string,
  ) {
    const organizationId = this.validate(() => validateOrganizationIdParam(organizationIdRaw));
    return this.configurationService.getPortalMode(organizationId, actorUserIdRaw);
  }

  @Put('organizations/:organization_id/portal-mode')
  updatePortalMode(
    @Param('organization_id') organizationIdRaw: string,
    @Body() body: unknown,
    @Headers('x-actor-user-id') actorUserIdRaw?: string,
  ) {
    const organizationId = this.validate(() => validateOrganizationIdParam(organizationIdRaw));
    const input = this.validate(() => validateUpdatePortalModeBody(body));
    return this.configurationService.updatePortalMode(organizationId, input, actorUserIdRaw);
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
}
