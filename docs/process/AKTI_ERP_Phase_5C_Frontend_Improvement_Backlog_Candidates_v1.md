# AKTI ERP Phase 5C Frontend Improvement Backlog Candidates v1

**Status:** PRE_PHASE_5C_CANDIDATES_ONLY
**Captured:** 2026-05-29 17:16:41 PKT
**Branch:** `docs/phase5c-frontend-current-state`
**Base main HEAD:** `c2a85325bbb7128a9e15dea7deb0bb6b40a87f40`

This is not a Phase 5C ticket pack, implementation plan, or execution authorization. It records candidate observations from current frontend evidence only.

## Candidate Backlog

| Candidate | Classification | Evidence | Planning note |
| --- | --- | --- | --- |
| Replace or redirect the root `/` scaffold with an approved entry experience. | blocker for Phase 5C planning | `apps/web/app/page.tsx`; screenshots `root-*` | Decide whether the first viewport is login, Mission Control, setup, or another governed entry. |
| Clarify production auth versus Advanced Diagnostics local/demo session entry. | blocker for Phase 5C planning | `AdvancedDiagnosticsSessionPanel`; `/app/settings` screenshots | Do not turn bearer-token diagnostics into production auth. Plan copy, access, and placement intentionally. |
| Decide whether Settings should use full Mission Control shell chrome or remain a focused control-panel layout. | should-fix in Phase 5C | `/app/settings`; `SettingsControlPanel` | Current route uses a back link and section nav, not the full sidebar/topbar shell. |
| Revisit Phase 4B/local-demo visible copy after Phase 5B merge. | UX improvement candidate | `/app` and module launcher screenshots | Copy still accurately signals local/demo state, but Phase 5C may need updated user-facing phase language. |
| Define frontend visibility for Phase 5B platform services. | should-fix in Phase 5C | Module launcher and settings Modules section | No dedicated Foundry, Gatekeeper, workflow, read-model, or observability operator route is currently visible. |
| Keep module launcher honest until backend/API context is connected. | UX improvement candidate | `ModuleLauncher` placeholder | Preserve no-fake-data rule; improve empty state only after approved screen contract. |
| Validate mobile bottom navigation overlap and scroll padding. | responsive/mobile candidate | `mission-control-mobile-390x844.png` | Bottom nav is readable, but Phase 5C should verify long pages, forms, and overlays across breakpoints. |
| Add formal keyboard/focus audit for command palette and notification drawer. | accessibility candidate | `command-palette-desktop-1440x900.png`; `notification-drawer-desktop-1440x900.png` | Current overlay screenshots are promising evidence, not full keyboard/screen-reader proof. |
| Review setup organization page against shared component system. | design-system consistency candidate | `/setup/organization`; inline styles in route file | Decide whether setup remains standalone or adopts shared `Button`, `Field`, and state components. |
| Confirm Lead Desk routes remain no-technical-leakage for normal operators. | accessibility candidate | Lead Desk screenshots and route source | Dynamic routes use sample IDs in URLs; visible copy avoids raw token/org/actor details in normal states. |
| Improve Lead Desk empty/blocked state guidance after auth/API decisions. | UX improvement candidate | Lead Desk session-missing screenshots | Better next-step copy may help noob-proofness once Phase 5C locks auth/session assumptions. |
| Review table responsive behavior with real Lead Desk rows. | responsive/mobile candidate | `DataTable` in `lead-desk/inbox/page.tsx` | Screenshots did not include populated rows because no local/demo API/session was used. |
| Preserve non-scope around Lead Desk business workflow expansion. | future phase / not Phase 5C | Phase docs and Lead Desk route inventory | UX cleanup may be Phase 5C; new business workflow capability needs separate approval. |
| Decide whether command palette should include dynamic module commands after Foundry. | future phase / not Phase 5C | `CommandPalette` static command list | Dynamic command registration may depend on future module manifest/frontend contract work. |
| Keep notification drawer as shell/evidence until communication policy enables live content. | future phase / not Phase 5C | `NotificationCenter` static messages | Do not add live notifications, WhatsApp, email, or provider behavior in Phase 5C without approval. |
| Plan visual QA around color contrast and status badges. | design-system consistency candidate | Shared `StatusBadge` and screenshots | Existing badges pair color with text; Phase 5C should verify contrast and semantic consistency. |
| Define first-run setup relationship to tenant bootstrap and security gates. | blocker for Phase 5C planning | `/setup/organization` route | The page posts to setup API; Phase 5C should not polish or expose it without confirming intended lifecycle. |
| Document screenshot acceptance criteria before frontend edits. | should-fix in Phase 5C | This evidence pass | Future implementation should define desktop/mobile route screenshot gates before changing UI. |

## Non-Candidates For Phase 5C Without Separate Approval

- Golden Module implementation.
- Phase 6A or Phase 6B business-module delivery.
- Marketplace or public module store UI.
- Production deployment.
- Real external adapter/provider integration.
- Runtime AI provider UI or calls.
- Production WhatsApp activation.
- Business reports or new business-specific workflows.
- Package, lockfile, schema, or generated-registry changes outside an approved Phase 5C plan.

## Suggested Planning Inputs For Phase 5C

- Current route inventory from `AKTI_ERP_Phase_5C_Frontend_Current_State_Evidence_v1.md`.
- Screenshot manifest under `codex-review/phase5c-frontend-current-state/screenshot-manifest.md`.
- ADR-0013 Mission Control shell architecture.
- ADR-0014 UI component library direction.
- Design System Contract v1.
- Phase 5C readiness handoff produced at Phase 5B closure.

