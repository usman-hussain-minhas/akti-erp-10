---
owner: Usman Hussain
status: for_gate_3_review
created: 2026-06-14
updated: 2026-06-14
metadata_standard: esbla_file_metadata_standard_v1
---

# Repo-Grounded FFET Registry

- Subphase: `6.5A`
- FFET count: `6`
- Execution authorization: `false` for every FFET

| FFET | Capability | Dependencies | MCR |
| --- | --- | --- | --- |
| `P65A-FFET-001` | Import and metadata normalization | none | Imported Composer docs have compliant metadata, current source references, and no stale authority citations. |
| `P65A-FFET-002` | Suite amendment and ratification packet | P65A-FFET-001 | Suite amendment package names exact doctrine patches and remains unsigned until human ratification. |
| `P65A-FFET-003` | P-40 through P-45 parameter amendment | P65A-FFET-002 | Composer governed parameters use P-40 through P-45 and never reuse P-26 through P-39. |
| `P65A-FFET-004` | Source authority and conflict register | P65A-FFET-001 | Every Composer claim has authority tier and conflict disposition path. |
| `P65A-FFET-005` | Phase sequence and 6D dependency gate | P65A-FFET-002 | Phase 6.5 is inserted before 6D and 6D dependency gates are explicit. |
| `P65A-FFET-006` | Gate controls and FFET lifecycle | P65A-FFET-004, P65A-FFET-005 | Execution flags remain false and human Gate 3 approval boundary is explicit. |
