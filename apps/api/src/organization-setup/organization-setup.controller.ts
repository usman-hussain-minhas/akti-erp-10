import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { OrganizationSetupService } from './organization-setup.service';

@Controller('platform/setup/organization')
export class OrganizationSetupController {
  constructor(private readonly organizationSetupService: OrganizationSetupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createInitialOrganization(@Body() body: unknown) {
    return this.organizationSetupService.bootstrapSetup(body);
  }
}
