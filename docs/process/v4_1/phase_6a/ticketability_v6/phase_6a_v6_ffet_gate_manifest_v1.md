# Phase 6A v6 FFET Gate Manifest

Status: `PHASE_6A_V6_FFET_SET_READY_FOR_HUMAN_GATE_REVIEW`

This package supersedes `ticketability_v5` for Phase 6A Gate-2 FFET review. It intentionally contains only FFET Gate-2 artifacts plus this manifest. Historical control/readiness artifacts remain preserved in `ticketability_v5` and are excluded from v6 to avoid stale blocked/control-required labels.

## Gate Rules

- Every operative `adl_hard_rule` edge must carry non-empty `adl_refs`.
- `business_logic_hard_rule` is not a fallback for missing ADL references.
- `phase_doc_required` may appear only as raw provenance, never as terminal basis.
- Ticket/execution authorization flags remain false pending human Gate 3.


## Root Artifact Fix Evidence

Status: `PASS`

The root dependency matrix `docs/process/v4_1/phase_6a/dependency_extraction_matrix_v1.json` is changed in this PR and carries the six ratified ADL reference corrections. The v6 FFET registry carries the same refs, so regeneration starts from corrected source truth instead of relying only on the Gate-2 backstop.


## Freshness Evidence

- Branch: `codex/phase-6a-ffet-adl-ref-gate`
- Base ref: `origin/main`
- Base commit at artifact update: `d93e0bc`
- Artifact update head commit: `ea677f5`
- Validation status: PASS after minute-detail patch.


## Minute-Detail Validation Results

- Phase 6A JSON parse: PASS
- Custom Phase 6A v6 minute-detail FFET audit: PASS
- Phase 6A zero-trust mechanical audit: PASS
- Lower-snake path check: PASS
- `git diff --check`: PASS
