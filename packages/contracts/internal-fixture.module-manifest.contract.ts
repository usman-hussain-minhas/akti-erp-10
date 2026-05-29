import { ModuleManifestSchema, type ModuleManifest } from "./module-manifest.schema.js";

export const internalFixtureModuleManifest: ModuleManifest = ModuleManifestSchema.parse({
  module_key: "platform.fixture",
  display_name: "Internal Platform Fixture",
  display_metadata: {
    display_name: "Internal Platform Fixture",
    display_description: "Internal validation fixture for platform lifecycle checks; not a user-facing module.",
    icon_key: "test-tube",
    category: "internal",
    visibility_state: "hidden",
    route: null,
  },
  module_type: "standard",
  version: "0.1.0",
  owner: "platform",
  min_platform_version: "0.1.0",
  dependencies: [
    {
      module_key: "core.access",
      min_version: "0.1.0",
    },
  ],
  optional_dependencies: [],
  capabilities: [
    {
      key: "platform.fixture.read",
      description: "Read internal fixture lifecycle state for Foundry validation.",
      module_key: "platform.fixture",
      risk_level: "low",
      requires_permission: true,
      requires_reauth: false,
      requires_audit: false,
      gatekeeper_required: false,
      approval_chain_required: false,
      input_schema: null,
      output_schema: "platform.fixture.read.output",
    },
    {
      key: "platform.fixture.manage",
      description: "Exercise governed Foundry lifecycle actions for the internal fixture.",
      module_key: "platform.fixture",
      risk_level: "high",
      requires_permission: true,
      requires_reauth: false,
      requires_audit: true,
      gatekeeper_required: true,
      approval_chain_required: false,
      input_schema: "platform.fixture.manage.input",
      output_schema: "platform.fixture.manage.output",
    },
  ],
  capabilities_consumed: [
    {
      capability_key: "platform.shell.access",
      provider_module_key: "core.access",
      required: true,
      min_version: "0.1.0",
    },
  ],
  required_capabilities: ["platform.fixture.read"],
  permissions: [
    {
      key: "platform.fixture.read",
      label: "Read internal fixture",
      module_key: "platform.fixture",
      description: "Allow reading the internal platform fixture state.",
      allowed_scope_types: ["organization"],
    },
    {
      key: "platform.fixture.manage",
      label: "Manage internal fixture",
      module_key: "platform.fixture",
      description: "Allow governed internal fixture lifecycle exercises.",
      allowed_scope_types: ["organization"],
    },
  ],
  api_routes: [
    {
      method: "GET",
      path: "/platform/fixture",
      capability_key: "platform.fixture.read",
      auth_required: true,
      public_route: false,
      rate_limited: true,
      input_schema: null,
      output_schema: "platform.fixture.read.output",
    },
    {
      method: "POST",
      path: "/platform/fixture/actions",
      capability_key: "platform.fixture.manage",
      auth_required: true,
      public_route: false,
      rate_limited: true,
      input_schema: "platform.fixture.manage.input",
      output_schema: "platform.fixture.manage.output",
    },
  ],
  events_emitted: [
    {
      event_type: "platform.fixture.lifecycle.proved",
      version: "0.1.0",
      source_module: "platform.fixture",
      schema: "platform.fixture.lifecycle.proved.event",
      delivery_mode: "transactional_outbox",
      retry_policy: {
        strategy: "none",
        max_attempts: 0,
        initial_delay_ms: 0,
      },
      idempotency_key_fields: ["organization_id", "fixture_run_id"],
    },
  ],
  events_consumed: [],
  schemas: [
    {
      key: "platform.fixture.read.output",
      version: "0.1.0",
      description: "Internal fixture read output.",
    },
    {
      key: "platform.fixture.manage.input",
      version: "0.1.0",
      description: "Internal fixture governed action input.",
    },
    {
      key: "platform.fixture.manage.output",
      version: "0.1.0",
      description: "Internal fixture governed action output.",
    },
    {
      key: "platform.fixture.lifecycle.proved.event",
      version: "0.1.0",
      description: "Internal fixture lifecycle proof event.",
    },
  ],
  migrations: [
    {
      key: "platform.fixture.non-destructive-migration-proof",
      version: "0.1.0",
      description: "Manifest-only non-destructive migration proof for Foundry lifecycle validation.",
      required: false,
    },
  ],
  settings: [
    {
      key: "platform.fixture.mode",
      label: "Fixture mode",
      description: "Controls the internal fixture validation mode.",
      value_type: "string",
      required: true,
      default_value: "validation",
    },
  ],
  menu_entries: [
    {
      key: "platform.fixture.shell",
      label: "Fixture shell",
      path: "/platform/fixture",
      capability_key: "platform.shell.access",
      order: 10,
    },
  ],
  dashboard_widgets: [],
  gatekeeper_hooks: [
    {
      key: "platform.fixture.manage.preflight",
      capability_key: "platform.fixture.manage",
      description: "Gatekeeper preflight for internal fixture lifecycle actions.",
      required: true,
    },
  ],
  audit_hooks: [
    {
      key: "platform.fixture.lifecycle.proved.audit",
      event_type: "platform.fixture.lifecycle.proved",
      description: "Audit internal fixture lifecycle proof events.",
      required: true,
    },
  ],
  health_checks: [
    {
      key: "platform.fixture.health",
      description: "Internal fixture contract health check.",
      endpoint: "/platform/fixture",
      critical: false,
      timeout_ms: 1000,
    },
  ],
  degraded_mode_behavior: {
    mode: "limited",
    description: "Fixture lifecycle actions are disabled while read access remains available.",
    disabled_capabilities: ["platform.fixture.manage"],
  },
  disable_behavior: {
    description: "Disabling the internal fixture blocks fixture lifecycle exercises only.",
    blocks_dependent_modules: false,
    data_retention_required: true,
  },
  data_ownership: {
    owner_module_key: "platform.fixture",
    tenant_scoped: true,
    entity_refs: [],
    retention_policy: "Retain internal fixture evidence according to platform audit policy.",
    sensitive_data: false,
  },
});
