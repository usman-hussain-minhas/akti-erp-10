# Phase 6B v6 Dependency Extraction Audit

Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

All values computed from live v6 DEM JSON. No generator attestation echoed.

## Computed Edge Counts

| Metric | v5 | v6 |
|---|---|---|
| Total edges | 450 | 450 |
| Hard dependency edges | 442 | 432 |
| Manual-review edges | 8 | 18 |
| phase_doc_required on hard edges | 201 | **0** |
| billing_or_evidence on non-billing targets | 38+ | **0** |

## Edge Basis Distribution (computed)

| basis | v5 | v6 |
|---|---|---|
| activation_lifecycle_required | 84 | 189 |
| business_logic_hard_rule | 0 | 87 |
| billing_or_evidence_required | 150 | 112 |
| adl_hard_rule | 6 | 43 |
| manual_decision | 9 | 19 |
| phase_doc_required (hard edges) | 201 | **0** |

## Target Semantic Class Distribution (v6 new field, computed)

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

## Billing Basis Target Class Gate (computed)

billing_or_evidence_required edges targeting non-billing target_semantic_class: **0**
Gate: billing_or_evidence_required valid only for billing_financial or audit_evidence. PASS.

## ADL Edge Distribution (computed)

| ADL | seed-level count | edge-level count |
|---|---|---|
| ADL-004 | 6 | 6 |
| ADL-013 | 2 | 2 |
| ADL-014 | 1 | 1 |
| ADL-015 | 2 | 2 |
| ADL-016 | 2 | 2 |
| ADL-018 | 1 | 1 |
| ADL-021 | 1 | 1 |

## ADL Grounding Status (computed)

| Status | Count |
|---|---|
| Edge-grounded ADL refs | 15 edge-level refs |
| Self-contained rationale (with source ref) | 8 seeds |
| Manual-review-blocked | 13 seeds |
| Orphaned (no grounding) | **0** |

## Gates

| Gate | Result | Evidence |
|---|---|---|
| zero phase_doc_required on hard edges | PASS | 0 |
| billing_or_evidence targets billing/evidence | PASS | 0 violations |
| all edges have target_semantic_class | PASS | 450/450 |
| ADL grounding complete | PASS | 0 orphaned |
| B2 seed/extraction parity | PASS | 102/102 |
| manual-review edges for unresolved deps | PASS | 18 MR edges |

Result: READY_WITH_MANUAL_REVIEW_BLOCKERS
