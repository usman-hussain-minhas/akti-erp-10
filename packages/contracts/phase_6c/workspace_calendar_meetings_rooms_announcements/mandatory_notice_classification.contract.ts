export const PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_SEED_ID = "seed_6c_089_mandatory_notice_classification" as const;
export const PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_COMPONENT_ID = "6C.07" as const;
export const MANDATORY_NOTICE_CLASSIFICATION_SCAFFOLD_EVENT = "phase_6c.workspace_calendar_meetings_rooms_announcements.mandatory_notice_classification.scaffold_control_evaluated" as const;

export type MandatoryNoticeClassificationScaffoldInput = {
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

export type MandatoryNoticeClassificationScaffoldReceipt = {
  seed_id: typeof PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_SEED_ID;
  component_id: typeof PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_COMPONENT_ID;
  component_slug: "workspace_calendar_meetings_rooms_announcements";
  model_name: "Phase6CMandatoryNoticeClassification";
  event_name: typeof MANDATORY_NOTICE_CLASSIFICATION_SCAFFOLD_EVENT;
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
