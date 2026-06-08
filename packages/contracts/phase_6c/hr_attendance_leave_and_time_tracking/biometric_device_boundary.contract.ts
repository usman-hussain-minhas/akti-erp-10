export const PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_SEED_ID = "seed_6c_025_biometric_device_boundary" as const;
export const PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_COMPONENT_ID = "6C.03" as const;
export const BIOMETRIC_DEVICE_BOUNDARY_SCAFFOLD_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.biometric_device_boundary.scaffold_control_evaluated" as const;

export type BiometricDeviceBoundaryScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type BiometricDeviceBoundaryScaffoldReceipt = {
  seed_id: typeof PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_BIOMETRIC_DEVICE_BOUNDARY_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CBiometricDeviceBoundary";
  event_name: typeof BIOMETRIC_DEVICE_BOUNDARY_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
