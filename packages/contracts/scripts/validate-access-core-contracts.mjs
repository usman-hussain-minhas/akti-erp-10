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

function hasDuplicates(values) {
  return new Set(values).size !== values.length;
}

function normalizeSortedSet(values) {
  return [...new Set(values)].sort();
}

function main() {
  const failures = [];

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

    if (manifest.api_routes.length !== 0) {
      failures.push("Manifest api_routes must be empty for P1-004 alignment-only scope");
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

    if (!seed.capability_key.startsWith("access.")) {
      failures.push(`Seed capability_key ${seed.capability_key} must use access.* namespace`);
    }

    if (!seed.permission_key.startsWith("access.")) {
      failures.push(`Seed permission_key ${seed.permission_key} must use access.* namespace`);
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

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log("Access Core contract validation passed.");
}

main();
