import { createHash } from 'node:crypto';

export const PHASE_6C_TASK_REMINDER_GATEWAY_SEED_ID = 'seed_6c_079_task_reminder_gateway' as const;
export const PHASE_6C_TASK_REMINDER_GATEWAY_COMPONENT_ID = '6C.06' as const;
export const TASK_REMINDER_GATEWAY_RUNTIME_EVENT = 'phase_6c.workspace_tasks_projects_documents_and_knowledge.task_reminder_gateway.runtime_evaluated' as const;

type TaskReminderGatewayChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
type TaskReminderGatewayPriority = 'LOW' | 'NORMAL' | 'HIGH';
type TaskReminderGatewayRecipientOptOutState = 'OPTED_IN' | 'OPTED_OUT' | 'UNKNOWN';
type TaskReminderGatewayIntentStatus = 'READY_FOR_GATEWAY' | 'BLOCKED_BY_OPT_OUT' | 'DEFERRED_NOT_YET_DUE';
type TaskReminderGatewayReceiptStatus = 'GATEWAY_READY' | 'BLOCKED_BY_OPT_OUT' | 'DEFERRED_NOT_YET_DUE';

type TaskReminderGatewayPolicy = {
  outbound_gateway_enforcement_ref: string;
  global_opt_out_registry_ref: string;
  adl_ref: 'ADL-004';
  allow_unknown_opt_out_state?: boolean;
};

type TaskReminderGatewayRecipient = {
  recipient_ref: string;
  channel: TaskReminderGatewayChannel;
  opt_out_state: TaskReminderGatewayRecipientOptOutState;
  gateway_recipient_ref?: string;
  locale?: string;
};

type TaskReminderGatewayMessage = {
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

const ALLOWED_CHANNELS = new Set<TaskReminderGatewayChannel>(['EMAIL', 'SMS', 'PUSH', 'IN_APP']);
const ALLOWED_PRIORITIES = new Set<TaskReminderGatewayPriority>(['LOW', 'NORMAL', 'HIGH']);
const ALLOWED_OPT_OUT_STATES = new Set<TaskReminderGatewayRecipientOptOutState>(['OPTED_IN', 'OPTED_OUT', 'UNKNOWN']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for task_reminder_gateway runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for task_reminder_gateway runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function requireMessage(message: TaskReminderGatewayMessage): TaskReminderGatewayMessage {
  if (!message || typeof message !== 'object') {
    throw new Error('message is required for task_reminder_gateway runtime evaluation.');
  }

  return {
    subject: requireNonEmpty(message.subject, 'message.subject'),
    body: requireNonEmpty(message.body, 'message.body'),
    ...(message.action_url === undefined ? {} : { action_url: requireNonEmpty(message.action_url, 'message.action_url') }),
  };
}

function requireGatewayPolicy(policy: TaskReminderGatewayPolicy): Required<TaskReminderGatewayPolicy> {
  if (!policy || typeof policy !== 'object') {
    throw new Error('gateway_policy is required for task_reminder_gateway runtime evaluation.');
  }
  if (policy.adl_ref !== 'ADL-004') {
    throw new Error('task_reminder_gateway must route outbound reminders through ADL-004 gateway enforcement.');
  }

  return {
    outbound_gateway_enforcement_ref: requireNonEmpty(policy.outbound_gateway_enforcement_ref, 'gateway_policy.outbound_gateway_enforcement_ref'),
    global_opt_out_registry_ref: requireNonEmpty(policy.global_opt_out_registry_ref, 'gateway_policy.global_opt_out_registry_ref'),
    adl_ref: 'ADL-004',
    allow_unknown_opt_out_state: policy.allow_unknown_opt_out_state === true,
  };
}

function rejectForbiddenRequests(input: TaskReminderGatewayInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof TaskReminderGatewayInput, string]> = [
    ['direct_provider_send_requested', 'direct provider send is forbidden; reminder intents must be gateway-routed'],
    ['gateway_bypass_requested', 'gateway bypass is forbidden by ADL-004'],
    ['opt_out_bypass_requested', 'opt-out bypass is forbidden by ADL-004'],
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

function normalizeRecipients(recipients: readonly TaskReminderGatewayRecipient[]): readonly TaskReminderGatewayRecipient[] {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('at least one recipient is required for task_reminder_gateway runtime evaluation.');
  }

  const seen = new Set<string>();
  return recipients.map((recipient, index) => {
    const recipient_ref = requireNonEmpty(recipient.recipient_ref, 'recipients[' + index + '].recipient_ref');
    if (!ALLOWED_CHANNELS.has(recipient.channel)) {
      throw new Error('recipients[' + index + '].channel must be one of EMAIL, SMS, PUSH, IN_APP.');
    }
    if (!ALLOWED_OPT_OUT_STATES.has(recipient.opt_out_state)) {
      throw new Error('recipients[' + index + '].opt_out_state must be OPTED_IN, OPTED_OUT, or UNKNOWN.');
    }

    const dedupeKey = recipient_ref + ':' + recipient.channel;
    if (seen.has(dedupeKey)) {
      throw new Error('duplicate recipient/channel pair is not allowed for task_reminder_gateway: ' + dedupeKey);
    }
    seen.add(dedupeKey);

    return {
      recipient_ref,
      channel: recipient.channel,
      opt_out_state: recipient.opt_out_state,
      ...(recipient.gateway_recipient_ref === undefined ? {} : { gateway_recipient_ref: requireNonEmpty(recipient.gateway_recipient_ref, 'recipients[' + index + '].gateway_recipient_ref') }),
      ...(recipient.locale === undefined ? {} : { locale: requireNonEmpty(recipient.locale, 'recipients[' + index + '].locale') }),
    };
  });
}

function buildIdempotencyKey(input: {
  organization_id: string;
  reminder_ref: string;
  task_ref: string;
  reminder_at: string;
  recipients: readonly TaskReminderGatewayRecipient[];
}): string {
  const recipientKey = input.recipients.map((recipient) => recipient.recipient_ref + ':' + recipient.channel).sort().join('|');
  return createHash('sha256')
    .update([input.organization_id, input.reminder_ref, input.task_ref, input.reminder_at, recipientKey].join('|'))
    .digest('hex');
}

function buildGatewayEnvelopeRef(input: {
  idempotency_key: string;
  recipient_ref: string;
  channel: TaskReminderGatewayChannel;
}): string {
  return createHash('sha256').update(input.idempotency_key + ':' + input.recipient_ref + ':' + input.channel).digest('hex').slice(0, 24);
}

function digestRuntime(receiptWithoutDigest: Omit<TaskReminderGatewayReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateTaskReminderGateway(input: TaskReminderGatewayInput): TaskReminderGatewayReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('task_reminder_gateway rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const reminder_ref = requireNonEmpty(input.reminder_ref, 'reminder_ref');
  const task_ref = requireNonEmpty(input.task_ref, 'task_ref');
  const task_title = requireNonEmpty(input.task_title, 'task_title');
  const due_at = requireTimestamp(input.due_at, 'due_at');
  const reminder_at = requireTimestamp(input.reminder_at, 'reminder_at');
  const evaluated_at = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const requested_by_user_id = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const priority = input.priority ?? 'NORMAL';
  if (!ALLOWED_PRIORITIES.has(priority)) {
    throw new Error('priority must be LOW, NORMAL, or HIGH for task_reminder_gateway runtime evaluation.');
  }

  if (Date.parse(reminder_at) > Date.parse(due_at)) {
    throw new Error('reminder_at must not be after due_at for task_reminder_gateway runtime evaluation.');
  }

  const gateway_policy = requireGatewayPolicy(input.gateway_policy);
  const recipients = normalizeRecipients(input.recipients);
  const message = requireMessage(input.message);
  const evidence_refs = [...(input.evidence_refs ?? [])].map((ref, index) => requireNonEmpty(ref, 'evidence_refs[' + index + ']'));
  const workspace_collaboration_surface_active = input.workspace_collaboration_surface_active === true;
  const collaboration_context_ref = input.collaboration_context_ref === undefined
    ? undefined
    : requireNonEmpty(input.collaboration_context_ref, 'collaboration_context_ref');

  if (collaboration_context_ref !== undefined && !workspace_collaboration_surface_active) {
    throw new Error('collaboration_context_ref requires workspace_collaboration_surface_active for task_reminder_gateway.');
  }

  const generatedIdempotencyKey = buildIdempotencyKey({ organization_id, reminder_ref, task_ref, reminder_at, recipients });
  const idempotency_key = input.idempotency_key === undefined
    ? generatedIdempotencyKey
    : requireNonEmpty(input.idempotency_key, 'idempotency_key');
  const isDueForGateway = Date.parse(evaluated_at) >= Date.parse(reminder_at);

  const intents = recipients.map<TaskReminderGatewayIntent>((recipient) => {
    if (!isDueForGateway) {
      return {
        recipient_ref: recipient.recipient_ref,
        channel: recipient.channel,
        status: 'DEFERRED_NOT_YET_DUE',
        opt_out_state: recipient.opt_out_state,
        gateway_recipient_ref: recipient.gateway_recipient_ref,
        block_reason: 'NOT_YET_DUE',
      };
    }

    if (recipient.opt_out_state === 'OPTED_OUT') {
      return {
        recipient_ref: recipient.recipient_ref,
        channel: recipient.channel,
        status: 'BLOCKED_BY_OPT_OUT',
        opt_out_state: recipient.opt_out_state,
        gateway_recipient_ref: recipient.gateway_recipient_ref,
        block_reason: 'GLOBAL_OPT_OUT',
      };
    }

    if (recipient.opt_out_state === 'UNKNOWN' && !gateway_policy.allow_unknown_opt_out_state) {
      return {
        recipient_ref: recipient.recipient_ref,
        channel: recipient.channel,
        status: 'BLOCKED_BY_OPT_OUT',
        opt_out_state: recipient.opt_out_state,
        gateway_recipient_ref: recipient.gateway_recipient_ref,
        block_reason: 'UNKNOWN_OPT_OUT_STATE',
      };
    }

    return {
      recipient_ref: recipient.recipient_ref,
      channel: recipient.channel,
      status: 'READY_FOR_GATEWAY',
      opt_out_state: recipient.opt_out_state,
      gateway_recipient_ref: recipient.gateway_recipient_ref,
      gateway_envelope_ref: buildGatewayEnvelopeRef({ idempotency_key, recipient_ref: recipient.recipient_ref, channel: recipient.channel }),
    };
  });

  const ready_intent_count = intents.filter((intent) => intent.status === 'READY_FOR_GATEWAY').length;
  const blocked_intent_count = intents.filter((intent) => intent.status === 'BLOCKED_BY_OPT_OUT').length;
  const deferred_intent_count = intents.filter((intent) => intent.status === 'DEFERRED_NOT_YET_DUE').length;
  const status: TaskReminderGatewayReceiptStatus = deferred_intent_count === intents.length
    ? 'DEFERRED_NOT_YET_DUE'
    : ready_intent_count > 0
      ? 'GATEWAY_READY'
      : 'BLOCKED_BY_OPT_OUT';

  const receiptWithoutDigest: Omit<TaskReminderGatewayReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_TASK_REMINDER_GATEWAY_SEED_ID,
    component_id: PHASE_6C_TASK_REMINDER_GATEWAY_COMPONENT_ID,
    component_slug: 'workspace_tasks_projects_documents_and_knowledge',
    model_name: 'Phase6CTaskReminderGateway',
    event_name: TASK_REMINDER_GATEWAY_RUNTIME_EVENT,
    organization_id,
    service_manifest_contract_id,
    reminder_ref,
    task_ref,
    task_title,
    due_at,
    reminder_at,
    evaluated_at,
    requested_by_user_id,
    priority,
    gateway_policy,
    workspace_collaboration_surface_active,
    ...(collaboration_context_ref === undefined ? {} : { collaboration_context_ref }),
    message,
    idempotency_key,
    evidence_refs,
    intents,
    ready_intent_count,
    blocked_intent_count,
    deferred_intent_count,
    status,
    forbidden_behavior_rejections: [],
    metadata: input.metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
