---
owner: Usman Hussain
status: for_gate_3_review
created: 2026-06-14
updated: 2026-06-14
metadata_standard: esbla_file_metadata_standard_v1
---

# Repo-Grounded FFET Registry

- Subphase: `6.5H`
- FFET count: `16`
- Execution authorization: `false` for every FFET

| FFET | Capability | Dependencies | MCR |
| --- | --- | --- | --- |
| `P65H-FFET-001` | Composer screen contract pack | P65A-FFET-006, P65D-FFET-001, P65G-FFET-008 | All Composer UI surfaces have screen contracts before frontend implementation. |
| `P65H-FFET-002` | Setup Wizard frontend | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | Browser proof shows tenant admin can start from template with required states. |
| `P65H-FFET-003` | Organization View canvas/form parity | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | Browser proof shows organization edits work through canvas and form/list fallback. |
| `P65H-FFET-004` | Workflow View canvas/form parity | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | Browser proof shows workflow edits work through canvas and form/list fallback. |
| `P65H-FFET-005` | Policy and Permission View | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI shows permission consequences and blocks unsafe publish. |
| `P65H-FFET-006` | Delegation View | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI shows delegation scope, consent, fallback, and audit consequences. |
| `P65H-FFET-007` | Agreement and Split Rule View | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI distinguishes draft agreement from binding acceptance and shows split consequences. |
| `P65H-FFET-008` | External Connections View | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI shows credential/provider state without exposing raw secrets. |
| `P65H-FFET-009` | AI Proposal Panel | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI proves AI proposal enters pipeline and cannot directly execute. |
| `P65H-FFET-010` | Test Shadow Debug Replay View | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI shows simulation, shadow divergence, validation failures, and replay trace. |
| `P65H-FFET-011` | Publish View | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI shows human preview, risk, cost, and missing requirements before publish. |
| `P65H-FFET-012` | Run Monitor View | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI shows live state, stuck recovery, evidence, and audit links. |
| `P65H-FFET-013` | Export Import View | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | UI proves import-to-draft, symbolic remap, and no-surprise export states. |
| `P65H-FFET-014` | Responsive accessibility visual proof | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008, P65H-FFET-001 | Screenshots prove required states, responsive posture, and accessibility basics. |
| `P65H-FFET-015` | Composer final visual audit | P65A-FFET-006, P65B-FFET-008, P65D-FFET-001, P65G-FFET-008 | Final screenshot bundle maps every visual assertion to evidence. |
| `P65H-FFET-016` | Composer frontend navigation and activation mount | P65A-FFET-006, P65B-FFET-008, P65H-FFET-001 | Composer navigation appears only when activated and routes to the approved Composer shell without bypassing screen contracts. |
