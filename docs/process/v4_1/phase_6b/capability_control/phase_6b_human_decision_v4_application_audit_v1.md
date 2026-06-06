# Phase 6B Human Decision v4 Application Audit

**Status:** PASS - v4 decision authority is coherent as docs/control input.

## Source and scope audit

| Check | Result | Evidence |
|---|---|---|
| PR #55 schema decision gate merged before v4 | PASS | Local HEAD a84e5137bf57fa9392b9b9d1874d3176f7d3cfc6 contains the field-level clarification artifact. |
| v4 built from v3 plus amendment, not copied raw | PASS | v3 contradictions are normalized in `questions_answered_b6_v4.json`. |
| Live counts derived from v17, not v8 | PASS | docs/process/v4_1/phase_6b/v17/dependency_extraction_matrix_v1.json used for edge counts. |
| No dependency JSON modified by v4 | PASS | v4 is decision authority only. |
| Ticket generation remains forbidden | PASS | All v4 authorization flags are false. |

## Live v17 edge audit

| Check | Result | Count |
|---|---|---:|
| Total edges | PASS | 452 |
| Hard edges | PASS | 444 |
| Global opt-out hard edges observed | PASS | 29 |
| Outbound gateway ADL-004 edges observed | PASS | 6 |
| API-key scope hard edges observed | PASS | 16 |
| Operative terminal phase_doc_required hard edges | PASS | 0 |
| Operative terminal capability_prerequisite hard edges | PASS | 0 |
| adl_hard_rule with empty adl_refs | PASS | 0 |

## v3 contradiction repair audit

| Defect | Result | v4 repair |
|---|---|---|
| email_shared_inbox basis contradiction | PASS | Existing opt-out edge is reclassified to `adl_hard_rule` + `ADL-004`; gateway edge remains ADL-004. |
| capability_prerequisite unsupported final basis | PASS | Forbidden as terminal basis until tooling supports it. |
| phase_doc_required placeholder | PASS | Forbidden as terminal basis; descriptive mentions excluded from operative count. |
| stale line references | PASS | v4 uses section-level source authority language. |
| ambiguous anchor accept/reject labels | PASS | Rejection cases use `REJECT_PROPOSED_ANCHOR_USE_CANONICAL`. |

## Opt-out application audit

| Population | Live v17 count | v4 treatment | Result |
|---|---:|---|---|
| Send surface | 6 | hard `adl_hard_rule` + `ADL-004` | PASS |
| Lead capture | 19 | `conditional` | PASS |
| Non-send setup | 3 | `conditional` | PASS |
| Communication evidence non-send | 1 | `conditional` | PASS |

## Projected downstream effect

If applied to the dependency graph without unrelated graph changes, v4 projects:

- Hard edges: 444 -> 421
- Business-logic hard edges: 239 -> 210
- ADL hard-rule edges: 7 -> 13
- Conditional opt-out edges represented: 23

These are projection values only. The downstream artifact pass must rederive against the then-current target version before applying.

## Stop conditions preserved

- Stop if conditional dependency representation is unavailable.
- Stop if any send-surface opt-out edge cannot carry ADL-004.
- Stop if applying v4 would require runtime/schema/code changes in a planning PR.
- Stop if ticket-generation flags become true before final human approval.

## Final status

PHASE_6B_HUMAN_DECISION_V4_APPLICATION_AUDIT_PASS
