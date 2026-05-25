import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';

import {
  HierarchyValidationError,
  validateCreateOrganizationUnitBody,
  validateCreateUnitTypeBody,
  validateOrganizationIdParam,
} from './dto/hierarchy.dto';
import { HierarchyService } from './hierarchy.service';
import { HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

@Controller('platform/hierarchy')
export class HierarchyController {
  constructor(private readonly hierarchyService: HierarchyService) {}

  @Post('organizations/:organization_id/unit-types')
  createUnitType(
    @Param('organization_id') organizationIdRaw: string,
    @Body() body: unknown,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const input = this.validate(() => validateCreateUnitTypeBody(body));
    return this.hierarchyService.createUnitType(organizationId, input, this.resolveActorUserId(headers, organizationId));
  }

  @Get('organizations/:organization_id/unit-types')
  listUnitTypes(
    @Param('organization_id') organizationIdRaw: string,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    return this.hierarchyService.listUnitTypes(organizationId, this.resolveActorUserId(headers, organizationId));
  }

  @Post('organizations/:organization_id/units')
  createUnit(
    @Param('organization_id') organizationIdRaw: string,
    @Body() body: unknown,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const input = this.validate(() => validateCreateOrganizationUnitBody(body));
    return this.hierarchyService.createUnit(organizationId, input, this.resolveActorUserId(headers, organizationId));
  }

  @Get('organizations/:organization_id/units')
  listUnits(
    @Param('organization_id') organizationIdRaw: string,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    return this.hierarchyService.listUnits(organizationId, this.resolveActorUserId(headers, organizationId));
  }

  private validate<T>(fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      if (error instanceof HierarchyValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private validateParam<T>(fn: () => T): T {
    return this.validate(fn);
  }

  private resolveActorUserId(headers: HeaderRecord, organizationId: string): string {
    return resolveTrustedRequestContext(headers, { routeOrganizationId: organizationId }).actor_user_id;
  }
}
