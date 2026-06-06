import { z } from "zod";

export const Phase6BScaffoldContractSchema = z
  .object({
    phase: z.literal("6b"),
    source_component_id: z.literal("6B.12"),
    module_key: z.literal("phase-6b.general-ledger-accounting"),
    display_name: z.literal("General Ledger Accounting"),
    scaffold_status: z.literal("scaffold_control_only"),
    capability_implementation_authorized: z.literal(false),
    ticket_generation_allowed: z.literal(false),
    schema_baseline_status: z.literal("phase_6b_schema_declared"),
    schema_model_refs: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type Phase6BScaffoldContract = z.infer<typeof Phase6BScaffoldContractSchema>;

export const phase6bScaffoldContract = Phase6BScaffoldContractSchema.parse({
  phase: "6b",
  source_component_id: "6B.12",
  module_key: "phase-6b.general-ledger-accounting",
  display_name: "General Ledger Accounting",
  scaffold_status: "scaffold_control_only",
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: "phase_6b_schema_declared",
  schema_model_refs: [
  "Phase6BChartOfAccount",
  "Phase6BJournalEntry",
  "Phase6BJournalEntryLine",
  "Phase6BAccountingPeriod",
  "Phase6BTaxMapping",
  ],
});
