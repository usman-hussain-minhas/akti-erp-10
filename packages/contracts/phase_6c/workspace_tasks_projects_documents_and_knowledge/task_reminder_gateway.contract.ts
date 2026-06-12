export const PHASE_6C_TASK_REMINDER_GATEWAY_SEED_ID = 'seed_6c_079_task_reminder_gateway' as const;
export const PHASE_6C_TASK_REMINDER_GATEWAY_COMPONENT_ID = '6C.06' as const;
export const TASK_REMINDER_GATEWAY_RUNTIME_EVENT = 'phase_6c.workspace_tasks_projects_documents_and_knowledge.task_reminder_gateway.runtime_evaluated' as const;

export type TaskReminderGatewayChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type TaskReminderGatewayPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type TaskReminderGatewayRecipientOptOutState = 'OPTED_IN' | 'OPTED_OUT' | 'UNKNOWN';
export type TaskReminderGatewayIntentStatus = 'READY_FOR_GATEWAY' | 'BLOCKED_BY_OPT_OUT' | 'DEFERRED_NOT_YET_DUE';
export type TaskReminderGatewayReceiptStatus = 'GATEWAY_READY' | 'BLOCKED_BY_OPT_OUT' | 'DEFERRED_NOT_YET_DUE';

export type TaskReminderGatewayPolicy = {
  outbound_gateway_enforcement_ref: string;
  global_opt_out_registry_ref: string;
  adl_ref: 'ADL-004';
  allow_unknown_opt_out_state?: boolean;
};

export type TaskReminderGatewayRecipient = {
  recipient_ref: string;
  channel: TaskReminderGatewayChannel;
  opt_out_state: TaskReminderGatewayRecipientOptOutState;
  gateway_recipient_ref?: string;
  locale?: string;
};

export type TaskReminderGatewayMessage = {
  subject: string;
  body: string;
  action_url?: string;
};

export type TaskReminderGatewayInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  reminder_ref: string;
  task_ref: string;
  task_title: string;
  due_at: string;
  reminder_at: string;
  evaluated_at: string;
  requested_by_user_id: string;
  priority?: TaskReminderGatewayPriority;
  recipients: readonly TaskReminderGatewayRecipient[];
  message: TaskReminderGatewayMessage;
  gateway_policy: TaskReminderGatewayPolicy;
  workspace_collaboration_surface_active?: boolean;
  collaboration_context_ref?: string;
  idempotency_key?: string;
  evidence_refs?: readonly string[];
  metadata?: Record<string, unknown>;
  direct_provider_send_requested?: boolean;
  gateway_bypass_requested?: boolean;
  opt_out_bypass_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

export type TaskReminderGatewayIntent = {
  recipient_ref: string;
  channel: TaskReminderGatewayChannel;
  status: TaskReminderGatewayIntentStatus;
  opt_out_state: TaskReminderGatewayRecipientOptOutState;
  gateway_recipient_ref?: string;
  block_reason?: 'GLOBAL_OPT_OUT' | 'UNKNOWN_OPT_OUT_STATE' | 'NOT_YET_DUE';
  gateway_envelope_ref?: string;
};

export type TaskReminderGatewayReceipt = {
  seed_id: typeof PHASE_6C_TASK_REMINDER_GATEWAY_SEED_ID;
  component_id: typeof PHASE_6C_TASK_REMINDER_GATEWAY_COMPONENT_ID;
  component_slug: 'workspace_tasks_projects_documents_and_knowledge';
  model_name: 'Phase6CTaskReminderGateway';
  event_name: typeof TASK_REMINDER_GATEWAY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  reminder_ref: string;
  task_ref: string;
  task_title: string;
  due_at: string;
  reminder_at: string;
  evaluated_at: string;
  requested_by_user_id: string;
  priority: TaskReminderGatewayPriority;
  gateway_policy: Required<TaskReminderGatewayPolicy>;
  workspace_collaboration_surface_active: boolean;
  collaboration_context_ref?: string;
  message: TaskReminderGatewayMessage;
  idempotency_key: string;
  evidence_refs: readonly string[];
  intents: readonly TaskReminderGatewayIntent[];
  ready_intent_count: number;
  blocked_intent_count: number;
  deferred_intent_count: number;
  status: TaskReminderGatewayReceiptStatus;
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
