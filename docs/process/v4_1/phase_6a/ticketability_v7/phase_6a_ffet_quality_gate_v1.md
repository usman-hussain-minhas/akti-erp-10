# Phase 6A v7 FFET Quality Gate

Status: `PHASE_6A_V7_FFET_SET_READY_FOR_HUMAN_GATE_REVIEW`

| Check | Result |
|---|---:|
| Seeds | 74 |
| FFET candidates | 74 |
| Orphan seeds | 0 |
| Overlapping seed mappings | 0 |
| Broad globs | 0 |
| Ownership overlaps | 0 |
| Dependency cycles | 0 |
| Placeholder leakage | 0 |
| Documentation-only MCRs | 0 |
| Terminal phase_doc_required | 0 |
| Raw phase_doc_required provenance retained | 65 |
| Terminal capability_prerequisite | 0 |
| Flags false | PASS |

Phase 6B remains parked at Gate 2.


## Phase 6A v7 ADL Reference Gate

Status: PASS

- Every operative `adl_hard_rule` edge must carry at least one `adl_ref`.
- `business_logic_hard_rule` is not a fallback for missing ADL references.
- `phase_doc_required` may appear only as raw provenance, never as an operative terminal basis.
- The six Saga/Event/DLQ edges corrected in root Phase 6A dependency truth carry the ratified ADL refs in this v7 FFET set.
