# AKTI ERP Phase 2 Autonomous Execution Run — PLANS.md

Status: draft_for_codex_plan_mode_validation_after_control_doc_corrections

## Purpose

This file is a human-readable roadmap for the AKTI ERP Phase 2 Autonomous Execution Run.

It summarizes the approved execution pack. It is not the source of truth.

## Authority Notice

PLANS.md is a human-readable summary only.

It does not override:

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

## Goal

Validate whether Codex can execute one full approved Phase 2 ticket queue autonomously, with per-ticket validation, artifacts, commits, and stop conditions, while keeping `main` safe.

## Scope

Phase 2 includes:

1. Phase 2A — Engagement Gateway Lite
2. Phase 2B — Lead Desk Core
3. Phase 2C — WhatsApp Lead Desk Integration through Engagement Gateway Lite

## Non-Scope

Codex must not build:

- LMS
- HR
- Finance
- Hiring
- Certification
- Website Builder
- AI Content Editor
- Production deployment
- Production auth/session unless separately approved
- Direct Meta/WhatsApp API calls from Lead Desk
- Unapproved modules, capabilities, roles, events, or screens

## Required Control Files

The run depends on:

```text
docs/process/AKTI_ERP_Phase_2_Autonomous_Branch_Trial_Plan_v1.json
docs/process/AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json
docs/process/AKTI_ERP_Phase_2_Autonomous_Runbook_v1.md
PLANS.md
```

## Current Ticket Queue Summary

### Setup

- P2-000 — Validate autonomous Phase 2 control documents

### Phase 2A — Engagement Gateway Lite

- P2A-001 — Create Engagement Gateway Lite contracts and manifest boundary
- P2-VAL-001 — Add Phase 2-aware registry verification path
- P2A-002 — Add Engagement Gateway Lite data model if required by approved contract
- P2A-003 — Implement Engagement Gateway Lite API/service foundation
- P2A-GATE — Phase 2A validation gate

### Phase 2B — Lead Desk Core

- P2-VAL-002 — Add Phase 2 screen-contract validation support
- P2B-001 — Create Lead Desk Core contracts and screen contracts
- P2B-002 — Add Lead Desk Core data foundation
- P2B-003 — Implement Lead Desk Core API foundation
- P2B-004 — Implement Lead Desk frontend screens from approved screen contracts
- P2B-GATE — Phase 2B validation gate

### Phase 2C — WhatsApp Lead Desk Integration

- P2C-001 — Create WhatsApp integration contracts through Engagement Gateway Lite
- P2C-002 — Implement gateway-mediated WhatsApp stub integration
- P2C-GATE — Final Phase 2 validation and audit package

## Validation Expectations

Each ticket runs ticket-specific validation.

Phase gates run the full validation ladder defined in the execution pack. Phase 2 schema tickets depend on `P2-VAL-001` and must not rely on `pnpm registry:verify:phase1` as the final Phase 2 schema verifier. Lead Desk screen-contract work depends on `P2-VAL-002`.

## Artifact Expectations

Each ticket creates:

- file manifest
- changed-files zip
- validation summary
- run journal entry

Final completion creates:

- exact-file implementation plan before editing when a ticket starts from a broad allowed glob
- final branch audit package
- source zip
- commit log
- file list
- checksums
- validation summary
- known gaps
- merge recommendation

## Stop Conditions Summary

Codex must stop if it needs to:

- invent scope
- change unexpected files
- add unapproved dependencies
- change Prisma/registry/contracts unexpectedly
- implement frontend without screen contract
- directly connect Lead Desk to WhatsApp/Meta
- weaken tests
- ignore validation failures
- merge to main
- mutate active Phase 2 control documents during autonomous implementation tickets
- run Phase 2C before ADR-0003 has a Phase 2C pilot target date or formal exception
- run in danger-full-access, unrestricted-network, or approval-never mode without explicit approval

## Coordinator Note

The coordinator transfers outputs between ChatGPT and Codex. ChatGPT audits. Codex validates and executes. Codex only runs the approved ticket queue.
