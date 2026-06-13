import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getSchema } from "@mrleebo/prisma-ast";

// generated/entity-registry.generated.json is generated and should not be edited manually.

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(scriptDir, "../..");
export const prismaSchemaPath = join(repoRoot, "prisma/schema.prisma");
export const metadataPath = join(repoRoot, "prisma/entity-registry.metadata.json");
export const generatedRegistryPath = join(repoRoot, "generated/entity-registry.generated.json");

const prismaSchemaSource = "prisma/schema.prisma";
const metadataSource = "prisma/entity-registry.metadata.json";

const scalarTypes = new Set([
  "String",
  "Boolean",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "DateTime",
  "Json",
  "Bytes",
  "Unsupported",
]);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function validateJsonWithContract(schemaName, filePath) {
  const code = [
    "import { readFileSync } from 'node:fs';",
    `import { ${schemaName} } from './entity-registry.schema.ts';`,
    `${schemaName}.parse(JSON.parse(readFileSync(process.env.ESBLA_REGISTRY_JSON_PATH, 'utf8')));`,
  ].join(" ");

  const result = spawnSync("pnpm", ["--filter", "@akti/contracts", "exec", "tsx", "-e", code], {
    cwd: repoRoot,
    env: {
      ...process.env,
      ESBLA_REGISTRY_JSON_PATH: filePath,
    },
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${schemaName} validation failed for ${relative(repoRoot, filePath)}`);
  }
}

function sha256(input) {
  return `sha256:${createHash("sha256").update(input).digest("hex")}`;
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parsePrismaSchema(source) {
  try {
    return getSchema(source);
  } catch (error) {
    throw new Error(`Failed to parse ${prismaSchemaSource}: ${error.message}`);
  }
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function attributesFor(property, name) {
  return ensureArray(property.attributes).filter((attribute) => attribute.name === name);
}

function blockAttributesFor(model, name) {
  return ensureArray(model.properties).filter(
    (property) => property.type === "attribute" && property.kind === "object" && property.name === name,
  );
}

function firstAttribute(property, name) {
  return attributesFor(property, name)[0];
}

function unwrapString(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function keyValueArg(attribute, key) {
  return ensureArray(attribute?.args)
    .map((arg) => arg.value)
    .find((value) => value?.type === "keyValue" && value.key === key)?.value;
}

function positionalArg(attribute, index = 0) {
  return ensureArray(attribute?.args)[index]?.value;
}

function stringArg(attribute, keys = []) {
  for (const key of keys) {
    const value = keyValueArg(attribute, key);
    const unwrapped = unwrapString(value);
    if (unwrapped !== undefined) {
      return unwrapped;
    }
  }

  return unwrapString(positionalArg(attribute));
}

function fieldListArg(attribute) {
  const positional = positionalArg(attribute);
  if (positional?.type === "array") {
    return positional.args;
  }

  const fields = keyValueArg(attribute, "fields");
  if (fields?.type === "array") {
    return fields.args;
  }

  throw new Error(`Unable to extract field list for @${attribute.name}`);
}

function modelTableName(model) {
  return stringArg(blockAttributesFor(model, "map")[0]) ?? model.name;
}

function fieldColumnName(field) {
  return stringArg(firstAttribute(field, "map")) ?? field.name;
}

function indexName(tableName, columns, suffix, attribute) {
  return stringArg(attribute, ["map", "name"]) ?? `${tableName}_${columns.join("_")}_${suffix}`;
}

function modelFields(model) {
  return ensureArray(model.properties).filter((property) => property.type === "field");
}

function isRelationField(field, modelNames) {
  if (attributesFor(field, "relation").length > 0) {
    return true;
  }

  return modelNames.has(field.fieldType) && !scalarTypes.has(field.fieldType);
}

function buildFields(model, modelNames, idFieldNames) {
  return modelFields(model)
    .map((field) => {
      const relation = isRelationField(field, modelNames);
      return {
        field_name: field.name,
        column_name: fieldColumnName(field),
        type: `${field.fieldType}${field.array ? "[]" : ""}`,
        is_required: !field.optional,
        is_unique: attributesFor(field, "unique").length > 0,
        is_id: attributesFor(field, "id").length > 0 || idFieldNames.has(field.name),
        is_relation: relation,
        ...(relation ? { relation_model: field.fieldType } : {}),
      };
    })
    .sort((left, right) => left.field_name.localeCompare(right.field_name));
}

function columnByFieldName(fields) {
  return new Map(fields.map((field) => [field.field_name, field.column_name]));
}

function fieldsToColumns(fieldNames, fieldColumns, modelName, attributeName) {
  return fieldNames.map((fieldName) => {
    const column = fieldColumns.get(fieldName);
    if (column === undefined) {
      throw new Error(`${modelName} @${attributeName} references missing field ${fieldName}`);
    }

    return column;
  });
}

function buildUniqueConstraints(model, tableName, fields, idFieldNames) {
  const fieldColumns = columnByFieldName(fields);
  const constraints = [];

  for (const field of modelFields(model)) {
    const column = fieldColumns.get(field.name);
    const idAttribute = firstAttribute(field, "id");
    const uniqueAttribute = firstAttribute(field, "unique");

    if (idAttribute) {
      idFieldNames.add(field.name);
      constraints.push({
        name: indexName(tableName, [column], "pk", idAttribute),
        fields: [field.name],
        columns: [column],
      });
    }

    if (uniqueAttribute) {
      constraints.push({
        name: indexName(tableName, [column], "key", uniqueAttribute),
        fields: [field.name],
        columns: [column],
      });
    }
  }

  for (const attribute of blockAttributesFor(model, "id")) {
    const fieldNames = fieldListArg(attribute);
    const columns = fieldsToColumns(fieldNames, fieldColumns, model.name, "@@id");
    for (const fieldName of fieldNames) {
      idFieldNames.add(fieldName);
    }
    constraints.push({
      name: indexName(tableName, columns, "pk", attribute),
      fields: fieldNames,
      columns,
    });
  }

  for (const attribute of blockAttributesFor(model, "unique")) {
    const fieldNames = fieldListArg(attribute);
    const columns = fieldsToColumns(fieldNames, fieldColumns, model.name, "@@unique");
    constraints.push({
      name: indexName(tableName, columns, "key", attribute),
      fields: fieldNames,
      columns,
    });
  }

  return constraints.sort((left, right) => left.name.localeCompare(right.name));
}

function buildIndexes(model, tableName, fields, uniqueConstraints) {
  const fieldColumns = columnByFieldName(fields);
  const indexes = [];

  for (const attribute of blockAttributesFor(model, "index")) {
    const fieldNames = fieldListArg(attribute);
    const columns = fieldsToColumns(fieldNames, fieldColumns, model.name, "@@index");
    indexes.push({
      name: indexName(tableName, columns, "idx", attribute),
      fields: fieldNames,
      columns,
      is_unique: false,
    });
  }

  for (const constraint of uniqueConstraints) {
    indexes.push({
      name: constraint.name,
      fields: constraint.fields,
      columns: constraint.columns,
      is_unique: true,
    });
  }

  return indexes.sort((left, right) => left.name.localeCompare(right.name));
}

function loadMetadata() {
  validateJsonWithContract("EntityRegistryMetadataSchema", metadataPath);
  const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  return metadata;
}

function validateMetadataCoverage(models, metadata) {
  const modelNames = new Set(models.map((model) => model.name));
  const metadataModelNames = Object.keys(metadata.models);

  for (const modelName of metadataModelNames) {
    if (!modelNames.has(modelName)) {
      throw new Error(`Entity Registry metadata references missing Prisma model: ${modelName}`);
    }
  }

  for (const modelName of modelNames) {
    if (metadata.models[modelName] === undefined) {
      throw new Error(`Prisma model lacks Entity Registry metadata: ${modelName}`);
    }
  }
}

function validateTenantEntity(entity) {
  if (!entity.tenant_scoped) {
    return;
  }

  if (!entity.organization_id_required) {
    throw new Error(`${entity.model_name} is tenant-scoped but organization_id_required is not true`);
  }

  if (!entity.rls_required) {
    throw new Error(`${entity.model_name} is tenant-scoped but rls_required is not true`);
  }

  if (entity.organization_id_field === null || entity.organization_id_column === null) {
    throw new Error(`${entity.model_name} is tenant-scoped but lacks organization_id field or mapped column`);
  }

  const hasOrganizationIndex = entity.indexes.some(
    (index) =>
      index.fields.includes(entity.organization_id_field) ||
      index.columns.includes(entity.organization_id_column),
  );

  if (!hasOrganizationIndex) {
    throw new Error(`${entity.model_name} is tenant-scoped but lacks an index including organization_id`);
  }
}

function buildEntity(model, metadataEntry, modelNames) {
  const tableName = modelTableName(model);
  const initialIdFieldNames = new Set();
  const initialFields = buildFields(model, modelNames, initialIdFieldNames);
  const uniqueConstraints = buildUniqueConstraints(model, tableName, initialFields, initialIdFieldNames);
  const fields = buildFields(model, modelNames, initialIdFieldNames);
  const indexes = buildIndexes(model, tableName, fields, uniqueConstraints);
  const organizationField =
    fields.find((field) => field.field_name === "organization_id") ??
    fields.find((field) => field.column_name === "organization_id") ??
    null;

  const entity = {
    model_name: model.name,
    table_name: tableName,
    owner_module: metadataEntry.owner_module,
    phase: metadataEntry.phase,
    tenant_scoped: metadataEntry.tenant_scoped,
    organization_id_required: metadataEntry.organization_id_required,
    rls_required: metadataEntry.rls_required,
    organization_id_field: organizationField?.field_name ?? null,
    organization_id_column: organizationField?.column_name ?? null,
    fields,
    indexes,
    unique_constraints: uniqueConstraints,
    events_emitted: [...metadataEntry.events_emitted].sort((left, right) =>
      `${left.event_type}@${left.version}`.localeCompare(`${right.event_type}@${right.version}`),
    ),
    retention_policy: metadataEntry.retention_policy,
    audit_required: metadataEntry.audit_required,
    sensitive_data_classification: metadataEntry.sensitive_data_classification,
  };

  validateTenantEntity(entity);
  return entity;
}

export function buildEntityRegistry() {
  run("pnpm", ["exec", "prisma", "validate", "--schema", prismaSchemaSource]);

  const schemaSource = readFileSync(prismaSchemaPath, "utf8");
  const metadataSourceText = readFileSync(metadataPath, "utf8");
  const schema = parsePrismaSchema(schemaSource);
  const metadata = loadMetadata();
  const models = ensureArray(schema.list).filter((item) => item.type === "model");

  validateMetadataCoverage(models, metadata);

  const modelNames = new Set(models.map((model) => model.name));
  const entities = models
    .map((model) => buildEntity(model, metadata.models[model.name], modelNames))
    .sort((left, right) => left.model_name.localeCompare(right.model_name));
  const futurePlaceholders = [...metadata.future_placeholders].sort((left, right) =>
    left.entity_key.localeCompare(right.entity_key),
  );

  const registry = {
    registry_version: metadata.version,
    sources: {
      prisma_schema: prismaSchemaSource,
      metadata: metadataSource,
      prisma_schema_hash: sha256(schemaSource),
      metadata_hash: sha256(metadataSourceText),
    },
    entities,
    future_placeholders: futurePlaceholders,
  };

  return registry;
}

export function writeEntityRegistry(outputPath = generatedRegistryPath) {
  const registry = renderEntityRegistry();
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, registry);
  console.log(`Wrote ${relative(repoRoot, outputPath)}`);
}

export function renderEntityRegistry() {
  const rendered = stableJson(buildEntityRegistry());
  const tempDir = mkdtempSync(join(tmpdir(), "esbla-entity-registry-"));
  const tempFile = join(tempDir, "entity-registry.generated.json");

  try {
    writeFileSync(tempFile, rendered);
    validateJsonWithContract("GeneratedEntityRegistrySchema", tempFile);
    return rendered;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function main() {
  writeEntityRegistry();
}

if (existsSync(fileURLToPath(import.meta.url)) && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
