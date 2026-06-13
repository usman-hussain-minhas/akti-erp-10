# P5B-015b Summary

Ticket: P5B-015b - Menu registration

## Bounded Replan

The ticket was declared as control/evidence-only, but its minimum concrete requirement required working menu registration behavior. Under the standing bounded-replan authority, implementation was scoped to the existing Module Registry manifest contribution surface and a ticket-stamped proof test.

## Source Files Inspected

- docs/process/AKTI_ERP_Phase_5B_Plan_v10.md
- docs/process/AKTI_ERP_Phase_5B_Ticket_Pack_v1.json
- docs/process/AKTI_ERP_Foundry_Implementation_Requirements_From_Phase_5A_v1.md
- docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md
- docs/adr/ADR-0016-shell-base-capability-or-session-gated-screen.md
- packages/contracts/module-manifest.schema.ts
- packages/contracts/access-core.module-manifest.contract.ts
- packages/contracts/engagement-gateway-lite.module-manifest.contract.ts
- apps/api/src/module-registry/module-registry.service.ts
- apps/api/src/module-registry/module-registry.service.test.ts

## Exact Files Changed

- apps/api/src/module-registry/module-registry.service.ts
- apps/api/src/module-registry/module-registry.p5b-015b.test.ts
- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015b/P5B-015b-summary.md
- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015b/P5B-015b-validation-summary.md

## Implementation

- Added `registerMenuContributions` to `ModuleRegistryService`.
- Menu entries are derived from module manifests as deterministic registration projections.
- Menu entries are sorted by order and key for stable shell consumption.
- Menu entries may reference local capabilities or explicitly consumed capabilities.
- Unknown capability references, duplicate keys, malformed paths, invalid orders, and cross-owner business navigation are rejected.

## Scope Guardrails

- No frontend screens, Phase 5C polish, business-module implementation, schema, generated registry, package, lockfile, deployment, secret, real adapter, or runtime AI files were modified.
- No Phase 5A policy, ADR, standard, checklist, or handoff files were modified.
- Screen, command, settings, health/degraded-state, and frontend API registration remain deferred to their own queued tickets.
