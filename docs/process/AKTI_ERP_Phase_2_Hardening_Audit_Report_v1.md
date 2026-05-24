# AKTI ERP Phase 2 Hardening Audit Report

**Status:** control-document cleanup ready for Phase 2 hardening implementation prompt
**Active repo path:** `docs/process/AKTI_ERP_Phase_2_Hardening_Audit_Report_v1.md`
**Companion file:** `docs/process/AKTI_ERP_Phase_2_Hardening_Ticket_Pack_v1.json`
**Revision label:** v1.3; active repo filename remains v1.

---

## 1. Purpose

This report preserves the Phase 2 hardening findings and defines the corrected hardening direction required to make the Phase 2 branch concrete, verified, internally consistent, audit-backed, and merge-ready within approved Phase 2 scope.

The companion ticket pack defines a full autonomous hardening queue from `P2H-000` through `P2H-014`.

`P2H-014` is the final external audit package ticket.

---

## 2. Control-Document Corrections Applied

The hardening control documents have been normalized so the active repo authority is unambiguous:

1. Active repo filenames remain:
   - `docs/process/AKTI_ERP_Phase_2_Hardening_Audit_Report_v1.md`
   - `docs/process/AKTI_ERP_Phase_2_Hardening_Ticket_Pack_v1.json`
2. Revision labels such as v1.3 are metadata only and do not change active repo filenames.
3. The hardening queue explicitly runs from `P2H-000` through `P2H-014`.
4. `P2H-014` is the final external audit package ticket.
5. `P2H-000` must make the hardening docs tracked repo authority before implementation tickets run.
6. Source-file revisions such as `_v1_1` are source context only and must not remain as parallel active authority.
7. Any Phase 2 postmortem unavailable in the repo is source-file context only, not active repo authority.
8. Pass groupings are explanatory only; `ordered_ticket_queue` is authoritative.
9. Broad globs are inspection hints only and must become exact-file implementation plans before edits.
10. Final audit package output must be generated from committed branch `HEAD`.
11. Ignored `codex-review/` final artifacts do not require a source commit unless a tracked closure report is intentionally created at `docs/process/AKTI_ERP_Phase_2_Hardening_Closure_Report_v1.md`.
12. `P2H-014` must capture `SHORT_SHA` before using it and must check `unzip` plus checksum tooling or document the fallback.
13. `P2H-012` must replace the current `apps/web` scaffold test behavior with meaningful no-new-dependency tests or stop for explicit dependency/tooling approval.
14. `P2H-005` must require ADR/subdecision handling if outbox retry/dead-letter semantics materially alter architecture beyond foundation metadata.

---

## 3. Source-of-Truth Basis

This report follows the AKTI ERP authority order:

1. `prisma/schema.prisma`
2. `packages/contracts`
3. module manifests
4. `generated/entity-registry.generated.json`
5. `docs/adr/*`
6. `AGENTS.md`
7. process documents
8. `PLANS.md`
9. chat prompts and uploaded files as supporting context only

If this report conflicts with higher-ranked repo sources, the higher-ranked source wins.

---

## 4. Executive Verdict

**Phase 2 run result:** completed on `phase2/autonomous-full-run`.
**Phase 2 implementation status:** requires hardening before merge-readiness.
**Branch value:** preserve and harden; do not discard.

The hardening target is:

```text
A concrete, verified, runtime-proven, audit-backed, merge-ready Phase 2 branch within approved Phase 2 scope.
```

---

## 5. Corrected Hardening Queue

The ordered ticket queue is authoritative and must be executed exactly in this order.

Pass groupings are explanatory only.

| Ticket | Title | Purpose |
| --- | --- | --- |
| P2H-000 | Housekeeping, source-doc tracking, and baseline lock | Make hardening docs tracked repo authority and lock baseline. |
| P2H-001 | Prisma migration policy and non-destructive baseline | Resolve migration policy before schema edits. |
| P2H-002 | Phase 2 CI and validation gate | Make CI/local validation Phase 2-aware. |
| P2H-003 | Manifest-driven module and capability seed path | Seed modules/capabilities from manifests. |
| P2H-004 | Gatekeeper support for Phase 2 capabilities | Enforce Phase 2 high-risk capabilities through real Gatekeeper path. |
| P2H-005 | Outbox idempotency retry and dead-letter foundation | Add durable outbox metadata with ADR guard if semantics change. |
| P2H-006 | Runtime module events aligned with manifests and outbox | Emit declared module events and prove them with tests. |
| P2H-007 | Lead Desk scope model and schema foundation | Add schema support for assigned_records and own_unit scope. |
| P2H-008 | Real Lead Desk scope enforcement | Enforce tenant, assigned_records, and own_unit scope at runtime. |
| P2H-009 | Lead Desk DB relation integrity and assignment history | Strengthen actor/assignee/history integrity. |
| P2H-010 | Engagement Gateway request traceability and persistence | Persist or formally bound gateway request identity. |
| P2H-011 | Frontend actor-context hardening | Remove actor identity from URLs and centralize temporary context. |
| P2H-012 | Real frontend tests for Lead Desk screens | Replace scaffold frontend tests with meaningful tests or stop if tooling requires approval. |
| P2H-013 | Screen contract lifecycle and validation policy | Align implemented screens with lifecycle validation. |
| P2H-014 | Final Phase 2 hardening gate and external audit package | Validate all hardening and package committed branch `HEAD` for audit. |

---

## 6. Stronger-Path Default

Within approved Phase 2 scope, the hardening run must choose the stronger implementation path by default:

- implement real scope enforcement rather than narrowing permissions to organization-only;
- implement manifest-driven capability seeding rather than manual DB assumptions;
- implement module-specific runtime events rather than relying only on generic mutation events;
- implement outbox durability fields rather than deferring all reliability metadata;
- implement meaningful frontend tests rather than scaffold placeholders.

The stronger path must be derived from repo authority: Prisma, contracts, manifests, generated registry, ADRs, and active process docs. If a stronger path requires a new business rule, capability, permission, role, event, screen, module, dependency, secret, or architecture decision, Codex must stop.

Documented deferral is allowed only when behavior is truly outside Phase 2 scope or requires production-only infrastructure such as real WhatsApp credentials, production auth/session, production deployment, or real outbound BSP delivery.

---

## 7. Final Acceptance Rule

The branch is not merge-ready until:

- all tickets `P2H-000` through `P2H-014` are closed in order;
- full validation passes;
- no direct Lead Desk to Meta/WhatsApp coupling exists;
- source-of-truth artifacts align;
- final external audit package is generated from committed branch `HEAD`;
- excluded local/build/secret paths are absent from the source ZIP;
- known deferrals are explicit and bounded.
