---
owner: Usman Hussain
status: for_gate_3_review
created: 2026-06-14
updated: 2026-06-14
metadata_standard: esbla_file_metadata_standard_v1
---

# Repo-Grounded FFET Registry

- Subphase: `6.5G`
- FFET count: `11`
- Execution authorization: `false` for every FFET

| FFET | Capability | Dependencies | MCR |
| --- | --- | --- | --- |
| `P65G-FFET-001` | Validation engine severities | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Blocker blocks publish; warning requires acknowledgement evidence. |
| `P65G-FFET-002` | Simulation test mode | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Simulation runs end-to-end with mocked externals and no side effects. |
| `P65G-FFET-003` | Shadow mode divergence report | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Shadow run reports divergence and blocks cutover above release threshold. |
| `P65G-FFET-004` | Scheduled publish revalidation | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Scheduled publish revalidates and keeps prior version live on failure. |
| `P65G-FFET-005` | Rollback and migration behavior | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Rollback creates traceable version behavior and migration is bounded by validation. |
| `P65G-FFET-006` | Runtime instance state machine | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Instances pin versions and track state, owner, next event, timeout, escalation, recovery. |
| `P65G-FFET-007` | Dead-end runtime recovery guard | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Dead-end runtime states are blocked and declared recovery actions are available. |
| `P65G-FFET-008` | Run Monitor evidence surface | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Run Monitor exposes state, evidence, recovery, and audit lenses. |
| `P65G-FFET-009` | Export import off-ramp | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Export/import uses symbolic remap, import-to-draft only, and clean tenant validation. |
| `P65G-FFET-010` | Support diagnostics surface | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Support diagnostics are read-mostly or pipeline-bound and never bypass authority. |
| `P65G-FFET-011` | Composer final falsifiable demo | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004, P65F-FFET-007 | Final demo proves golden path and all negative assertions before Phase 6D dependency consumption. |
