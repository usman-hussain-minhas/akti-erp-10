import { z } from "zod";

import { ManifestKeySchema, ModuleKeySchema } from "./module-manifest.schema.js";

const NonEmptyStringSchema = z.string().min(1);
const TimestampSchema = z.string().datetime({ offset: true });
const PayloadSchema = z.record(z.string(), z.unknown());
const HealthStatusSchema = z.enum(["healthy", "degraded", "disabled", "unknown"]);

export const GatekeeperDecisionSchema = z.enum([
  "allow",
  "deny",
  "approval_required",
  "degraded_block",
]);

export const GatekeeperCheckStatusSchema = z.enum(["passed", "failed", "skipped", "warning"]);

export const GatekeeperHookModeSchema = z.enum(["sync_preflight", "approval_required"]);

export const GatekeeperFailureBehaviorSchema = z.enum(["deny", "degrade", "approval_required"]);

export const GatekeeperReauthStatusSchema = z.enum([
  "not_required",
  "required",
  "satisfied",
  "expired",
]);

export const GatekeeperReasonSchema = z
  .object({
    code: ManifestKeySchema,
    message: NonEmptyStringSchema,
    severity: z.enum(["info", "warning", "error"]),
  })
  .strict();

export const GatekeeperEvidenceRequirementSchema = z
  .object({
    evidence_key: ManifestKeySchema,
    label: NonEmptyStringSchema,
    required: z.boolean(),
  })
  .strict();

export const GatekeeperContextSchema = z
  .object({
    current_organization_id: NonEmptyStringSchema,
    current_user_id: NonEmptyStringSchema,
    active_scope_unit_id: NonEmptyStringSchema.nullable(),
    active_group_ids: z.array(NonEmptyStringSchema),
    capabilities: z.array(ManifestKeySchema),
    module_health: z.record(ModuleKeySchema, HealthStatusSchema),
    dependency_health: z.record(ModuleKeySchema, HealthStatusSchema),
    reauth_status: GatekeeperReauthStatusSchema,
  })
  .strict();

export const GatekeeperRequestSchema = z
  .object({
    request_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    capability_key: ManifestKeySchema,
    module_key: ModuleKeySchema,
    entity_type: ManifestKeySchema,
    entity_id: NonEmptyStringSchema.nullable(),
    scope_unit_id: NonEmptyStringSchema.nullable(),
    payload: PayloadSchema,
    requested_at: TimestampSchema,
    context: GatekeeperContextSchema,
  })
  .strict();

export const GatekeeperCheckResultSchema = z
  .object({
    check_key: ManifestKeySchema,
    status: GatekeeperCheckStatusSchema,
    reason: GatekeeperReasonSchema.nullable(),
    evidence_required: z.array(GatekeeperEvidenceRequirementSchema),
    evidence_present: z.array(ManifestKeySchema),
  })
  .strict();

export const DegradedDependencyBehaviorSchema = z
  .object({
    module_enabled: z.boolean(),
    dependency_healthy: z.boolean(),
    dependency_required: z.boolean(),
    failure_behavior: GatekeeperFailureBehaviorSchema,
  })
  .strict();

export const GatekeeperHookContractSchema = z
  .object({
    capability_key: ManifestKeySchema,
    mode: GatekeeperHookModeSchema,
    checks: z.array(ManifestKeySchema).min(1),
    failure_behavior: GatekeeperFailureBehaviorSchema,
  })
  .strict();

export const GatekeeperDecisionResultSchema = z
  .object({
    decision: GatekeeperDecisionSchema,
    request_id: NonEmptyStringSchema,
    capability_key: ManifestKeySchema,
    actor_user_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    reasons: z.array(GatekeeperReasonSchema),
    checks: z.array(GatekeeperCheckResultSchema),
    required_evidence: z.array(GatekeeperEvidenceRequirementSchema),
    missing_evidence: z.array(ManifestKeySchema),
    approval_chain_key: ManifestKeySchema.optional(),
    approval_request_id: NonEmptyStringSchema.optional(),
    reauth_required: z.boolean(),
    decision_token: NonEmptyStringSchema.optional(),
    expires_at: TimestampSchema.nullable(),
  })
  .strict()
  .superRefine((result, ctx) => {
    if (result.decision === "approval_required" && result.approval_chain_key === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["approval_chain_key"],
        message: "approval_required decisions require approval_chain_key",
      });
    }

    if (result.decision === "allow") {
      if (result.decision_token === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["decision_token"],
          message: "allow decisions require decision_token",
        });
      }

      if (result.missing_evidence.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["missing_evidence"],
          message: "allow decisions cannot have missing evidence",
        });
      }
    }

    if (result.decision === "deny" && result.reasons.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["reasons"],
        message: "deny decisions require at least one reason",
      });
    }

    if (result.decision === "degraded_block") {
      if (result.reasons.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["reasons"],
          message: "degraded_block decisions require at least one reason",
        });
      }

      if (!result.checks.some((check) => ["failed", "warning"].includes(check.status))) {
        ctx.addIssue({
          code: "custom",
          path: ["checks"],
          message: "degraded_block decisions require at least one failed or warning check",
        });
      }
    }
  });

export type GatekeeperDecision = z.infer<typeof GatekeeperDecisionSchema>;
export type GatekeeperCheckStatus = z.infer<typeof GatekeeperCheckStatusSchema>;
export type GatekeeperHookMode = z.infer<typeof GatekeeperHookModeSchema>;
export type GatekeeperFailureBehavior = z.infer<typeof GatekeeperFailureBehaviorSchema>;
export type GatekeeperReauthStatus = z.infer<typeof GatekeeperReauthStatusSchema>;
export type GatekeeperReason = z.infer<typeof GatekeeperReasonSchema>;
export type GatekeeperEvidenceRequirement = z.infer<typeof GatekeeperEvidenceRequirementSchema>;
export type GatekeeperContext = z.infer<typeof GatekeeperContextSchema>;
export type GatekeeperRequest = z.infer<typeof GatekeeperRequestSchema>;
export type GatekeeperCheckResult = z.infer<typeof GatekeeperCheckResultSchema>;
export type GatekeeperDecisionResult = z.infer<typeof GatekeeperDecisionResultSchema>;
export type GatekeeperHookContract = z.infer<typeof GatekeeperHookContractSchema>;
export type DegradedDependencyBehavior = z.infer<typeof DegradedDependencyBehaviorSchema>;

export function parseGatekeeperRequest(input: unknown): GatekeeperRequest {
  return GatekeeperRequestSchema.parse(input);
}

export function safeParseGatekeeperRequest(input: unknown) {
  return GatekeeperRequestSchema.safeParse(input);
}

export function parseGatekeeperDecisionResult(input: unknown): GatekeeperDecisionResult {
  return GatekeeperDecisionResultSchema.parse(input);
}

export function safeParseGatekeeperDecisionResult(input: unknown) {
  return GatekeeperDecisionResultSchema.safeParse(input);
}

const samplePassedCheck = {
  check_key: "lead.assignment.scope",
  status: "passed",
  reason: null,
  evidence_required: [],
  evidence_present: [],
};

const sampleFailedCheck = {
  check_key: "lead.assignment.permission",
  status: "failed",
  reason: {
    code: "permission.missing",
    message: "The actor does not have the required capability.",
    severity: "error",
  },
  evidence_required: [],
  evidence_present: [],
};

export const sampleAllowDecision = GatekeeperDecisionResultSchema.parse({
  decision: "allow",
  request_id: "req_001",
  capability_key: "lead.assign",
  actor_user_id: "user_001",
  organization_id: "org_001",
  reasons: [],
  checks: [samplePassedCheck],
  required_evidence: [],
  missing_evidence: [],
  reauth_required: false,
  decision_token: "gk_decision_allow_001",
  expires_at: "2026-05-22T10:00:00.000Z",
});

export const sampleApprovalRequiredDecision = GatekeeperDecisionResultSchema.parse({
  decision: "approval_required",
  request_id: "req_002",
  capability_key: "lead.reassign",
  actor_user_id: "user_001",
  organization_id: "org_001",
  reasons: [
    {
      code: "approval.required",
      message: "This action requires approval before execution.",
      severity: "warning",
    },
  ],
  checks: [samplePassedCheck],
  required_evidence: [
    {
      evidence_key: "lead.reassign.reason",
      label: "Reassignment reason",
      required: true,
    },
  ],
  missing_evidence: ["lead.reassign.reason"],
  approval_chain_key: "lead.reassign.approval",
  approval_request_id: "approval_001",
  reauth_required: false,
  expires_at: null,
});

export const sampleDenyDecision = GatekeeperDecisionResultSchema.parse({
  decision: "deny",
  request_id: "req_003",
  capability_key: "lead.delete",
  actor_user_id: "user_001",
  organization_id: "org_001",
  reasons: [
    {
      code: "permission.denied",
      message: "The actor cannot perform this action.",
      severity: "error",
    },
  ],
  checks: [sampleFailedCheck],
  required_evidence: [],
  missing_evidence: [],
  reauth_required: false,
  expires_at: null,
});

export const sampleDegradedBlockDecision = GatekeeperDecisionResultSchema.parse({
  decision: "degraded_block",
  request_id: "req_004",
  capability_key: "lead.send-message",
  actor_user_id: "user_001",
  organization_id: "org_001",
  reasons: [
    {
      code: "dependency.degraded",
      message: "A required dependency is degraded.",
      severity: "error",
    },
  ],
  checks: [
    {
      check_key: "engagement.gateway.health",
      status: "warning",
      reason: {
        code: "dependency.unhealthy",
        message: "Engagement Gateway is not healthy enough for this action.",
        severity: "warning",
      },
      evidence_required: [],
      evidence_present: [],
    },
  ],
  required_evidence: [],
  missing_evidence: [],
  reauth_required: false,
  expires_at: null,
});
