# Phase 6A v6 FFET Gate Manifest

Status: `PHASE_6A_V6_FFET_SET_READY_FOR_HUMAN_GATE_REVIEW`

This package supersedes `ticketability_v5` for Phase 6A Gate-2 FFET review. It intentionally contains only FFET Gate-2 artifacts plus this manifest. Historical control/readiness artifacts remain preserved in `ticketability_v5` and are excluded from v6 to avoid stale blocked/control-required labels.

## Gate Rules

- Every operative `adl_hard_rule` edge must carry non-empty `adl_refs`.
- `business_logic_hard_rule` is not a fallback for missing ADL references.
- `phase_doc_required` may appear only as raw provenance, never as terminal basis.
- Ticket/execution authorization flags remain false pending human Gate 3.
