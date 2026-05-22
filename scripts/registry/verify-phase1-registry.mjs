import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const schemaPath = resolve(repoRoot, "prisma/schema.prisma");
const metadataPath = resolve(repoRoot, "prisma/entity-registry.metadata.json");
const generatedPath = resolve(repoRoot, "generated/entity-registry.generated.json");

const APPROVED_MODELS = [
  "Organization",
  "OrganizationDomain",
  "UnitType",
  "OrganizationUnit",
  "OrganizationUnitClosure",
  "User",
  "Group",
  "UserGroup",
  "Capability",
  "GroupCapability",
  "AuditLog",
  "EventOutbox",
  "ModuleRegistryEntry",
  "OrganizationSetting",
];

const APPROVED_ENUMS = ["CapabilityRiskLevel", "PermissionScopeType"];
const NON_TENANT_MODELS = ["Organization", "Capability", "ModuleRegistryEntry"];
const STATUS_STRING_MODELS = [
  "Organization",
  "OrganizationUnit",
  "User",
  "Group",
  "EventOutbox",
  "ModuleRegistryEntry",
];

const COMPOSITE_RELATION_PATTERNS = [
  "fields: [organization_id, unit_type_id], references: [organization_id, id]",
  "fields: [organization_id, parent_unit_id], references: [organization_id, id]",
  "fields: [organization_id, primary_unit_id], references: [organization_id, id]",
  "fields: [organization_id, user_id], references: [organization_id, id]",
  "fields: [organization_id, group_id], references: [organization_id, id]",
  "fields: [organization_id, scope_unit_id], references: [organization_id, id]",
  "fields: [organization_id, ancestor_unit_id], references: [organization_id, id]",
  "fields: [organization_id, descendant_unit_id], references: [organization_id, id]",
  "fields: [organization_id, actor_user_id], references: [organization_id, id]",
];

function normalizeSpace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function setEquals(a, b) {
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}

function parseNamedBlocks(source, kind) {
  const blocks = new Map();
  const lines = source.split(/\r?\n/);

  let inBlock = false;
  let currentName = "";
  let currentLines = [];
  let braceDepth = 0;

  for (const line of lines) {
    if (!inBlock) {
      const match = line.match(new RegExp(`^\\s*${kind}\\s+(\\w+)\\s*\\{`));
      if (match) {
        inBlock = true;
        currentName = match[1];
        currentLines = [line];
        braceDepth = (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
        continue;
      }
    } else {
      currentLines.push(line);
      braceDepth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      if (braceDepth === 0) {
        blocks.set(currentName, currentLines.join("\n"));
        inBlock = false;
        currentName = "";
        currentLines = [];
      }
    }
  }

  return blocks;
}

function main() {
  const failures = [];

  const schemaSource = readFileSync(schemaPath, "utf8");
  const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  const generated = JSON.parse(readFileSync(generatedPath, "utf8"));

  const schemaModels = parseNamedBlocks(schemaSource, "model");
  const schemaEnums = parseNamedBlocks(schemaSource, "enum");

  const approvedModelSet = new Set(APPROVED_MODELS);
  const approvedEnumSet = new Set(APPROVED_ENUMS);
  const nonTenantSet = new Set(NON_TENANT_MODELS);

  if (!setEquals(new Set(schemaModels.keys()), approvedModelSet)) {
    failures.push(
      `Prisma models mismatch. Expected [${APPROVED_MODELS.join(", ")}], got [${[...schemaModels.keys()].join(", ")}]`,
    );
  }

  if (!setEquals(new Set(schemaEnums.keys()), approvedEnumSet)) {
    failures.push(
      `Prisma enums mismatch. Expected [${APPROVED_ENUMS.join(", ")}], got [${[...schemaEnums.keys()].join(", ")}]`,
    );
  }

  if (schemaModels.has("SystemSetting")) {
    failures.push("SystemSetting model must not exist in prisma/schema.prisma");
  }

  const metadataModels = Object.keys(metadata.models ?? {}).sort();
  if (!setEquals(new Set(metadataModels), approvedModelSet)) {
    failures.push(
      `Metadata models mismatch. Expected [${APPROVED_MODELS.join(", ")}], got [${metadataModels.join(", ")}]`,
    );
  }

  const generatedEntityModels = (generated.entities ?? []).map((e) => e.model_name).sort();
  if (!setEquals(new Set(generatedEntityModels), approvedModelSet)) {
    failures.push(
      `Generated entity models mismatch. Expected [${APPROVED_MODELS.join(", ")}], got [${generatedEntityModels.join(", ")}]`,
    );
  }

  if (generated.entities?.length !== 14) {
    failures.push(`Generated registry entity count must be 14, got ${generated.entities?.length ?? "undefined"}`);
  }

  if ((generated.entities ?? []).some((entity) => entity.model_name === "SystemSetting")) {
    failures.push("Generated registry must not contain SystemSetting");
  }

  if (!Array.isArray(metadata.future_placeholders) || metadata.future_placeholders.length !== 0) {
    failures.push("Metadata future_placeholders must be []");
  }

  if (!Array.isArray(generated.future_placeholders) || generated.future_placeholders.length !== 0) {
    failures.push("Generated registry future_placeholders must be []");
  }

  for (const modelName of metadataModels) {
    const events = metadata.models[modelName]?.events_emitted;
    if (!Array.isArray(events) || events.length !== 0) {
      failures.push(`Metadata ${modelName}.events_emitted must be []`);
    }
  }

  for (const entity of generated.entities ?? []) {
    if (!Array.isArray(entity.events_emitted) || entity.events_emitted.length !== 0) {
      failures.push(`Generated entity ${entity.model_name}.events_emitted must be []`);
    }
  }

  const metadataNonTenant = metadataModels
    .filter((modelName) => !metadata.models[modelName]?.tenant_scoped)
    .sort();
  if (!setEquals(new Set(metadataNonTenant), nonTenantSet)) {
    failures.push(
      `Metadata non-tenant models mismatch. Expected [${NON_TENANT_MODELS.join(", ")}], got [${metadataNonTenant.join(", ")}]`,
    );
  }

  const generatedNonTenant = (generated.entities ?? [])
    .filter((entity) => !entity.tenant_scoped)
    .map((entity) => entity.model_name)
    .sort();
  if (!setEquals(new Set(generatedNonTenant), nonTenantSet)) {
    failures.push(
      `Generated non-tenant models mismatch. Expected [${NON_TENANT_MODELS.join(", ")}], got [${generatedNonTenant.join(", ")}]`,
    );
  }

  for (const modelName of APPROVED_MODELS) {
    const metadataEntry = metadata.models?.[modelName];
    if (!metadataEntry) {
      continue;
    }

    const shouldBeTenantScoped = !nonTenantSet.has(modelName);

    if (shouldBeTenantScoped) {
      if (metadataEntry.tenant_scoped !== true) {
        failures.push(`${modelName} metadata must set tenant_scoped=true`);
      }
      if (metadataEntry.organization_id_required !== true) {
        failures.push(`${modelName} metadata must set organization_id_required=true`);
      }
      if (metadataEntry.rls_required !== true) {
        failures.push(`${modelName} metadata must set rls_required=true`);
      }
    } else {
      if (metadataEntry.tenant_scoped !== false) {
        failures.push(`${modelName} metadata must set tenant_scoped=false`);
      }
      if (metadataEntry.organization_id_required !== false) {
        failures.push(`${modelName} metadata must set organization_id_required=false`);
      }
      if (metadataEntry.rls_required !== false) {
        failures.push(`${modelName} metadata must set rls_required=false`);
      }
    }
  }

  const normalizedSchema = normalizeSpace(schemaSource);
  for (const pattern of COMPOSITE_RELATION_PATTERNS) {
    const normalizedPattern = normalizeSpace(pattern);
    if (!normalizedSchema.includes(normalizedPattern)) {
      failures.push(`Missing composite relation pattern: ${pattern}`);
    }
  }

  const compositeUniqueModels = ["UnitType", "OrganizationUnit", "User", "Group"];
  for (const modelName of compositeUniqueModels) {
    const block = schemaModels.get(modelName);
    if (!block) {
      failures.push(`Model block missing for ${modelName}`);
      continue;
    }

    if (!/@@unique\(\[\s*organization_id\s*,\s*id\s*\]\)/.test(block)) {
      failures.push(`${modelName} must include @@unique([organization_id, id])`);
    }
  }

  for (const modelName of STATUS_STRING_MODELS) {
    const block = schemaModels.get(modelName);
    if (!block) {
      failures.push(`Model block missing for ${modelName}`);
      continue;
    }

    if (!/^\s*status\s+String\b/m.test(block)) {
      failures.push(`${modelName}.status must be String in prisma/schema.prisma`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log("Phase 1 registry verification passed.");
}

main();
