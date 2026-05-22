export type CreateOrganizationSetupRequest = {
  slug: unknown;
  display_name: unknown;
  status: unknown;
  domain: unknown;
  is_primary?: unknown;
};

export type CreateOrganizationSetupInput = {
  slug: string;
  display_name: string;
  status: string;
  domain: string;
  is_primary?: boolean;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOMAIN_PATTERN = /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

const MAX_SLUG_LENGTH = 64;
const MAX_DISPLAY_NAME_LENGTH = 160;
const MAX_STATUS_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 253;

export class OrganizationSetupValidationError extends Error {}

function assertStringField(value: unknown, fieldName: string) {
  if (typeof value !== 'string') {
    throw new OrganizationSetupValidationError(`${fieldName} must be a string`);
  }

  return value.trim();
}

export function validateAndNormalizeCreateOrganizationSetupInput(
  input: unknown,
): CreateOrganizationSetupInput {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new OrganizationSetupValidationError('request body must be an object');
  }

  const body = input as CreateOrganizationSetupRequest;

  const slug = assertStringField(body.slug, 'slug').toLowerCase();
  if (slug.length === 0 || slug.length > MAX_SLUG_LENGTH) {
    throw new OrganizationSetupValidationError(`slug must be 1-${MAX_SLUG_LENGTH} characters`);
  }
  if (!SLUG_PATTERN.test(slug)) {
    throw new OrganizationSetupValidationError('slug must use lowercase letters, numbers, and hyphens only');
  }

  const displayName = assertStringField(body.display_name, 'display_name');
  if (displayName.length === 0 || displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new OrganizationSetupValidationError(
      `display_name must be 1-${MAX_DISPLAY_NAME_LENGTH} characters`,
    );
  }

  const status = assertStringField(body.status, 'status');
  if (status.length === 0 || status.length > MAX_STATUS_LENGTH) {
    throw new OrganizationSetupValidationError(`status must be 1-${MAX_STATUS_LENGTH} characters`);
  }

  const domain = assertStringField(body.domain, 'domain').toLowerCase();
  if (domain.length === 0 || domain.length > MAX_DOMAIN_LENGTH) {
    throw new OrganizationSetupValidationError(`domain must be 1-${MAX_DOMAIN_LENGTH} characters`);
  }
  if (!DOMAIN_PATTERN.test(domain)) {
    throw new OrganizationSetupValidationError('domain must be a valid hostname-style domain');
  }

  let isPrimary: boolean | undefined;
  if (body.is_primary !== undefined) {
    if (typeof body.is_primary !== 'boolean') {
      throw new OrganizationSetupValidationError('is_primary must be a boolean when provided');
    }
    if (body.is_primary !== true) {
      throw new OrganizationSetupValidationError('is_primary must be true when provided');
    }
    isPrimary = true;
  }

  return {
    slug,
    display_name: displayName,
    status,
    domain,
    is_primary: isPrimary,
  };
}
