# Phase 6B Version Lineage Report v7

Status: PHASE_6B_V7_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

## Lineage

- v1: original generated lifecycle docs.
- v2: failed due to cross-artifact drift.
- v3: parity repair but type/ADL/report identity failure.
- v4: ADL precision/readiness wording failure.
- v5: edge-basis/ADL-grounding/fidelity failure.
- v6: local edge layer, TDM, and DFM propagation failure.
- v7: full graph-truth repair attempt.

## v7 Fixes

- Regenerated ESM local dependency edges from DEM.
- Removed stale 6B.10 hard local API-key edges.
- Removed stale 6B.10 opt-out selected targets from TDM.
- Rebuilt DFM from live SCM/TDM/DEM/ESM/ESM-local truth.
- Replaced ADL self-contained misnomer with explicit grounding modes.
- Converted unresolved email_shared_inbox outbound gateway edge to manual-review-only.
- Added audit reporting for DEM/local, TDM/DEM/ESM, DFM/live, ADL grounding, API-key blockers, and duplicate scope rationale counts.

## Self-Heal Attempts

Self-heal attempts used: recorded by implementation validation output.

## Validation Result

Validation result is recorded by the implementation return. v7 is safe for targeted manual review with blockers if all graph-truth checks pass.

## Future Rule

If v7 fails, create v8 by copying v7 and patching only v8. Never overwrite failed versions.

## Final Status

PHASE_6B_V7_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
