# Phase 6B Human Decision Register - v4

**Status:** PHASE_6B_HUMAN_DECISION_REGISTER_V4_READY_FOR_SCHEMA_CONTROL_INPUT

This is the repo-native, cleaned decision authority derived from the uploaded v3 answer register, the v4 amendment plan, PR #55 schema field-level decisions, and live v17 artifact counts. It is not a ticket authorization and does not modify the dependency graph by itself.

## Authorization locks

- ticket_generation_allowed=false
- ticket_pack_generation_allowed=false
- capability_implementation_authorized=false
- schema_implementation_authorized_by_this_artifact=false
- dependency_json_mutation_authorized_by_this_artifact=false

## What v4 fixes

- Terminal `phase_doc_required` is forbidden as an operative basis.
- Terminal `capability_prerequisite` is forbidden until enum/tooling support exists. Use `business_logic_hard_rule` as the interim hard basis and keep capability-prerequisite wording only as rationale.
- `email_shared_inbox` is a send surface. Its existing opt-out edge is reclassified to `adl_hard_rule` with `ADL-004`; it is not treated as a newly absent edge.
- Send-surface opt-out edges use `adl_hard_rule` with `ADL-004`.
- Lead-capture, non-send setup, and communication-evidence opt-out edges become `conditional`, not silently dropped.
- Phase 6B.04 provider/API lead-intake API-key edges remain unchanged by this v4 register.
- Schema baseline policy is minimal source-grounded relation skeletons, with `metadata_json` restricted to audit/control/extension metadata only.

## Canonical hard-rule doctrine

An edge is hard only if it is genuinely immovable: platform identity or architecture, transaction/data integrity, security/regulatory enforcement, billing/evidence structure, or customer-protection asymmetry. Structure is hard; values and policies not named hard are configurable as data.

The platform hard-rule layer is A-H: platform identity and architecture; transaction and data integrity; security and identity; billing and evidence; customer-first protection; 25-year design principles as rule generators, not independent binary gates; configurability as the default for anything not named hard; and outbound communication gateway/global opt-out enforcement under ADL-004 for send paths.

Domain behavioral ADLs remain governed by the ADL registry. This register does not replace that registry.

## Basis decision tree

1. Specific ADL named: `adl_hard_rule` with non-empty `adl_refs`.
2. Locked non-ADL platform rule: `business_logic_hard_rule`.
3. Billing/evidence-bearing target: `billing_or_evidence_required`.
4. Foundry/manifest activation to SMC: `activation_lifecycle_required`.
5. Configurable policy or value: represent as `soft`, `conditional`, or `deferred`; do not drop.
6. Unclassifiable from source: keep manual review and do not promote execution.

## Live v17 counts used

| Metric | Count |
|---|---:|
| Total dependency edges | 452 |
| Hard dependency edges | 444 |
| Global opt-out hard edges | 29 |
| Outbound gateway hard edges | 6 |
| API-key scope hard edges | 16 |
| Service manifest hard edges | 85 |
| Operative phase_doc_required hard edges | 0 |
| Operative capability_prerequisite hard edges | 0 |
| adl_hard_rule edges with empty refs | 0 |

## Opt-out v4 matrix from live v17

| Population | Count | v4 treatment |
|---|---:|---|
| Send surface | 6 | hard `adl_hard_rule` + `ADL-004` |
| Lead capture | 19 | `conditional` dependency representation |
| Non-send setup | 3 | `conditional` dependency representation |
| Communication evidence non-send | 1 | `conditional` dependency representation |

Projected after downstream application, if no other graph changes occur: hard edges 421; conditional opt-out edges represented 23; send opt-out edges rebased to ADL-004 6. This is only a projection; this artifact does not apply the graph change.

## Send-surface opt-out edges

- seed_6b_07_email_sequences -> seed_6a_global_opt_out_registry: reclassify existing edge to hard `adl_hard_rule` with `ADL-004`.
- seed_6b_07_email_shared_inbox -> seed_6a_global_opt_out_registry: reclassify existing edge to hard `adl_hard_rule` with `ADL-004`.
- seed_6b_07_email_transactional_domain -> seed_6a_global_opt_out_registry: reclassify existing edge to hard `adl_hard_rule` with `ADL-004`.
- seed_6b_07_whatsapp_auto_reply_keywords -> seed_6a_global_opt_out_registry: reclassify existing edge to hard `adl_hard_rule` with `ADL-004`.
- seed_6b_07_whatsapp_broadcast_compliance -> seed_6a_global_opt_out_registry: reclassify existing edge to hard `adl_hard_rule` with `ADL-004`.
- seed_6b_07_whatsapp_outbound_window -> seed_6a_global_opt_out_registry: reclassify existing edge to hard `adl_hard_rule` with `ADL-004`.

## Conditional opt-out edges

- seed_6b_04_api_lead_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_chatbot_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_csv_excel_import -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_email_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_facebook_page_forms_connector -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_google_ads_connector -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_google_business_connector -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_inbound_sms_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_inbound_whatsapp_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_live_chat_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_manual_lead_entry -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_meta_lead_forms_connector -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_meta_whatsapp_intake_connector -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_phone_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_referral_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_tiktok_lead_gen_connector -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_unified_lead_record_authority -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_walk_in_intake -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_04_web_form_intake_connector -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (lead_capture).
- seed_6b_07_communication_attempt_evidence -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (communication_evidence_non_send).
- seed_6b_07_email_connected_inbox -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (non_send_setup).
- seed_6b_07_whatsapp_inbound_routing -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (non_send_setup).
- seed_6b_07_whatsapp_template_management -> seed_6a_global_opt_out_registry: move from hard dependency to `conditional` representation (non_send_setup).

## API-key decisions

- Phase 6B.10 provider/processing surfaces consume `seed_6a_api_key_scope_registry` with `business_logic_hard_rule` and `api_security`.
- `seed_6b_10_payment_allocation_balance` and `seed_6b_10_manual_reconciliation_path` must not carry API-key scope dependencies.
- Existing Phase 6B.04 provider/API lead-intake API-key dependencies remain unchanged by v4 unless a later source-specific review proves otherwise.
- No API-key edge uses `adl_hard_rule` or `billing_or_evidence_required`.

## Schema-baseline decisions carried forward

| Decision | Token |
|---|---|
| P6B_SCHEMA_FIELD_POLICY_001 | `RELATION_SKELETON_WITH_MINIMAL_SOURCE_GROUNDED_FIELDS` |
| P6B_SCHEMA_FIELD_POLICY_002 | `ALLOW_METADATA_JSON_ONLY` |
| P6B_SCHEMA_FIELD_POLICY_003 | `YES_LINK_PHASE_6B_CRM_MODELS_TO_LEAD_RECORD_WHEN_THEY_EXTEND_LEAD_WORKFLOWS` |
| P6B_SCHEMA_FIELD_POLICY_004 | `CREATE_SAFE_CORE_RELATIONS_NOW_NO_CALCULATION_BEHAVIOR` |
| P6B_SCHEMA_FIELD_POLICY_005 | `PRODUCT_PRICE_HISTORY_IS_CANONICAL_6B_PRICING_AUTHORITY` |
| P6B_SCHEMA_FIELD_POLICY_006 | `YES_PROVIDER_CALLBACK_ALLOCATION_RECEIPT_TOPUP_RECONCILIATION_BASELINE` |
| P6B_SCHEMA_FIELD_POLICY_007 | `YES_OPTIONAL_CHANNELS_GATEWAY_ENFORCED_SEND_ATTEMPTS` |
| P6B_SCHEMA_FIELD_POLICY_008 | `CONFIRM_ADL_016_IS_PHASE_6B_ONLY_AND_EXCLUDED_FROM_PHASE_6A_EXECUTABLE_TICKETS` |

The schema baseline may use relation skeletons with minimal source-grounded fields. `metadata_json` is allowed only for audit/control/extension metadata and may never be the sole carrier of a source-named business fact.

## Downstream application gates

- No operative terminal `phase_doc_required`.
- No operative terminal `capability_prerequisite` until tooling supports it.
- Every `adl_hard_rule` edge has non-empty `adl_refs`.
- Send opt-out hard edges carry `ADL-004`.
- Demoted opt-out edges are represented as conditional/soft/deferred, never dropped.
- Ticket generation and execution remain false until a later final human review.

## Final status

PHASE_6B_HUMAN_DECISION_REGISTER_V4_READY_FOR_SCHEMA_CONTROL_INPUT
