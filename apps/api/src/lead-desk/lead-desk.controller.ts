import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Query, Inject } from '@nestjs/common';

import { LeadDeskService } from './lead-desk.service';
import { HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

function requireParam(raw: string, name: string) {
  const value = raw?.trim();
  if (!value) {
    throw new BadRequestException(`${name} is required`);
  }
  return value;
}

@Controller('api/lead-desk/organizations/:organization_id/leads')
export class LeadDeskController {
  constructor(@Inject(LeadDeskService) private readonly leadDeskService: LeadDeskService) {}

  @Post()
  createLead(
    @Param('organization_id') organizationIdRaw: string,
    @Body() body: unknown,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    return this.leadDeskService.createLead(organizationId, body, this.resolveActorUserId(headers, organizationId));
  }

  @Get()
  listLeads(
    @Param('organization_id') organizationIdRaw: string,
    @Query() query: Record<string, unknown>,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    return this.leadDeskService.listLeads(organizationId, query, this.resolveActorUserId(headers, organizationId));
  }

  @Get(':lead_id')
  getLeadDetail(
    @Param('organization_id') organizationIdRaw: string,
    @Param('lead_id') leadIdRaw: string,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    const leadId = requireParam(leadIdRaw, 'lead_id');
    return this.leadDeskService.getLeadDetail(organizationId, leadId, this.resolveActorUserId(headers, organizationId));
  }

  @Patch(':lead_id/status')
  updateLeadStatus(
    @Param('organization_id') organizationIdRaw: string,
    @Param('lead_id') leadIdRaw: string,
    @Body() body: unknown,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    const leadId = requireParam(leadIdRaw, 'lead_id');
    return this.leadDeskService.updateLeadStatus(
      organizationId,
      leadId,
      body,
      this.resolveActorUserId(headers, organizationId),
    );
  }

  @Patch(':lead_id/assignment')
  updateLeadAssignment(
    @Param('organization_id') organizationIdRaw: string,
    @Param('lead_id') leadIdRaw: string,
    @Body() body: unknown,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    const leadId = requireParam(leadIdRaw, 'lead_id');
    return this.leadDeskService.updateLeadAssignment(
      organizationId,
      leadId,
      body,
      this.resolveActorUserId(headers, organizationId),
    );
  }

  private resolveActorUserId(headers: HeaderRecord, organizationId: string): string {
    return resolveTrustedRequestContext(headers, { routeOrganizationId: organizationId }).actor_user_id;
  }
}
