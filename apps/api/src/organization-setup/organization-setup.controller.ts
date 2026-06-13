import { Body, Controller, HttpCode, HttpStatus, Post, Inject } from '@nestjs/common';

import { OrganizationSetupService } from './organization-setup.service';

@Controller('platform/setup/organization')
export class OrganizationSetupController {
  constructor(@Inject(OrganizationSetupService) private readonly organizationSetupService: OrganizationSetupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createInitialOrganization(@Body() body: unknown) {
    return this.organizationSetupService.bootstrapSetup(body);
  }
}
