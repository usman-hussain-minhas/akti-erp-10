# AKTI ERP Phase 2 Autonomous Execution Run - PLANS.md

Status: active_v3_after_p2_ctrl_001

## Purpose

This file is a human-readable roadmap for the AKTI ERP Phase 2 Autonomous Execution Run. It summarizes the active execution pack and is not the source of truth.

## Runtime State Model

The active control docs define the approved queue, boundaries, decision rules, and hard gates. They are the stable run contract, not the live execution ledger.

During `/goal`, runtime progress is derived from:

- git commit history
- `codex-review/phase2-autonomous-full-run/autonomous-run-journal.md`
- `codex-review/phase2-autonomous-full-run/ticket-artifacts/<ticket-id>/`
- optional `codex-review/phase2-autonomous-full-run/run-state.json`
- active v3 queue order

If these sources conflict materially, Codex must stop with `RUN_STATE_CONFLICT`.

## Authority Notice

PLANS.md does not override:

1. `prisma/schema.prisma`
2. `packages/contracts`
3. module manifests
4. `generated/entity-registry.generated.json`
5. `docs/adr/*`
6. `AGENTS.md`
7. `docs/process/AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json`
8. `docs/process/AKTI_ERP_Phase_2_Autonomous_Runbook_v1.md`

If conflict exists, the higher-ranked source wins.

## Run Name

AKTI ERP Phase 2 Autonomous Execution Run

## Branch

`phase2/autonomous-full-run`

Branch base: current clean `main` after Phase 2 control-document corrections are merged.

Reference commits:

- Final Phase 1 implementation commit: `18f497d P1H-FINAL harden access reads and capability duplicates`
- Phase 2 control-document merge commit: `f02ac95 Merge pull request #1 from usman-hussain-minhas/chore/phase2-control-docs`
- P2A-001 implementation commit: `944d0c8 P2A-001 add engagement gateway contracts`

## Current Status

- Active queue version: v3
- P2-000: COMPLETE
- P2A-001: COMPLETE
- P2-VAL-001: COMPLETE
- Goal start ticket: `P2A-002`
- Phase 2B uses split v3 tickets, not the old broad P2B-001 through P2B-004 queue.
- Phase 2C is unlocked for stub/non-production execution under the ADR-0003 formal exception recorded on 2026-05-24.

## Goal

Execute the approved Phase 2 v3 autonomous queue with per-ticket validation, artifacts, commits, and hard stop conditions while keeping `main` safe.

## Non-Scope

Codex must not build LMS, HR, Finance, Hiring, Certification, Website Builder, AI Content Editor, production deployment, production auth/session unless separately approved, direct Meta/WhatsApp calls from Lead Desk, or unapproved modules/capabilities/roles/events/screens.

## V3 Ticket Queue

| Ticket | Title | Status |
| --- | --- | --- |
| P2-000 | Validate Phase 2 control documents | COMPLETE |
| P2A-001 | Create Engagement Gateway Lite contracts and manifest boundary | COMPLETE |
| P2-VAL-001 | Add Phase 2-aware registry verification | COMPLETE |
| P2A-002 | Engagement Gateway persistence decision | AUTONOMOUS_DECISION_RULE |
| P2A-003 | Implement Engagement Gateway Lite API/service foundation | AUTONOMOUS_AFTER_PREVIOUS |
| P2A-GATE | Phase 2A validation gate | AUTONOMOUS_AFTER_PREVIOUS |
| P2-VAL-002 | Add Phase 2 screen-contract validation | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-001A | Lead Desk contract and capability boundary | AUTONOMOUS_DECISION_RULE |
| P2B-001B | Lead Desk screen contracts | AUTONOMOUS_DECISION_RULE |
| P2B-002A | Lead Desk data model decision | AUTONOMOUS_DECISION_RULE |
| P2B-002B | Lead Desk schema and registry foundation | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-003A | Lead Desk create/list/detail API | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-003B | Lead Desk status/update API | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-003C | Lead Desk assignment API | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-004A | Lead Desk list/inbox frontend | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-004B | Lead Desk detail frontend | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-004C | Lead Desk create and assignment frontend | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-GATE | Phase 2B validation gate | AUTONOMOUS_AFTER_PREVIOUS |
| P2C-001 | WhatsApp integration contracts through gateway | AUTONOMOUS_AFTER_PREVIOUS |
| P2C-002 | Gateway-mediated WhatsApp stub integration | AUTONOMOUS_AFTER_PREVIOUS |
| P2C-GATE | Final Phase 2 validation gate | AUTONOMOUS_AFTER_PREVIOUS |

## Decision Rules

- P2A-002: defer persistence if P2A-001 contracts do not require persisted gateway request state; implement exact derivable models only after P2-VAL-001; stop if unclear.
- P2B-001A: Lead Desk contracts are limited to lead intake, list, detail, status, and assignment. Exclude campaigns, finance, student lifecycle, LMS, HR, certification, direct WhatsApp, Meta, and provider concepts.
- P2B-001B: screen contracts are limited to lead inbox/list, detail, create, and assignment/status action screens. No frontend implementation.
- P2B-002A: derive data model only from approved contracts and screen contracts; proceed only if exact model set and migration policy are clear.
- P2B-002B: implement schema/registry only after P2B-002A and P2-VAL-001; stop if migration scaffolding is required but not ticketed.
- P2B API tickets: implement only APIs backed by approved contracts/models; no direct WhatsApp/Meta, unapproved status workflows, fake data, or hardcoded tenant/campus/role/user/org assumptions.
- P2B frontend tickets: implement only approved screen-contract screens with required empty/loading/error/permission-denied states; no fake dashboards or hardcoded tenant assumptions.
- P2B-GATE: if validation passes, continue automatically into Phase 2C; if validation fails, stop.
- Phase 2C: allowed only as stub/non-production under ADR-0003 formal exception; no production credentials, no real outbound WhatsApp messages, no direct Lead Desk-to-Meta/WhatsApp coupling, and all transport through Engagement Gateway Lite.

## Validation Expectations

Each ticket runs ticket-specific validation. Phase gates run the full validation ladder defined in the execution pack. Phase 2 schema tickets depend on P2-VAL-001. Lead Desk screen-contract work depends on P2-VAL-002.

## Autonomous Loop Policy

Codex may continue automatically to the next ticket when all are true:

- exact-file plan fits active ticket scope
- implementation stays within allowed files
- validation passes
- self-audit passes
- lightweight artifacts are created
- journal/runtime state is updated
- commit succeeds, or no tracked commit is required
- no hard gate triggers

Control-doc progress fields are bootstrap/reference metadata only. Codex must not stop after each successful ticket only because those fields are no longer current.

Codex may run complete Phase 2 autonomously from `P2-VAL-002` through `P2C-GATE`. Codex stops only on hard gate trigger, validation failure twice, `RUN_STATE_CONFLICT`, or final run completion.

## Autonomous Validation Repair Policy

Codex may automatically repair validation failures during a ticket when all are true:

- failure is deterministic from schema/type/test/lint output
- fix is limited to the active ticket's allowed files
- no new dependency is required
- no architecture/control-doc/ADR change is required, except an explicit control-doc correction ticket
- no business rule, role, permission, capability, module, event, status, workflow, or screen must be invented
- no forbidden file must change

Auto-repairable examples include:

- import/export name mismatch
- TypeScript type mismatch inside active ticket files
- Zod/schema shape mismatch
- module manifest field mismatch
- invalid manifest key format
- duplicate action key
- missing required capability key when an approved capability already exists
- local test expectation mismatch caused by active ticket implementation

Non-repairable cases must stop immediately:

- file outside active ticket scope
- new dependency
- Prisma/schema change not allowed by ticket
- migration strategy decision
- new business rule
- new capability/permission/role/module/event/screen
- secret or external credential
- direct WhatsApp/Meta coupling
- frontend without screen contract
- fake data or hardcoded tenant/campus/role/user/org assumptions

Repair budget:

- up to 3 autonomous repair cycles per ticket for local deterministic failures
- if validation still fails after 3 repair cycles, stop with `VALIDATION_FAILED`
- if any repair attempt reveals a true hard gate, stop immediately

Reporting policy:

- do not report or stop for each local repair attempt
- summarize repair attempts in the ticket summary artifact
- report to user only if repair budget is exhausted, hard gate triggers, phase/final gate is reached, or run completes

## Artifact Expectations

Per ticket, lightweight artifacts are:

- `<ticket-id>-summary.md`
- `<ticket-id>-changed-files.zip`

Heavy audit is required only at `P2A-GATE`, `P2B-GATE`, and final branch audit.

If a ticket creates only ignored artifacts and no tracked source files, create artifacts, update journal/runtime state, record `no tracked commit required`, and continue.

## Stop Conditions Summary

Codex must stop for unsafe environment, file scope breach, validation failure twice, new dependency required, secret access required, invented business rule/capability/permission/event/module/role/screen, unclear migration strategy, direct WhatsApp/Meta coupling, frontend without approved screen contract, fake data or hardcoded tenant/campus/role/user assumptions, run-state conflict, final Phase 2 gate reached (`P2C-GATE`), or final run complete.

## Push Policy

Codex may push only `phase2/autonomous-full-run`. Never push `main`. Never merge `main`. Never open PR unless explicitly asked.

## Coordinator Note

The coordinator transfers outputs between ChatGPT and Codex. ChatGPT audits. Codex validates and executes only the approved active v3 queue.
