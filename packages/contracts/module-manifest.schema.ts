import { z } from "zod";

export const ModuleKeySchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)+$/,
    "Use a lowercase slug/dot-key such as core.access or lead.desk",
  );

export const ManifestKeySchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*$/,
    "Use lowercase slug or dot-key syntax with no spaces or unsafe characters",
  );

export const SemverSchema = z
  .string()
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    "Use semver-like syntax such as 1.0.0",
  );

const ModuleTypeSchema = z.enum(["core", "standard", "optional", "dedicated"]);
const ModuleDisplayCategorySchema = z.enum(["core", "platform", "business", "integration", "internal"]);
const VisibilityStateSchema = z.enum(["available", "requires_setup", "locked", "coming_soon", "hidden"]);
const RiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
const HttpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const SchemaReferenceSchema = ManifestKeySchema.nullable();
const PathSchema = z.string().regex(/^\/[A-Za-z0-9/_:.-]*$/, "Use an absolute API or UI path");
const FieldKeySchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/, "Use lowercase field keys");

export const ModuleDisplayMetadataSchema = z
  .object({
    display_name: z.string().min(1),
    display_description: z.string().min(1),
    icon_key: ManifestKeySchema,
    category: ModuleDisplayCategorySchema,
    visibility_state: VisibilityStateSchema,
    route: PathSchema.nullable(),
  })
  .strict();

export const PermissionScopeSchema = z.enum([
  "global",
  "organization",
  "own_unit",
  "child_units",
  "own_record",
  "assigned_records",
]);

export const EventDeliveryModeSchema = z.enum([
  "transactional_outbox",
  "async_broadcast",
  "internal_sync",
]);

export const RetryPolicySchema = z
  .object({
    strategy: z.enum(["none", "fixed", "exponential"]),
    max_attempts: z.number().int().min(0),
    initial_delay_ms: z.number().int().min(0),
    max_delay_ms: z.number().int().min(0).optional(),
    backoff_multiplier: z.number().positive().optional(),
    dead_letter_after_attempts: z.number().int().min(0).optional(),
    jitter: z.boolean().optional(),
  })
  .strict()
  .superRefine((policy, ctx) => {
    if (policy.strategy === "none" && policy.max_attempts !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["max_attempts"],
        message: "max_attempts must be 0 when strategy is none",
      });
    }

    if (policy.strategy === "exponential" && policy.backoff_multiplier === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["backoff_multiplier"],
        message: "backoff_multiplier is required for exponential retry",
      });
    }

    if (
      policy.dead_letter_after_attempts !== undefined &&
      policy.dead_letter_after_attempts > policy.max_attempts
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["dead_letter_after_attempts"],
        message: "dead_letter_after_attempts must be <= max_attempts",
      });
    }
  });

export const CapabilitySpecSchema = z
  .object({
    key: ManifestKeySchema,
    description: z.string().min(1),
    module_key: ModuleKeySchema,
    risk_level: RiskLevelSchema,
    requires_permission: z.boolean(),
    requires_reauth: z.boolean(),
    requires_audit: z.boolean(),
    gatekeeper_required: z.boolean(),
    approval_chain_required: z.boolean(),
    input_schema: SchemaReferenceSchema,
    output_schema: SchemaReferenceSchema,
  })
  .strict()
  .superRefine((capability, ctx) => {
    if (["high", "critical"].includes(capability.risk_level)) {
      if (!capability.requires_audit) {
        ctx.addIssue({
          code: "custom",
          path: ["requires_audit"],
          message: "high and critical capabilities require audit",
        });
      }

      if (!capability.gatekeeper_required) {
        ctx.addIssue({
          code: "custom",
          path: ["gatekeeper_required"],
          message: "high and critical capabilities require Gatekeeper",
        });
      }
    }

    if (capability.risk_level === "critical" && !capability.requires_reauth) {
      ctx.addIssue({
        code: "custom",
        path: ["requires_reauth"],
        message: "critical capabilities require reauth",
      });
    }
  });

export const CapabilityConsumptionSpecSchema = z
  .object({
    capability_key: ManifestKeySchema,
    provider_module_key: ModuleKeySchema,
    required: z.boolean(),
    min_version: SemverSchema.optional(),
  })
  .strict();

export const PermissionSpecSchema = z
  .object({
    key: ManifestKeySchema,
    label: z.string().min(1),
    module_key: ModuleKeySchema,
    description: z.string().min(1),
    allowed_scope_types: z.array(PermissionScopeSchema).min(1),
  })
  .strict();

export const ApiRouteSchema = z
  .object({
    method: HttpMethodSchema,
    path: PathSchema,
    capability_key: ManifestKeySchema,
    auth_required: z.boolean(),
    public_route: z.boolean(),
    rate_limited: z.boolean(),
    input_schema: SchemaReferenceSchema,
    output_schema: SchemaReferenceSchema,
  })
  .strict();

export const ModuleEventSchema = z
  .object({
    event_type: ManifestKeySchema,
    version: SemverSchema,
    source_module: ModuleKeySchema,
    schema: ManifestKeySchema,
    delivery_mode: EventDeliveryModeSchema,
    retry_policy: RetryPolicySchema,
    idempotency_key_fields: z.array(FieldKeySchema),
  })
  .strict();

export const SchemaSpecSchema = z
  .object({
    key: ManifestKeySchema,
    version: SemverSchema,
    description: z.string().min(1),
  })
  .strict();

export const MigrationSpecSchema = z
  .object({
    key: ManifestKeySchema,
    version: SemverSchema,
    description: z.string().min(1),
    required: z.boolean(),
  })
  .strict();

export const SettingSpecSchema = z
  .object({
    key: ManifestKeySchema,
    label: z.string().min(1),
    description: z.string().min(1),
    value_type: z.enum(["string", "number", "boolean", "json"]),
    required: z.boolean(),
    default_value: z.unknown().optional(),
  })
  .strict();

export const MenuEntrySpecSchema = z
  .object({
    key: ManifestKeySchema,
    label: z.string().min(1),
    path: PathSchema,
    capability_key: ManifestKeySchema.optional(),
    order: z.number().int().min(0),
  })
  .strict();

export const DashboardWidgetSpecSchema = z
  .object({
    key: ManifestKeySchema,
    label: z.string().min(1),
    capability_key: ManifestKeySchema,
    data_schema: ManifestKeySchema,
  })
  .strict();

export const GatekeeperHookSpecSchema = z
  .object({
    key: ManifestKeySchema,
    capability_key: ManifestKeySchema,
    description: z.string().min(1),
    required: z.boolean(),
  })
  .strict();

export const AuditHookSpecSchema = z
  .object({
    key: ManifestKeySchema,
    event_type: ManifestKeySchema,
    description: z.string().min(1),
    required: z.boolean(),
  })
  .strict();

export const HealthCheckSpecSchema = z
  .object({
    key: ManifestKeySchema,
    description: z.string().min(1),
    endpoint: PathSchema.optional(),
    critical: z.boolean(),
    timeout_ms: z.number().int().positive(),
  })
  .strict();

export const DegradedModeSpecSchema = z
  .object({
    mode: z.enum(["readonly", "limited", "disabled"]),
    description: z.string().min(1),
    disabled_capabilities: z.array(ManifestKeySchema),
  })
  .strict();

export const DisableBehaviorSpecSchema = z
  .object({
    description: z.string().min(1),
    blocks_dependent_modules: z.boolean(),
    data_retention_required: z.boolean(),
  })
  .strict();

export const DataOwnershipSpecSchema = z
  .object({
    owner_module_key: ModuleKeySchema,
    tenant_scoped: z.boolean(),
    entity_refs: z.array(ManifestKeySchema),
    retention_policy: z.string().min(1),
    sensitive_data: z.boolean(),
  })
  .strict();

const DependencySpecSchema = z
  .object({
    module_key: ModuleKeySchema,
    min_version: SemverSchema.optional(),
  })
  .strict();

export const ModuleManifestSchema = z
  .object({
    module_key: ModuleKeySchema,
    display_name: z.string().min(1),
    display_metadata: ModuleDisplayMetadataSchema,
    module_type: ModuleTypeSchema,
    version: SemverSchema,
    owner: z.string().min(1),
    min_platform_version: SemverSchema,
    dependencies: z.array(DependencySpecSchema),
    optional_dependencies: z.array(DependencySpecSchema),
    capabilities: z.array(CapabilitySpecSchema),
    capabilities_consumed: z.array(CapabilityConsumptionSpecSchema),
    required_capabilities: z.array(ManifestKeySchema),
    permissions: z.array(PermissionSpecSchema),
    api_routes: z.array(ApiRouteSchema),
    events_emitted: z.array(ModuleEventSchema),
    events_consumed: z.array(ModuleEventSchema),
    schemas: z.array(SchemaSpecSchema),
    migrations: z.array(MigrationSpecSchema),
    settings: z.array(SettingSpecSchema),
    menu_entries: z.array(MenuEntrySpecSchema),
    dashboard_widgets: z.array(DashboardWidgetSpecSchema),
    gatekeeper_hooks: z.array(GatekeeperHookSpecSchema),
    audit_hooks: z.array(AuditHookSpecSchema),
    health_checks: z.array(HealthCheckSpecSchema),
    degraded_mode_behavior: DegradedModeSpecSchema,
    disable_behavior: DisableBehaviorSpecSchema,
    data_ownership: DataOwnershipSpecSchema,
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const addIssue = (path: Array<string | number>, message: string) => {
      ctx.addIssue({
        code: "custom",
        path,
        message,
      });
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

    requireUnique(manifest.capabilities, "capabilities", (item) => item.key, "key", "capability key");
    requireUnique(manifest.permissions, "permissions", (item) => item.key, "key", "permission key");
    requireUnique(
      manifest.api_routes,
      "api_routes",
      (item) => `${item.method} ${item.path}`,
      ["method", "path"],
      "API route method + path",
    );
    requireUnique(
      manifest.events_emitted,
      "events_emitted",
      (item) => `${item.event_type}@${item.version}`,
      ["event_type", "version"],
      "emitted event type + version",
    );
    requireUnique(
      manifest.events_consumed,
      "events_consumed",
      (item) => `${item.event_type}@${item.version}`,
      ["event_type", "version"],
      "consumed event type + version",
    );
    requireUnique(manifest.schemas, "schemas", (item) => item.key, "key", "schema key");
    requireUnique(manifest.migrations, "migrations", (item) => item.key, "key", "migration key");
    requireUnique(manifest.settings, "settings", (item) => item.key, "key", "setting key");
    requireUnique(manifest.menu_entries, "menu_entries", (item) => item.key, "key", "menu entry key");
    requireUnique(
      manifest.dashboard_widgets,
      "dashboard_widgets",
      (item) => item.key,
      "key",
      "dashboard widget key",
    );
    requireUnique(
      manifest.gatekeeper_hooks,
      "gatekeeper_hooks",
      (item) => item.key,
      "key",
      "Gatekeeper hook key",
    );
    requireUnique(manifest.audit_hooks, "audit_hooks", (item) => item.key, "key", "audit hook key");
    requireUnique(manifest.health_checks, "health_checks", (item) => item.key, "key", "health check key");
    requireUnique(
      manifest.capabilities_consumed,
      "capabilities_consumed",
      (item) => `${item.provider_module_key}:${item.capability_key}`,
      ["provider_module_key", "capability_key"],
      "provider module + consumed capability pair",
    );
    requireUnique(
      manifest.required_capabilities,
      "required_capabilities",
      (item) => item,
      [],
      "required capability key",
    );
    requireUnique(
      manifest.dependencies,
      "dependencies",
      (item) => item.module_key,
      "module_key",
      "dependency module_key",
    );
    requireUnique(
      manifest.optional_dependencies,
      "optional_dependencies",
      (item) => item.module_key,
      "module_key",
      "optional dependency module_key",
    );

    const capabilityKeys = new Set(manifest.capabilities.map((item) => item.key));
    const consumedCapabilityKeys = new Set(manifest.capabilities_consumed.map((item) => item.capability_key));
    const schemaKeys = new Set(manifest.schemas.map((item) => item.key));
    const emittedEventTypes = new Set(manifest.events_emitted.map((item) => item.event_type));
    const gatekeeperCapabilityKeys = new Set(manifest.gatekeeper_hooks.map((item) => item.capability_key));
    const dependencyModuleKeys = new Set(manifest.dependencies.map((item) => item.module_key));

    const requireLocalCapability = (capabilityKey: string, path: Array<string | number>) => {
      if (!capabilityKeys.has(capabilityKey)) {
        addIssue(path, "capability_key must reference capabilities[].key");
      }
    };

    const requireLocalOrConsumedCapability = (capabilityKey: string, path: Array<string | number>) => {
      if (!capabilityKeys.has(capabilityKey) && !consumedCapabilityKeys.has(capabilityKey)) {
        addIssue(path, "capability_key must reference capabilities[].key or capabilities_consumed[].capability_key");
      }
    };

    const requireSchema = (schemaKey: string | null, path: Array<string | number>) => {
      if (schemaKey !== null && !schemaKeys.has(schemaKey)) {
        addIssue(path, "schema reference must exist in schemas[].key");
      }
    };

    manifest.capabilities.forEach((capability, index) => {
      if (capability.module_key !== manifest.module_key) {
        addIssue(["capabilities", index, "module_key"], "capability module_key must match manifest module_key");
      }

      requireSchema(capability.input_schema, ["capabilities", index, "input_schema"]);
      requireSchema(capability.output_schema, ["capabilities", index, "output_schema"]);

      if (capability.gatekeeper_required && !gatekeeperCapabilityKeys.has(capability.key)) {
        addIssue(
          ["capabilities", index, "gatekeeper_required"],
          "gatekeeper_required capabilities must have at least one gatekeeper hook",
        );
      }
    });

    manifest.permissions.forEach((permission, index) => {
      if (permission.module_key !== manifest.module_key) {
        addIssue(["permissions", index, "module_key"], "permission module_key must match manifest module_key");
      }
    });

    manifest.capabilities_consumed.forEach((capability, index) => {
      if (capability.provider_module_key === manifest.module_key) {
        addIssue(
          ["capabilities_consumed", index, "provider_module_key"],
          "consumed capability provider_module_key must not equal manifest module_key",
        );
      }
    });

    manifest.required_capabilities.forEach((capabilityKey, index) => {
      requireLocalOrConsumedCapability(capabilityKey, ["required_capabilities", index]);
    });

    manifest.api_routes.forEach((route, index) => {
      requireLocalCapability(route.capability_key, ["api_routes", index, "capability_key"]);
      requireSchema(route.input_schema, ["api_routes", index, "input_schema"]);
      requireSchema(route.output_schema, ["api_routes", index, "output_schema"]);
    });

    manifest.events_emitted.forEach((event, index) => {
      if (event.source_module !== manifest.module_key) {
        addIssue(["events_emitted", index, "source_module"], "emitted event source_module must match manifest module_key");
      }

      requireSchema(event.schema, ["events_emitted", index, "schema"]);
    });

    manifest.events_consumed.forEach((event, index) => {
      requireSchema(event.schema, ["events_consumed", index, "schema"]);
    });

    manifest.menu_entries.forEach((entry, index) => {
      if (entry.capability_key !== undefined) {
        requireLocalOrConsumedCapability(entry.capability_key, ["menu_entries", index, "capability_key"]);
      }
    });

    manifest.dashboard_widgets.forEach((widget, index) => {
      requireLocalOrConsumedCapability(widget.capability_key, ["dashboard_widgets", index, "capability_key"]);
      requireSchema(widget.data_schema, ["dashboard_widgets", index, "data_schema"]);
    });

    manifest.gatekeeper_hooks.forEach((hook, index) => {
      requireLocalCapability(hook.capability_key, ["gatekeeper_hooks", index, "capability_key"]);
    });

    manifest.audit_hooks.forEach((hook, index) => {
      if (!emittedEventTypes.has(hook.event_type)) {
        addIssue(["audit_hooks", index, "event_type"], "audit hook event_type must reference events_emitted[].event_type");
      }
    });

    manifest.degraded_mode_behavior.disabled_capabilities.forEach((capabilityKey, index) => {
      if (!capabilityKeys.has(capabilityKey)) {
        addIssue(
          ["degraded_mode_behavior", "disabled_capabilities", index],
          "disabled capability must reference capabilities[].key",
        );
      }
    });

    manifest.dependencies.forEach((dependency, index) => {
      if (dependency.module_key === manifest.module_key) {
        addIssue(["dependencies", index, "module_key"], "dependencies must not include manifest module_key");
      }
    });

    manifest.optional_dependencies.forEach((dependency, index) => {
      if (dependency.module_key === manifest.module_key) {
        addIssue(["optional_dependencies", index, "module_key"], "optional_dependencies must not include manifest module_key");
      }

      if (dependencyModuleKeys.has(dependency.module_key)) {
        addIssue(
          ["optional_dependencies", index, "module_key"],
          "module_key must not appear in both dependencies and optional_dependencies",
        );
      }
    });

    if (manifest.data_ownership.owner_module_key !== manifest.module_key) {
      addIssue(["data_ownership", "owner_module_key"], "data owner_module_key must match manifest module_key");
    }
  });

export type RetryPolicySpec = z.infer<typeof RetryPolicySchema>;
export type CapabilitySpec = z.infer<typeof CapabilitySpecSchema>;
export type CapabilityConsumptionSpec = z.infer<typeof CapabilityConsumptionSpecSchema>;
export type PermissionSpec = z.infer<typeof PermissionSpecSchema>;
export type ApiRouteSpec = z.infer<typeof ApiRouteSchema>;
export type ModuleEventSpec = z.infer<typeof ModuleEventSchema>;
export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;

export function parseModuleManifest(input: unknown): ModuleManifest {
  return ModuleManifestSchema.parse(input);
}

export function safeParseModuleManifest(input: unknown) {
  return ModuleManifestSchema.safeParse(input);
}

export const sampleCoreModuleManifest = ModuleManifestSchema.parse({
  module_key: "core.access",
  display_name: "Access Core",
  display_metadata: {
    display_name: "Access Core",
    display_description: "Access policy and capability foundation for the platform.",
    icon_key: "shield",
    category: "core",
    visibility_state: "hidden",
    route: null,
  },
  module_type: "core",
  version: "0.1.0",
  owner: "platform",
  min_platform_version: "0.1.0",
  dependencies: [],
  optional_dependencies: [],
  capabilities: [
    {
      key: "access.policy.manage",
      description: "Manage access policy declarations.",
      module_key: "core.access",
      risk_level: "high",
      requires_permission: true,
      requires_reauth: false,
      requires_audit: true,
      gatekeeper_required: true,
      approval_chain_required: false,
      input_schema: "access.policy.manage.input",
      output_schema: "access.policy.manage.output",
    },
  ],
  capabilities_consumed: [],
  required_capabilities: [],
  permissions: [
    {
      key: "access.policy.manage",
      label: "Manage access policies",
      module_key: "core.access",
      description: "Allows policy configuration within approved generic scopes.",
      allowed_scope_types: ["global", "organization"],
    },
  ],
  api_routes: [
    {
      method: "POST",
      path: "/api/access/policies",
      capability_key: "access.policy.manage",
      auth_required: true,
      public_route: false,
      rate_limited: true,
      input_schema: "access.policy.manage.input",
      output_schema: "access.policy.manage.output",
    },
  ],
  events_emitted: [
    {
      event_type: "access.policy.updated",
      version: "0.1.0",
      source_module: "core.access",
      schema: "access.policy.updated",
      delivery_mode: "transactional_outbox",
      retry_policy: {
        strategy: "exponential",
        max_attempts: 7,
        initial_delay_ms: 60000,
        max_delay_ms: 86400000,
        backoff_multiplier: 3,
        dead_letter_after_attempts: 7,
        jitter: true,
      },
      idempotency_key_fields: ["organization_id", "policy_id"],
    },
  ],
  events_consumed: [],
  schemas: [
    {
      key: "access.policy.manage.input",
      version: "0.1.0",
      description: "Input contract for access policy management.",
    },
    {
      key: "access.policy.manage.output",
      version: "0.1.0",
      description: "Output contract for access policy management.",
    },
    {
      key: "access.policy.updated",
      version: "0.1.0",
      description: "Event contract for access policy updates.",
    },
  ],
  migrations: [],
  settings: [],
  menu_entries: [],
  dashboard_widgets: [],
  gatekeeper_hooks: [
    {
      key: "access.policy.manage.gatekeeper",
      capability_key: "access.policy.manage",
      description: "Gatekeeper check for access policy changes.",
      required: true,
    },
  ],
  audit_hooks: [
    {
      key: "access.policy.updated.audit",
      event_type: "access.policy.updated",
      description: "Audit access policy updates.",
      required: true,
    },
  ],
  health_checks: [
    {
      key: "access.health",
      description: "Access Core contract health check.",
      endpoint: "/api/access/health",
      critical: true,
      timeout_ms: 5000,
    },
  ],
  degraded_mode_behavior: {
    mode: "readonly",
    description: "Policy reads may continue; policy changes are disabled.",
    disabled_capabilities: ["access.policy.manage"],
  },
  disable_behavior: {
    description: "Disabling Access Core blocks dependent protected operations.",
    blocks_dependent_modules: true,
    data_retention_required: true,
  },
  data_ownership: {
    owner_module_key: "core.access",
    tenant_scoped: true,
    entity_refs: ["access.policy"],
    retention_policy: "Retain policy metadata according to platform audit policy.",
    sensitive_data: true,
  },
});
