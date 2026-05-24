import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { safeParseModuleManifest } from "../module-manifest.schema.ts";
import {
  EngagementGatewayCreateRequestInputSchema,
  EngagementGatewayCreateRequestOutputSchema,
  EngagementGatewayHealthOutputSchema,
  EngagementGatewayRequestRecordedEventSchema,
  sampleEngagementGatewayCreateRequestInput,
  sampleEngagementGatewayCreateRequestOutput,
  sampleEngagementGatewayHealthOutput,
  sampleEngagementGatewayRequestRecordedEvent,
} from "../engagement-gateway-lite.contract.ts";
import { engagementGatewayLiteModuleManifest } from "../engagement-gateway-lite.module-manifest.contract.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const contractsRoot = resolve(scriptDir, "..");
const contractPath = resolve(contractsRoot, "engagement-gateway-lite.contract.ts");
const manifestPath = resolve(contractsRoot, "engagement-gateway-lite.module-manifest.contract.ts");

const EXPECTED_MODULE_KEY = "engagement.gateway";
const REQUEST_CREATE_CAPABILITY = "engagement.gateway.request.create";
const HEALTH_READ_CAPABILITY = "engagement.gateway.health.read";
const RECORDED_EVENT = "engagement.gateway.request.recorded";

const EXPECTED_SCHEMA_KEYS = new Set([
  "engagement.gateway.request.create.input",
  "engagement.gateway.request.create.output",
  "engagement.gateway.request.recorded.event",
  "engagement.gateway.health.output",
  "engagement.gateway.whatsapp.stub.payload",
]);

const EXPECTED_ROUTE_KEYS = new Set([
  "POST /platform/engagement-gateway/organizations/:organization_id/requests",
  "GET /platform/engagement-gateway/organizations/:organization_id/health",
]);

const FORBIDDEN_SOURCE_PATTERNS = [
  ["meta", /(^|[^a-z0-9])meta([^a-z0-9]|$)/],
  ["phone", /(^|[^a-z0-9])phone([^a-z0-9]|$)/],
  ["web" + "hook", /(^|[^a-z0-9])webhook([^a-z0-9]|$)/],
  ["bsp", /(^|[^a-z0-9])bsp([^a-z0-9]|$)/],
];

function setEquals(actual, expected) {
  if (actual.size !== expected.size) {
    return false;
  }

  for (const item of actual) {
    if (!expected.has(item)) {
      return false;
    }
  }

  return true;
}

function hasDuplicates(values) {
  return new Set(values).size !== values.length;
}

function main() {
  const failures = [];

  const manifestParse = safeParseModuleManifest(engagementGatewayLiteModuleManifest);
  if (!manifestParse.success) {
    failures.push(`Engagement Gateway Lite manifest parse failed: ${manifestParse.error.message}`);
  }

  const sampleParses = [
    ["create request input", EngagementGatewayCreateRequestInputSchema.safeParse(sampleEngagementGatewayCreateRequestInput)],
    [
      "create request output",
      EngagementGatewayCreateRequestOutputSchema.safeParse(sampleEngagementGatewayCreateRequestOutput),
    ],
    [
      "recorded event",
      EngagementGatewayRequestRecordedEventSchema.safeParse(sampleEngagementGatewayRequestRecordedEvent),
    ],
    ["health output", EngagementGatewayHealthOutputSchema.safeParse(sampleEngagementGatewayHealthOutput)],
  ];

  for (const [label, parseResult] of sampleParses) {
    if (!parseResult.success) {
      failures.push(`Sample ${label} parse failed: ${parseResult.error.message}`);
    }
  }

  const manifest = manifestParse.success ? manifestParse.data : null;
  if (manifest) {
    if (manifest.module_key !== EXPECTED_MODULE_KEY) {
      failures.push(`Manifest module_key must be ${EXPECTED_MODULE_KEY}`);
    }

    if (manifest.display_name !== "Engagement Gateway Lite") {
      failures.push("Manifest display_name must be Engagement Gateway Lite");
    }

    if (manifest.module_type !== "standard") {
      failures.push("Manifest module_type must be standard");
    }

    const dependencyKeys = manifest.dependencies.map((dependency) => dependency.module_key);
    if (dependencyKeys.length !== 1 || dependencyKeys[0] !== "core.access") {
      failures.push("Manifest must depend only on core.access for P2A-001");
    }

    if (manifest.optional_dependencies.length !== 0) {
      failures.push("Manifest optional_dependencies must be empty for P2A-001");
    }

    const capabilityKeys = manifest.capabilities.map((capability) => capability.key);
    if (!setEquals(new Set(capabilityKeys), new Set([REQUEST_CREATE_CAPABILITY, HEALTH_READ_CAPABILITY]))) {
      failures.push("Manifest capabilities must contain only request.create and health.read");
    }

    if (hasDuplicates(capabilityKeys)) {
      failures.push("Manifest capability keys must be unique");
    }

    const requestCapability = manifest.capabilities.find(
      (capability) => capability.key === REQUEST_CREATE_CAPABILITY,
    );
    if (requestCapability) {
      if (requestCapability.risk_level !== "high") {
        failures.push(`${REQUEST_CREATE_CAPABILITY} must be high risk`);
      }

      if (
        requestCapability.requires_permission !== true ||
        requestCapability.requires_audit !== true ||
        requestCapability.gatekeeper_required !== true ||
        requestCapability.approval_chain_required !== false
      ) {
        failures.push(`${REQUEST_CREATE_CAPABILITY} flags must require permission, audit, and Gatekeeper only`);
      }
    }

    const healthCapability = manifest.capabilities.find((capability) => capability.key === HEALTH_READ_CAPABILITY);
    if (healthCapability) {
      if (
        healthCapability.risk_level !== "low" ||
        healthCapability.requires_permission !== true ||
        healthCapability.requires_audit !== false ||
        healthCapability.gatekeeper_required !== false
      ) {
        failures.push(`${HEALTH_READ_CAPABILITY} must be low-risk read capability without audit or Gatekeeper`);
      }
    }

    const permissionKeys = manifest.permissions.map((permission) => permission.key);
    if (!setEquals(new Set(permissionKeys), new Set([REQUEST_CREATE_CAPABILITY, HEALTH_READ_CAPABILITY]))) {
      failures.push("Manifest permissions must match declared capability keys");
    }

    for (const permission of manifest.permissions) {
      if (permission.allowed_scope_types.length !== 1 || permission.allowed_scope_types[0] !== "organization") {
        failures.push(`${permission.key} must allow organization scope only`);
      }
    }

    const routeKeys = manifest.api_routes.map((route) => `${route.method} ${route.path}`);
    if (!setEquals(new Set(routeKeys), EXPECTED_ROUTE_KEYS)) {
      failures.push("Manifest routes must match approved P2A-001 route declarations");
    }

    for (const route of manifest.api_routes) {
      if (route.auth_required !== true || route.public_route !== false || route.rate_limited !== true) {
        failures.push(`${route.method} ${route.path} must be protected, private, and rate limited`);
      }
    }

    if (manifest.events_emitted.length !== 1 || manifest.events_emitted[0]?.event_type !== RECORDED_EVENT) {
      failures.push(`Manifest must emit exactly ${RECORDED_EVENT}`);
    }

    const recordedEvent = manifest.events_emitted[0];
    if (recordedEvent) {
      if (
        recordedEvent.version !== "0.1.0" ||
        recordedEvent.delivery_mode !== "transactional_outbox" ||
        recordedEvent.retry_policy.strategy !== "none" ||
        recordedEvent.retry_policy.max_attempts !== 0
      ) {
        failures.push(`${RECORDED_EVENT} must be declaration-only transactional outbox event with no retry policy`);
      }
    }

    if (manifest.events_consumed.length !== 0) {
      failures.push("Manifest events_consumed must be empty for P2A-001");
    }

    const schemaKeys = new Set(manifest.schemas.map((schema) => schema.key));
    if (!setEquals(schemaKeys, EXPECTED_SCHEMA_KEYS)) {
      failures.push("Manifest schemas must match approved P2A-001 schema keys");
    }

    if (
      manifest.migrations.length !== 0 ||
      manifest.settings.length !== 0 ||
      manifest.menu_entries.length !== 0 ||
      manifest.dashboard_widgets.length !== 0
    ) {
      failures.push("Manifest must not declare migrations, settings, menu entries, or dashboard widgets");
    }

    if (
      manifest.gatekeeper_hooks.length !== 1 ||
      manifest.gatekeeper_hooks[0]?.capability_key !== REQUEST_CREATE_CAPABILITY ||
      manifest.gatekeeper_hooks[0]?.required !== true
    ) {
      failures.push(`${REQUEST_CREATE_CAPABILITY} must have one required Gatekeeper hook`);
    }

    if (
      manifest.audit_hooks.length !== 1 ||
      manifest.audit_hooks[0]?.event_type !== RECORDED_EVENT ||
      manifest.audit_hooks[0]?.required !== true
    ) {
      failures.push(`${RECORDED_EVENT} must have one required audit hook`);
    }

    if (manifest.health_checks.length !== 1 || manifest.health_checks[0]?.critical !== false) {
      failures.push("Manifest must declare one non-critical health check");
    }

    if (
      manifest.degraded_mode_behavior.mode !== "limited" ||
      !manifest.degraded_mode_behavior.disabled_capabilities.includes(REQUEST_CREATE_CAPABILITY)
    ) {
      failures.push("Manifest degraded mode must disable request creation only");
    }

    if (
      manifest.disable_behavior.blocks_dependent_modules !== true ||
      manifest.disable_behavior.data_retention_required !== true
    ) {
      failures.push("Manifest disable behavior must block dependents and require data retention");
    }

    if (
      manifest.data_ownership.owner_module_key !== EXPECTED_MODULE_KEY ||
      manifest.data_ownership.tenant_scoped !== true ||
      manifest.data_ownership.entity_refs.length !== 0 ||
      manifest.data_ownership.sensitive_data !== true
    ) {
      failures.push("Manifest data ownership must be tenant-scoped with no entity refs for P2A-001");
    }
  }

  const contractSource = readFileSync(contractPath, "utf8").toLowerCase();
  const manifestSource = readFileSync(manifestPath, "utf8").toLowerCase();
  const combinedSource = `${contractSource}\n${manifestSource}`;

  for (const [label, pattern] of FORBIDDEN_SOURCE_PATTERNS) {
    if (pattern.test(combinedSource)) {
      failures.push(`Forbidden provider or downstream coupling token detected: ${label}`);
    }
  }

  if (combinedSource.includes("whatsapp")) {
    if (!combinedSource.includes("whatsapp_stub")) {
      failures.push("Any WhatsApp mention must remain stub-only and use whatsapp_stub transport naming");
    }
    if (combinedSource.includes("production credential")) {
      failures.push("Engagement Gateway contracts must not encode production credential behavior");
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log("Engagement Gateway Lite contract validation passed.");
}

main();
