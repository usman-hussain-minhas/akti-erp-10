# AKTI ERP Phase 2 Autonomous Runbook v1

Status: active_v3_after_p2_ctrl_001
Recommended repo path: `docs/process/AKTI_ERP_Phase_2_Autonomous_Runbook_v1.md`

## 1. Purpose

This runbook is the operational script for Codex during the AKTI ERP Phase 2 Autonomous Execution Run. It operationalizes the active execution pack and the v3 autonomous queue adopted by P2-CTRL-001.

## 2. Operating Principle

ChatGPT designs and audits. Codex validates and executes. The coordinator transfers outputs between them. Codex executes only the approved active queue in the execution pack.

## 3. Active Run Contract

Codex must use:

`docs/process/AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json`

as the active run contract. If the execution pack conflicts with Prisma, contracts, module manifests, generated registry, ADRs, or AGENTS.md, Codex must stop and report the conflict.

The active control docs define queue, boundaries, decision rules, and hard gates. They are a stable run contract, not a live per-ticket execution ledger.

Goal start anchor: `P2A-002`.

Tickets completed before this goal start: `P2-000`, `P2A-001` (`944d0c84badbf9633c12c395f8e50cb08cc96571`), and `P2-VAL-001` (`8b8b691227d6fff12c2bb7c8017e11bf49041e8b`).

## 4. Branch

Use only:

`phase2/autonomous-full-run`

Branch base: current clean `main` after Phase 2 control-document corrections are merged. Final Phase 1 implementation commit is `18f497d`; Phase 2 control-document merge commit is `f02ac95`.

Rules:

- Never work on `main` for the autonomous controlled branch run.
- Never merge to `main`.
- Commit per ticket on the operational branch only.
- If the branch becomes messy, stop and report.

## 5. V3 Queue

| Ticket | Status |
| --- | --- |
| P2-000 - Validate Phase 2 control documents | COMPLETE |
| P2A-001 - Create Engagement Gateway Lite contracts and manifest boundary | COMPLETE |
| P2-VAL-001 - Add Phase 2-aware registry verification | COMPLETE |
| P2A-002 - Engagement Gateway persistence decision | AUTONOMOUS_DECISION_RULE |
| P2A-003 - Implement Engagement Gateway Lite API/service foundation | AUTONOMOUS_AFTER_PREVIOUS |
| P2A-GATE - Phase 2A validation gate | AUTONOMOUS_AFTER_PREVIOUS |
| P2-VAL-002 - Add Phase 2 screen-contract validation | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-001A - Lead Desk contract and capability boundary | AUTONOMOUS_DECISION_RULE |
| P2B-001B - Lead Desk screen contracts | AUTONOMOUS_DECISION_RULE |
| P2B-002A - Lead Desk data model decision | AUTONOMOUS_DECISION_RULE |
| P2B-002B - Lead Desk schema and registry foundation | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-003A - Lead Desk create/list/detail API | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-003B - Lead Desk status/update API | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-003C - Lead Desk assignment API | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-004A - Lead Desk list/inbox frontend | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-004B - Lead Desk detail frontend | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-004C - Lead Desk create and assignment frontend | AUTONOMOUS_AFTER_PREVIOUS |
| P2B-GATE - Phase 2B validation gate | AUTONOMOUS_AFTER_PREVIOUS |
| P2C-001 - WhatsApp integration contracts through gateway | AUTONOMOUS_AFTER_PREVIOUS |
| P2C-002 - Gateway-mediated WhatsApp stub integration | AUTONOMOUS_AFTER_PREVIOUS |
| P2C-GATE - Final Phase 2 validation gate | AUTONOMOUS_AFTER_PREVIOUS |

Status meanings:

- COMPLETE: already satisfied in repo history.
- AUTONOMOUS_READY: may run next after normal prechecks.
- AUTONOMOUS_AFTER_PREVIOUS: may run after prior ticket passes validation, self-audit, artifacts, journal, and commit.
- AUTONOMOUS_DECISION_RULE: may continue only when the ticket's autonomous decision rule passes.
- GOVERNANCE_BLOCKED: must not run until governance condition is resolved.

## 6. Before Starting `/goal`

Codex must confirm:

- current branch is `phase2/autonomous-full-run`
- worktree is clean except ignored artifacts
- active control docs exist
- AGENTS.md and ADRs exist
- execution pack is readable and has active queue version v3
- package scripts are available or missing scripts are reported honestly
- no production secrets are required or accessed
- execution environment is approved safe mode: not danger-full-access, not unrestricted network, not approval-never
- goal start ticket is `P2A-002`
- P2-VAL-001 precedes schema-changing tickets
- P2-VAL-002 precedes Lead Desk screen-contract tickets
- Phase 2C is unlocked only for stub/non-production implementation under ADR-0003 formal exception

## 7. Goal Command

Use this after the execution pack is validated:

```text
/goal Execute the approved Phase 2 v3 autonomous execution pack from docs/process/AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json on branch phase2/autonomous-full-run. Start at P2A-002. Complete the approved ticket queue in order. Apply each autonomous decision rule, validate, self-audit, create artifacts, update the journal, and commit each ticket on the operational branch. Never merge to main. Never invent scope. Stop if any hard gate triggers.
```

## 8. Per-Ticket Procedure

For each ticket:

1. Read the current ticket only.
2. Read required source files.
3. Confirm branch is `phase2/autonomous-full-run`.
4. Confirm working tree is clean except ignored artifacts.
5. Produce an exact-file implementation plan from any broad allowed glob before editing.
6. If the ticket is AUTONOMOUS_DECISION_RULE, apply the encoded decision rule before editing.
7. Implement only the exact-file plan derived from `files_expected_to_change`.
8. Stop if any forbidden or unexpected file must change.
9. Do not mutate active Phase 2 control documents unless the active ticket is an explicit control-document correction.
10. Run ticket validation.
11. Run full validation if ticket touches schema, registry, contracts, permissions, Gatekeeper, runtime boundary, or frontend build.
12. Self-audit: no scope creep, hardcoded tenant/role/user/campus assumptions, fake data, TODO placeholders, direct Lead Desk to WhatsApp/Meta call, or weakened tests.
13. Create ticket artifacts before commit.
14. Append run journal.
15. Commit only ticket-approved files.
16. Continue to next ticket or stop.

Runtime progress during `/goal` is derived from:

- git commit history
- `codex-review/phase2-autonomous-full-run/autonomous-run-journal.md`
- `codex-review/phase2-autonomous-full-run/ticket-artifacts/<ticket-id>/`
- optional `codex-review/phase2-autonomous-full-run/run-state.json`
- active v3 queue order

If these materially conflict, stop with `RUN_STATE_CONFLICT`.

Do not stop after each successful ticket only because `completed_tickets`, `completed_commits`, or `next_executable_ticket` fields are stale.

Autonomous validation repair policy during `/goal`:

- Codex may auto-repair deterministic validation failures (schema/type/test/lint) when the fix stays inside active ticket scope.
- Auto-repair requires no new dependency, no architecture/control-doc/ADR mutation (except explicit control-doc correction ticket), no invented business rule/capability/permission/module/event/role/screen/workflow/status, and no forbidden-file edits.
- Auto-repairable examples include import/export mismatch, type mismatch, Zod/schema shape mismatch, module manifest field mismatch, invalid manifest key format, duplicate action key, missing required capability key where approved capability already exists, and local test expectation mismatch caused by active ticket implementation.
- Non-repairable cases are hard stops: file outside ticket scope, new dependency, disallowed Prisma/schema change, unclear migration strategy, new business rule, invented capability/permission/role/module/event/screen, secret or external credential use, direct WhatsApp/Meta coupling, frontend without screen contract, fake data, or hardcoded tenant/campus/role/user/org assumptions.
- Repair budget is up to 3 autonomous repair cycles per ticket. If still failing after 3 cycles, stop with `VALIDATION_FAILED`. If a true hard gate appears, stop immediately.
- Do not report to user for each repair attempt. Summarize repair attempts in the ticket summary artifact. Report only when repair budget is exhausted, hard gate triggers, phase/final gate is reached, or run completes.

## 9. Decision-Rule Execution

- P2A-002: defer persistence if P2A-001 contracts do not require it; implement exact derivable models only after P2-VAL-001; stop if unclear.
- P2B-001A: Lead Desk contracts cover only lead intake, list, detail, status, and assignment.
- P2B-001B: screen contracts cover only lead inbox/list, detail, create, and assignment/status action screens.
- P2B-002A: derive data model only from approved contracts and screen contracts; stop if the exact model set or migration policy is unclear.
- P2B-002B: implement schema/registry only after P2B-002A and P2-VAL-001.
- P2B API tickets: implement only APIs backed by approved contracts/models; no direct WhatsApp/Meta, unapproved workflows, fake data, or hardcoded tenant/campus/role/user/org assumptions.
- P2B frontend tickets: implement only approved screen-contract screens with required empty/loading/error/permission-denied states.
- P2B-GATE: if validation passes, continue automatically into Phase 2C; if validation fails, stop.
- P2C tickets: run only under ADR-0003 stub/non-production exception limits: no production credentials, no real outbound WhatsApp messages, no direct Lead Desk-to-Meta/WhatsApp coupling, and all transport through Engagement Gateway Lite.

## 10. Artifact Procedure

For each future ticket create lightweight artifacts before commit:

```text
codex-review/phase2-autonomous-full-run/ticket-artifacts/<ticket-id>/<ticket-id>-summary.md
codex-review/phase2-autonomous-full-run/ticket-artifacts/<ticket-id>/<ticket-id>-changed-files.zip
```

Append:

```text
codex-review/phase2-autonomous-full-run/autonomous-run-journal.md
```

Heavy audit artifacts are required at `P2A-GATE`, `P2B-GATE`, and final branch audit only.

P2A-001 artifacts were backfilled after commit `944d0c84badbf9633c12c395f8e50cb08cc96571` because the implementation commit lacked artifacts. Do not rerun P2A-001. If `codex-review` is ignored, artifacts must still be included in the final audit package and reported in the journal.

If a ticket has no tracked source-file changes by design (artifact-only ticket), create artifacts, update journal/runtime state, record `no tracked commit required`, and continue.

## 11. Commit Procedure

- Stage only files allowed by the active ticket.
- Use the exact `commit_message` from the ticket.
- Do not include unrelated changes.
- Do not commit failed validation unless the ticket is explicitly a failure report artifact.
- Do not merge.
- Push is allowed only to `phase2/autonomous-full-run`. Never push or merge `main`. Never open PR unless explicitly asked.

## 12. Hard Gates

Stop if:

- Unsafe execution environment
- Required file outside exact ticket scope
- Validation failure twice
- New dependency required
- Secret access required
- Invented business rule, capability, permission, event, module, role, or screen required
- Unclear migration strategy
- Direct WhatsApp/Meta coupling
- Frontend without approved screen contract
- Fake dashboards or fake operational data
- Hardcoded tenant/campus/role/user assumptions
- RUN_STATE_CONFLICT
- Final Phase 2 gate reached (`P2C-GATE`)
- Final run complete

When stopping, report ticket ID, reason, changed files, validation status, last successful commit, and recommended next action.

## 13. Final Audit Package

At completion create:

```text
codex-review/phase2-autonomous-full-run/final-branch-audit/
```

Include source zip from branch HEAD, commit log, file list, checksums, validation summary, autonomous run journal, checkpoint summaries, changed-files-by-ticket manifest, stop-condition report, known gaps, and merge recommendation. Then stop.

## 14. What Codex Must Never Do

- never merge to main
- never run on main for this controlled branch run
- never invent scope
- never bypass AGENTS.md, ADRs, contracts, Prisma, or execution pack
- never use or inspect production secrets
- never run autonomous execution in danger-full-access, unrestricted-network, or approval-never mode unless explicitly approved before the run
- never weaken tests to pass
- never create fake dashboards
- never implement frontend without screen contract
- never directly connect Lead Desk to WhatsApp/Meta
- never hide failed validation

## 15. Coordinator Handoff

The coordinator will bring Codex outputs back to ChatGPT for audit. Codex should produce compact, evidence-based summaries and keep full logs in artifacts.
