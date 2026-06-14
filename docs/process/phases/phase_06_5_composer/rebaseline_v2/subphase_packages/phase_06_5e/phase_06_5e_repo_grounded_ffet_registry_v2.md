---
owner: Usman Hussain
status: for_gate_3_review
created: 2026-06-14
updated: 2026-06-14
metadata_standard: esbla_file_metadata_standard_v1
---

# Repo-Grounded FFET Registry

- Subphase: `6.5E`
- FFET count: `9`
- Execution authorization: `false` for every FFET

| FFET | Capability | Dependencies | MCR |
| --- | --- | --- | --- |
| `P65E-FFET-001` | Delegation grant contract | P65A-FFET-006, P65D-FFET-005 | DelegationGrant contract covers stage/workflow/workflow-tree/department scopes. |
| `P65E-FFET-002` | Delegation lifecycle state machine | P65A-FFET-006, P65B-FFET-008, P65D-FFET-005 | Lifecycle tests cover grant, accept, reject, revoke, and replacement. |
| `P65E-FFET-003` | Tier drop abandonment fallback | P65A-FFET-006, P65B-FFET-008, P65D-FFET-005 | Tier drop pauses invalid stages and abandonment routes to declared fallback with evidence. |
| `P65E-FFET-004` | Onward delegation Gatekeeper enforcement | P65A-FFET-006, P65B-FFET-008, P65D-FFET-005 | Onward delegation without host consent is denied and audited. |
| `P65E-FFET-005` | Structured agreement acceptance | P65A-FFET-006, P65B-FFET-008, P65D-FFET-005 | Agreement draft and binding acceptance are distinct and identity-tier gated. |
| `P65E-FFET-006` | Evidence crossing and lenses | P65A-FFET-006, P65B-FFET-008, P65D-FFET-005 | Evidence crossing writes one event with authorized lenses only. |
| `P65E-FFET-007` | Reputation protection boundary | P65A-FFET-006, P65B-FFET-008, P65D-FFET-005 | Prohibited reputation inference is blocked and audited. |
| `P65E-FFET-008` | Dispute and review scaffolding | P65A-FFET-006, P65B-FFET-008, P65D-FFET-005 | Dispute path exists for contested delegation, agreement, refund, and reversal without inventing legal outcome. |
| `P65E-FFET-009` | Sub-tenant invite guard | P65A-FFET-006, P65B-FFET-008, P65D-FFET-005 | Sub-tenant external invites require explicit host grant and audit. |
