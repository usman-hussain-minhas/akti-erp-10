export const PHASE_6C_RESOURCE_CAPACITY_EQUIPMENT_SEED_ID = 'seed_6c_087_resource_capacity_equipment' as const;
export const PHASE_6C_RESOURCE_CAPACITY_EQUIPMENT_COMPONENT_ID = '6C.07' as const;
export const RESOURCE_CAPACITY_EQUIPMENT_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.resource_capacity_equipment.runtime_evaluated' as const;

export type ResourceCapacityEquipmentType = 'ROOM' | 'EQUIPMENT';
export type ResourceCapacityEquipmentStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export type ResourceEquipmentItem = {
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
