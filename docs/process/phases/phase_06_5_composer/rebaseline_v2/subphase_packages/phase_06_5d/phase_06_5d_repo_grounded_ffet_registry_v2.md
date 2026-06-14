---
owner: Usman Hussain
status: for_gate_3_review
created: 2026-06-14
updated: 2026-06-14
metadata_standard: esbla_file_metadata_standard_v1
---

# Repo-Grounded FFET Registry

- Subphase: `6.5D`
- FFET count: `8`
- Execution authorization: `false` for every FFET

| FFET | Capability | Dependencies | MCR |
| --- | --- | --- | --- |
| `P65D-FFET-001` | Setup Wizard screen and API contract | P65A-FFET-006, P65B-FFET-003, P65C-FFET-004 | Screen/API contract covers route, users, capabilities, states, and must-not-happen rules. |
| `P65D-FFET-002` | Organization graph authoring | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004 | Tests prove P-40 depth, multi-parent precedence, and reorganization validation. |
| `P65D-FFET-003` | Workflow graph authoring | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004 | Tests prove P-41/P-42 workflow and stage limits plus bounded-loop validation. |
| `P65D-FFET-004` | Custom fields with primitive inheritance | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004 | Unsafe custom fields affecting money, identity, reputation, or permission are blocked unless primitive-supported. |
| `P65D-FFET-005` | Permission composition authoring | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004 | Permission changes compose through Access Core/Gatekeeper and in-flight behavior is explicit. |
| `P65D-FFET-006` | Template library authoring | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004 | Templates enter the change pipeline as proposals and never bypass validation. |
| `P65D-FFET-007` | Concurrent editing conflict resolution | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004 | Concurrent edits detect conflicts and block publish until resolved. |
| `P65D-FFET-008` | Manual AI template import parity | P65A-FFET-006, P65B-FFET-003, P65B-FFET-008, P65C-FFET-004 | Manual, AI, template, and import authoring all feed equivalent proposal records. |
