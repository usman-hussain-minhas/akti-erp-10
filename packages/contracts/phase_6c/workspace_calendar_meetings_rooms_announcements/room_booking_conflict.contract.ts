export const PHASE_6C_ROOM_BOOKING_CONFLICT_SEED_ID = 'seed_6c_086_room_booking_conflict' as const;
export const PHASE_6C_ROOM_BOOKING_CONFLICT_COMPONENT_ID = '6C.07' as const;
export const ROOM_BOOKING_CONFLICT_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.room_booking_conflict.runtime_evaluated' as const;

export type RoomBookingStatus = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED';
export type RoomBookingConflictSeverity = 'NONE' | 'WARNING' | 'BLOCKING';

export type RoomBookingResource = {
  resource_ref: string;
  resource_type: 'ROOM' | 'EQUIPMENT';
  capacity?: number;
};

export type RoomBookingWindow = {
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

export type RoomBookingConflictFinding = {
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
