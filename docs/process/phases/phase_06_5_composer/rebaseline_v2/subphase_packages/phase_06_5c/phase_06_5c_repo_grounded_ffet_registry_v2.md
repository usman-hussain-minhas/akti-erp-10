---
owner: Usman Hussain
status: for_gate_3_review
created: 2026-06-14
updated: 2026-06-14
metadata_standard: esbla_file_metadata_standard_v1
---

# Repo-Grounded FFET Registry

- Subphase: `6.5C`
- FFET count: `7`
- Execution authorization: `false` for every FFET

| FFET | Capability | Dependencies | MCR |
| --- | --- | --- | --- |
| `P65C-FFET-001` | Primitive contract and manifest baseline | P65A-FFET-006, P65B-FFET-003 | Every primitive declares capabilities, inputs, outputs, permissions, events, cost, evidence, and failure modes. |
| `P65C-FFET-002` | Primitive compatibility validation | P65A-FFET-006, P65B-FFET-003 | Incompatible primitive chains are rejected with explainable errors. |
| `P65C-FFET-003` | Extension registration gate | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008 | Only approved extension path can register executable primitive behavior. |
| `P65C-FFET-004` | Runtime resolver source chain | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008 | Resolver applies deterministic source layers and conflict reporting. |
| `P65C-FFET-005` | Symbolic reference boundary | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008 | Exports and compositions use symbolic references, never raw secrets or tenant/user IDs. |
| `P65C-FFET-006` | Primitive deprecation lifecycle | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008 | Deprecated primitives block new compositions without breaking existing valid versions. |
| `P65C-FFET-007` | Primitive registry negative demo | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008 | Demo rejects unregistered, missing, deprecated, and incompatible primitive paths before publish. |
