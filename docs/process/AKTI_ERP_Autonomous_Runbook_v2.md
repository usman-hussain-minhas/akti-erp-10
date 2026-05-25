# AKTI ERP Autonomous Runbook v2

## Purpose

This runbook defines the reusable autonomous execution model after Phase 1 and Phase 2 closure. It is not a phase ticket pack. A future phase must still provide its own approved queue, scope, gates, and validation expectations.

## Operating Model

Future autonomous runs use stable contract plus flexible runtime.

- Stable contract: approved control docs define scope, ordered queue, ticket boundaries, validation ladder, artifact policy, hard gates, and final stop behavior.
- Flexible runtime: progress is derived from git history, run journal, ticket artifacts, optional run-state file, and ordered queue position.
- Control docs are not live execution ledgers and should not be mutated during implementation tickets unless the active ticket is explicitly a control-doc correction.

## Runtime State Sources

Use these sources in order when determining run progress:

1. Git commit history on the active branch.
2. Run journal under the approved `codex-review/` run folder.
3. Ticket artifacts under the approved artifact folder.
4. Optional run-state file if the active control docs define one.
5. Ordered ticket queue from the active contract.

If these conflict materially, stop with a run-state conflict rather than guessing.

## Exact-File Planning

Before editing, each ticket must produce an exact-file implementation plan. Broad globs in ticket packs are inspection hints only. If required files fall outside the exact-file plan, stop unless the active ticket explicitly allows a scoped plan update.

## Validation Repair Policy

Autonomous repair is allowed only for deterministic local validation failures inside active ticket scope.

Allowed examples:

- TypeScript import/export mismatch.
- Zod/schema shape mismatch.
- Local test expectation mismatch caused by active-ticket implementation.
- Missing validation wiring for active-ticket tests when no dependency or unrelated script change is needed.

Stop immediately for:

- New dependency.
- Forbidden file scope.
- Architecture, ADR, module-boundary, or business-rule decision.
- Secret access.
- Production deployment.
- Destructive migration.
- Direct WhatsApp/Meta coupling.
- Frontend without an approved screen contract.
- Validation failure after the active repair budget.

## Validation/Test-Runner Wiring Policy

Test-runner wiring may be updated only when all are true:

- The active ticket adds or requires tests.
- Existing validation does not run those tests.
- The change is limited to including active-ticket tests.
- No dependency is added.
- No unrelated script behavior changes.

Allowed wiring files must be named by the active ticket. If root orchestration, CI, or broad script behavior must change, stop unless explicitly approved.

## Artifact Policy

- Per-ticket artifacts should be lightweight: summary, changed-file list or ZIP, and validation notes.
- Heavy audit packages should be created only at phase gates, final closure, or explicit audit-package tickets.
- Ignored artifacts can support review but are not repo authority unless separately committed through an approved tracked document.

## Elevated Execution Exception

Default execution posture should be safe and approval-gated. A full-access or elevated execution profile may be used only when the active control docs explicitly authorize it for the current run. This exception does not relax scope, validation, governance, production-secret, or deployment boundaries.

## Default Hard Boundaries

- No production secrets.
- No production deployment.
- No production auth/session changes unless explicitly scoped.
- No destructive migrations.
- No dependency additions without approval.
- No invented modules, capabilities, permissions, roles, events, screens, or business rules.
- No direct Lead Desk-to-Meta/WhatsApp coupling.
- No real outbound WhatsApp unless explicitly approved in a later phase.
