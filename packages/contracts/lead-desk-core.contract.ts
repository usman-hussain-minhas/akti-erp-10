import { z } from "zod";

import { ManifestKeySchema } from "./module-manifest.schema.js";

const NonEmptyStringSchema = z.string().min(1);
const TimestampSchema = z.string().datetime({ offset: true });

export const LeadDeskStatusSchema = z.enum([
  "new",
  "contacted",
  "qualified",
  "closed",
]);

export const LeadDeskCreateLeadInputSchema = z
  .object({
    organization_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    source_ref: NonEmptyStringSchema,
    full_name: NonEmptyStringSchema,
    phone_e164: NonEmptyStringSchema,
    notes: z.string().max(2000).optional(),
    requested_at: TimestampSchema,
  })
  .strict();

export const LeadDeskCreateLeadOutputSchema = z
  .object({
    lead_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    status: LeadDeskStatusSchema,
    created_at: TimestampSchema,
  })
  .strict();

export const LeadDeskListLeadsInputSchema = z
  .object({
    organization_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    status: LeadDeskStatusSchema.optional(),
    assigned_user_id: NonEmptyStringSchema.optional(),
    cursor: NonEmptyStringSchema.optional(),
    limit: z.number().int().positive().max(100).default(50),
  })
  .strict();

export const LeadDeskLeadRecordSchema = z
  .object({
    lead_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    full_name: NonEmptyStringSchema,
    phone_e164: NonEmptyStringSchema,
    source_ref: NonEmptyStringSchema,
    status: LeadDeskStatusSchema,
    assigned_user_id: NonEmptyStringSchema.nullable(),
    created_at: TimestampSchema,
    updated_at: TimestampSchema,
  })
  .strict();

export const LeadDeskListLeadsOutputSchema = z
  .object({
    items: z.array(LeadDeskLeadRecordSchema),
    next_cursor: NonEmptyStringSchema.nullable(),
  })
  .strict();

export const LeadDeskGetLeadDetailInputSchema = z
  .object({
    organization_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    lead_id: NonEmptyStringSchema,
  })
  .strict();

export const LeadDeskGetLeadDetailOutputSchema = LeadDeskLeadRecordSchema;

export const LeadDeskUpdateLeadStatusInputSchema = z
  .object({
    organization_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    lead_id: NonEmptyStringSchema,
    status: LeadDeskStatusSchema,
    reason: z.string().max(512).optional(),
    requested_at: TimestampSchema,
  })
  .strict();

export const LeadDeskUpdateLeadStatusOutputSchema = z
  .object({
    lead_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    status: LeadDeskStatusSchema,
    updated_at: TimestampSchema,
  })
  .strict();

export const LeadDeskAssignLeadInputSchema = z
  .object({
    organization_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    lead_id: NonEmptyStringSchema,
    assigned_user_id: NonEmptyStringSchema,
    requested_at: TimestampSchema,
  })
  .strict();

export const LeadDeskAssignLeadOutputSchema = z
  .object({
    lead_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    assigned_user_id: NonEmptyStringSchema,
    updated_at: TimestampSchema,
  })
  .strict();

export const LeadDeskLeadCreatedEventSchema = z
  .object({
    event_type: z.literal("lead.desk.lead.created"),
    version: z.literal("0.1.0"),
    organization_id: NonEmptyStringSchema,
    lead_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    created_at: TimestampSchema,
  })
  .strict();

export const LeadDeskLeadStatusUpdatedEventSchema = z
  .object({
    event_type: z.literal("lead.desk.lead.status.updated"),
    version: z.literal("0.1.0"),
    organization_id: NonEmptyStringSchema,
    lead_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    status: LeadDeskStatusSchema,
    updated_at: TimestampSchema,
  })
  .strict();

export const LeadDeskLeadAssignedEventSchema = z
  .object({
    event_type: z.literal("lead.desk.lead.assigned"),
    version: z.literal("0.1.0"),
    organization_id: NonEmptyStringSchema,
    lead_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    assigned_user_id: NonEmptyStringSchema,
    updated_at: TimestampSchema,
  })
  .strict();

export const LeadDeskCapabilityKeySchema = z.union([
  ManifestKeySchema.refine((value) => value === "lead.intake.create"),
  ManifestKeySchema.refine((value) => value === "lead.inbox.view"),
  ManifestKeySchema.refine((value) => value === "lead.detail.view"),
  ManifestKeySchema.refine((value) => value === "lead.status.update"),
  ManifestKeySchema.refine((value) => value === "lead.inbox.assign"),
]);

export type LeadDeskStatus = z.infer<typeof LeadDeskStatusSchema>;
export type LeadDeskCreateLeadInput = z.infer<typeof LeadDeskCreateLeadInputSchema>;
export type LeadDeskCreateLeadOutput = z.infer<typeof LeadDeskCreateLeadOutputSchema>;
export type LeadDeskListLeadsInput = z.infer<typeof LeadDeskListLeadsInputSchema>;
export type LeadDeskListLeadsOutput = z.infer<typeof LeadDeskListLeadsOutputSchema>;
export type LeadDeskGetLeadDetailInput = z.infer<typeof LeadDeskGetLeadDetailInputSchema>;
export type LeadDeskGetLeadDetailOutput = z.infer<typeof LeadDeskGetLeadDetailOutputSchema>;
export type LeadDeskUpdateLeadStatusInput = z.infer<typeof LeadDeskUpdateLeadStatusInputSchema>;
export type LeadDeskUpdateLeadStatusOutput = z.infer<typeof LeadDeskUpdateLeadStatusOutputSchema>;
export type LeadDeskAssignLeadInput = z.infer<typeof LeadDeskAssignLeadInputSchema>;
export type LeadDeskAssignLeadOutput = z.infer<typeof LeadDeskAssignLeadOutputSchema>;
export type LeadDeskLeadCreatedEvent = z.infer<typeof LeadDeskLeadCreatedEventSchema>;
export type LeadDeskLeadStatusUpdatedEvent = z.infer<typeof LeadDeskLeadStatusUpdatedEventSchema>;
export type LeadDeskLeadAssignedEvent = z.infer<typeof LeadDeskLeadAssignedEventSchema>;

export const sampleLeadDeskCreateLeadInput = LeadDeskCreateLeadInputSchema.parse({
  organization_id: "organization_alpha",
  actor_user_id: "actor_alpha",
  source_ref: "source_alpha",
  full_name: "Lead Alpha",
  phone_e164: "+923001234567",
  notes: "Requested callback",
  requested_at: "2026-05-24T10:00:00.000Z",
});

export const sampleLeadDeskCreateLeadOutput = LeadDeskCreateLeadOutputSchema.parse({
  lead_id: "lead_alpha",
  organization_id: "organization_alpha",
  status: "new",
  created_at: "2026-05-24T10:00:01.000Z",
});
