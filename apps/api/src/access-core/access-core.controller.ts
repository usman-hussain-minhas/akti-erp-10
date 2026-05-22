import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { AccessCoreService } from './access-core.service';
import {
  AccessCoreValidationError,
  validateAssignmentIdParam,
  validateCreateGroupBody,
  validateCreateGroupCapabilityBody,
  validateCreateMembershipBody,
  validateCreateUserBody,
  validateGroupIdParam,
  validateMembershipIdParam,
  validateOrganizationIdParam,
  validateUpdateGroupBody,
  validateUpdateUserBody,
  validateUserIdParam,
} from './dto/access-core.dto';

@Controller('platform/access')
export class AccessCoreController {
  constructor(private readonly accessCoreService: AccessCoreService) {}

  @Get('capabilities')
  listCapabilities() {
    return this.accessCoreService.listCapabilities();
  }

  @Post('organizations/:organization_id/users')
  createUser(@Param('organization_id') organizationIdRaw: string, @Body() body: unknown) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const input = this.validate(() => validateCreateUserBody(body));
    return this.accessCoreService.createUser(organizationId, input);
  }

  @Get('organizations/:organization_id/users')
  listUsers(@Param('organization_id') organizationIdRaw: string) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    return this.accessCoreService.listUsers(organizationId);
  }

  @Get('organizations/:organization_id/users/:user_id')
  getUser(@Param('organization_id') organizationIdRaw: string, @Param('user_id') userIdRaw: string) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const userId = this.validateParam(() => validateUserIdParam(userIdRaw));
    return this.accessCoreService.getUser(organizationId, userId);
  }

  @Patch('organizations/:organization_id/users/:user_id')
  updateUser(
    @Param('organization_id') organizationIdRaw: string,
    @Param('user_id') userIdRaw: string,
    @Body() body: unknown,
  ) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const userId = this.validateParam(() => validateUserIdParam(userIdRaw));
    const input = this.validate(() => validateUpdateUserBody(body));
    return this.accessCoreService.updateUser(organizationId, userId, input);
  }

  @Delete('organizations/:organization_id/users/:user_id')
  deleteUser(@Param('organization_id') organizationIdRaw: string, @Param('user_id') userIdRaw: string) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const userId = this.validateParam(() => validateUserIdParam(userIdRaw));
    return this.accessCoreService.deleteUser(organizationId, userId);
  }

  @Post('organizations/:organization_id/groups')
  createGroup(@Param('organization_id') organizationIdRaw: string, @Body() body: unknown) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const input = this.validate(() => validateCreateGroupBody(body));
    return this.accessCoreService.createGroup(organizationId, input);
  }

  @Get('organizations/:organization_id/groups')
  listGroups(@Param('organization_id') organizationIdRaw: string) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    return this.accessCoreService.listGroups(organizationId);
  }

  @Get('organizations/:organization_id/groups/:group_id')
  getGroup(@Param('organization_id') organizationIdRaw: string, @Param('group_id') groupIdRaw: string) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const groupId = this.validateParam(() => validateGroupIdParam(groupIdRaw));
    return this.accessCoreService.getGroup(organizationId, groupId);
  }

  @Patch('organizations/:organization_id/groups/:group_id')
  updateGroup(
    @Param('organization_id') organizationIdRaw: string,
    @Param('group_id') groupIdRaw: string,
    @Body() body: unknown,
  ) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const groupId = this.validateParam(() => validateGroupIdParam(groupIdRaw));
    const input = this.validate(() => validateUpdateGroupBody(body));
    return this.accessCoreService.updateGroup(organizationId, groupId, input);
  }

  @Delete('organizations/:organization_id/groups/:group_id')
  deleteGroup(@Param('organization_id') organizationIdRaw: string, @Param('group_id') groupIdRaw: string) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const groupId = this.validateParam(() => validateGroupIdParam(groupIdRaw));
    return this.accessCoreService.deleteGroup(organizationId, groupId);
  }

  @Post('organizations/:organization_id/user-groups')
  createMembership(@Param('organization_id') organizationIdRaw: string, @Body() body: unknown) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const input = this.validate(() => validateCreateMembershipBody(body));
    return this.accessCoreService.createMembership(organizationId, input);
  }

  @Get('organizations/:organization_id/user-groups')
  listMemberships(@Param('organization_id') organizationIdRaw: string) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    return this.accessCoreService.listMemberships(organizationId);
  }

  @Delete('organizations/:organization_id/user-groups/:membership_id')
  deleteMembership(
    @Param('organization_id') organizationIdRaw: string,
    @Param('membership_id') membershipIdRaw: string,
  ) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const membershipId = this.validateParam(() => validateMembershipIdParam(membershipIdRaw));
    return this.accessCoreService.deleteMembership(organizationId, membershipId);
  }

  @Post('organizations/:organization_id/group-capabilities')
  createGroupCapabilityAssignment(@Param('organization_id') organizationIdRaw: string, @Body() body: unknown) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const input = this.validate(() => validateCreateGroupCapabilityBody(body));
    return this.accessCoreService.createGroupCapabilityAssignment(organizationId, input);
  }

  @Get('organizations/:organization_id/group-capabilities')
  listGroupCapabilityAssignments(@Param('organization_id') organizationIdRaw: string) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    return this.accessCoreService.listGroupCapabilityAssignments(organizationId);
  }

  @Delete('organizations/:organization_id/group-capabilities/:assignment_id')
  deleteGroupCapabilityAssignment(
    @Param('organization_id') organizationIdRaw: string,
    @Param('assignment_id') assignmentIdRaw: string,
  ) {
    const organizationId = this.validateParam(() => validateOrganizationIdParam(organizationIdRaw));
    const assignmentId = this.validateParam(() => validateAssignmentIdParam(assignmentIdRaw));
    return this.accessCoreService.deleteGroupCapabilityAssignment(organizationId, assignmentId);
  }

  private validate<T>(fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      if (error instanceof AccessCoreValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private validateParam<T>(fn: () => T): T {
    return this.validate(fn);
  }
}
