# ADR-0013: Frontend Mission Control Architecture

## ADR number

ADR-0013

## Title

Frontend Mission Control Architecture

## Date

2026-05-26

## Status

Accepted for Phase 4B product definition

## Context

Phase 4 and Phase 4A proved AKTI ERP can run locally, migrate from committed Prisma migrations, smoke-test, and render the current frontend routes. The frontend remains proof-capable rather than operator-ready: navigation is sparse, session details are too technical for normal users, and future modules have no stable shell surface to target.

Phase 4B must make the application noob-proof and structurally ready for future Foundry/module registration without implementing Foundry itself. A filesystem-only navigation model is insufficient because routes discovered from `apps/web/app/**` do not express module ownership, required capability, menu grouping, enabled/disabled state, user visibility, or the difference between a visible placeholder and an operational surface. In short, filesystem-only navigation is insufficient for an ERP shell that must govern modules, permissions, and operator-facing destinations. If future modules each add their own navigation without a shell contract, AKTI ERP will fragment into unrelated pages instead of a coherent ERP.

## Predecessors / Prior State

The decision builds on:

- Phase 1 portal-shell and settings screen contracts.
- Phase 2 Lead Desk screen contracts and proof-like frontend routes.
- Phase 3 trusted session/tenant hardening and operator-context replacement concerns.
- Phase 4 frontend current-state evidence showing the UI is technically functional but not operator-ready.
- Phase 4A local demo runbook, smoke script, browser inspection support, screenshot capture, and redaction review paths.

Before this ADR, `/app` existed as a sparse portal surface, Lead Desk routes existed outside a full ERP shell, settings/admin surfaces were not operator-ready, and notification/session controls were not governed by a Mission Control layout.

## Decision

AKTI ERP will use a Mission Control shell architecture for Phase 4B:

- `/app` owns the shell and default dashboard/Mission Control content.
- Desktop uses a collapsible left sidebar plus compact top utility bar.
- Mobile uses a hybrid drawer plus bottom primary navigation.
- Settings lives at `/app/settings`.
- Dashboard v1 is folded into `/app`; no distinct `/app/dashboard` route is selected in this product definition.
- Notification center is a shell drawer/region; no separate notification route is selected in this product definition.
- Command palette is a shell overlay opened by keyboard shortcut and visible search/command entry.
- Advanced Diagnostics is a settings/admin surface and is the only approved Phase 4B location for bearer token/session technical details.

The shell must show normal users only safe session states: session active, session missing, session expired/invalid, and limited diagnostics mode. Raw bearer tokens, decoded token internals, actor IDs, organization IDs, lead IDs, and technical session fields move out of normal operator screens and into Advanced Diagnostics only.

## Accepted Phase 4B Capability Limitation

The current Phase 4B Mission Control screen contract keeps `access.policy.manage` as the required capability because the active `private_portal` screen-contract schema rejects empty `required_capabilities`. This is a schema constraint, not the intended long-term operator model.

This limitation is accepted for Phase 4B local/demo because current demo sessions are admin/elevated. The long-term model remains layered:

- shell base visibility = authenticated/session-valid operator;
- Lead Desk navigation = `lead.inbox.view` or `lead.intake.create`;
- Settings/admin/Access/Advanced Diagnostics = `access.policy.manage` or future equivalent;
- module regions are capability-gated individually.

Phase 5A must resolve either a base platform shell capability such as `platform.shell.access` / `platform.authenticated`, or an authenticated/session-gated shell screen type before Phase 6 non-admin operators and modules. Phase 4B ticketing must not treat `access.policy.manage` as the final user-facing shell gate.

## Route And Surface Ownership

| Surface | Route / ownership | Phase 4B responsibility |
| --- | --- | --- |
| Mission Control shell and dashboard v1 | `/app` | Own global layout, dashboard content, module launcher, session status, command entry, notification shell, and main content outlet. |
| Settings / Control Panel | `/app/settings` | Own settings IA, supported read sections, placeholders, Gatekeeper denial UX, and Advanced Diagnostics. |
| Notification center | Shell drawer/region | Provide bell, unread badge shell, drawer, toast renderer, empty state, and static/demo/system notification rendering only. |
| Command palette | Shell overlay | Provide static/core navigation commands only in Phase 4B. |
| Lead Desk | Existing Lead Desk routes inside shell/navigation | Bring existing routes under shell/navigation context and remove normal-user technical leakage. |
| Login | Deferred | No Phase 4B login screen or production auth replacement. |

## Module Registration Interface

Phase 4B defines the conceptual shell target that future modules will register into, but it does not implement the Foundry/module installer. Future module registration must include enough information for the shell to render safe navigation without filesystem guessing.

Minimum conceptual registration fields for future Foundry/module governance include:

- `module_id`: stable module identity used to group shell surfaces.
- `menu`: menu placement, label, grouping, ordering, and whether it appears in sidebar, launcher, command palette, or settings.
- `route`: approved route or route prefix owned by the module.
- `capability`: capability required to see or use the surface.
- `visibility`: condition that determines whether the surface is visible, hidden, or admin-only for the current user context.
- `enabled/disabled state`: whether the module or surface is operational, disabled, unavailable, or placeholder-only, with a plain-English disabled reason.

Phase 4B may hard-code or statically configure core shell destinations while preserving this shape as future Foundry input. Phase 5B owns dynamic module installation, lifecycle, marketplace behavior, and runtime module registration governance.

## Phase 5B / Foundry Implications

Foundry needs a stable frontend destination model before it can install or expose modules safely. This ADR gives Foundry a future registration target for menu, route, capability, module_id, visibility, and enabled/disabled state, but it deliberately avoids module installer implementation.

When Phase 5B begins, it can refine this conceptual registration shape into contracts/manifests and validate that installed modules use the Mission Control shell rather than inventing their own portal chrome.

## Phase 6 Module Implications

Phase 6 modules must not ship isolated navigation systems, private dashboard shells, or conflicting settings layouts. They must plug into the Mission Control shell, use shared navigation/component contracts, and declare visibility and capability requirements. Domain-specific pages may extend content regions, but the shell remains platform-owned.

## Consequences

- Phase 4B ticket pack must include shell/layout implementation work before broad screen polish.
- Screen contracts must cover `/app` shell and `/app/settings`.
- Visual QA becomes a closure gate, not a passive evidence artifact.
- Dashboard and notification center do not need separate screen contracts unless later product decisions create distinct routes.
- Lead Desk UX cleanup must respect shell navigation, safe session state, and no raw ID/token exposure.
- Future module UX must be shaped around a shared platform shell rather than local route discovery.

## Alternatives Considered

| Alternative | Reason rejected or deferred |
| --- | --- |
| Keep filesystem-only navigation | Does not encode module_id, capability, menu grouping, visibility, enabled/disabled state, or placeholders. It would invite route drift and module fragmentation. |
| Build only a Lead Desk-specific shell | Would overfit Phase 4B to one business module and fail the ERP/module governance goal. |
| Create separate dashboard and notification routes now | Adds route scope before the product definition selects a need. `/app` and shell regions are enough for Phase 4B. |
| Implement Foundry dynamic module registration now | Belongs to Phase 5B and would violate Phase 4B non-scope. |
| Implement a real login flow now | Requires a separate auth/security decision and likely backend work; Phase 4B only moves token entry to Advanced Diagnostics. |

## Risks / Mitigations

| Risk | Mitigation |
| --- | --- |
| Shell work grows into Foundry/module installer work | Keep module registration as conceptual input only; stop if dynamic installation or lifecycle work appears. |
| Notification center becomes communication policy | Limit Phase 4B to infrastructure shell only; defer delivery, retention, mentions, WhatsApp/SMS/email, and module-driven semantics to Phase 5A/later work. |
| Session UX becomes an invented login flow | Use the approved six-step Advanced Diagnostics token setup path only; defer username/password, OAuth, and production auth replacement. |
| Future modules fragment the UI | Require shared shell/layout/components and future module registration concepts before Phase 6 modules. |
| Technical leakage remains visible | Make visual QA and noob-proof checklist closure gates; normal users must not see bearer tokens or raw IDs by default. |

## Non-Scope

This ADR does not authorize frontend implementation, dependency installation, production launch, real WhatsApp behavior, Foundry/module installer work, platform AI runtime, Phase 5, new business modules, production integrations, full module-driven notification semantics, dashboard marketplace behavior, offline-first sync, real-time collaboration, or macro/scripting.

## Owner

AKTI / Phase 4B product definition controller.

## Review date

Before Phase 4B ticket-pack creation and again before Phase 4B closure.
