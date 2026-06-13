import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PermissionScopeSchema, safeParseModuleManifest } from "../module-manifest.schema.ts";
import { accessCoreModuleManifest } from "../access-core.module-manifest.contract.ts";
import {
  AccessCoreCapabilitySeedListSchema,
  accessCoreCapabilitySeedDefinitions,
} from "../access-core-capability-seed.contract.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const contractsRoot = resolve(scriptDir, "..");
const manifestPath = resolve(contractsRoot, "access-core.module-manifest.contract.ts");
const seedPath = resolve(contractsRoot, "access-core-capability-seed.contract.ts");
const packageManifestPath = resolve(contractsRoot, "package.json");

const S2_CC_001_PHASE6C_WORKSPACE_EXPORTS = [
  "./phase-6c-workspace-cross-module-channel-ref-module-manifest",
  "./phase-6c-workspace-e2e-encryption-boundary-module-manifest",
  "./phase-6c-workspace-membership-policy-module-manifest",
  "./phase-6c-workspace-mention-notification-evidence-module-manifest",
  "./phase-6c-workspace-message-attachment-file-ref-module-manifest",
  "./phase-6c-workspace-moderation-reporting-module-manifest",
  "./phase-6c-workspace-outbound-notification-gateway-module-manifest",
  "./phase-6c-workspace-private-channel-approval-module-manifest",
  "./phase-6c-workspace-workspace-message-search-module-manifest",
];

const DISALLOWED_PREFIXES = [
  "lead.",
  "whatsapp.",
  "engagement.",
  "lms.",
  "student.",
  "finance.",
  "hr.",
  "hiring.",
  "certification.",
  "website.",
  "quality.",
  "audit.",
  "ai.",
];

const FORBIDDEN_ASSUMPTION_TOKENS = ["akti", "campus"];
const FORBIDDEN_ASSUMPTION_PATTERNS = [/\borg_\d+\b/, /\buser_\d+\b/, /\bgroup_\d+\b/, /\brole_\d+\b/];

const FORBIDDEN_RUNTIME_TOKENS = [
  "prisma",
  "createMany",
  "upsert",
  "insert into",
  "update ",
  "delete from",
  "seed(",
  "transaction(",
  "db.",
];

const ACCESS_CORE_APPROVED_NON_ACCESS_KEYS = new Set([
  "platform.data.controls.view",
  "platform.crm.access",
  "platform.modules.view",
  "platform.shell.access",
]);

const P1_007_ALLOWED_API_ROUTES = new Set([
  "GET /platform/access/capabilities",
  "POST /platform/access/organizations/:organization_id/users",
  "GET /platform/access/organizations/:organization_id/users",
  "GET /platform/access/organizations/:organization_id/users/:user_id",
  "PATCH /platform/access/organizations/:organization_id/users/:user_id",
  "DELETE /platform/access/organizations/:organization_id/users/:user_id",
  "POST /platform/access/organizations/:organization_id/groups",
  "GET /platform/access/organizations/:organization_id/groups",
  "GET /platform/access/organizations/:organization_id/groups/:group_id",
  "PATCH /platform/access/organizations/:organization_id/groups/:group_id",
  "DELETE /platform/access/organizations/:organization_id/groups/:group_id",
  "POST /platform/access/organizations/:organization_id/user-groups",
  "GET /platform/access/organizations/:organization_id/user-groups",
  "DELETE /platform/access/organizations/:organization_id/user-groups/:membership_id",
  "POST /platform/access/organizations/:organization_id/group-capabilities",
  "GET /platform/access/organizations/:organization_id/group-capabilities",
  "DELETE /platform/access/organizations/:organization_id/group-capabilities/:assignment_id",
]);

function validateStage2ContractNamespaceCompatibility(failures) {
  const packageManifest = JSON.parse(readFileSync(packageManifestPath, "utf8"));
  const migration = packageManifest.esblaNamespaceMigration;

  if (!migration) {
    failures.push("S2-CC-001 namespace migration metadata must exist in packages/contracts/package.json");
    return;
  }

  if (migration.stage2_ffet !== "S2-CC-001") {
    failures.push("S2-CC-001 namespace migration metadata must name S2-CC-001");
  }

  if (packageManifest.name !== migration.current_workspace_package_name) {
    failures.push("S2-CC-001 package compatibility metadata must match the current workspace package name");
  }

  if (migration.package_name_rename !== "deferred_until_workspace_wide_package_rename_can_update_consumers_and_lockfile") {
    failures.push("S2-CC-001 package rename must remain deferred until the workspace-wide package rename can update consumers and lockfile");
  }

  const exported = new Set(migration.exported_phase6c_workspace_manifest_subpaths ?? []);
  for (const exportPath of S2_CC_001_PHASE6C_WORKSPACE_EXPORTS) {
    if (!packageManifest.exports?.[exportPath]) {
      failures.push(`S2-CC-001 package export missing: ${exportPath}`);
    }

    if (!packageManifest.typesVersions?.["*"]?.[exportPath.slice(2)]) {
      failures.push(`S2-CC-001 typesVersions entry missing: ${exportPath}`);
    }

    if (!exported.has(exportPath)) {
      failures.push(`S2-CC-001 migration metadata missing export: ${exportPath}`);
    }
  }
}

function hasDuplicates(values) {
  return new Set(values).size !== values.length;
}

function normalizeSortedSet(values) {
  return [...new Set(values)].sort();
}

function usesApprovedAccessCoreNamespace(key) {
  return key.startsWith("access.") || ACCESS_CORE_APPROVED_NON_ACCESS_KEYS.has(key);
}

function main() {
  const failures = [];

  validateStage2ContractNamespaceCompatibility(failures);

  const manifestParse = safeParseModuleManifest(accessCoreModuleManifest);
  if (!manifestParse.success) {
    failures.push(`Access Core manifest parse failed: ${manifestParse.error.message}`);
  }

  const seedParse = AccessCoreCapabilitySeedListSchema.safeParse(accessCoreCapabilitySeedDefinitions);
  if (!seedParse.success) {
    failures.push(`Access Core seed parse failed: ${seedParse.error.message}`);
  }

  const manifest = manifestParse.success ? manifestParse.data : null;
  const seedDefinitions = seedParse.success ? seedParse.data : [];

  if (manifest) {
    if (manifest.module_key !== "core.access") {
      failures.push("Manifest module_key must be core.access");
    }

    if (manifest.menu_entries.length !== 0) {
      failures.push("Manifest menu_entries must be empty for P1-004 alignment-only scope");
    }

    if (manifest.dashboard_widgets.length !== 0) {
      failures.push("Manifest dashboard_widgets must be empty for P1-004 alignment-only scope");
    }

    if (manifest.events_emitted.length !== 0 || manifest.events_consumed.length !== 0) {
      failures.push("Manifest events_emitted/events_consumed must be empty for P1-004");
    }

    const manifestCapabilityKeys = new Set(manifest.capabilities.map((capability) => capability.key));

    if (manifest.api_routes.length !== P1_007_ALLOWED_API_ROUTES.size) {
      failures.push(
        `Manifest api_routes must include exactly ${P1_007_ALLOWED_API_ROUTES.size} P1-007 routes`,
      );
    }

    for (const route of manifest.api_routes) {
      const routeKey = `${route.method} ${route.path}`;
      if (!P1_007_ALLOWED_API_ROUTES.has(routeKey)) {
        failures.push(`Unapproved Access Core API route detected: ${routeKey}`);
      }

      if (!route.path.startsWith("/platform/access/")) {
        failures.push(`Access Core API route must start with /platform/access/: ${routeKey}`);
      }

      if (route.path.startsWith("/app/")) {
        failures.push(`Frontend-style route must not appear in Access Core manifest: ${routeKey}`);
      }

      if (!manifestCapabilityKeys.has(route.capability_key)) {
        failures.push(`Route capability_key must exist in manifest capabilities: ${routeKey}`);
      }

      if (route.auth_required !== true || route.public_route !== false) {
        failures.push(`Route auth/public flags must be explicit and protected: ${routeKey}`);
      }

      if (typeof route.rate_limited !== "boolean") {
        failures.push(`Route rate_limited must be explicitly set: ${routeKey}`);
      }
    }
  }

  const capabilityKeys = seedDefinitions.map((seed) => seed.capability_key);
  const permissionKeys = seedDefinitions.map((seed) => seed.permission_key);

  if (hasDuplicates(capabilityKeys)) {
    failures.push("Seed capability keys must be unique");
  }

  if (hasDuplicates(permissionKeys)) {
    failures.push("Seed permission keys must be unique");
  }

  if (manifest) {
    const manifestCapabilityKeys = new Set(manifest.capabilities.map((capability) => capability.key));
    const manifestPermissionKeys = new Set(manifest.permissions.map((permission) => permission.key));
    const manifestCapabilityByKey = new Map(manifest.capabilities.map((capability) => [capability.key, capability]));
    const manifestPermissionByKey = new Map(manifest.permissions.map((permission) => [permission.key, permission]));
    const shellCapability = manifestCapabilityByKey.get("platform.shell.access");
    const shellPermission = manifestPermissionByKey.get("platform.shell.access");
    const policyCapability = manifestCapabilityByKey.get("access.policy.manage");

    if (!shellCapability) {
      failures.push("platform.shell.access capability must exist in Access Core manifest");
    } else {
      if (shellCapability.key === "access.policy.manage") {
        failures.push("platform.shell.access must remain distinct from access.policy.manage");
      }

      if (shellCapability.risk_level !== "low") {
        failures.push("platform.shell.access must be a low-risk shell capability");
      }

      if (shellCapability.gatekeeper_required !== false) {
        failures.push("platform.shell.access must not require Gatekeeper preflight");
      }

      if (shellCapability.approval_chain_required !== false) {
        failures.push("platform.shell.access must not require approval chain");
      }

      if (shellCapability.requires_permission !== true) {
        failures.push("platform.shell.access must require an explicit permission grant");
      }

      if (shellCapability.requires_audit !== false || shellCapability.requires_reauth !== false) {
        failures.push("platform.shell.access must not behave like an admin or policy-management capability");
      }
    }

    if (!shellPermission) {
      failures.push("platform.shell.access permission must exist in Access Core manifest");
    } else {
      const shellScopes = normalizeSortedSet(shellPermission.allowed_scope_types);
      if (shellScopes.length !== 1 || shellScopes[0] !== "organization") {
        failures.push("platform.shell.access permission must be organization-scoped only");
      }
    }

    if (!policyCapability) {
      failures.push("access.policy.manage capability must remain present");
    } else {
      if (policyCapability.risk_level !== "high") {
        failures.push("access.policy.manage must remain high risk");
      }

      if (policyCapability.gatekeeper_required !== true || policyCapability.requires_audit !== true) {
        failures.push("access.policy.manage must remain Gatekeeper/audit protected");
      }
    }

    for (const seed of seedDefinitions) {
      if (!manifestCapabilityKeys.has(seed.capability_key)) {
        failures.push(`Seed capability_key ${seed.capability_key} must exist in manifest capabilities`);
      }

      if (!manifestPermissionKeys.has(seed.permission_key)) {
        failures.push(`Seed permission_key ${seed.permission_key} must exist in manifest permissions`);
      }

      const manifestCapability = manifestCapabilityByKey.get(seed.capability_key);
      if (manifestCapability) {
        if (seed.risk_level !== manifestCapability.risk_level) {
          failures.push(
            `${seed.capability_key} risk_level mismatch: seed=${seed.risk_level} manifest=${manifestCapability.risk_level}`,
          );
        }

        if (seed.gatekeeper_required !== manifestCapability.gatekeeper_required) {
          failures.push(
            `${seed.capability_key} gatekeeper_required mismatch: seed=${seed.gatekeeper_required} manifest=${manifestCapability.gatekeeper_required}`,
          );
        }

        if (seed.approval_chain_required !== manifestCapability.approval_chain_required) {
          failures.push(
            `${seed.capability_key} approval_chain_required mismatch: seed=${seed.approval_chain_required} manifest=${manifestCapability.approval_chain_required}`,
          );
        }

        if (seed.requires_permission !== manifestCapability.requires_permission) {
          failures.push(
            `${seed.capability_key} requires_permission mismatch: seed=${seed.requires_permission} manifest=${manifestCapability.requires_permission}`,
          );
        }
      }

      const manifestPermission = manifestPermissionByKey.get(seed.permission_key);
      if (manifestPermission) {
        const seedScopes = normalizeSortedSet(seed.allowed_scope_types);
        const manifestScopes = normalizeSortedSet(manifestPermission.allowed_scope_types);
        const sameLength = seedScopes.length === manifestScopes.length;
        const sameValues = sameLength && seedScopes.every((scope, index) => scope === manifestScopes[index]);

        if (!sameValues) {
          failures.push(
            `${seed.capability_key} allowed_scope_types mismatch: seed=[${seedScopes.join(", ")}] manifest=[${manifestScopes.join(", ")}]`,
          );
        }
      }
    }
  }

  for (const seed of seedDefinitions) {
    for (const scopeType of seed.allowed_scope_types) {
      const scopeParse = PermissionScopeSchema.safeParse(scopeType);
      if (!scopeParse.success) {
        failures.push(`Invalid scope type ${scopeType} for seed ${seed.capability_key}`);
      }
    }

    if (!usesApprovedAccessCoreNamespace(seed.capability_key)) {
      failures.push(
        `Seed capability_key ${seed.capability_key} must use access.* namespace or an approved Access Core shell key`,
      );
    }

    if (!usesApprovedAccessCoreNamespace(seed.permission_key)) {
      failures.push(
        `Seed permission_key ${seed.permission_key} must use access.* namespace or an approved Access Core shell key`,
      );
    }

    if (seed.module_key !== "core.access") {
      failures.push(`Seed module_key ${seed.module_key} must be core.access`);
    }

    for (const prefix of DISALLOWED_PREFIXES) {
      if (seed.capability_key.startsWith(prefix) || seed.permission_key.startsWith(prefix)) {
        failures.push(`Seed key must not use business-module prefix ${prefix}`);
      }
    }
  }

  const manifestSource = readFileSync(manifestPath, "utf8").toLowerCase();
  const seedSource = readFileSync(seedPath, "utf8").toLowerCase();

  for (const token of FORBIDDEN_ASSUMPTION_TOKENS) {
    if (manifestSource.includes(token) || seedSource.includes(token)) {
      failures.push(`Forbidden hardcoded assumption token detected: ${token}`);
    }
  }

  for (const pattern of FORBIDDEN_ASSUMPTION_PATTERNS) {
    if (pattern.test(manifestSource) || pattern.test(seedSource)) {
      failures.push(`Forbidden hardcoded assumption pattern detected: ${pattern}`);
    }
  }

  for (const token of FORBIDDEN_RUNTIME_TOKENS) {
    if (seedSource.includes(token)) {
      failures.push(`Forbidden runtime seed execution token detected in seed contract: ${token}`);
    }
  }

  const shellSeed = seedDefinitions.find((seed) => seed.capability_key === "platform.shell.access");
  const policySeed = seedDefinitions.find((seed) => seed.capability_key === "access.policy.manage");

  if (!shellSeed) {
    failures.push("platform.shell.access seed definition must exist");
  } else {
    if (shellSeed.permission_key !== "platform.shell.access") {
      failures.push("platform.shell.access seed must map to the matching shell permission");
    }

    if (shellSeed.risk_level !== "low") {
      failures.push("platform.shell.access seed must be low risk");
    }

    if (
      shellSeed.gatekeeper_required !== false ||
      shellSeed.approval_chain_required !== false ||
      shellSeed.requires_permission !== true
    ) {
      failures.push("platform.shell.access seed must require permission without Gatekeeper or approval-chain behavior");
    }

    const shellScopes = normalizeSortedSet(shellSeed.allowed_scope_types);
    if (shellScopes.length !== 1 || shellScopes[0] !== "organization") {
      failures.push("platform.shell.access seed must be organization-scoped only");
    }
  }

  if (!policySeed) {
    failures.push("access.policy.manage seed definition must remain present");
  } else {
    if (policySeed.risk_level !== "high" || policySeed.gatekeeper_required !== true) {
      failures.push("access.policy.manage seed must remain high-risk and Gatekeeper protected");
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log("Access Core contract validation passed.");
}

main();
