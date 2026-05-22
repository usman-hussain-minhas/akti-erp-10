import { z } from "zod";

import { ManifestKeySchema, ModuleKeySchema, SemverSchema } from "./module-manifest.schema.js";

const NonEmptyStringSchema = z.string().min(1);
const PrismaIdentifierSchema = z
  .string()
  .regex(/^[A-Za-z][A-Za-z0-9_]*$/, "Use a Prisma identifier");

const EntityRegistryEventSchema = z
  .object({
    event_type: ManifestKeySchema,
    version: SemverSchema,
  })
  .strict();

export const SensitiveDataClassificationSchema = z.enum([
  "public",
  "internal",
  "confidential",
  "restricted",
]);

export const EntityPhaseSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const EntityMetadataModelSchema = z
  .object({
    owner_module: ModuleKeySchema,
    phase: EntityPhaseSchema,
    tenant_scoped: z.boolean(),
    organization_id_required: z.boolean(),
    rls_required: z.boolean(),
    retention_policy: NonEmptyStringSchema,
    audit_required: z.boolean(),
    sensitive_data_classification: SensitiveDataClassificationSchema,
    events_emitted: z.array(EntityRegistryEventSchema),
  })
  .strict()
  .superRefine((model, ctx) => {
    if (model.tenant_scoped) {
      if (!model.organization_id_required) {
        ctx.addIssue({
          code: "custom",
          path: ["organization_id_required"],
          message: "tenant-scoped entities require organization_id_required",
        });
      }

      if (!model.rls_required) {
        ctx.addIssue({
          code: "custom",
          path: ["rls_required"],
          message: "tenant-scoped entities require rls_required",
        });
      }
    }

    const seenEvents = new Map<string, number>();
    model.events_emitted.forEach((event, index) => {
      const eventKey = `${event.event_type}@${event.version}`;
      const firstIndex = seenEvents.get(eventKey);

      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["events_emitted", index, "event_type"],
          message: `event_type + version must be unique; first declared at events_emitted[${firstIndex}]`,
        });
        return;
      }

      seenEvents.set(eventKey, index);
    });
  });

export const FuturePlaceholderSchema = z
  .object({
    entity_key: ManifestKeySchema,
    display_name: NonEmptyStringSchema,
    intended_owner_module: ModuleKeySchema,
    target_phase: z.number().int().min(3),
    purpose: NonEmptyStringSchema,
  })
  .strict();

export const EntityRegistryMetadataSchema = z
  .object({
    version: SemverSchema,
    models: z.record(PrismaIdentifierSchema, EntityMetadataModelSchema),
    future_placeholders: z.array(FuturePlaceholderSchema),
  })
  .strict();

export const GeneratedEntityFieldSchema = z
  .object({
    field_name: PrismaIdentifierSchema,
    column_name: NonEmptyStringSchema,
    type: NonEmptyStringSchema,
    is_required: z.boolean(),
    is_unique: z.boolean(),
    is_id: z.boolean(),
    is_relation: z.boolean(),
    relation_model: PrismaIdentifierSchema.optional(),
  })
  .strict();

export const GeneratedEntityIndexSchema = z
  .object({
    name: NonEmptyStringSchema,
    fields: z.array(PrismaIdentifierSchema).min(1),
    columns: z.array(NonEmptyStringSchema).min(1),
    is_unique: z.boolean(),
  })
  .strict();

export const GeneratedEntityUniqueConstraintSchema = z
  .object({
    name: NonEmptyStringSchema,
    fields: z.array(PrismaIdentifierSchema).min(1),
    columns: z.array(NonEmptyStringSchema).min(1),
  })
  .strict();

export const GeneratedEntitySchema = z
  .object({
    model_name: PrismaIdentifierSchema,
    table_name: NonEmptyStringSchema,
    owner_module: ModuleKeySchema,
    phase: EntityPhaseSchema,
    tenant_scoped: z.boolean(),
    organization_id_required: z.boolean(),
    rls_required: z.boolean(),
    organization_id_field: PrismaIdentifierSchema.nullable(),
    organization_id_column: NonEmptyStringSchema.nullable(),
    fields: z.array(GeneratedEntityFieldSchema),
    indexes: z.array(GeneratedEntityIndexSchema),
    unique_constraints: z.array(GeneratedEntityUniqueConstraintSchema),
    events_emitted: z.array(EntityRegistryEventSchema),
    retention_policy: NonEmptyStringSchema,
    audit_required: z.boolean(),
    sensitive_data_classification: SensitiveDataClassificationSchema,
  })
  .strict();

const GeneratedEntityRegistrySourcesSchema = z
  .object({
    prisma_schema: NonEmptyStringSchema,
    metadata: NonEmptyStringSchema,
    prisma_schema_hash: NonEmptyStringSchema.optional(),
    metadata_hash: NonEmptyStringSchema.optional(),
  })
  .strict();

export const GeneratedEntityRegistrySchema = z
  .object({
    registry_version: SemverSchema,
    sources: GeneratedEntityRegistrySourcesSchema,
    entities: z.array(GeneratedEntitySchema),
    future_placeholders: z.array(FuturePlaceholderSchema),
  })
  .strict();

export type SensitiveDataClassification = z.infer<typeof SensitiveDataClassificationSchema>;
export type EntityPhase = z.infer<typeof EntityPhaseSchema>;
export type EntityMetadataModel = z.infer<typeof EntityMetadataModelSchema>;
export type FuturePlaceholder = z.infer<typeof FuturePlaceholderSchema>;
export type EntityRegistryMetadata = z.infer<typeof EntityRegistryMetadataSchema>;
export type GeneratedEntityField = z.infer<typeof GeneratedEntityFieldSchema>;
export type GeneratedEntityIndex = z.infer<typeof GeneratedEntityIndexSchema>;
export type GeneratedEntityUniqueConstraint = z.infer<typeof GeneratedEntityUniqueConstraintSchema>;
export type GeneratedEntity = z.infer<typeof GeneratedEntitySchema>;
export type GeneratedEntityRegistry = z.infer<typeof GeneratedEntityRegistrySchema>;

export function parseEntityRegistryMetadata(input: unknown): EntityRegistryMetadata {
  return EntityRegistryMetadataSchema.parse(input);
}

export function safeParseEntityRegistryMetadata(input: unknown) {
  return EntityRegistryMetadataSchema.safeParse(input);
}

export function parseGeneratedEntityRegistry(input: unknown): GeneratedEntityRegistry {
  return GeneratedEntityRegistrySchema.parse(input);
}

export function safeParseGeneratedEntityRegistry(input: unknown) {
  return GeneratedEntityRegistrySchema.safeParse(input);
}

export const sampleEntityRegistryMetadata = EntityRegistryMetadataSchema.parse({
  version: "0.1.0",
  models: {},
  future_placeholders: [],
});

export const sampleGeneratedEntityRegistry = GeneratedEntityRegistrySchema.parse({
  registry_version: "0.1.0",
  sources: {
    prisma_schema: "prisma/schema.prisma",
    metadata: "prisma/entity-registry.metadata.json",
  },
  entities: [],
  future_placeholders: [],
});
