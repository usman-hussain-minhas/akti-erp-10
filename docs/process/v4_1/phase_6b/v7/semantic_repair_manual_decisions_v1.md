# Phase 6B v7 Semantic Repair Manual Decisions

Status: PHASE_6B_SEMANTIC_REPAIR_MANUAL_DECISIONS_ACCEPTED

Current v7 repair status: PHASE_6B_V7_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

## Decision Tokens Present

- API_KEY_SCOPE_DECISION_ACCEPTED: absent
- COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> absent

## v7 Manual Review Policy

No missing decision token is silently resolved. Absent 6B.10 API-key direction keeps the affected payment seeds manual-review-blocked. Absent email_shared_inbox send-enforcement confirmation keeps the outbound gateway edge manual-review-only.

## Root Cause Logged

LOCAL EDGE LAYER EXCLUDED FROM SEMANTIC REGENERATION

v6 repaired DEM and some ESM top-level fields, but left ESM local dependency_edges, TDM, DFM, and audit checks stale. v7 regenerates those truth-carrying layers from the canonical graph.

## Final Status

PHASE_6B_V7_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
