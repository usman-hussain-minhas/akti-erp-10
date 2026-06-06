# Phase 6B Semantic Repair Manual Decisions v1

Status: PHASE_6B_SEMANTIC_REPAIR_V2_MANUAL_DECISIONS_ACCEPTED

## Scope

This artifact records the four approved policy decisions that govern the v2 semantic repair.
It supersedes the v1 `semantic_repair_manual_decisions_v1.md` in the phase_6b/ top-level directory.

Do not generate tickets, ticket packs, or execution artifacts from this document.
ticket_pack_generation_allowed: false
execution_authorized: false

---

## Policy 1 — Provider-Neutral Payment Target Default

**Decision**: When a component has a dependency on the 6B.10 payment component, the default
provider-neutral target is `seed_6b_10_payment_allocation_balance` for:
- Accounting, GL, reconciliation, payroll, and balance use cases
- General dependency on the 6B.10 payment surface

The target `seed_6b_10_refund_to_original_method` should be selected only when the dependency is
**specifically** about reversing a payment to the original payment instrument. None of the 25
retargeted edges (6B.11–6B.15) were identified as refund-specific; all 25 target
`seed_6b_10_payment_allocation_balance`.

**Rejected**: `seed_6b_10_jazzcash_gateway` (provider_adapter, single-provider). This must never
be selected as a default provider-neutral target when non-provider siblings exist in the component.
`rejected_first_child_target_if_any` must name the specific provider that was rejected.

**Stop condition**: If a payment edge has no clean provider-neutral target, set
`manual_review_required=true` with reason; do not substitute a provider seed.

---

## Policy 2 — Pricing-Model Family Classification

**Decision (APPLIED, HUMAN CONFIRMATION REQUIRED)**:
The 8 pricing-model variant seeds in 6B.02 are reclassified from `tenant_service` to
`configuration_extension`:
- seed_6b_02_fixed_pricing_model
- seed_6b_02_tiered_pricing_model
- seed_6b_02_volume_pricing_model
- seed_6b_02_per_unit_pricing_model
- seed_6b_02_per_hour_pricing_model
- seed_6b_02_per_period_pricing_model
- seed_6b_02_early_bird_pricing_deadline
- seed_6b_02_bundle_package_composition

Rationale: The source says pricing is "tenant-toggleable only through the Product service",
not eight independent services. These variants are configuration extensions of the parent
Product Catalogue Service, not independently activatable/billable/versioned services.

Consequence: manifest_required=false, foundry_activation_required=false,
manifest_traceability_targets=[], seed_6a_service_manifest_contract removed from dependencies.

Retained as `core_microservice` (no change):
- seed_6b_02_installment_plan_engine
- seed_6b_02_discount_stacking_engine
- seed_6b_02_scholarship_discount_approval

⚠ **HUMAN CONFIRMATION REQUIRED**: A human reviewer must verify that no pricing variant
is independently tenant-activatable before this classification is accepted. If any variant
IS independently activatable, set it back to `tenant_service` with `manifest_required=true`.

---

## Policy 3 — ADL-021 Anchor-Only Model

**Decision**: ADL-021 (immutable lead source) is carried by the anchor seed
`seed_6b_04_unified_lead_record_authority` only. Child connector seeds depend on the anchor and
do NOT independently carry ADL-021.

**Applied**: ADL-021 removed from:
- seed_6b_04_meta_lead_forms_connector
- seed_6b_04_tiktok_lead_gen_connector
- seed_6b_04_manual_lead_entry
- seed_6b_04_api_lead_intake

**Rationale**: ADL-021 creates an immutability obligation on the lead source record. This obligation
is enforced at the authority layer (unified_lead_record_authority), not at each individual intake
connector. Scattering ADL-021 across 5 of 19 connectors with no defensible selection rule creates
false compliance signals and audit drift.

---

## Policy 4 — ADL-004 Outbound Gateway and Classification of 6B.07 Surfaces

**Decision**: ADL-004 and dependency on `seed_6a_outbound_gateway_enforcement` apply to all
outbound-dispatching 6B.07 surfaces. Inbound-only routing is classified explicitly and does not
carry ADL-004 or gateway enforcement.

**Outbound surfaces (ADL-004 + gateway_enforcement added)**:
- seed_6b_07_whatsapp_template_management
- seed_6b_07_whatsapp_outbound_window
- seed_6b_07_whatsapp_broadcast_compliance
- seed_6b_07_whatsapp_auto_reply_keywords
- seed_6b_07_email_transactional_domain
- seed_6b_07_email_sequences (already had ADL-004; gateway dep added)
- seed_6b_07_email_shared_inbox

**Inbound-only (classified, no ADL-004, no gateway dep)**:
- seed_6b_07_whatsapp_inbound_routing
- seed_6b_07_email_connected_inbox

**Evidence primitive (records, does not dispatch; ADL-004 retained, no gateway dep)**:
- seed_6b_07_communication_attempt_evidence

---

## Additional v2 Repair Notes

### Non-API Lead Intake (Fix 2 — 6B.04)

The following non-API lead intake seeds had `seed_6a_api_key_scope_registry` incorrectly inherited
from the parent. This dep is now removed from their `dependencies` arrays and documented in
`parent_required_dependency_trace` with `status: not_applicable_with_reason`:

manual_lead_entry, walk_in_intake, phone_intake, email_intake, referral_intake,
inbound_whatsapp_intake, inbound_sms_intake, chatbot_intake, live_chat_intake,
web_form_intake_connector, csv_excel_import

API connectors (api_lead_intake, meta_lead_forms_connector, meta_whatsapp_intake_connector,
tiktok_lead_gen_connector, google_ads_connector, google_business_connector,
facebook_page_forms_connector) retain the dependency — correct.

### Payment Provider Adapters (Fix 2 — 6B.10)

All 10 6B.10 seeds had `seed_6a_global_opt_out_registry` removed.
`global_opt_out_registry` governs marketing-communication consent; payment processing,
disbursement, reconciliation, and top-up are not communication channels and do not
require opt-out enforcement. The prior adl_hard_rule basis for this dep (on
payment_allocation_balance and refund_to_original_method) was not source-grounded to
any communication-related ADL.

### Edge Basis Re-derivation (Fix6e-bis)

v1 over-applied `billing_or_evidence_required` as the basis for 121 edges that target
platform/identity/access seeds. v2 re-derives these:
- Targets: access_core_gatekeeper, person_identity_graph, base_design_tokens, visual_workflow_builder
  → basis corrected to `activation_lifecycle_required`
- Targets: global_opt_out_registry, api_key_scope_registry
  → basis corrected to `adl_hard_rule`

---

## Later-Phase Blockers Recorded, Not Repaired

No Phase 6C–6F artifacts modified in this pass.
