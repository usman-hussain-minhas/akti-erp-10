# Phase 6B v6 Zero Trust Gate Summary

Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
Repair start SHA: b8968e30444355bc3de9ca55de2cb779695d2125
Ticket generation: BLOCKED | Ticket-pack planning: BLOCKED | Do not merge PR #47

## Computed State Summary

| Metric | v5 | v6 |
|---|---|---|
| Seeds | 102 | 102 |
| manifest_required = true | 84 | 84 |
| manifest_required = false | 18 | 18 |
| foundry_activation = true | 83 | 83 |
| SMC dep count | 84 | 84 |
| Hard edges | 442 | 432 |
| Manual-review edges | 8 | 18 |
| Total edges | 450 | 450 |
| manual_review_required seeds | 11 | 21 |
| phase_doc_required hard edges | 201 | **0** |
| billing_or_evidence on non-billing | 38 | **0** |

## Seed Type Distribution (computed)

| seed_type | v5 | v6 |
|---|---|---|
| tenant_service | 57 | 57 |
| optional_microservice | 9 | 9 |
| core_microservice | 11 | 11 |
| configuration_extension | 8 | 8 |
| provider_adapter | 7 | 7 |
| evidence_primitive | 5 | 5 |
| audit_log_primitive | 2 | 2 |
| internal_lifecycle_primitive | 3 | 3 |

## Edge Basis Distribution (computed)

| basis | v5 | v6 |
|---|---|---|
| activation_lifecycle_required | 84 | 189 |
| business_logic_hard_rule | 0 | 87 |
| billing_or_evidence_required | 150 | 112 |
| adl_hard_rule | 6 | 43 |
| manual_decision | 9 | 19 |
| phase_doc_required on hard edges | 201 | **0** |

## Target Semantic Class Distribution (v6 new, computed)

| target_semantic_class | count |
|---|---|
| billing_financial | 92 |
| capability_ordering | 87 |
| activation_manifest | 84 |
| identity_access | 60 |
| platform_lifecycle | 46 |
| communication_governance | 35 |
| audit_evidence | 20 |
| api_security | 18 |
| manual_review | 8 |

## Gate Results (all computed from live v6 JSON — no declared values)

| Gate | Result | Computed evidence |
|---|---|---|
| G1: zero phase_doc_required on hard edges | PASS | 0 remaining |
| G2: billing_or_evidence targets billing/evidence only | PASS | 0 violations |
| G3: all edges have target_semantic_class | PASS | 450/450 edges |
| G4: ADL grounding complete | PASS | 0 orphaned ADLs |
| G5: five-way fidelity (SCM/ESM/TDM/DEM/DFM) | PASS | 15/15 components |
| G6: 6B.10 opt-out removed from SCM | PASS | absent from normalized targets |
| G7: 6B.10 api-key downgraded to manual_review | PASS | 10 seeds, 18 MR edges |
| Inverse-manifest gate | PASS | 0 false+SMC seeds |
| Manifest↔foundry consistency | PASS | 0 false/true pairs |
| B2 hard-edge↔seed-dep parity | PASS | 102/102 |
| DFS cycle-free | PASS | no cycles detected |
| ADL-021 anchor-only | PASS | 1 seed (unified_lead_record_authority) |
| ticket/execution flags | PASS | 102/102 false |
| scope_summary uniqueness | PASS | per-seed unique or shared_scope_rationale present |

## Manual Review Blockers (computed from ESM)

Total manual_review_required seeds: **21**

| Category | Count |
|---|---|
| Pricing family (6B.02) | 8 |
| Communication surfaces (6B.07) | 3 |
| 6B.10 API-key direction (6B.10) | 10 |

Blocker increase from v5 (11→21): 10 previously-silent 6B.10 api-key hard edges
now surfaced as explicit manual-review blockers. This is honest, not regression.

Resolution tokens required in semantic_repair_manual_decisions_v1.md:
- PRICING_DECISION_ACCEPTED (x8)
- COMM_DECISION_ACCEPTED (x3)
- 6B10_APIKEY_DECISION_ACCEPTED (x1)

## Final Status

PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

If all decision tokens present and validated:
→ PHASE_6B_V6_SEMANTIC_REPAIR_READY_FOR_ACCEPTANCE_REVIEW

ticket_pack_generation_allowed: false
execution_authorized: false
