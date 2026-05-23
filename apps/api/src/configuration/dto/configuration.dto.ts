export type PortalMode = 'simple' | 'builder';

export type UpdatePortalModeInput = {
  mode: PortalMode;
};

const PORTAL_MODES = new Set<PortalMode>(['simple', 'builder']);
const MAX_ID_LENGTH = 191;

export class ConfigurationValidationError extends Error {}

function assertObjectBody(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ConfigurationValidationError('request body must be an object');
  }

  return value as Record<string, unknown>;
}

function assertNonEmptyPathParam(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > MAX_ID_LENGTH) {
    throw new ConfigurationValidationError(`${field} path param is required`);
  }

  return value.trim();
}

export function validateOrganizationIdParam(value: unknown) {
  return assertNonEmptyPathParam(value, 'organization_id');
}

export function validateUpdatePortalModeBody(input: unknown): UpdatePortalModeInput {
  const body = assertObjectBody(input);

  if (typeof body.mode !== 'string') {
    throw new ConfigurationValidationError('mode must be simple or builder');
  }

  const mode = body.mode.trim().toLowerCase();
  if (!PORTAL_MODES.has(mode as PortalMode)) {
    throw new ConfigurationValidationError('mode must be simple or builder');
  }

  return {
    mode: mode as PortalMode,
  };
}
