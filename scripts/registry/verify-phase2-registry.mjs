import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const schemaPath = resolve(repoRoot, "prisma/schema.prisma");
const metadataPath = resolve(repoRoot, "prisma/entity-registry.metadata.json");
const generatedPath = resolve(repoRoot, "generated/entity-registry.generated.json");

function normalizeSpace(text) {
  return text.replace(/\s+/g, " ").trim();
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

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasOrganizationIdField(modelBlock) {
  return /^\s*organization_id\s+\S+/m.test(modelBlock);
}

function keyForPlaceholder(placeholder) {
  return `${placeholder.entity_key}::${placeholder.target_phase}`;
}

function main() {
  const failures = [];

  const schemaSource = readFileSync(schemaPath, "utf8");
  const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  const generated = JSON.parse(readFileSync(generatedPath, "utf8"));

  const schemaModels = parseNamedBlocks(schemaSource, "model");
  const schemaModelNames = [...schemaModels.keys()];
  const schemaModelSet = new Set(schemaModelNames);

  const metadataModelsObj =
    metadata !== null && typeof metadata === "object" && metadata.models && typeof metadata.models === "object"
      ? metadata.models
      : {};
  const metadataModelNames = Object.keys(metadataModelsObj);
  const metadataModelSet = new Set(metadataModelNames);

  const generatedEntities = safeArray(generated?.entities);
  const generatedModelNames = generatedEntities.map((entity) => entity?.model_name).filter(isNonEmptyString);
  const generatedModelSet = new Set(generatedModelNames);

  for (const modelName of metadataModelNames) {
    if (!schemaModelSet.has(modelName)) {
      failures.push(`Metadata models contains missing schema model: ${modelName}`);
    }
  }

  for (const modelName of schemaModelNames) {
    if (!metadataModelSet.has(modelName)) {
      failures.push(`Schema model missing metadata entry: ${modelName}`);
    }
  }

  for (const modelName of generatedModelNames) {
    if (!schemaModelSet.has(modelName)) {
      failures.push(`Generated entities contains model missing from schema: ${modelName}`);
    }
    if (!metadataModelSet.has(modelName)) {
      failures.push(`Generated entities contains model missing metadata: ${modelName}`);
    }
  }

  for (const modelName of schemaModelNames) {
    if (!generatedModelSet.has(modelName)) {
      failures.push(`Schema model missing generated entity: ${modelName}`);
    }
  }

  for (const modelName of metadataModelNames) {
    const metadataEntry = metadataModelsObj[modelName];
    if (metadataEntry === null || typeof metadataEntry !== "object") {
      failures.push(`${modelName} metadata entry must be an object`);
      continue;
    }

    if (!isNonEmptyString(metadataEntry.owner_module)) {
      failures.push(`${modelName} metadata owner_module must be non-empty`);
    }

    if (typeof metadataEntry.phase !== "number" || !Number.isInteger(metadataEntry.phase) || metadataEntry.phase < 0) {
      failures.push(`${modelName} metadata phase must be a non-negative integer`);
    }

    if (metadataEntry.tenant_scoped === true) {
      if (metadataEntry.organization_id_required !== true) {
        failures.push(`${modelName} metadata tenant_scoped=true requires organization_id_required=true`);
      }
      if (metadataEntry.rls_required !== true) {
        failures.push(`${modelName} metadata tenant_scoped=true requires rls_required=true`);
      }
    }
  }

  for (const entity of generatedEntities) {
    const modelName = entity?.model_name;
    if (!isNonEmptyString(modelName)) {
      failures.push("Generated entity has missing model_name");
      continue;
    }

    const metadataEntry = metadataModelsObj[modelName];
    if (!metadataEntry || typeof metadataEntry !== "object") {
      failures.push(`Generated entity ${modelName} missing metadata entry`);
      continue;
    }

    if (!isNonEmptyString(entity.owner_module)) {
      failures.push(`Generated entity ${modelName} owner_module must be non-empty`);
    }

    if (typeof entity.phase !== "number" || !Number.isInteger(entity.phase) || entity.phase < 0) {
      failures.push(`Generated entity ${modelName} phase must be a non-negative integer`);
    }

    if (entity.owner_module !== metadataEntry.owner_module) {
      failures.push(`Generated entity ${modelName} owner_module mismatch with metadata`);
    }

    if (entity.phase !== metadataEntry.phase) {
      failures.push(`Generated entity ${modelName} phase mismatch with metadata`);
    }

    if (entity.tenant_scoped !== metadataEntry.tenant_scoped) {
      failures.push(`Generated entity ${modelName} tenant_scoped mismatch with metadata`);
    }

    if (entity.organization_id_required !== metadataEntry.organization_id_required) {
      failures.push(`Generated entity ${modelName} organization_id_required mismatch with metadata`);
    }

    if (entity.rls_required !== metadataEntry.rls_required) {
      failures.push(`Generated entity ${modelName} rls_required mismatch with metadata`);
    }

    if (metadataEntry.tenant_scoped === true) {
      if (entity.organization_id_field !== "organization_id") {
        failures.push(`Generated entity ${modelName} tenant-scoped metadata requires organization_id_field=organization_id`);
      }
      if (entity.organization_id_column !== "organization_id") {
        failures.push(`Generated entity ${modelName} tenant-scoped metadata requires organization_id_column=organization_id`);
      }

      const modelBlock = schemaModels.get(modelName);
      if (!modelBlock || !hasOrganizationIdField(modelBlock)) {
        failures.push(`Schema model ${modelName} must define organization_id for tenant-scoped metadata`);
      }
    }
  }

  const metadataPlaceholders = safeArray(metadata?.future_placeholders);
  const generatedPlaceholders = safeArray(generated?.future_placeholders);

  const metadataPlaceholderKeys = new Set();
  for (const placeholder of metadataPlaceholders) {
    if (placeholder === null || typeof placeholder !== "object") {
      failures.push("Metadata future_placeholders entry must be an object");
      continue;
    }

    if (!isNonEmptyString(placeholder.entity_key)) {
      failures.push("Metadata future placeholder entity_key must be non-empty");
      continue;
    }

    if (!isNonEmptyString(placeholder.display_name)) {
      failures.push(`Metadata future placeholder ${placeholder.entity_key} display_name must be non-empty`);
    }
    if (!isNonEmptyString(placeholder.intended_owner_module)) {
      failures.push(`Metadata future placeholder ${placeholder.entity_key} intended_owner_module must be non-empty`);
    }
    if (
      typeof placeholder.target_phase !== "number" ||
      !Number.isInteger(placeholder.target_phase) ||
      placeholder.target_phase < 3
    ) {
      failures.push(`Metadata future placeholder ${placeholder.entity_key} target_phase must be an integer >= 3`);
    }
    if (!isNonEmptyString(placeholder.purpose)) {
      failures.push(`Metadata future placeholder ${placeholder.entity_key} purpose must be non-empty`);
    }

    if (schemaModelSet.has(placeholder.entity_key)) {
      failures.push(`Metadata future placeholder conflicts with real schema model: ${placeholder.entity_key}`);
    }

    const key = keyForPlaceholder(placeholder);
    if (metadataPlaceholderKeys.has(key)) {
      failures.push(`Duplicate metadata future placeholder key: ${key}`);
    }
    metadataPlaceholderKeys.add(key);
  }

  const generatedPlaceholderKeys = new Set();
  for (const placeholder of generatedPlaceholders) {
    if (placeholder === null || typeof placeholder !== "object") {
      failures.push("Generated future_placeholders entry must be an object");
      continue;
    }

    if (!isNonEmptyString(placeholder.entity_key)) {
      failures.push("Generated future placeholder entity_key must be non-empty");
      continue;
    }

    if (schemaModelSet.has(placeholder.entity_key)) {
      failures.push(`Generated future placeholder conflicts with real schema model: ${placeholder.entity_key}`);
    }

    const key = keyForPlaceholder(placeholder);
    if (generatedPlaceholderKeys.has(key)) {
      failures.push(`Duplicate generated future placeholder key: ${key}`);
    }
    generatedPlaceholderKeys.add(key);
  }

  for (const key of metadataPlaceholderKeys) {
    if (!generatedPlaceholderKeys.has(key)) {
      failures.push(`Generated future placeholders missing metadata placeholder: ${key}`);
    }
  }

  for (const key of generatedPlaceholderKeys) {
    if (!metadataPlaceholderKeys.has(key)) {
      failures.push(`Generated future placeholders include unknown placeholder not in metadata: ${key}`);
    }
  }

  const normalizedSchema = normalizeSpace(schemaSource);
  if (!normalizedSchema.includes("model")) {
    failures.push("Schema parse sanity check failed: no model declarations found");
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log("Phase 2 registry verification passed.");
}

main();
