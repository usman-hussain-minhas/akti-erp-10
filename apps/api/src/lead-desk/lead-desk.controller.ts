import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';

import { LeadDeskService } from './lead-desk.service';

function requireParam(raw: string, name: string) {
  const value = raw?.trim();
  if (!value) {
    throw new BadRequestException(`${name} is required`);
  }
  return value;
}

@Controller('api/lead-desk/organizations/:organization_id/leads')
export class LeadDeskController {
  constructor(private readonly leadDeskService: LeadDeskService) {}

  @Post()
  createLead(
    @Param('organization_id') organizationIdRaw: string,
    @Body() body: unknown,
    @Headers('x-actor-user-id') actorUserIdRaw?: string,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    return this.leadDeskService.createLead(organizationId, body, actorUserIdRaw);
  }

  @Get()
  listLeads(
    @Param('organization_id') organizationIdRaw: string,
    @Query() query: Record<string, unknown>,
    @Headers('x-actor-user-id') actorUserIdRaw?: string,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    return this.leadDeskService.listLeads(organizationId, query, actorUserIdRaw);
  }

  @Get(':lead_id')
  getLeadDetail(
    @Param('organization_id') organizationIdRaw: string,
    @Param('lead_id') leadIdRaw: string,
    @Headers('x-actor-user-id') actorUserIdRaw?: string,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    const leadId = requireParam(leadIdRaw, 'lead_id');
    return this.leadDeskService.getLeadDetail(organizationId, leadId, actorUserIdRaw);
  }

  @Patch(':lead_id/status')
  updateLeadStatus(
    @Param('organization_id') organizationIdRaw: string,
    @Param('lead_id') leadIdRaw: string,
    @Body() body: unknown,
    @Headers('x-actor-user-id') actorUserIdRaw?: string,
  ) {
    const organizationId = requireParam(organizationIdRaw, 'organization_id');
    const leadId = requireParam(leadIdRaw, 'lead_id');
    return this.leadDeskService.updateLeadStatus(organizationId, leadId, body, actorUserIdRaw);
  }
}
