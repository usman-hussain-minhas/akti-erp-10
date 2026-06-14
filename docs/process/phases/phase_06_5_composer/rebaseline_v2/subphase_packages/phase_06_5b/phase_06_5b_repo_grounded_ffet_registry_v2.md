---
owner: Usman Hussain
status: for_gate_3_review
created: 2026-06-14
updated: 2026-06-14
metadata_standard: esbla_file_metadata_standard_v1
---

# Repo-Grounded FFET Registry

- Subphase: `6.5B`
- FFET count: `8`
- Execution authorization: `false` for every FFET

| FFET | Capability | Dependencies | MCR |
| --- | --- | --- | --- |
| `P65B-FFET-001` | Composition and CompositionVersion contracts | P65A-FFET-006 | contracts:validate proves composition/version schemas and published immutability. |
| `P65B-FFET-002` | Universal change proposal contract | P65A-FFET-006 | Proposal contract captures source, risk floor, impact preview, provenance, and evidence targets. |
| `P65B-FFET-003` | One change pipeline runtime | P65A-FFET-006 | Runtime tests prove every configuration face writes through one pipeline. |
| `P65B-FFET-004` | Deterministic risk-floor classifier | P65A-FFET-006 | Tests prove risk floors cannot be lowered by AI or humans. |
| `P65B-FFET-005` | Human preview before consequence | P65A-FFET-006 | Consequential changes require human-readable preview before publish. |
| `P65B-FFET-006` | Versioned change graph and provenance | P65A-FFET-006 | Accepted proposals produce replayable version graph and provenance evidence. |
| `P65B-FFET-007` | Super Admin support face pipeline bound | P65A-FFET-006 | Support surface cannot write config outside one change pipeline. |
| `P65B-FFET-008` | Composer API module mount and route spine | P65A-FFET-006, P65B-FFET-003 | Composer API module mounts once and exposes an activation-aware route spine without wiring individual features multiple times. |
