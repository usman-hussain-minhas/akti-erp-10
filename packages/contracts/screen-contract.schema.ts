import { z } from "zod";

import {
  ManifestKeySchema,
  ModuleKeySchema,
  PermissionScopeSchema,
  SemverSchema,
} from "./module-manifest.schema.js";

export const ScreenKeySchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/,
    "Use lowercase slug/dot-key syntax such as admissions.lead_inbox",
  );

export const ScreenRouteSchema = z.string().regex(/^\/[A-Za-z0-9/_:.-]*$/, "route must start with /");
export const ScreenTypeSchema = z.enum(["private_portal", "public_site", "admin_console", "embedded_widget"]);
export const ScreenStatusSchema = z.enum(["planned", "active", "deprecated", "disabled"]);
export const ActionTypeSchema = z.enum([
  "view",
  "navigate",
  "create",
  "update",
  "delete",
  "assign",
  "reassign",
  "approve",
  "reject",
  "verify",
  "issue",
  "enroll",
  "publish",
  "send",
  "export",
  "upload",
  "download",
  "search",
  "filter",
  "open",
  "custom",
]);

const RiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
const HttpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const ScreenFieldKeySchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/, "Use lowercase field keys");
const HumanLabelSchema = z
  .string()
  .min(2)
  .refine((value) => /[A-Za-z]/.test(value) && !/^[a-z0-9_.-]+$/.test(value), {
    message: "Use human-readable labels, not technical keys only",
  });
const CapabilityReferenceSchema = ManifestKeySchema.nullable();

export const ScreenActionSchema = z
  .object({
    action_key: ManifestKeySchema,
    label: HumanLabelSchema,
    capability_key: CapabilityReferenceSchema,
    action_type: ActionTypeSchema,
    risk_level: RiskLevelSchema,
    requires_confirmation: z.boolean(),
    requires_reauth: z.boolean(),
    gatekeeper_required: z.boolean(),
    audit_required: z.boolean(),
  })
  .strict();

export const ScreenDataSourceSchema = z
  .object({
    key: ManifestKeySchema,
    label: HumanLabelSchema,
    source_type: z.enum(["api", "server_action", "static_config", "derived"]),
    route_key: ManifestKeySchema.optional(),
    description: z.string().min(1),
  })
  .strict();

const ScreenApiRouteSchema = z
  .object({
    key: ManifestKeySchema,
    method: HttpMethodSchema,
    path: ScreenRouteSchema,
    capability_key: CapabilityReferenceSchema,
    auth_required: z.boolean(),
    public_route: z.boolean(),
    rate_limited: z.boolean(),
    input_schema: ManifestKeySchema.nullable(),
    output_schema: ManifestKeySchema.nullable(),
    description: z.string().min(1),
  })
  .strict();

export const ScreenTableColumnSchema = z
  .object({
    key: ScreenFieldKeySchema,
    label: HumanLabelSchema,
    data_path: ScreenFieldKeySchema,
    column_type: z.enum(["text", "number", "date", "status", "money", "action", "badge"]),
    sortable: z.boolean(),
    required: z.boolean(),
  })
  .strict();

export const ScreenFilterSchema = z
  .object({
    key: ScreenFieldKeySchema,
    label: HumanLabelSchema,
    filter_type: z.enum(["select", "multi_select", "date_range", "text", "boolean", "number_range"]),
    scope_type: PermissionScopeSchema.optional(),
    required: z.boolean(),
  })
  .strict();

export const ScreenFormFieldSchema = z
  .object({
    key: ScreenFieldKeySchema,
    label: HumanLabelSchema,
    field_type: z.enum(["text", "textarea", "number", "select", "multi_select", "date", "file", "boolean"]),
    required: z.boolean(),
    validation_key: ManifestKeySchema.optional(),
  })
  .strict();

export const ScreenStateSchema = z
  .object({
    title: HumanLabelSchema,
    message: z.string().min(1),
    primary_action_key: ManifestKeySchema.optional(),
  })
  .strict();

export const ResponsiveBehaviorSchema = z
  .object({
    layout: z.enum(["table", "cards", "split_panel", "single_column", "stacked"]),
    primary_navigation: z.string().min(1),
    critical_content: z.array(ScreenFieldKeySchema),
  })
  .strict();

const VisibilityRuleSchema = z
  .object({
    key: ManifestKeySchema,
    description: z.string().min(1),
    capability_key: CapabilityReferenceSchema,
  })
  .strict();

const RecordScopeBehaviorSchema = z
  .object({
    default_scope: PermissionScopeSchema,
    allowed_scope_types: z.array(PermissionScopeSchema).min(1),
    description: z.string().min(1),
  })
  .strict();

const QueryParamSchema = z
  .object({
    key: ScreenFieldKeySchema,
    required: z.boolean(),
    value_type: z.enum(["string", "number", "boolean", "date"]),
  })
  .strict();

const RequiredEntitySchema = z
  .object({
    entity_key: ManifestKeySchema,
    purpose: z.string().min(1),
  })
  .strict();

const SortSpecSchema = z
  .object({
    field_key: ScreenFieldKeySchema,
    direction: z.enum(["asc", "desc"]),
    default: z.boolean(),
  })
  .strict();

const PaginationSchema = z
  .object({
    mode: z.enum(["none", "page", "cursor"]),
    default_page_size: z.number().int().positive().optional(),
  })
  .strict();

const SavedViewSchema = z
  .object({
    key: ManifestKeySchema,
    label: HumanLabelSchema,
    description: z.string().min(1),
  })
  .strict();

const ValidationRuleSchema = z
  .object({
    key: ManifestKeySchema,
    field_key: ScreenFieldKeySchema,
    message: z.string().min(1),
  })
  .strict();

const DraftBehaviorSchema = z
  .object({
    supported: z.boolean(),
    autosave: z.boolean(),
    restore_message: z.string().min(1).optional(),
  })
  .strict();

const FileUploadSchema = z
  .object({
    key: ManifestKeySchema,
    label: HumanLabelSchema,
    max_files: z.number().int().positive(),
    allowed_mime_types: z.array(z.string().min(1)).min(1),
  })
  .strict();

const AuditHookSchema = z
  .object({
    key: ManifestKeySchema,
    action_key: ManifestKeySchema,
    description: z.string().min(1),
  })
  .strict();

const ExpectedEventSchema = z
  .object({
    event_type: ManifestKeySchema,
    version: SemverSchema.optional(),
    trigger_action_key: ManifestKeySchema.optional(),
  })
  .strict();

const NotificationSchema = z
  .object({
    key: ManifestKeySchema,
    label: HumanLabelSchema,
    trigger_action_key: ManifestKeySchema,
  })
  .strict();

const AiActionSchema = z
  .object({
    action_key: ManifestKeySchema,
    label: HumanLabelSchema,
    action_type: ActionTypeSchema,
    human_approval_required: z.boolean(),
  })
  .strict();

export const ScreenContractSchema = z
  .object({
    screen_key: ScreenKeySchema,
    module_key: ModuleKeySchema,
    title: HumanLabelSchema,
    route: ScreenRouteSchema,
    screen_type: ScreenTypeSchema,
    status: ScreenStatusSchema,
    version: SemverSchema,
    business_purpose: z.string().min(1),
    primary_user_context: z.string().min(1),
    user_goal: z.string().min(1),
    success_outcome: z.string().min(1),
    required_capabilities: z.array(ManifestKeySchema),
    optional_capabilities: z.array(ManifestKeySchema),
    visibility_rules: z.array(VisibilityRuleSchema),
    record_scope_behavior: RecordScopeBehaviorSchema,
    primary_action: ScreenActionSchema,
    secondary_actions: z.array(ScreenActionSchema),
    row_actions: z.array(ScreenActionSchema),
    bulk_actions: z.array(ScreenActionSchema),
    destructive_actions: z.array(ScreenActionSchema),
    data_sources: z.array(ScreenDataSourceSchema),
    api_routes: z.array(ScreenApiRouteSchema),
    query_params: z.array(QueryParamSchema),
    required_entities: z.array(RequiredEntitySchema),
    empty_data_behavior: ScreenStateSchema,
    table_columns: z.array(ScreenTableColumnSchema),
    filters: z.array(ScreenFilterSchema),
    search_fields: z.array(ScreenFieldKeySchema),
    sorting: z.array(SortSpecSchema),
    pagination: PaginationSchema,
    saved_views: z.array(SavedViewSchema),
    form_fields: z.array(ScreenFormFieldSchema),
    validation_rules: z.array(ValidationRuleSchema),
    submit_action: ScreenActionSchema.nullable(),
    draft_behavior: DraftBehaviorSchema,
    file_uploads: z.array(FileUploadSchema),
    empty_state: ScreenStateSchema,
    loading_state: ScreenStateSchema,
    error_state: ScreenStateSchema,
    permission_denied_state: ScreenStateSchema,
    degraded_mode_state: ScreenStateSchema,
    desktop_layout: ResponsiveBehaviorSchema,
    tablet_layout: ResponsiveBehaviorSchema,
    mobile_layout: ResponsiveBehaviorSchema,
    no_technical_language: z.literal(true),
    no_fake_data: z.literal(true),
    no_placeholder_actions: z.literal(true),
    no_hardcoded_roles: z.literal(true),
    no_hardcoded_units: z.literal(true),
    plain_language_labels: z.literal(true),
    audit_hooks: z.array(AuditHookSchema),
    events_expected: z.array(ExpectedEventSchema),
    notifications_triggered: z.array(NotificationSchema),
    ai_allowed: z.boolean(),
    ai_actions: z.array(AiActionSchema),
    ai_requires_human_approval: z.boolean(),
    ai_forbidden_actions: z.array(ActionTypeSchema),
    forbidden_behaviors: z.array(z.string().min(1)).min(1),
  })
  .strict()
  .superRefine((screen, ctx) => {
    const addIssue = (path: Array<string | number>, message: string) => {
      ctx.addIssue({ code: "custom", path, message });
    };

    const requireUnique = <T>(
      items: T[],
      collectionPath: string,
      getKey: (item: T) => string,
      keyPath: string | string[],
      label: string,
    ) => {
      const seen = new Map<string, number>();
      const keyPathParts = Array.isArray(keyPath) ? keyPath : [keyPath];

      items.forEach((item, index) => {
        const key = getKey(item);
        const firstIndex = seen.get(key);
        if (firstIndex !== undefined) {
          addIssue(
            [collectionPath, index, ...keyPathParts],
            `${label} must be unique; first declared at ${collectionPath}[${firstIndex}]`,
          );
          return;
        }
        seen.set(key, index);
      });
    };

    const allActions = [
      screen.primary_action,
      ...screen.secondary_actions,
      ...screen.row_actions,
      ...screen.bulk_actions,
      ...screen.destructive_actions,
      ...(screen.submit_action ? [screen.submit_action] : []),
    ];
    const actionKeys = new Set(allActions.map((action) => action.action_key));
    const capabilityKeys = new Set([...screen.required_capabilities, ...screen.optional_capabilities]);
    const apiRouteKeys = new Set(screen.api_routes.map((route) => route.key));
    const navigationActions = new Set(["view", "navigate", "open", "search", "filter"]);

    const requireActionKey = (actionKey: string | undefined, path: Array<string | number>) => {
      if (actionKey !== undefined && !actionKeys.has(actionKey)) {
        addIssue(path, "action key must reference a declared screen action");
      }
    };

    if (screen.screen_type === "private_portal" && screen.required_capabilities.length === 0) {
      addIssue(["required_capabilities"], "private portal screens require at least one required capability");
    }

    requireUnique(allActions, "actions", (item) => item.action_key, "action_key", "action_key");
    requireUnique(screen.data_sources, "data_sources", (item) => item.key, "key", "data source key");
    requireUnique(screen.api_routes, "api_routes", (item) => item.key, "key", "API route key");
    requireUnique(screen.table_columns, "table_columns", (item) => item.key, "key", "table column key");
    requireUnique(screen.filters, "filters", (item) => item.key, "key", "filter key");
    requireUnique(screen.search_fields, "search_fields", (item) => item, [], "search field key");
    requireUnique(screen.form_fields, "form_fields", (item) => item.key, "key", "form field key");
    requireUnique(screen.saved_views, "saved_views", (item) => item.key, "key", "saved view key");
    requireUnique(screen.audit_hooks, "audit_hooks", (item) => item.key, "key", "audit hook key");
    requireUnique(
      screen.events_expected,
      "events_expected",
      (item) => `${item.event_type}@${item.version ?? "unversioned"}`,
      ["event_type", "version"],
      "expected event type + version",
    );

    allActions.forEach((action, index) => {
      if (!navigationActions.has(action.action_type) && action.capability_key === null) {
        addIssue(["actions", index, "capability_key"], "non-navigation actions require a capability_key");
      }

      if (action.capability_key !== null && !capabilityKeys.has(action.capability_key)) {
        addIssue(["actions", index, "capability_key"], "action capability must be declared on screen");
      }
    });

    screen.api_routes.forEach((route, index) => {
      if (route.capability_key !== null && !capabilityKeys.has(route.capability_key)) {
        addIssue(["api_routes", index, "capability_key"], "API route capability must be declared on screen");
      }
    });

    screen.data_sources.forEach((dataSource, index) => {
      if (dataSource.route_key !== undefined && !apiRouteKeys.has(dataSource.route_key)) {
        addIssue(["data_sources", index, "route_key"], "data source route_key must reference api_routes[].key");
      }
    });

    screen.audit_hooks.forEach((hook, index) => {
      requireActionKey(hook.action_key, ["audit_hooks", index, "action_key"]);
    });

    screen.events_expected.forEach((event, index) => {
      requireActionKey(event.trigger_action_key, ["events_expected", index, "trigger_action_key"]);
    });

    screen.notifications_triggered.forEach((notification, index) => {
      requireActionKey(notification.trigger_action_key, ["notifications_triggered", index, "trigger_action_key"]);
    });

    requireActionKey(screen.empty_data_behavior.primary_action_key, ["empty_data_behavior", "primary_action_key"]);
    requireActionKey(screen.empty_state.primary_action_key, ["empty_state", "primary_action_key"]);
    requireActionKey(screen.loading_state.primary_action_key, ["loading_state", "primary_action_key"]);
    requireActionKey(screen.error_state.primary_action_key, ["error_state", "primary_action_key"]);
    requireActionKey(screen.permission_denied_state.primary_action_key, [
      "permission_denied_state",
      "primary_action_key",
    ]);
    requireActionKey(screen.degraded_mode_state.primary_action_key, ["degraded_mode_state", "primary_action_key"]);

    screen.destructive_actions.forEach((action, index) => {
      if (!action.requires_confirmation) {
        addIssue(["destructive_actions", index, "requires_confirmation"], "destructive actions require confirmation");
      }
      if (!action.audit_required) {
        addIssue(["destructive_actions", index, "audit_required"], "destructive actions require audit");
      }
      if (action.risk_level !== "low" && !action.requires_reauth) {
        addIssue(["destructive_actions", index, "requires_reauth"], "destructive actions require reauth unless low risk");
      }
    });

    const sensitiveAiActions = new Set([
      "publish",
      "send",
      "approve",
      "reject",
      "verify",
      "issue",
      "enroll",
      "delete",
      "export",
    ]);

    screen.ai_actions.forEach((action, index) => {
      if (sensitiveAiActions.has(action.action_type) && !action.human_approval_required) {
        addIssue(["ai_actions", index, "human_approval_required"], "sensitive AI actions require human approval");
      }
    });
  });

export type ScreenAction = z.infer<typeof ScreenActionSchema>;
export type ScreenDataSource = z.infer<typeof ScreenDataSourceSchema>;
export type ScreenTableColumn = z.infer<typeof ScreenTableColumnSchema>;
export type ScreenFilter = z.infer<typeof ScreenFilterSchema>;
export type ScreenFormField = z.infer<typeof ScreenFormFieldSchema>;
export type ScreenState = z.infer<typeof ScreenStateSchema>;
export type ResponsiveBehavior = z.infer<typeof ResponsiveBehaviorSchema>;
export type ScreenContract = z.infer<typeof ScreenContractSchema>;

export function parseScreenContract(input: unknown): ScreenContract {
  return ScreenContractSchema.parse(input);
}

export function safeParseScreenContract(input: unknown) {
  return ScreenContractSchema.safeParse(input);
}

export const sampleLeadInboxScreenContract = ScreenContractSchema.parse({
  screen_key: "lead.inbox",
  module_key: "lead.desk",
  title: "Lead Inbox",
  route: "/lead-desk/inbox",
  screen_type: "private_portal",
  status: "planned",
  version: "0.1.0",
  business_purpose: "Give admissions staff one operational queue for reviewing and assigning incoming leads.",
  primary_user_context: "Admissions staff working live lead follow-up.",
  user_goal: "Find the next lead that needs action and assign it to the right owner.",
  success_outcome: "Leads are reviewed, assigned, and ready for follow-up without duplicate work.",
  required_capabilities: ["lead.inbox.view", "lead.inbox.assign"],
  optional_capabilities: ["lead.inbox.message", "lead.inbox.export"],
  visibility_rules: [
    {
      key: "lead.inbox.visible",
      description: "Show the screen only to users with lead inbox view capability.",
      capability_key: "lead.inbox.view",
    },
  ],
  record_scope_behavior: {
    default_scope: "organization",
    allowed_scope_types: ["organization", "own_unit", "assigned_records"],
    description: "Users see leads according to approved organization and assignment scope.",
  },
  primary_action: {
    action_key: "lead.assign",
    label: "Assign lead",
    capability_key: "lead.inbox.assign",
    action_type: "assign",
    risk_level: "medium",
    requires_confirmation: false,
    requires_reauth: false,
    gatekeeper_required: false,
    audit_required: true,
  },
  secondary_actions: [
    {
      action_key: "lead.message",
      label: "Send message",
      capability_key: "lead.inbox.message",
      action_type: "send",
      risk_level: "medium",
      requires_confirmation: true,
      requires_reauth: false,
      gatekeeper_required: false,
      audit_required: true,
    },
  ],
  row_actions: [
    {
      action_key: "lead.open",
      label: "Open lead",
      capability_key: "lead.inbox.view",
      action_type: "open",
      risk_level: "low",
      requires_confirmation: false,
      requires_reauth: false,
      gatekeeper_required: false,
      audit_required: false,
    },
  ],
  bulk_actions: [],
  destructive_actions: [],
  data_sources: [
    {
      key: "lead.inbox.list",
      label: "Lead inbox list",
      source_type: "api",
      route_key: "lead.inbox.list",
      description: "Paginated lead inbox data.",
    },
  ],
  api_routes: [
    {
      key: "lead.inbox.list",
      method: "GET",
      path: "/api/lead-desk/leads",
      capability_key: "lead.inbox.view",
      auth_required: true,
      public_route: false,
      rate_limited: true,
      input_schema: "lead.inbox.list.input",
      output_schema: "lead.inbox.list.output",
      description: "Load lead inbox records.",
    },
  ],
  query_params: [
    {
      key: "status",
      required: false,
      value_type: "string",
    },
  ],
  required_entities: [
    {
      entity_key: "lead.record",
      purpose: "Render lead identity, status, source, and assignment state.",
    },
  ],
  empty_data_behavior: {
    title: "No leads waiting",
    message: "There are no leads matching the current filters.",
  },
  table_columns: [
    {
      key: "lead_name",
      label: "Lead name",
      data_path: "lead.name",
      column_type: "text",
      sortable: true,
      required: true,
    },
    {
      key: "lead_status",
      label: "Lead status",
      data_path: "lead.status",
      column_type: "status",
      sortable: true,
      required: true,
    },
  ],
  filters: [
    {
      key: "lead_status",
      label: "Lead status",
      filter_type: "multi_select",
      scope_type: "organization",
      required: false,
    },
  ],
  search_fields: ["lead.name", "lead.phone"],
  sorting: [
    {
      field_key: "created_at",
      direction: "desc",
      default: true,
    },
  ],
  pagination: {
    mode: "cursor",
    default_page_size: 50,
  },
  saved_views: [
    {
      key: "lead.inbox.unassigned",
      label: "Unassigned leads",
      description: "Leads that still need an owner.",
    },
  ],
  form_fields: [],
  validation_rules: [],
  submit_action: null,
  draft_behavior: {
    supported: false,
    autosave: false,
  },
  file_uploads: [],
  empty_state: {
    title: "No leads waiting",
    message: "There are no leads matching the current filters.",
  },
  loading_state: {
    title: "Loading leads",
    message: "Lead inbox records are loading.",
  },
  error_state: {
    title: "Could not load leads",
    message: "Try again or contact support if the issue continues.",
  },
  permission_denied_state: {
    title: "Access needed",
    message: "You do not have permission to view the lead inbox.",
  },
  degraded_mode_state: {
    title: "Limited lead inbox",
    message: "Lead assignment is temporarily limited while the service recovers.",
  },
  desktop_layout: {
    layout: "table",
    primary_navigation: "Lead Desk",
    critical_content: ["lead.name", "lead.status"],
  },
  tablet_layout: {
    layout: "cards",
    primary_navigation: "Lead Desk",
    critical_content: ["lead.name", "lead.status"],
  },
  mobile_layout: {
    layout: "cards",
    primary_navigation: "Lead Desk",
    critical_content: ["lead.name", "lead.status"],
  },
  no_technical_language: true,
  no_fake_data: true,
  no_placeholder_actions: true,
  no_hardcoded_roles: true,
  no_hardcoded_units: true,
  plain_language_labels: true,
  audit_hooks: [
    {
      key: "lead.assigned.audit",
      action_key: "lead.assign",
      description: "Record lead assignment changes.",
    },
  ],
  events_expected: [
    {
      event_type: "lead.assigned",
      version: "0.1.0",
      trigger_action_key: "lead.assign",
    },
  ],
  notifications_triggered: [
    {
      key: "lead.assigned.notification",
      label: "Lead assigned",
      trigger_action_key: "lead.assign",
    },
  ],
  ai_allowed: false,
  ai_actions: [],
  ai_requires_human_approval: true,
  ai_forbidden_actions: ["publish", "send", "approve", "reject", "verify", "issue", "enroll", "delete", "export"],
  forbidden_behaviors: [
    "Do not show fake lead counts.",
    "Do not expose technical permission names to normal users.",
    "Do not hardcode role, campus, group, or staff names.",
    "Do not render assignment actions without a real capability-backed action.",
  ],
});
