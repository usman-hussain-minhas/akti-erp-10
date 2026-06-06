# Phase 6B v6 Execution Seed Matrix Audit

Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

## Computed Counts

| Metric | Value |
|---|---|
| Seeds | 102 |
| manifest_required = true | 84 |
| manifest_required = false | 18 |
| foundry_activation = true | 83 |
| SMC dep count | 84 |
| manual_review_required seeds | 21 |

## Seed Type Distribution

| seed_type | count |
|---|---|
| tenant_service | 57 |
| core_microservice | 11 |
| optional_microservice | 9 |
| configuration_extension | 8 |
| provider_adapter | 7 |
| evidence_primitive | 5 |
| internal_lifecycle_primitive | 3 |
| audit_log_primitive | 2 |

## New v6 Fields

| Field | Count | Purpose |
|---|---|---|
| adl_self_contained_rationale | 8 seeds | Structured ADL grounding with source ref |
| shared_scope_rationale | 92 seeds | Documents why component-level scope text is shared |
| manual_review_reason | 21 seeds | Explains each manual_review_required decision |
| adl_evidence_refs | 1 seed | communication_attempt_evidence evidence-only ADL ref |

## Gate Results

| Gate | Result |
|---|---|
| All 102 seeds have seed_type | PASS |
| All ticket/execution flags false | PASS |
| B2 hard-edge↔seed-dep parity | PASS: 102/102 |
| Inverse-manifest gate (false+SMC=0) | PASS |
| Manifest↔foundry consistency | PASS: 0 false/true pairs |
| No unknown dep IDs | PASS |
| DFS cycle-free | PASS |
| ADL-021 anchor-only | PASS: 1 seed |
| ADL grounding complete | PASS: 0 orphaned |
| Scope_summary uniqueness | PASS: per-seed or rationale-explained |

Result: READY_WITH_MANUAL_REVIEW_BLOCKERS — 21 seeds blocked
