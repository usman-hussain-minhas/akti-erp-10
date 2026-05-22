import { z } from "zod";

import { ManifestKeySchema, ModuleKeySchema } from "./module-manifest.schema.js";

const NonEmptyStringSchema = z.string().min(1);
const TimestampSchema = z.string().datetime({ offset: true });
const PayloadSchema = z.record(z.string(), z.unknown());

export const ApprovalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "expired",
]);

export const ApprovalStepStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "skipped",
  "expired",
]);

export const ApprovalDecisionTypeSchema = z.enum([
  "approve",
  "reject",
  "cancel",
  "expire",
  "delegate",
]);

export const ApprovalApproverTypeSchema = z.enum(["user", "group", "capability"]);

export const ApprovalTimeoutBehaviorSchema = z.enum(["expire", "skip", "escalate"]);

export const ApprovalStepSchema = z
  .object({
    step_key: ManifestKeySchema,
    step_order: z.number().int().positive(),
    approver_type: ApprovalApproverTypeSchema,
    approver_user_id: NonEmptyStringSchema.nullable(),
    approver_group_id: NonEmptyStringSchema.nullable(),
    required_capability: ManifestKeySchema.nullable(),
    min_approvals: z.number().int().positive(),
    timeout_minutes: z.number().int().positive(),
    on_timeout: ApprovalTimeoutBehaviorSchema,
  })
  .strict()
  .superRefine((step, ctx) => {
    if (step.approver_type === "user" && step.approver_user_id === null) {
      ctx.addIssue({
        code: "custom",
        path: ["approver_user_id"],
        message: "user approval steps require approver_user_id",
      });
    }

    if (step.approver_type === "group" && step.approver_group_id === null) {
      ctx.addIssue({
        code: "custom",
        path: ["approver_group_id"],
        message: "group approval steps require approver_group_id",
      });
    }

    if (step.approver_type === "capability" && step.required_capability === null) {
      ctx.addIssue({
        code: "custom",
        path: ["required_capability"],
        message: "capability approval steps require required_capability",
      });
    }
  });

export const ApprovalChainSchema = z
  .object({
    chain_key: ManifestKeySchema,
    organization_id: NonEmptyStringSchema,
    module_key: ModuleKeySchema,
    capability_key: ManifestKeySchema,
    display_name: NonEmptyStringSchema,
    description: NonEmptyStringSchema,
    is_active: z.boolean(),
    steps: z.array(ApprovalStepSchema).min(1),
  })
  .strict()
  .superRefine((chain, ctx) => {
    const seenStepKeys = new Map<string, number>();
    const seenStepOrders = new Map<number, number>();

    chain.steps.forEach((step, index) => {
      const firstKeyIndex = seenStepKeys.get(step.step_key);
      if (firstKeyIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["steps", index, "step_key"],
          message: `step_key must be unique; first declared at steps[${firstKeyIndex}]`,
        });
      }

      const firstOrderIndex = seenStepOrders.get(step.step_order);
      if (firstOrderIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["steps", index, "step_order"],
          message: `step_order must be unique; first declared at steps[${firstOrderIndex}]`,
        });
      }

      seenStepKeys.set(step.step_key, index);
      seenStepOrders.set(step.step_order, index);
    });
  });

export const ApprovalRequestSchema = z
  .object({
    request_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    capability_key: ManifestKeySchema,
    module_key: ModuleKeySchema,
    requested_by_user_id: NonEmptyStringSchema,
    entity_type: ManifestKeySchema,
    entity_id: NonEmptyStringSchema.nullable(),
    status: ApprovalStatusSchema,
    approval_chain_key: ManifestKeySchema,
    current_step_key: ManifestKeySchema.nullable(),
    payload: PayloadSchema,
    reason: NonEmptyStringSchema,
    created_at: TimestampSchema,
    resolved_at: TimestampSchema.nullable(),
  })
  .strict()
  .superRefine((request, ctx) => {
    if (request.status === "pending" && request.resolved_at !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["resolved_at"],
        message: "pending approval requests must not have resolved_at",
      });
    }

    if (request.status !== "pending" && request.resolved_at === null) {
      ctx.addIssue({
        code: "custom",
        path: ["resolved_at"],
        message: "resolved approval requests require resolved_at",
      });
    }
  });

export const ApprovalDecisionSchema = z
  .object({
    decision_id: NonEmptyStringSchema,
    request_id: NonEmptyStringSchema,
    step_key: ManifestKeySchema,
    decided_by_user_id: NonEmptyStringSchema,
    decision: ApprovalDecisionTypeSchema,
    comment: NonEmptyStringSchema.nullable(),
    decided_at: TimestampSchema,
  })
  .strict()
  .superRefine((decision, ctx) => {
    if (["delegate", "cancel", "expire"].includes(decision.decision) && decision.comment === null) {
      ctx.addIssue({
        code: "custom",
        path: ["comment"],
        message: `${decision.decision} decisions require comment`,
      });
    }
  });

export const ApprovalEscalationSchema = z
  .object({
    escalation_id: NonEmptyStringSchema,
    request_id: NonEmptyStringSchema,
    step_key: ManifestKeySchema,
    escalated_to_user_id: NonEmptyStringSchema.nullable(),
    escalated_to_group_id: NonEmptyStringSchema.nullable(),
    reason: NonEmptyStringSchema,
    escalated_at: TimestampSchema,
  })
  .strict()
  .superRefine((escalation, ctx) => {
    if (escalation.escalated_to_user_id === null && escalation.escalated_to_group_id === null) {
      ctx.addIssue({
        code: "custom",
        path: ["escalated_to_user_id"],
        message: "approval escalations require a user or group target",
      });
    }
  });

export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type ApprovalStepStatus = z.infer<typeof ApprovalStepStatusSchema>;
export type ApprovalDecisionType = z.infer<typeof ApprovalDecisionTypeSchema>;
export type ApprovalApproverType = z.infer<typeof ApprovalApproverTypeSchema>;
export type ApprovalTimeoutBehavior = z.infer<typeof ApprovalTimeoutBehaviorSchema>;
export type ApprovalStep = z.infer<typeof ApprovalStepSchema>;
export type ApprovalChain = z.infer<typeof ApprovalChainSchema>;
export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
export type ApprovalEscalation = z.infer<typeof ApprovalEscalationSchema>;

export function parseApprovalChain(input: unknown): ApprovalChain {
  return ApprovalChainSchema.parse(input);
}

export function safeParseApprovalChain(input: unknown) {
  return ApprovalChainSchema.safeParse(input);
}

export function parseApprovalRequest(input: unknown): ApprovalRequest {
  return ApprovalRequestSchema.parse(input);
}

export function safeParseApprovalRequest(input: unknown) {
  return ApprovalRequestSchema.safeParse(input);
}

export function parseApprovalDecision(input: unknown): ApprovalDecision {
  return ApprovalDecisionSchema.parse(input);
}

export function safeParseApprovalDecision(input: unknown) {
  return ApprovalDecisionSchema.safeParse(input);
}

export const sampleApprovalChain = ApprovalChainSchema.parse({
  chain_key: "lead.reassign.approval",
  organization_id: "org_001",
  module_key: "lead.desk",
  capability_key: "lead.reassign",
  display_name: "Lead reassignment approval",
  description: "Requires a team lead approval before a lead is reassigned.",
  is_active: true,
  steps: [
    {
      step_key: "lead.reassign.team-lead",
      step_order: 1,
      approver_type: "group",
      approver_user_id: null,
      approver_group_id: "group_team_leads",
      required_capability: null,
      min_approvals: 1,
      timeout_minutes: 240,
      on_timeout: "escalate",
    },
  ],
});

export const samplePendingApprovalRequest = ApprovalRequestSchema.parse({
  request_id: "approval_req_001",
  organization_id: "org_001",
  capability_key: "lead.reassign",
  module_key: "lead.desk",
  requested_by_user_id: "user_001",
  entity_type: "lead",
  entity_id: "lead_001",
  status: "pending",
  approval_chain_key: "lead.reassign.approval",
  current_step_key: "lead.reassign.team-lead",
  payload: {
    from_user_id: "user_001",
    to_user_id: "user_002",
  },
  reason: "The lead needs reassignment for timely follow-up.",
  created_at: "2026-05-22T10:00:00.000Z",
  resolved_at: null,
});

export const sampleApprovedDecision = ApprovalDecisionSchema.parse({
  decision_id: "approval_decision_001",
  request_id: "approval_req_001",
  step_key: "lead.reassign.team-lead",
  decided_by_user_id: "user_010",
  decision: "approve",
  comment: "Approved for workload balancing.",
  decided_at: "2026-05-22T10:30:00.000Z",
});

export const sampleRejectedDecision = ApprovalDecisionSchema.parse({
  decision_id: "approval_decision_002",
  request_id: "approval_req_002",
  step_key: "lead.reassign.team-lead",
  decided_by_user_id: "user_010",
  decision: "reject",
  comment: "Rejected because the target owner is unavailable.",
  decided_at: "2026-05-22T10:45:00.000Z",
});

export const sampleEscalation = ApprovalEscalationSchema.parse({
  escalation_id: "approval_escalation_001",
  request_id: "approval_req_001",
  step_key: "lead.reassign.team-lead",
  escalated_to_user_id: null,
  escalated_to_group_id: "group_admissions_managers",
  reason: "The approval step timed out before a decision was recorded.",
  escalated_at: "2026-05-22T14:00:00.000Z",
});
