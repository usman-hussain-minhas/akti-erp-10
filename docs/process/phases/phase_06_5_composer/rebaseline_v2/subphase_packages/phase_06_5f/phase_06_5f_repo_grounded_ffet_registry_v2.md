---
owner: Usman Hussain
status: for_gate_3_review
created: 2026-06-14
updated: 2026-06-14
metadata_standard: esbla_file_metadata_standard_v1
---

# Repo-Grounded FFET Registry

- Subphase: `6.5F`
- FFET count: `9`
- Execution authorization: `false` for every FFET

| FFET | Capability | Dependencies | MCR |
| --- | --- | --- | --- |
| `P65F-FFET-001` | Escrow composition contract | P65A-FFET-006, P65C-FFET-003, P65E-FFET-005 | Composer escrow composes existing 6B primitives and does not create payout rails. |
| `P65F-FFET-002` | Split tax refund reversal rules | P65A-FFET-006, P65B-FFET-008, P65C-FFET-003, P65E-FFET-005 | Split rules support tax/refund/reversal and no split percentage is a default. |
| `P65F-FFET-003` | Payout rail reference boundary | P65A-FFET-006, P65B-FFET-008, P65C-FFET-003, P65E-FFET-005 | Composer references existing payout adapters and does not build new rails. |
| `P65F-FFET-004` | Budget and cost honesty | P65A-FFET-006, P65B-FFET-008, P65C-FFET-003, P65E-FFET-005 | Cost forecast and P-45 warning/block behavior are visible before publish. |
| `P65F-FFET-005` | External action registration contract | P65A-FFET-006, P65C-FFET-003, P65E-FFET-005 | External action contract declares provider, timeout, retry, idempotency, and fallback. |
| `P65F-FFET-006` | Credential boundary runtime | P65A-FFET-006, P65B-FFET-008, P65C-FFET-003, P65E-FFET-005 | Raw credentials are rejected in compositions and exports. |
| `P65F-FFET-007` | Provider failure recovery | P65A-FFET-006, P65B-FFET-008, P65C-FFET-003, P65E-FFET-005 | Provider failures create audit evidence and user-visible recovery. |
| `P65F-FFET-008` | AI external action guard | P65A-FFET-006, P65B-FFET-008, P65C-FFET-003, P65E-FFET-005 | AI may propose but never execute external actions. |
| `P65F-FFET-009` | Money and external-action negative demo | P65A-FFET-006, P65B-FFET-008, P65C-FFET-003, P65E-FFET-005 | Demo proves failed payment, missing credentials, provider unavailable, and AI execution denial. |
