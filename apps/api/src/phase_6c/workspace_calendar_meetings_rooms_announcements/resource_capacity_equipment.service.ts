import { createHash } from 'node:crypto';

export const PHASE_6C_RESOURCE_CAPACITY_EQUIPMENT_SEED_ID = 'seed_6c_087_resource_capacity_equipment' as const;
export const PHASE_6C_RESOURCE_CAPACITY_EQUIPMENT_COMPONENT_ID = '6C.07' as const;
export const RESOURCE_CAPACITY_EQUIPMENT_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.resource_capacity_equipment.runtime_evaluated' as const;

type ResourceCapacityEquipmentType = 'ROOM' | 'EQUIPMENT';
type ResourceCapacityEquipmentStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

type ResourceEquipmentItem = {
  equipment_ref: string;
  name: string;
  quantity: number;
  portable?: boolean;
};

export type ResourceCapacityEquipmentInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  resource_ref: string;
  resource_type: ResourceCapacityEquipmentType;
  display_name: string;
  status: ResourceCapacityEquipmentStatus;
  capacity?: number;
  location_ref?: string;
  equipment: readonly ResourceEquipmentItem[];
  accessibility_features?: readonly string[];
  metadata_tags?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  metadata?: Record<string, unknown>;
  booking_write_requested?: boolean;
  calendar_write_requested?: boolean;
  inventory_mutation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

export type ResourceCapacityEquipmentReceipt = {
  seed_id: typeof PHASE_6C_RESOURCE_CAPACITY_EQUIPMENT_SEED_ID;
  component_id: typeof PHASE_6C_RESOURCE_CAPACITY_EQUIPMENT_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CResourceCapacityEquipment';
  event_name: typeof RESOURCE_CAPACITY_EQUIPMENT_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  resource_ref: string;
  resource_type: ResourceCapacityEquipmentType;
  display_name: string;
  status: ResourceCapacityEquipmentStatus;
  capacity?: number;
  location_ref?: string;
  equipment: readonly ResourceEquipmentItem[];
  equipment_count: number;
  total_equipment_quantity: number;
  accessibility_features: readonly string[];
  metadata_tags: readonly string[];
  booking_ready: boolean;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

const RESOURCE_TYPES = new Set<ResourceCapacityEquipmentType>(['ROOM', 'EQUIPMENT']);
const STATUSES = new Set<ResourceCapacityEquipmentStatus>(['ACTIVE', 'INACTIVE', 'MAINTENANCE']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for resource_capacity_equipment runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for resource_capacity_equipment runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function requirePositiveInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for resource_capacity_equipment runtime evaluation.');
  }
  return value;
}

function rejectForbiddenRequests(input: ResourceCapacityEquipmentInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof ResourceCapacityEquipmentInput, string]> = [
    ['booking_write_requested', 'booking writes are outside this FFET'],
    ['calendar_write_requested', 'calendar writes are outside this FFET'],
    ['inventory_mutation_requested', 'inventory mutation is outside this FFET'],
    ['persistence_requested', 'persistence is deferred until runtime wiring is authorized'],
    ['runtime_adapter_requested', 'runtime adapter execution is outside this FFET'],
    ['cross_phase_write_requested', 'cross-phase writes are forbidden; refs/events only'],
    ['frontend_route_requested', 'frontend route publication is outside this FFET'],
    ['authorization_flag_change_requested', 'authorization flag changes are human-gated and forbidden here'],
  ];
  for (const [field, reason] of forbiddenFlags) {
    if (input[field] === true) {
      rejected.push(reason);
    }
  }
  return rejected;
}

function normalizeStringList(values: readonly string[] | undefined, field: string): readonly string[] {
  const normalized = [...(values ?? [])].map((value, index) => requireNonEmpty(value, field + '[' + index + ']'));
  const seen = new Set<string>();
  for (const value of normalized) {
    if (seen.has(value)) {
      throw new Error(field + ' contains duplicate value for resource_capacity_equipment: ' + value);
    }
    seen.add(value);
  }
  return normalized;
}

function normalizeEquipment(equipment: readonly ResourceEquipmentItem[]): readonly ResourceEquipmentItem[] {
  const seen = new Set<string>();
  return equipment.map((item, index) => {
    const equipment_ref = requireNonEmpty(item.equipment_ref, 'equipment[' + index + '].equipment_ref');
    if (seen.has(equipment_ref)) {
      throw new Error('duplicate equipment_ref is not allowed for resource_capacity_equipment: ' + equipment_ref);
    }
    seen.add(equipment_ref);
    return {
      equipment_ref,
      name: requireNonEmpty(item.name, 'equipment[' + index + '].name'),
      quantity: requirePositiveInteger(item.quantity, 'equipment[' + index + '].quantity') ?? 0,
      portable: item.portable === true,
    };
  });
}

function buildWarnings(input: {
  resourceType: ResourceCapacityEquipmentType;
  status: ResourceCapacityEquipmentStatus;
  capacity?: number;
  equipmentCount: number;
  accessibilityCount: number;
  hasLocation: boolean;
}): readonly string[] {
  const warnings: string[] = [];
  if (input.resourceType === 'ROOM' && input.capacity === undefined) {
    warnings.push('room_resource_has_no_capacity_metadata');
  }
  if (input.resourceType === 'ROOM' && !input.hasLocation) {
    warnings.push('room_resource_has_no_location_ref');
  }
  if (input.resourceType === 'ROOM' && input.equipmentCount === 0) {
    warnings.push('room_resource_has_no_equipment_metadata');
  }
  if (input.accessibilityCount === 0) {
    warnings.push('resource_has_no_accessibility_metadata');
  }
  if (input.status !== 'ACTIVE') {
    warnings.push('resource_not_active_for_booking');
  }
  return warnings;
}

function digestRuntime(receiptWithoutDigest: Omit<ResourceCapacityEquipmentReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateResourceCapacityEquipment(input: ResourceCapacityEquipmentInput): ResourceCapacityEquipmentReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('resource_capacity_equipment rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }
  if (!RESOURCE_TYPES.has(input.resource_type)) {
    throw new Error('resource_type must be ROOM or EQUIPMENT for resource_capacity_equipment.');
  }
  if (!STATUSES.has(input.status)) {
    throw new Error('status must be ACTIVE, INACTIVE, or MAINTENANCE for resource_capacity_equipment.');
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const resource_ref = requireNonEmpty(input.resource_ref, 'resource_ref');
  const display_name = requireNonEmpty(input.display_name, 'display_name');
  const capacity = requirePositiveInteger(input.capacity, 'capacity');
  const location_ref = input.location_ref === undefined ? undefined : requireNonEmpty(input.location_ref, 'location_ref');
  const equipment = normalizeEquipment(input.equipment);
  const accessibility_features = normalizeStringList(input.accessibility_features, 'accessibility_features');
  const metadata_tags = normalizeStringList(input.metadata_tags, 'metadata_tags');
  const total_equipment_quantity = equipment.reduce((sum, item) => sum + item.quantity, 0);
  const validation_warnings = buildWarnings({
    resourceType: input.resource_type,
    status: input.status,
    capacity,
    equipmentCount: equipment.length,
    accessibilityCount: accessibility_features.length,
    hasLocation: location_ref !== undefined,
  });

  const receiptWithoutDigest: Omit<ResourceCapacityEquipmentReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_RESOURCE_CAPACITY_EQUIPMENT_SEED_ID,
    component_id: PHASE_6C_RESOURCE_CAPACITY_EQUIPMENT_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CResourceCapacityEquipment',
    event_name: RESOURCE_CAPACITY_EQUIPMENT_RUNTIME_EVENT,
    organization_id,
    service_manifest_contract_id,
    resource_ref,
    resource_type: input.resource_type,
    display_name,
    status: input.status,
    ...(capacity === undefined ? {} : { capacity }),
    ...(location_ref === undefined ? {} : { location_ref }),
    equipment,
    equipment_count: equipment.length,
    total_equipment_quantity,
    accessibility_features,
    metadata_tags,
    booking_ready: input.status === 'ACTIVE' && !validation_warnings.includes('room_resource_has_no_capacity_metadata'),
    validation_warnings,
    forbidden_behavior_rejections: [],
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    metadata: input.metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
