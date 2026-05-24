# AKTI ERP Phase 2 Autonomous Runbook v1

Status: draft_for_codex_plan_mode_validation  
Recommended repo path: `docs/process/AKTI_ERP_Phase_2_Autonomous_Runbook_v1.md`

## 1. Purpose

This runbook is the operational script for Codex during the AKTI ERP Phase 2 Full Autonomous Stress Test.

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

`experiment/phase2-full-autonomous`

Rules:

- Never work on `main` for the autonomous stress test.
- Never merge to `main`.
- Commit per ticket on the experiment branch only.
- If the branch becomes messy, stop and report.

## 5. Before Starting `/goal`

Codex must confirm:

- current branch is correct or can create the experiment branch from accepted main
- worktree is clean
- control docs exist
- AGENTS.md exists
- ADRs exist
- execution pack is readable
- package scripts are available or missing scripts are reported honestly
- no uncommitted changes except ignored artifacts
- no production secrets are required

## 6. Goal Command

Use this after the execution pack is validated:

```text
/goal Execute the approved full Phase 2 autonomous stress-test pack from docs/process/AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json on branch experiment/phase2-full-autonomous. Complete the approved ticket queue in order. Validate, self-audit, create artifacts, and commit each ticket on the experiment branch. Never merge to main. Never invent scope. Stop if any stop condition triggers.
```

## 7. Per-Ticket Procedure

For each ticket:

1. Read current ticket only.
2. Read required source files.
3. Confirm branch is `experiment/phase2-full-autonomous`.
4. Confirm working tree is clean except ignored artifacts.
5. Implement only `files_expected_to_change`.
6. Stop if any forbidden or unexpected file must change.
7. Run ticket validation.
8. Run full validation if ticket touches schema, registry, contracts, permissions, Gatekeeper, runtime boundary, or frontend build.
9. Self-audit:
   - no scope creep
   - no hardcoded tenant/role/user/campus assumptions
   - no fake data
   - no TODO placeholders
   - no direct Lead Desk to WhatsApp/Meta call
   - no weakened tests
10. Create ticket artifact.
11. Append run journal.
12. Commit only ticket-approved files.
13. Continue to next ticket or stop.

## 8. Artifact Procedure

For each ticket create:

```text
codex-review/phase2-full-autonomous/ticket-artifacts/<ticket-id>/<ticket-id>-file-manifest.md
codex-review/phase2-full-autonomous/ticket-artifacts/<ticket-id>/<ticket-id>-changed-files.zip
codex-review/phase2-full-autonomous/ticket-artifacts/<ticket-id>/<ticket-id>-validation-summary.md
```

Append:

```text
codex-review/phase2-full-autonomous/autonomous-run-journal.md
```

After every 3 tickets create:

```text
codex-review/phase2-full-autonomous/checkpoints/checkpoint-<n>.md
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
- contract or screen contract change required but not ticketed
- Codex needs to invent capability, role, permission, event, module, screen, or business rule
- frontend screen lacks screen contract
- Lead Desk attempts direct WhatsApp/Meta API call
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
codex-review/phase2-full-autonomous/final-branch-audit/
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
- never run on main for this experiment
- never invent scope
- never bypass AGENTS.md, ADRs, contracts, Prisma, or execution pack
- never use production secrets
- never weaken tests to pass
- never create fake dashboards
- never implement frontend without screen contract
- never directly connect Lead Desk to WhatsApp/Meta
- never hide failed validation

## 13. Coordinator Handoff

The coordinator will bring Codex outputs back to ChatGPT for audit. Codex should produce compact, evidence-based summaries and keep full logs in artifacts.
