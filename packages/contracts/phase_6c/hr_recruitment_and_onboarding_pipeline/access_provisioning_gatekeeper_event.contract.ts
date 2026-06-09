export const PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_SEED_ID = 'seed_6c_018_access_provisioning_gatekeeper_event' as const;
export const PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_COMPONENT_ID = '6C.02' as const;
export const ACCESS_PROVISIONING_GATEKEEPER_EVENT_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.access_provisioning_gatekeeper_event.requested' as const;

export type AccessProvisioningGrantKind = 'ROLE' | 'CAPABILITY' | 'MODULE_MEMBERSHIP';
export type GatekeeperRequiredOutcome = 'ALLOW_OR_APPROVAL_REQUIRED';

export type AccessProvisioningGrantRequest = {
  grant_ref: string;
  grant_kind: AccessProvisioningGrantKind;
  target_ref: string;
  reason: string;
};

export type AccessProvisioningGatekeeperEventInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  applicant_ref?: string;
  offer_ref?: string;
  requested_by_user_id: string;
  evaluated_at: string;
  gatekeeper_policy_ref: string;
  event_bus_topic: string;
  grants: readonly AccessProvisioningGrantRequest[];
  control_metadata?: Record<string, unknown>;
  gatekeeper_bypass_requested?: boolean;
  direct_access_grant_requested?: boolean;
  access_core_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type AccessProvisioningGatekeeperPayload = {
  employee_ref: string;
  applicant_ref?: string;
  offer_ref?: string;
  gatekeeper_policy_ref: string;
  grants: readonly AccessProvisioningGrantRequest[];
  required_outcome: GatekeeperRequiredOutcome;
};

export type AccessProvisioningGatekeeperEventReceipt = {
  seed_id: typeof PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_ACCESS_PROVISIONING_GATEKEEPER_EVENT_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CAccessProvisioningGatekeeperEvent';
  event_name: typeof ACCESS_PROVISIONING_GATEKEEPER_EVENT_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'ACCESS_PROVISIONING_GATEKEEPER_EVENT_READY';
  gatekeeper_required: true;
  gatekeeper_bypass_allowed: false;
  direct_access_grant_allowed: false;
  access_core_mutation_executed: false;
  event_bus_topic: string;
  gatekeeper_payload: AccessProvisioningGatekeeperPayload;
  grant_count: number;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  requested_by_user_id: string;
  evaluated_at: string;
  access_provisioning_gatekeeper_event_evidence_digest: string;
};
