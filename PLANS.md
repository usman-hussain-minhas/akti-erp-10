# AKTI ERP Phase 2 Autonomous Execution Run - PLANS.md

Status: active_v3_after_p2_ctrl_001

## Purpose

This file is a human-readable roadmap for the AKTI ERP Phase 2 Autonomous Execution Run. It summarizes the active execution pack and is not the source of truth.

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
- Next executable ticket: `P2-VAL-001`
- Phase 2B uses split v3 tickets, not the old broad P2B-001 through P2B-004 queue.
- Phase 2C remains governance-blocked until ADR-0003 has a Phase 2C pilot target date or formal exception.

## Goal

Execute the approved Phase 2 v3 autonomous queue with per-ticket validation, artifacts, commits, and hard stop conditions while keeping `main` safe.

## Non-Scope

Codex must not build LMS, HR, Finance, Hiring, Certification, Website Builder, AI Content Editor, production deployment, production auth/session unless separately approved, direct Meta/WhatsApp calls from Lead Desk, or unapproved modules/capabilities/roles/events/screens.

## V3 Ticket Queue

| Ticket | Title | Status |
| --- | --- | --- |
| P2-000 | Validate Phase 2 control documents | COMPLETE |
| P2A-001 | Create Engagement Gateway Lite contracts and manifest boundary | COMPLETE |
| P2-VAL-001 | Add Phase 2-aware registry verification | AUTONOMOUS_READY |
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
| P2C-001 | WhatsApp integration contracts through gateway | GOVERNANCE_BLOCKED |
| P2C-002 | Gateway-mediated WhatsApp stub integration | GOVERNANCE_BLOCKED |
| P2C-GATE | Final Phase 2 validation gate | GOVERNANCE_BLOCKED |

## Decision Rules

- P2A-002: defer persistence if P2A-001 contracts do not require persisted gateway request state; implement exact derivable models only after P2-VAL-001; stop if unclear.
- P2B-001A: Lead Desk contracts are limited to lead intake, list, detail, status, and assignment. Exclude campaigns, finance, student lifecycle, LMS, HR, certification, direct WhatsApp, Meta, and provider concepts.
- P2B-001B: screen contracts are limited to lead inbox/list, detail, create, and assignment/status action screens. No frontend implementation.
- P2B-002A: derive data model only from approved contracts and screen contracts; proceed only if exact model set and migration policy are clear.
- P2B-002B: implement schema/registry only after P2B-002A and P2-VAL-001; stop if migration scaffolding is required but not ticketed.
- P2B API tickets: implement only APIs backed by approved contracts/models; no direct WhatsApp/Meta, unapproved status workflows, fake data, or hardcoded tenant/campus/role/user/org assumptions.
- P2B frontend tickets: implement only approved screen-contract screens with required empty/loading/error/permission-denied states; no fake dashboards or hardcoded tenant assumptions.
- Phase 2C: blocked until ADR-0003 has a Phase 2C pilot target date or formal exception.

## Validation Expectations

Each ticket runs ticket-specific validation. Phase gates run the full validation ladder defined in the execution pack. Phase 2 schema tickets depend on P2-VAL-001. Lead Desk screen-contract work depends on P2-VAL-002.

## Artifact Expectations

Future tickets create file manifest, changed-files zip, validation summary, and run journal entry before commit. P2A-001 artifacts were backfilled after commit `944d0c8`; do not rerun P2A-001. Ignored `codex-review` artifacts must still be reported in the journal and included in final audit packaging.

## Stop Conditions Summary

Codex must stop for unsafe environment, unexpected file scope, unapproved dependency, secret access, active control-doc mutation outside explicit correction tickets, invented business rule/capability/permission/event/module/role/screen, unclear migration strategy, schema edit before P2-VAL-001, unexpected registry drift, direct WhatsApp/Meta coupling, frontend without screen contract, fake data, hardcoded tenant/campus/role/user assumptions, Phase 2C before ADR-0003 date/exception, validation failure twice, missing artifacts, dirty branch, or main merge attempts.

## Coordinator Note

The coordinator transfers outputs between ChatGPT and Codex. ChatGPT audits. Codex validates and executes only the approved active v3 queue.
