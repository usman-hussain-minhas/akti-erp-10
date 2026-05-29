import { BadRequestException, Controller, Get, Headers, Param, Query } from '@nestjs/common';

import { ReportingService } from './reporting.service';
import { type HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

type ReadModelQueryParams = {
  capability_keys?: unknown;
  limit?: unknown;
  cursor?: unknown;
};

@Controller('platform/read-models')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get(':key')
  queryReadModel(@Param('key') key: string, @Query() query: ReadModelQueryParams, @Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);

    return this.reportingService.queryReadModel({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      read_model_key: requiredString(key, 'key'),
      capability_keys: requiredStringList(query.capability_keys, 'capability_keys'),
      limit: optionalLimit(query.limit),
      cursor: optionalString(query.cursor, 'cursor'),
    });
  }
}

function requiredStringList(input: unknown, field: string): string[] {
  const rawValues = Array.isArray(input) ? input : typeof input === 'string' ? input.split(',') : [];
  const values = rawValues.map((item) => requiredString(item, field));
  if (values.length === 0) {
    throw new BadRequestException(`reporting ${field} is required`);
  }

  return values;
}

function requiredString(input: unknown, field: string): string {
  const value = optionalString(input, field);
  if (!value) {
    throw new BadRequestException(`reporting ${field} is required`);
  }

  return value;
}

function optionalString(input: unknown, field: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`reporting ${field} must be a non-empty string`);
  }

  return input.trim();
}

function optionalLimit(input: unknown): number | undefined {
  if (input === undefined) {
    return undefined;
  }
  const raw = requiredString(input, 'limit');
  const value = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value.toString() !== raw) {
    throw new BadRequestException('reporting limit must be an integer');
  }

  return value;
}
