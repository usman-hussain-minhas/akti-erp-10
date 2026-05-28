# P5B-002b Summary - Platform Compatibility Check Baseline

## Ticket

- Ticket: P5B-002b
- Title: Platform compatibility check baseline
- Type: control_or_evidence
- Tier: 1
- Dependencies verified: P5B-002a committed
- Commit scope: evidence artifacts only

## Exact-File Plan

Files created for this ticket:

- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-002b/P5B-002b-summary.md
- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-002b/P5B-002b-validation-summary.md

No runtime compatibility code was created because `files_expected_to_change` grants evidence artifact authority only. Runtime checks remain reserved for later tickets with exact Gatekeeper, Foundry, registry, or service file ownership.

## Compatibility Authority

| Source | Baseline requirement |
| --- | --- |
| `platform.version.json` | Platform core version authority is `platform_core_version: 1.0.0`; artifact is governance metadata. |
| ADR-0017 | Foundry reads platform compatibility requirements from manifests and version metadata; Gatekeeper checks version compatibility declarations; release evidence includes platform version. |
| ADR-0018 | Module registry frontend API includes lifecycle state and version/compatibility information and must not expose raw internal authority. |
| Platform policy pack | Module updates are versioned changes with compatibility checks, migration safety checks, evidence, rollback readiness, and tenant-impact declarations. |
| Gatekeeper checklist | Module change review verifies module lifecycle state and version compatibility. |

## Compatibility Baseline

Later runtime tickets must implement compatibility checks using these rules:

- Current platform core version comes from `platform.version.json`.
- Module manifests or registry records must declare the module version and compatibility window when the ticket owns that surface.
- Updates must declare `from_version`, `to_version`, compatibility window, breaking changes, tenant impact, and rollback path.
- Gatekeeper decides whether a compatibility mismatch is `DENY`, `APPROVAL_REQUIRED`, or `STOP_FOR_REVIEW` according to risk.
- Foundry must not install, enable, update, or rollback a module before Gatekeeper authorization.
- Compatibility evidence must be attached to lifecycle actions and final audit output.
- Compatibility checks must fail closed if required version metadata is missing, malformed, or contradictory.

## Non-Scope

This ticket does not:

- Add a compatibility service.
- Add a Gatekeeper compatibility rule.
- Add Foundry runtime checks.
- Modify module registry runtime behavior.
- Modify `platform.version.json`.
- Modify Prisma, generated registry, package, or lockfile files.

## Downstream Ticket Links

This baseline feeds later Phase 5B tickets including:

- P5B-010d - Module compatibility checks.
- P5B-011d - Lifecycle compatibility proof.
- P5B-015a through P5B-015f - update/rollback lifecycle behavior.
- P5B-027a through P5B-027d - migration/schema contribution validation.

## Minimum Concrete Requirement

Scoped behavior for Platform compatibility check baseline is implemented in exact files and passes repo-real validation by mapping committed version, registry, Gatekeeper, Foundry, and lifecycle compatibility authority into a concrete execution baseline for later runtime tickets.
