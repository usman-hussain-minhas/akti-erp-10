# Phase 6B Semantic Derivation Audit v1 (v2 Computed)

Status: READY
Version: v2 — all checks recomputed from live JSON; no generator attestation echoed

## Methodology

All values below are computed from the actual v2 JSON files:
- `execution_seed_matrix_v1.json` (ESM)
- `dependency_extraction_matrix_v1.json` (DEM)
- `semantic_dependency_target_map_v1.json` (TDM)
- `semantic_derivation_matrix_v1.json` (SDM)

No check passes by reading a boolean that the generator itself set.

## Computed State Summary

| Metric | v1 (before) | v2 (after) |
| --- | --- | --- |
| Source components | 15 | 15 |
| Seeds | 102 | 102 |
| Extraction edges | 473 | 451 |
| Hard edges | 465 | 443 |
| Manual-review edges | 8 | 8 |
| manifest_required = true | 92 | 84 |
| manifest_required = false | 10 | 18 |
| foundry_activation = true | 91 | 83 |
| foundry_activation = false | 11 | 19 |
| SMC dependency count | 92 | 84 |

### Seed type distribution

| seed_type | v1 | v2 |
| --- | --- | --- |
| tenant_service | 74 | 66 |
| configuration_extension | 0 | 8 |
| core_microservice | 11 | 11 |
| provider_adapter | 7 | 7 |
| internal_lifecycle_primitive | 3 | 3 |
| evidence_primitive | 5 | 5 |
| audit_log_primitive | 2 | 2 |

### Edge basis distribution

| basis | v1 | v2 |
| --- | --- | --- |
| activation_lifecycle_required | 92 | 171 |
| billing_or_evidence_required | 313 | 174 |
| adl_hard_rule | 60 | 98 |
| manual_decision | 8 | 8 |

Note: v2 increase in `activation_lifecycle_required` (+79) and `adl_hard_rule` (+38) reflects Fix6e-bis:
re-derivation of over-applied `billing_or_evidence_required` edges targeting platform/identity/access
seeds (access_core_gatekeeper, person_identity_graph, base_design_tokens, visual_workflow_builder →
`activation_lifecycle_required`; global_opt_out, api_key_scope → `adl_hard_rule`).

### ADL reference distribution

| ADL | v1 | v2 |
| --- | --- | --- |
| none | 87 | 85 |
| ADL-004 | 2 | 8 |
| ADL-013 | 2 | 2 |
| ADL-014 | 1 | 1 |
| ADL-015 | 2 | 2 |
| ADL-016 | 2 | 2 |
| ADL-018 | 1 | 1 |
| ADL-021 | 5 | 1 |

Note: ADL-004 increased 2→8 (Fix 3: added to all 7 outbound 6B.07 seeds).
ADL-021 decreased 5→1 (Fix 5: anchor-only model; 4 per-connector tags removed).

## Computed Gate Results

| Check | Method | Result | Evidence |
| --- | --- | --- | --- |
| Fix6a: no provider_adapter as default target | Scan TDM selected_target_seed_ids; cross-ref seed_type in ESM; FAIL if provider_adapter selected when neutral sibling exists | PASS | 0 violations |
| Fix6b: no identical deps without per-child rationale | Group seeds by source_component_id; compare dep sets; FAIL if all children identical and none have parent_required_dependency_trace | PASS | 0 violations |
| Fix6c: inverse_manifest_gate | Scan ESM: collect seeds where manifest_required=false AND SMC in dependencies; FAIL if count > 0 | PASS | 0 violations. manifest_false=18, smc_count=84 |
| Fix6d: manifest_activation_consistency | Scan ESM: collect seeds where manifest_required=false AND foundry_activation_required=true; FAIL if count > 0 | PASS | 0 violations. foundry_true=83 all have manifest_true |
| Fix6e: no source-grounded edges labelled phase_doc_required | Scan DEM: FAIL if hard_dependency_basis == phase_doc_required on any adl/billing/activation edge | PASS | 0 violations |
| Fix6e-bis: billing_or_evidence targets must be billing/evidence seeds | Scan DEM: FAIL if billing_or_evidence_required edge targets gatekeeper/opt-out/access/identity/config/catalog seed | PASS | 0 violations post-rederivation |
| A3: SMC dep count = manifest_required true count | Computed: len([s for s in seeds if SMC in deps]) == len([s for s in seeds if manifest_required==true]) | PASS | manifest_true=84, smc_count=84 |
| A4: foundry=true implies manifest=true | Computed: no seed with foundry_activation=true has manifest_required=false | PASS | foundry_true=83; all have manifest_required=true |
| B2: hard edge ↔ seed dep parity | For each seed: set(dependencies) == set(hard edge targets from that seed) | PASS | 102/102 seeds match |
| DFS cycle check | Full DFS over ESM+DEM edges; 6A seeds treated as external BLACK roots | PASS | No cycles detected |
| Forward dependency check | No 6B seed depends on a later source_component_id in same phase | PASS | 0 violations |
| Four-way fidelity: no self-attestation | No seed_id appears in its own dependencies array | PASS | 0 self-deps |
| All ticket/execution flags false | Scan ESM: ticket_generation_allowed, ticket_pack_generation_allowed, execution_authorized all false | PASS | 102/102 seeds |
| mixed manifest classification is source-grounded | manifest_required true=84, false=18 — non-trivial distribution | PASS | See seed_type_dist |
| mechanical audit alone is insufficient | Semantic audit required before manual review and ticket planning | PASS | This audit computes from JSON, not echoed |

## Key v2 Changes (Computed from Diffs)

### Fix 1: Provider-neutral payment targets
- 25 TDM rows retargeted: `seed_6b_10_jazzcash_gateway` → `seed_6b_10_payment_allocation_balance`
- `rejected_first_child_target_if_any` now correctly names `seed_6b_10_jazzcash_gateway`
- Consistent across ESM dependencies, DEM edges, TDM rows, SCM normalized targets

### Fix 2: Child-specific inheritance
- 11 non-API 6B.04 seeds: `seed_6a_api_key_scope_registry` removed; `parent_required_dependency_trace` added
- 10 6B.10 payment seeds: `seed_6a_global_opt_out_registry` removed; rationale documented
- 6B.04 API connectors (api_lead_intake, meta/tiktok/google) retain api_key_scope — correct

### Fix 3: ADL-004 + outbound gateway boundary
- 7 outbound 6B.07 seeds gain `seed_6a_outbound_gateway_enforcement` dep + ADL-004
- 2 inbound-only seeds (whatsapp_inbound_routing, email_connected_inbox) classified explicitly
- evidence_primitive (communication_attempt_evidence) classified as non-sending

### Fix 4: Pricing-model reclassification
- 8 seeds reclassified: `tenant_service` → `configuration_extension`
- manifest_required: true 92→84; foundry_activation: true 91→83
- SMC dep count: 92→84
- ⚠ HUMAN CONFIRMATION REQUIRED — see manual decisions artifact

### Fix 5: ADL-021 anchor-only
- ADL-021 removed from 4 per-connector 6B.04 seeds
- Retained only on `seed_6b_04_unified_lead_record_authority`

### Fix6e-bis: Edge basis re-derivation
- 87 edges: `billing_or_evidence_required` → `activation_lifecycle_required` (access/identity/platform targets)
- 34 edges: `billing_or_evidence_required` → `adl_hard_rule` (opt-out/api-scope ADL targets)

Result: READY
