# P5B-000d Summary - Phase 5B Artifact Directory and Evidence Convention

## Ticket

- Ticket: P5B-000d
- Title: Phase 5B artifact directory and evidence convention
- Type: control_or_evidence
- Tier: 0
- Dependencies verified: P5B-000 committed
- Commit scope: evidence artifacts only

## Exact-File Plan

Files created for this ticket:

- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000d/P5B-000d-summary.md
- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000d/P5B-000d-validation-summary.md

No runtime source, Prisma schema, migrations, generated registry, package files, lockfiles, deployment files, secrets, or Phase 5A policy/ADR/standard/checklist/handoff documents were changed.

## Artifact Root

Phase 5B execution artifacts use this root:

- codex-review/phase5b-gatekeeper-foundry/

The root is intentionally ignored by `.gitignore`, so Phase 5B commits must force-add only the exact artifact files required by each ticket. Never force-add the whole `codex-review/` directory.

## Directory Convention

| Artifact class | Path convention | Tracking rule |
| --- | --- | --- |
| Per-ticket summary | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/<ticket_id>/<ticket_id>-summary.md | Force-add only when listed in `required_outputs` or needed to satisfy the ticket MCR. |
| Per-ticket validation evidence | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/<ticket_id>/<ticket_id>-validation-summary.md | Force-add when listed in `evidence_artifacts` or `required_outputs`. |
| Tier gate evidence | codex-review/phase5b-gatekeeper-foundry/tier-gates/<gate_id>-evidence.md | Force-add exact gate evidence files required by the gate ticket. |
| Final external audit package | codex-review/phase5b-gatekeeper-foundry/final-external-audit/ | Produce only at P5B-GATE, following the final external audit package rules. |

## File Naming Convention

- Ticket artifact directories use the exact `ticket_id`.
- Summary files use `<ticket_id>-summary.md`.
- Validation files use `<ticket_id>-validation-summary.md`.
- Tier gate evidence files use `<gate_id>-evidence.md`.
- Final audit package files use the exact names required by P5B-GATE.

## Evidence Content Convention

Each ticket validation summary should record:

- Ticket ID and title.
- Result: PASS or STOPPED_WITH_FINDINGS.
- Exact changed files.
- Forbidden-file review.
- Commands run and command results.
- Tests run and test results.
- Known gaps, accepted deferrals, or stop conditions.

Evidence must not claim implementation completion unless the ticket validation commands passed. Evidence does not replace working behavior for runtime tickets.

## Force-Add Convention

Because `.gitignore` ignores `codex-review/`, use this pattern for artifact staging:

```bash
git add -f -- <exact-artifact-file> [<exact-artifact-file> ...]
```

Forbidden patterns:

```bash
git add -f codex-review/
git add -f codex-review/phase5b-gatekeeper-foundry/
```

## Phase Boundary Convention

Artifacts may document findings and validation evidence, but they must not authorize:

- Phase 5C frontend excellence.
- Phase 6A Golden Module implementation.
- Phase 6B+ business modules.
- Marketplace/public module store work.
- Production deployment.
- Real production external adapters.
- Production secrets.
- Real AI provider calls.
- Phase 5A policy/ADR/standard/checklist edits.

## Minimum Concrete Requirement

Scoped behavior for Phase 5B artifact directory and evidence convention is implemented in exact files and passes repo-real validation.
