# Phase 6B Version Lineage Report

## v1 — Original PR #47 Artifacts
Failure pattern: DECLARED-FIELD CONSISTENCY MASKED ARCHITECTURAL MISDECLARATION
All manifest=true; no ADL layer; no seed_type; first-child dep anchoring.

## v2 — First Semantic Repair
Failure pattern: PARTIAL PROPAGATION / CROSS-ARTIFACT DRIFT
Semantic decisions existed but did not propagate to all artifacts.

## v3 — Propagation and Parity Repair
Failure pattern: SEMANTIC REPAIR PASSED PARITY BUT PRESERVED WRONG TYPE SEMANTICS
Introduced 201 phase_doc_required edges. Optional micro-services misclassified.

## v4 — Optional Micro-Service and ADL Cleanup
Failure pattern: ADL EDGE PRECISION STILL TOO BROAD
ADL-004 over-applied within 6B.07. phase_doc_required persisted (201 edges).

## v5 — Targeted Manual Review State
Status: PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
Fixed: ADL-004 precision, adl_evidence_refs, 11 explicit blockers.
Remaining: 201 phase_doc_required, 38+ billing_or_evidence misrouted,
8 orphaned ADL refs, SCM 6B.10 stale opt-out, audit MDs hiding distributions.

## v6 — Edge Basis Rederivation, ADL Grounding, Five-Way Fidelity (this version)
Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

### What v6 fixed
- Eliminated all 201 phase_doc_required hard edges (0 remaining)
- Added target_semantic_class (closed enum) to all 450 edges
- Rederived edge basis for all edges using target_semantic_class rule engine
- Fixed billing_or_evidence_required misrouting (0 non-billing targets remain)
- Grounded 8 orphaned ADL refs via carrier edges and adl_self_contained_rationale
- Removed stale seed_6a_global_opt_out_registry from SCM 6B.10
- Converted 10 6B.10 api-key hard edges to manual_review (direction unresolved)
- Added DFM five-way fidelity with TDM target fields
- Fixed 6B.07 scope_summary (10 unique per-seed summaries)
- Added shared_scope_rationale to 92 seeds with component-level shared scope
- All 10 audit MDs recomputed from live v6 JSON; no declared values

### New manual-review blockers
- 10 6B.10 api-key direction seeds (surfaced from silent hard deps)
- Total: 21 (8 pricing + 3 comm + 10 api-key) vs v5's 11

### Validation
All 32 computed checks: PASS.

### Git
Branch: docs/spark_platform_v4_1_phase_6b_to_6f_zero_trust_lifecycle
REPAIR_START_SHA: b8968e30444355bc3de9ca55de2cb779695d2125
