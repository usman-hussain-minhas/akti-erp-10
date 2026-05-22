import { z } from "zod";

import { ManifestKeySchema, ModuleKeySchema, PermissionScopeSchema } from "./module-manifest.schema.js";

const AccessCoreCapabilitySeedSchema = z
  .object({
    capability_key: ManifestKeySchema,
    permission_key: ManifestKeySchema,
    module_key: ModuleKeySchema,
    description: z.string().min(1),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    gatekeeper_required: z.boolean(),
    approval_chain_required: z.boolean(),
    requires_permission: z.boolean(),
    allowed_scope_types: z.array(PermissionScopeSchema).min(1),
  })
  .strict();

export const AccessCoreCapabilitySeedListSchema = z.array(AccessCoreCapabilitySeedSchema).min(1);

export type AccessCoreCapabilitySeed = z.infer<typeof AccessCoreCapabilitySeedSchema>;

export const accessCoreCapabilitySeedDefinitions: AccessCoreCapabilitySeed[] =
  AccessCoreCapabilitySeedListSchema.parse([
    {
      capability_key: "access.policy.manage",
      permission_key: "access.policy.manage",
      module_key: "core.access",
      description: "Minimal Access Core contract capability for policy definition management.",
      risk_level: "high",
      gatekeeper_required: true,
      approval_chain_required: false,
      requires_permission: true,
      allowed_scope_types: ["global", "organization"],
    },
  ]);
