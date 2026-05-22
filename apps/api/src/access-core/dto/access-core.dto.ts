export type CreateUserInput = {
  email: string;
  display_name: string;
  status: string;
  primary_unit_id?: string | null;
};

export type UpdateUserInput = {
  email?: string;
  display_name?: string;
  status?: string;
  primary_unit_id?: string | null;
};

export type CreateGroupInput = {
  key: string;
  label: string;
  status: string;
};

export type UpdateGroupInput = {
  key?: string;
  label?: string;
  status?: string;
};

export type CreateMembershipInput = {
  user_id: string;
  group_id: string;
};

export type CreateGroupCapabilityInput = {
  group_id: string;
  capability_key: string;
  scope_type: string;
  scope_unit_id?: string | null;
};

const SAFE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_KEY_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

const MAX_EMAIL_LENGTH = 254;
const MAX_DISPLAY_NAME_LENGTH = 160;
const MAX_STATUS_LENGTH = 64;
const MAX_KEY_LENGTH = 120;
const MAX_LABEL_LENGTH = 160;

export class AccessCoreValidationError extends Error {}

function assertObjectBody(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AccessCoreValidationError('request body must be an object');
  }

  return value as Record<string, unknown>;
}

function assertNonEmptyPathParam(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AccessCoreValidationError(`${field} path param is required`);
  }

  return value.trim();
}

function assertTrimmedString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string') {
    throw new AccessCoreValidationError(`${field} must be a string`);
  }

  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength) {
    throw new AccessCoreValidationError(`${field} must be 1-${maxLength} characters`);
  }

  return normalized;
}

function normalizeOptionalId(value: unknown, field: string) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AccessCoreValidationError(`${field} must be a string when provided`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new AccessCoreValidationError(`${field} must not be empty when provided`);
  }

  return normalized;
}

export function validateOrganizationIdParam(value: unknown) {
  return assertNonEmptyPathParam(value, 'organization_id');
}

export function validateUserIdParam(value: unknown) {
  return assertNonEmptyPathParam(value, 'user_id');
}

export function validateGroupIdParam(value: unknown) {
  return assertNonEmptyPathParam(value, 'group_id');
}

export function validateMembershipIdParam(value: unknown) {
  return assertNonEmptyPathParam(value, 'membership_id');
}

export function validateAssignmentIdParam(value: unknown) {
  return assertNonEmptyPathParam(value, 'assignment_id');
}

export function validateCreateUserBody(input: unknown): CreateUserInput {
  const body = assertObjectBody(input);

  const email = assertTrimmedString(body.email, 'email', MAX_EMAIL_LENGTH).toLowerCase();
  if (!SAFE_EMAIL_PATTERN.test(email)) {
    throw new AccessCoreValidationError('email must be in a valid format');
  }

  const displayName = assertTrimmedString(body.display_name, 'display_name', MAX_DISPLAY_NAME_LENGTH);
  const status = assertTrimmedString(body.status, 'status', MAX_STATUS_LENGTH);
  const primaryUnitId = normalizeOptionalId(body.primary_unit_id, 'primary_unit_id');

  return {
    email,
    display_name: displayName,
    status,
    primary_unit_id: primaryUnitId,
  };
}

export function validateUpdateUserBody(input: unknown): UpdateUserInput {
  const body = assertObjectBody(input);

  const output: UpdateUserInput = {};

  if ('email' in body) {
    const email = assertTrimmedString(body.email, 'email', MAX_EMAIL_LENGTH).toLowerCase();
    if (!SAFE_EMAIL_PATTERN.test(email)) {
      throw new AccessCoreValidationError('email must be in a valid format');
    }
    output.email = email;
  }

  if ('display_name' in body) {
    output.display_name = assertTrimmedString(body.display_name, 'display_name', MAX_DISPLAY_NAME_LENGTH);
  }

  if ('status' in body) {
    output.status = assertTrimmedString(body.status, 'status', MAX_STATUS_LENGTH);
  }

  if ('primary_unit_id' in body) {
    output.primary_unit_id = normalizeOptionalId(body.primary_unit_id, 'primary_unit_id');
  }

  if (Object.keys(output).length === 0) {
    throw new AccessCoreValidationError('at least one user field must be provided for update');
  }

  return output;
}

export function validateCreateGroupBody(input: unknown): CreateGroupInput {
  const body = assertObjectBody(input);

  const key = assertTrimmedString(body.key, 'key', MAX_KEY_LENGTH).toLowerCase();
  if (!SAFE_KEY_PATTERN.test(key)) {
    throw new AccessCoreValidationError('key must use lowercase slug/dot-key safe format');
  }

  const label = assertTrimmedString(body.label, 'label', MAX_LABEL_LENGTH);
  const status = assertTrimmedString(body.status, 'status', MAX_STATUS_LENGTH);

  return {
    key,
    label,
    status,
  };
}

export function validateUpdateGroupBody(input: unknown): UpdateGroupInput {
  const body = assertObjectBody(input);

  const output: UpdateGroupInput = {};

  if ('key' in body) {
    const key = assertTrimmedString(body.key, 'key', MAX_KEY_LENGTH).toLowerCase();
    if (!SAFE_KEY_PATTERN.test(key)) {
      throw new AccessCoreValidationError('key must use lowercase slug/dot-key safe format');
    }
    output.key = key;
  }

  if ('label' in body) {
    output.label = assertTrimmedString(body.label, 'label', MAX_LABEL_LENGTH);
  }

  if ('status' in body) {
    output.status = assertTrimmedString(body.status, 'status', MAX_STATUS_LENGTH);
  }

  if (Object.keys(output).length === 0) {
    throw new AccessCoreValidationError('at least one group field must be provided for update');
  }

  return output;
}

export function validateCreateMembershipBody(input: unknown): CreateMembershipInput {
  const body = assertObjectBody(input);

  return {
    user_id: assertTrimmedString(body.user_id, 'user_id', 191),
    group_id: assertTrimmedString(body.group_id, 'group_id', 191),
  };
}

export function validateCreateGroupCapabilityBody(input: unknown): CreateGroupCapabilityInput {
  const body = assertObjectBody(input);

  const capabilityKey = assertTrimmedString(body.capability_key, 'capability_key', MAX_KEY_LENGTH).toLowerCase();
  if (!SAFE_KEY_PATTERN.test(capabilityKey)) {
    throw new AccessCoreValidationError('capability_key must use lowercase slug/dot-key safe format');
  }

  const scopeType = assertTrimmedString(body.scope_type, 'scope_type', 64);
  const scopeUnitId = normalizeOptionalId(body.scope_unit_id, 'scope_unit_id');

  return {
    group_id: assertTrimmedString(body.group_id, 'group_id', 191),
    capability_key: capabilityKey,
    scope_type: scopeType,
    scope_unit_id: scopeUnitId,
  };
}
