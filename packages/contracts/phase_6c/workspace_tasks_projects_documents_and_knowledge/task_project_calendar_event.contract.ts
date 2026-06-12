export const PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_SEED_ID = 'seed_6c_082_task_project_calendar_event' as const;
export const PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_COMPONENT_ID = '6C.06' as const;
export const TASK_PROJECT_CALENDAR_EVENT_RUNTIME_EVENT = 'phase_6c.workspace_tasks_projects_documents_and_knowledge.task_project_calendar_event.runtime_evaluated' as const;

export type TaskProjectCalendarEventSourceType = 'TASK' | 'PROJECT' | 'MILESTONE';
export type TaskProjectCalendarEventKind = 'DUE_DATE' | 'WORK_WINDOW' | 'MILESTONE_DATE' | 'REMINDER_WINDOW';
export type TaskProjectCalendarEventVisibility = 'PRIVATE' | 'TEAM' | 'ORGANIZATION';
export type TaskProjectCalendarEventStatus = 'READY_FOR_CALENDAR_CONSUMPTION' | 'DEFERRED_INCOMPLETE_SOURCE';

export type TaskProjectCalendarEventParticipantRef = {
  participant_ref: string;
  role: 'OWNER' | 'ASSIGNEE' | 'WATCHER';
};

export type TaskProjectCalendarEventInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_type: TaskProjectCalendarEventSourceType;
  source_ref: string;
  event_ref: string;
  event_kind: TaskProjectCalendarEventKind;
  title: string;
  start_at: string;
  end_at?: string;
  all_day?: boolean;
  timezone: string;
  visibility: TaskProjectCalendarEventVisibility;
  generated_by_user_id: string;
  generated_at: string;
  participants?: readonly TaskProjectCalendarEventParticipantRef[];
  calendar_surface_active?: boolean;
  workspace_collaboration_surface_active?: boolean;
  collaboration_context_ref?: string;
  evidence_refs?: readonly string[];
  metadata?: Record<string, unknown>;
  calendar_write_requested?: boolean;
  external_provider_sync_requested?: boolean;
  direct_calendar_mutation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

export type TaskProjectCalendarEventPayload = {
  event_uid: string;
  source_type: TaskProjectCalendarEventSourceType;
  source_ref: string;
  event_ref: string;
  event_kind: TaskProjectCalendarEventKind;
  title: string;
  start_at: string;
  end_at?: string;
  all_day: boolean;
  timezone: string;
  visibility: TaskProjectCalendarEventVisibility;
  participants: readonly TaskProjectCalendarEventParticipantRef[];
  evidence_refs: readonly string[];
};

export type TaskProjectCalendarEventReceipt = {
  seed_id: typeof PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_COMPONENT_ID;
  component_slug: 'workspace_tasks_projects_documents_and_knowledge';
  model_name: 'Phase6CTaskProjectCalendarEvent';
  event_name: typeof TASK_PROJECT_CALENDAR_EVENT_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  generated_by_user_id: string;
  generated_at: string;
  status: TaskProjectCalendarEventStatus;
  calendar_surface_active: boolean;
  workspace_collaboration_surface_active: boolean;
  collaboration_context_ref?: string;
  calendar_payload: TaskProjectCalendarEventPayload;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
