import { createHash } from 'node:crypto';

export const PHASE_6C_ROOM_BOOKING_CONFLICT_SEED_ID = 'seed_6c_086_room_booking_conflict' as const;
export const PHASE_6C_ROOM_BOOKING_CONFLICT_COMPONENT_ID = '6C.07' as const;
export const ROOM_BOOKING_CONFLICT_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.room_booking_conflict.runtime_evaluated' as const;

type RoomBookingStatus = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED';
type RoomBookingConflictSeverity = 'NONE' | 'WARNING' | 'BLOCKING';

type RoomBookingResource = {
  resource_ref: string;
  resource_type: 'ROOM' | 'EQUIPMENT';
  capacity?: number;
};

type RoomBookingWindow = {
  booking_ref: string;
  resource_ref: string;
  start_at: string;
  end_at: string;
  status: RoomBookingStatus;
  attendee_count?: number;
};

export type RoomBookingConflictInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  candidate_booking: RoomBookingWindow;
  requested_resources: readonly RoomBookingResource[];
  existing_bookings: readonly RoomBookingWindow[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  metadata?: Record<string, unknown>;
  booking_write_requested?: boolean;
  calendar_write_requested?: boolean;
  provider_sync_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

type RoomBookingConflictFinding = {
  conflict_ref: string;
  resource_ref: string;
  existing_booking_ref: string;
  overlap_start_at: string;
  overlap_end_at: string;
  severity: Exclude<RoomBookingConflictSeverity, 'NONE'>;
  reason: 'RESOURCE_TIME_OVERLAP' | 'CAPACITY_EXCEEDED';
};

export type RoomBookingConflictReceipt = {
  seed_id: typeof PHASE_6C_ROOM_BOOKING_CONFLICT_SEED_ID;
  component_id: typeof PHASE_6C_ROOM_BOOKING_CONFLICT_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CRoomBookingConflict';
  event_name: typeof ROOM_BOOKING_CONFLICT_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  candidate_booking: RoomBookingWindow;
  requested_resources: readonly RoomBookingResource[];
  conflict_severity: RoomBookingConflictSeverity;
  conflict_count: number;
  findings: readonly RoomBookingConflictFinding[];
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

const BOOKING_STATUSES = new Set<RoomBookingStatus>(['REQUESTED', 'CONFIRMED', 'CANCELLED']);
const RESOURCE_TYPES = new Set<RoomBookingResource['resource_type']>(['ROOM', 'EQUIPMENT']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for room_booking_conflict runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for room_booking_conflict runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function requirePositiveInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for room_booking_conflict runtime evaluation.');
  }
  return value;
}

function rejectForbiddenRequests(input: RoomBookingConflictInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof RoomBookingConflictInput, string]> = [
    ['booking_write_requested', 'booking writes are outside this FFET'],
    ['calendar_write_requested', 'calendar writes are outside this FFET'],
    ['provider_sync_requested', 'provider sync is outside this FFET'],
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

function normalizeResource(resource: RoomBookingResource, index: number): RoomBookingResource {
  const resource_ref = requireNonEmpty(resource.resource_ref, 'requested_resources[' + index + '].resource_ref');
  if (!RESOURCE_TYPES.has(resource.resource_type)) {
    throw new Error('requested_resources[' + index + '].resource_type must be ROOM or EQUIPMENT.');
  }
  return {
    resource_ref,
    resource_type: resource.resource_type,
    ...(resource.capacity === undefined ? {} : { capacity: requirePositiveInteger(resource.capacity, 'requested_resources[' + index + '].capacity') }),
  };
}

function normalizeBooking(booking: RoomBookingWindow, field: string): RoomBookingWindow {
  if (!BOOKING_STATUSES.has(booking.status)) {
    throw new Error(field + '.status must be REQUESTED, CONFIRMED, or CANCELLED.');
  }
  const start_at = requireTimestamp(booking.start_at, field + '.start_at');
  const end_at = requireTimestamp(booking.end_at, field + '.end_at');
  if (Date.parse(end_at) <= Date.parse(start_at)) {
    throw new Error(field + '.end_at must be after start_at for room_booking_conflict.');
  }
  return {
    booking_ref: requireNonEmpty(booking.booking_ref, field + '.booking_ref'),
    resource_ref: requireNonEmpty(booking.resource_ref, field + '.resource_ref'),
    start_at,
    end_at,
    status: booking.status,
    ...(booking.attendee_count === undefined ? {} : { attendee_count: requirePositiveInteger(booking.attendee_count, field + '.attendee_count') }),
  };
}

function intervalsOverlap(a: RoomBookingWindow, b: RoomBookingWindow): boolean {
  return Date.parse(a.start_at) < Date.parse(b.end_at) && Date.parse(b.start_at) < Date.parse(a.end_at);
}

function maxIso(a: string, b: string): string {
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

function minIso(a: string, b: string): string {
  return Date.parse(a) <= Date.parse(b) ? a : b;
}

function buildConflictRef(input: { candidate: string; existing: string; resource: string; reason: string }): string {
  return createHash('sha256').update([input.candidate, input.existing, input.resource, input.reason].join('|')).digest('hex').slice(0, 24);
}

function digestRuntime(receiptWithoutDigest: Omit<RoomBookingConflictReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateRoomBookingConflict(input: RoomBookingConflictInput): RoomBookingConflictReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('room_booking_conflict rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const candidate_booking = normalizeBooking(input.candidate_booking, 'candidate_booking');
  if (candidate_booking.status === 'CANCELLED') {
    throw new Error('candidate_booking must not be CANCELLED for room_booking_conflict evaluation.');
  }
  const requested_resources = input.requested_resources.map(normalizeResource);
  if (requested_resources.length === 0) {
    throw new Error('at least one requested resource is required for room_booking_conflict.');
  }
  const resourceRefs = new Set<string>();
  for (const resource of requested_resources) {
    if (resourceRefs.has(resource.resource_ref)) {
      throw new Error('duplicate requested resource is not allowed for room_booking_conflict: ' + resource.resource_ref);
    }
    resourceRefs.add(resource.resource_ref);
  }
  if (!resourceRefs.has(candidate_booking.resource_ref)) {
    throw new Error('candidate_booking.resource_ref must be included in requested_resources.');
  }

  const existing_bookings = input.existing_bookings.map((booking, index) => normalizeBooking(booking, 'existing_bookings[' + index + ']'));
  const findings: RoomBookingConflictFinding[] = [];
  for (const existing of existing_bookings) {
    if (existing.status === 'CANCELLED' || existing.resource_ref !== candidate_booking.resource_ref) {
      continue;
    }
    if (intervalsOverlap(candidate_booking, existing)) {
      findings.push({
        conflict_ref: buildConflictRef({ candidate: candidate_booking.booking_ref, existing: existing.booking_ref, resource: existing.resource_ref, reason: 'RESOURCE_TIME_OVERLAP' }),
        resource_ref: existing.resource_ref,
        existing_booking_ref: existing.booking_ref,
        overlap_start_at: maxIso(candidate_booking.start_at, existing.start_at),
        overlap_end_at: minIso(candidate_booking.end_at, existing.end_at),
        severity: 'BLOCKING',
        reason: 'RESOURCE_TIME_OVERLAP',
      });
    }
  }

  const candidateResource = requested_resources.find((resource) => resource.resource_ref === candidate_booking.resource_ref);
  if (candidateResource?.capacity !== undefined && candidate_booking.attendee_count !== undefined && candidate_booking.attendee_count > candidateResource.capacity) {
    findings.push({
      conflict_ref: buildConflictRef({ candidate: candidate_booking.booking_ref, existing: 'capacity', resource: candidate_booking.resource_ref, reason: 'CAPACITY_EXCEEDED' }),
      resource_ref: candidate_booking.resource_ref,
      existing_booking_ref: 'capacity_limit',
      overlap_start_at: candidate_booking.start_at,
      overlap_end_at: candidate_booking.end_at,
      severity: 'WARNING',
      reason: 'CAPACITY_EXCEEDED',
    });
  }

  const validation_warnings: string[] = [];
  if (candidate_booking.attendee_count === undefined) {
    validation_warnings.push('candidate_booking_has_no_attendee_count');
  }
  if (requested_resources.some((resource) => resource.resource_type === 'ROOM' && resource.capacity === undefined)) {
    validation_warnings.push('room_resource_has_no_capacity_metadata');
  }

  const hasBlocking = findings.some((finding) => finding.severity === 'BLOCKING');
  const conflict_severity: RoomBookingConflictSeverity = hasBlocking ? 'BLOCKING' : findings.length > 0 ? 'WARNING' : 'NONE';
  const receiptWithoutDigest: Omit<RoomBookingConflictReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_ROOM_BOOKING_CONFLICT_SEED_ID,
    component_id: PHASE_6C_ROOM_BOOKING_CONFLICT_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CRoomBookingConflict',
    event_name: ROOM_BOOKING_CONFLICT_RUNTIME_EVENT,
    organization_id,
    service_manifest_contract_id,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    candidate_booking,
    requested_resources,
    conflict_severity,
    conflict_count: findings.length,
    findings,
    validation_warnings,
    forbidden_behavior_rejections: [],
    metadata: input.metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
