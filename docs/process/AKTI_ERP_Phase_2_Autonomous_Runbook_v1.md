# AKTI ERP Phase 2 Autonomous Runbook v1

Status: draft_for_codex_plan_mode_validation_after_control_doc_corrections
Recommended repo path: `docs/process/AKTI_ERP_Phase_2_Autonomous_Runbook_v1.md`

## 1. Purpose

This runbook is the operational script for Codex during the AKTI ERP Phase 2 Autonomous Execution Run.

It does not define architecture by itself. It operationalizes the approved execution pack.

## 2. Operating Principle

ChatGPT designs and audits. Codex validates and executes. The coordinator transfers outputs between them. Codex executes only the approved ticket queue.

## 3. Active Run Contract

Codex must use:

`docs/process/AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json`

as the active run contract after validating it against the repo.

If the execution pack conflicts with Prisma, contracts, module manifests, generated registry, or ADRs, Codex must stop and report the conflict.

## 4. Branch

Use only:

`phase2/autonomous-full-run`

Branch base: current clean `main` after Phase 2 control-document corrections are merged. Final Phase 1 implementation commit is `18f497d`; Phase 2 control-document merge commit is `f02ac95`.

Rules:

- Never work on `main` for the autonomous controlled branch run.
- Never merge to `main`.
- Commit per ticket on the operational branch only.
- If the branch becomes messy, stop and report.

## 5. Before Starting `/goal`

Codex must confirm:

- current branch is correct or can create the operational branch from accepted main
- worktree is clean
- control docs exist
- AGENTS.md exists
- ADRs exist
- execution pack is readable
- package scripts are available or missing scripts are reported honestly
- no uncommitted changes except ignored artifacts
- no production secrets are required
- execution environment is approved safe mode: not danger-full-access, not unrestricted network, not approval-never
- `P2-VAL-001` and `P2-VAL-002` are scheduled before dependent schema and screen-contract tickets

## 6. Goal Command

Use this after the execution pack is validated:

```text
/goal Execute the approved Phase 2 autonomous execution pack from docs/process/AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json on branch phase2/autonomous-full-run. Complete the approved ticket queue in order. Validate, self-audit, create artifacts, and commit each ticket on the operational branch. Never merge to main. Never invent scope. Stop if any stop condition triggers.
```

## 7. Per-Ticket Procedure

For each ticket:

1. Read current ticket only.
2. Read required source files.
3. Confirm branch is `phase2/autonomous-full-run`.
4. Confirm working tree is clean except ignored artifacts.
5. Produce an exact-file implementation plan from any broad allowed glob before editing.
6. Implement only the exact-file plan derived from `files_expected_to_change`.
7. Stop if any forbidden or unexpected file must change.
8. Do not mutate active Phase 2 control documents unless the active ticket is an explicit control-document correction.
9. Run ticket validation.
10. Run full validation if ticket touches schema, registry, contracts, permissions, Gatekeeper, runtime boundary, or frontend build.
11. Self-audit:
   - no scope creep
   - no hardcoded tenant/role/user/campus assumptions
   - no fake data
   - no TODO placeholders
   - no direct Lead Desk to WhatsApp/Meta call
   - no weakened tests
12. Create ticket artifact.
13. Append run journal.
14. Commit only ticket-approved files.
15. Continue to next ticket or stop.

## 8. Artifact Procedure

For each ticket create:

```text
codex-review/phase2-autonomous-full-run/ticket-artifacts/<ticket-id>/<ticket-id>-file-manifest.md
codex-review/phase2-autonomous-full-run/ticket-artifacts/<ticket-id>/<ticket-id>-changed-files.zip
codex-review/phase2-autonomous-full-run/ticket-artifacts/<ticket-id>/<ticket-id>-validation-summary.md
```

Append:

```text
codex-review/phase2-autonomous-full-run/autonomous-run-journal.md
```

After every 3 tickets create:

```text
codex-review/phase2-autonomous-full-run/checkpoints/checkpoint-<n>.md
```

## 9. Commit Procedure

- Stage only files allowed by the active ticket.
- Use the exact `commit_message` from the ticket.
- Do not include unrelated changes.
- Do not commit failed validation unless the ticket is explicitly a failure report artifact.
- Do not merge.

## 10. Stop Conditions

Stop if:

- validation fails twice on same ticket
- required change touches unexpected files
- new dependency is required but unapproved
- Prisma change required but not ticketed
- registry changes unexpectedly
- Phase 2 schema ticket starts before `P2-VAL-001` provides a Phase 2-aware registry verifier
- Lead Desk screen-contract ticket starts before `P2-VAL-002` provides Phase 2 screen-contract validation support
- contract or screen contract change required but not ticketed
- Codex needs to invent capability, role, permission, event, module, screen, or business rule
- frontend screen lacks screen contract
- Lead Desk attempts direct WhatsApp/Meta API call
- Phase 2C starts before ADR-0003 has a Phase 2C pilot target date or formal exception
- runtime smoke check fails
- artifact creation fails
- branch is dirty at ticket start
- context/rate budget is too low for next ticket
- ticket queue is complete

When stopping, report:

- ticket ID
- reason
- changed files
- validation status
- last successful commit
- recommended next action

## 11. Final Audit Package

At completion create:

```text
codex-review/phase2-autonomous-full-run/final-branch-audit/
```

Include:

- source zip from branch HEAD
- commit log
- file list
- checksums
- validation summary
- autonomous run journal
- checkpoint summaries
- changed-files-by-ticket manifest
- stop-condition report
- known gaps
- merge recommendation

Then stop.

## 12. What Codex Must Never Do

- never merge to main
- never run on main for this controlled branch run
- never invent scope
- never bypass AGENTS.md, ADRs, contracts, Prisma, or execution pack
- never use production secrets
- never run autonomous execution in danger-full-access, unrestricted-network, or approval-never mode unless explicitly approved before the run
- never weaken tests to pass
- never create fake dashboards
- never implement frontend without screen contract
- never directly connect Lead Desk to WhatsApp/Meta
- never hide failed validation

## 13. Coordinator Handoff

The coordinator will bring Codex outputs back to ChatGPT for audit. Codex should produce compact, evidence-based summaries and keep full logs in artifacts.
