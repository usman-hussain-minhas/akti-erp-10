# ADR-0013: Frontend Mission Control Architecture

**Status:** Accepted for Phase 4B product definition
**Date:** 2026-05-26

## Context

Phase 4 and Phase 4A proved AKTI ERP can run locally and render current routes, but the frontend remains proof-capable rather than operator-ready. Future Foundry/module registration needs a stable shell target so modules do not invent isolated navigation and layouts.

## Decision

AKTI ERP will use a Mission Control shell architecture for Phase 4B:

- `/app` owns the shell and default dashboard/Mission Control content.
- Desktop uses a collapsible left sidebar plus compact top utility bar.
- Mobile uses a drawer plus bottom primary navigation.
- Settings lives at `/app/settings`.
- Dashboard v1 is folded into `/app`; no distinct `/app/dashboard` route is selected.
- Notification center is a shell drawer/region; no separate notification route is selected.
- Advanced Diagnostics is a settings/admin surface.

## Route And Surface Ownership

| Surface | Route / ownership |
| --- | --- |
| Mission Control shell and dashboard v1 | `/app` |
| Settings / Control Panel | `/app/settings` |
| Notification center | shell drawer/region |
| Command palette | shell overlay |
| Lead Desk | existing Lead Desk routes inside shell/navigation |
| Login | deferred; no Phase 4B login implementation |

## Module-Registration Implications

Future modules must register into shared shell navigation and use shared layout/component contracts. Phase 4B prepares the surface for Foundry/module registration but does not implement Foundry, module installation, enable/disable lifecycle, marketplace, or module package governance.

## Consequences

- Phase 4B ticket pack must include shell/layout implementation work.
- Screen contracts must cover `/app` shell and `/app/settings`.
- Visual QA becomes a closure gate.
- Dashboard and notification center do not need separate screen contracts unless later product decisions create distinct routes.

## Non-Scope

This ADR does not authorize frontend implementation, dependency installation, production launch, real WhatsApp behavior, Foundry/module installer work, platform AI runtime, Phase 5, or new business modules.
