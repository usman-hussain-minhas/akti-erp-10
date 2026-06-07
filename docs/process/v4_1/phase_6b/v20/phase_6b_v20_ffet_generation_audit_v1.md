# Phase 6B v20 FFET Generation Audit

Status: `PHASE_6B_V20_FFET_SET_READY_FOR_HUMAN_GATE_REVIEW`

## Derivation Sources

- v19 seed matrix and capability traceability matrix
- v19 dependency extraction matrix
- v4 human decision register
- accepted Phase 6B schema-control baseline on main
- accepted Phase 6B scaffold-control baseline on main
- Ticket Quality Doctrine v1.2 FFET gate

## Rule

One FFET maps to one seed/sub-surface. No merge rationales were used. No execution flag was changed.

## Audit Outcome

{
  "seed_count": 103,
  "ffet_count": 103,
  "one_to_one_seed_ffet_coverage": true,
  "orphan_seed_count": 0,
  "overlapping_seed_count": 0,
  "broad_glob_count": 0,
  "placeholder_leakage_count": 0,
  "dependency_cycle_count": 0,
  "ownership_overlap_count": 0,
  "terminal_phase_doc_required_count": 0,
  "terminal_capability_prerequisite_count": 0,
  "config_not_built_violation_count": 0,
  "flags_false": true
}
