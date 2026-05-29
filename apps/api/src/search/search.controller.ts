import { BadRequestException, Controller, Get, Headers, Query } from '@nestjs/common';

import { SearchService, type SearchIndexTargetKey } from './search.service';
import { type HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

type SearchQueryParams = {
  q?: unknown;
  target_keys?: unknown;
  capability_keys?: unknown;
  limit?: unknown;
  cursor?: unknown;
};

const SEARCH_TARGET_KEYS = new Set(['workflow_definition', 'workflow_instance']);

@Controller('platform/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() query: SearchQueryParams, @Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);

    return this.searchService.search({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      query: requiredString(query.q, 'q'),
      target_keys: optionalTargetKeys(query.target_keys),
      capability_keys: requiredStringList(query.capability_keys, 'capability_keys'),
      limit: optionalLimit(query.limit),
      cursor: optionalString(query.cursor, 'cursor'),
    });
  }
}

function optionalTargetKeys(input: unknown): SearchIndexTargetKey[] | undefined {
  if (input === undefined) {
    return undefined;
  }

  return requiredStringList(input, 'target_keys').map((value) => {
    if (!SEARCH_TARGET_KEYS.has(value)) {
      throw new BadRequestException(`search target ${value} is not approved`);
    }

    return value as SearchIndexTargetKey;
  });
}

function requiredStringList(input: unknown, field: string): string[] {
  const values = normalizeStringList(input);
  if (values.length === 0) {
    throw new BadRequestException(`search ${field} is required`);
  }

  return values;
}

function normalizeStringList(input: unknown): string[] {
  const rawValues = Array.isArray(input) ? input : typeof input === 'string' ? input.split(',') : [];
  return rawValues.map((item) => requiredString(item, 'list item'));
}

function requiredString(input: unknown, field: string): string {
  const value = optionalString(input, field);
  if (!value) {
    throw new BadRequestException(`search ${field} is required`);
  }

  return value;
}

function optionalString(input: unknown, field: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`search ${field} must be a non-empty string`);
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
    throw new BadRequestException('search limit must be an integer');
  }

  return value;
}
