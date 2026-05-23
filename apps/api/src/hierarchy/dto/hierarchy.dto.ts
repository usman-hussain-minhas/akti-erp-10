export type CreateUnitTypeInput = {
  key: string;
  label: string;
  sort_order: number;
};

export type CreateOrganizationUnitInput = {
  unit_type_id: string;
  parent_unit_id?: string | null;
  key: string;
  name: string;
  status: string;
};

const SAFE_KEY_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

const MAX_KEY_LENGTH = 120;
const MAX_LABEL_LENGTH = 160;
const MAX_NAME_LENGTH = 200;
const MAX_STATUS_LENGTH = 64;
const MAX_ID_LENGTH = 191;
const MIN_SORT_ORDER = 0;
const MAX_SORT_ORDER = 1_000_000;

export class HierarchyValidationError extends Error {}

function assertObjectBody(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HierarchyValidationError('request body must be an object');
  }

  return value as Record<string, unknown>;
}

function assertNonEmptyPathParam(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HierarchyValidationError(`${field} path param is required`);
  }

  return value.trim();
}

function assertTrimmedString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string') {
    throw new HierarchyValidationError(`${field} must be a string`);
  }

  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength) {
    throw new HierarchyValidationError(`${field} must be 1-${maxLength} characters`);
  }

  return normalized;
}

function assertSafeKey(value: unknown, field: string) {
  const key = assertTrimmedString(value, field, MAX_KEY_LENGTH).toLowerCase();
  if (!SAFE_KEY_PATTERN.test(key)) {
    throw new HierarchyValidationError(`${field} must use lowercase slug/dot-key safe format`);
  }

  return key;
}

function normalizeOptionalId(value: unknown, field: string) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new HierarchyValidationError(`${field} must be a string when provided`);
  }

  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > MAX_ID_LENGTH) {
    throw new HierarchyValidationError(`${field} must be 1-${MAX_ID_LENGTH} characters when provided`);
  }

  return normalized;
}

function assertSortOrder(value: unknown) {
  if (typeof value !== 'number' || !Number.isInteger(value) || !Number.isFinite(value)) {
    throw new HierarchyValidationError('sort_order must be an integer');
  }

  if (value < MIN_SORT_ORDER || value > MAX_SORT_ORDER) {
    throw new HierarchyValidationError(`sort_order must be between ${MIN_SORT_ORDER} and ${MAX_SORT_ORDER}`);
  }

  return value;
}

export function validateOrganizationIdParam(value: unknown) {
  return assertNonEmptyPathParam(value, 'organization_id');
}

export function validateCreateUnitTypeBody(input: unknown): CreateUnitTypeInput {
  const body = assertObjectBody(input);

  return {
    key: assertSafeKey(body.key, 'key'),
    label: assertTrimmedString(body.label, 'label', MAX_LABEL_LENGTH),
    sort_order: assertSortOrder(body.sort_order),
  };
}

export function validateCreateOrganizationUnitBody(input: unknown): CreateOrganizationUnitInput {
  const body = assertObjectBody(input);

  return {
    unit_type_id: assertTrimmedString(body.unit_type_id, 'unit_type_id', MAX_ID_LENGTH),
    parent_unit_id: normalizeOptionalId(body.parent_unit_id, 'parent_unit_id'),
    key: assertSafeKey(body.key, 'key'),
    name: assertTrimmedString(body.name, 'name', MAX_NAME_LENGTH),
    status: assertTrimmedString(body.status, 'status', MAX_STATUS_LENGTH),
  };
}
