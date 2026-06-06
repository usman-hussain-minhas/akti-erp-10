# Phase 6B v8 Version Lineage Report

## Lineage

v1: original generated lifecycle docs; mechanically green but semantically unsafe.
v2: failed due to cross-artifact drift.
v3: parity repair but type, ADL, and report identity issues remained.
v4: ADL precision and readiness wording issue remained.
v5: edge-basis, ADL-grounding, and fidelity issue remained.
v6: local edge, TDM, and DFM propagation failure remained.
v7: graph propagation improved but TDM manual-review contradictions and pricing-anchor ambiguity remained.
v8: adds machine-readable blocker registry, repairs TDM blocker status, makes DFM blocker-aware, removes forbidden generic edge reasons, and preserves ticket-generation prohibition.

## v8 Final State

Status: PHASE_6B_V8_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
Expected file count: 21
Blocker registry file: manual_blocker_registry_v1.json
Blocker registry entries: 138
Ticket generation allowed: false
Ticket pack generation allowed: false

## Future Rule

If v8 fails to reach clean targeted manual review or acceptance-review state, do not create v9 automatically. Stop for root-cause workshop or schema redesign approval.
