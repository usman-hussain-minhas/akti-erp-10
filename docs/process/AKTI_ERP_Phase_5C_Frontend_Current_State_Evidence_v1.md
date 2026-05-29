# AKTI ERP Phase 5C Frontend Current-State Evidence v1

**Status:** PRE_PHASE_5C_EVIDENCE_ONLY
**Captured:** 2026-05-29 17:16:41 PKT
**Branch:** `docs/phase5c-frontend-current-state`
**Base main HEAD:** `c2a85325bbb7128a9e15dea7deb0bb6b40a87f40`

This document records current frontend evidence for Phase 5C planning. It does not start Phase 5C implementation, create a ticket pack, authorize UI changes, or modify frontend/runtime behavior.

## 1. Repo State

- Phase 5B PR #14 was merged into `main`.
- Merge commit / final main HEAD inspected for this evidence: `c2a85325bbb7128a9e15dea7deb0bb6b40a87f40`.
- Evidence branch: `docs/phase5c-frontend-current-state`.
- Frontend run command used for screenshots: `pnpm --dir apps/web exec next dev --hostname 127.0.0.1 --port 3000`.
- Screenshot method: Codex Browser in-app Playwright screenshot with explicit viewport overrides.
- No frontend code, backend code, schema, generated registry, package, or lockfile changes were made for this evidence pass.

## 2. Files Inspected

- `apps/web/app/**`
- `apps/web/components/**`
- `apps/web/package.json`
- `package.json`
- `docs/adr/ADR-0013-frontend-mission-control-architecture.md`
- `docs/adr/ADR-0014-ui-component-library.md`
- `docs/standards/AKTI_ERP_Design_System_Contract_v1.md`
- `docs/process/AKTI_ERP_Phase_4B_Product_Definition_v1.md`
- `docs/process/AKTI_ERP_Phase_4B_Shell_Layout_Decision_v1.md`
- `docs/process/AKTI_ERP_Phase_4B_Settings_Control_Panel_IA_v1.md`
- `docs/process/AKTI_ERP_Phase_4B_Dashboard_IA_Decision_v1.md`
- `docs/process/AKTI_ERP_Phase_4B_Command_Palette_Interaction_Model_v1.md`
- `docs/process/AKTI_ERP_Phase_4B_Noob_Proof_Acceptance_Checklist_v1.md`
- `docs/process/AKTI_ERP_Phase_4B_Lead_Desk_UX_Problem_List_v1.md`

## 3. Frontend Route Inventory

| Route | Source file | Layout dependency | Auth/session requirement | Visible navigation entry | Screenshot priority | Blocked/unauthenticated state |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `apps/web/app/page.tsx` | Root layout only | None in current route | None | High | Public scaffold only. |
| `/app` | `apps/web/app/app/page.tsx` | `MissionControlShell` | Renders without session; protected data requires Advanced Diagnostics session context and optional API base | Sidebar, bottom nav, command palette | High | Shows session-missing notice and local/demo placeholders. |
| `/app/settings` | `apps/web/app/app/settings/page.tsx` | `SettingsControlPanel` | Renders without session; most read-only loads require session and API base | Mission Control settings icon/link and sidebar | High | Shows session-missing notice and disabled/protected load states. |
| `/setup/organization` | `apps/web/app/setup/organization/page.tsx` | Standalone setup form | No current browser session requirement; posts to setup API when submitted | None | Medium | Static form is visible; no submission was performed. |
| `/lead-desk/inbox` | `apps/web/app/lead-desk/inbox/page.tsx` | `LeadDeskWorkspace` | Requires Advanced Diagnostics session context to load records | Mission Control sidebar, Lead Desk workspace nav, command palette | High | Load action disabled and session-missing state shown. |
| `/lead-desk/create` | `apps/web/app/lead-desk/create/page.tsx` | `LeadDeskWorkspace` | Requires session context and required fields before submit | Lead Desk workspace nav and command palette | High | Submit disabled until session context and required fields exist. |
| `/lead-desk/leads/[leadId]` | `apps/web/app/lead-desk/leads/[leadId]/page.tsx` | `LeadDeskWorkspace` | Requires session context to load detail | Linked from inbox rows after data loads | Medium | Sample route renders blocked/session-missing state safely. |
| `/lead-desk/leads/[leadId]/actions` | `apps/web/app/lead-desk/leads/[leadId]/actions/page.tsx` | `LeadDeskWorkspace` | Requires session context and loaded lead before mutation | Linked from detail after data loads | Medium | Sample route renders blocked/session-missing state safely. |

## 4. Screenshot Manifest Summary

- Local screenshot directory: `codex-review/phase5c-frontend-current-state/screenshots/`
- Local screenshot manifest: `codex-review/phase5c-frontend-current-state/screenshot-manifest.md`
- Screenshot count: 18
- Viewports captured: desktop `1440x900`, mobile `390x844`
- Browser automation: Codex Browser in-app Playwright with viewport override.
- Screenshots are local evidence artifacts only and are not staged in this docs branch.

Captured surfaces include `/`, `/app`, `/app/settings`, `/setup/organization`, Lead Desk inbox/create/detail/action routes, command palette open state, and notification drawer open state.

## 5. Current IA / Navigation State

The Mission Control shell at `/app` is the primary ERP shell. Desktop navigation uses a fixed left sidebar and top utility bar. Mobile navigation uses a compact top bar plus fixed bottom navigation and a drawer. Visible shell destinations are Mission Control, Lead Desk, and Settings.

The root `/` route still displays a minimal scaffold rather than a polished login, gateway, or Mission Control entry. This is important for Phase 5C planning because first-run user entry is not yet operator-ready.

## 6. Current Dashboard / Shell State

The `/app` dashboard shows session status, a read-only module launcher placeholder, local/demo API health, Lead Desk quick status, settings quick link, notification shell region, and help region. API-backed widgets intentionally show placeholder states when `NEXT_PUBLIC_API_BASE_URL` and valid local/demo session context are absent.

The shell follows the Phase 4B architecture direction, but visible copy still references Phase 4B/local-demo status. Phase 5C should decide whether to revise copy and entry states after a screen-contract-led plan.

## 7. Current Settings / Control-Panel State

`/app/settings` exposes General, Users & Roles, Groups / Access, Hierarchy, Modules, Appearance, Security, Notifications, and Advanced Diagnostics sections. Built sections are read-only loaders against existing APIs when local/demo API and session context exist. Appearance, Security, and Notifications remain explicit placeholders.

Advanced Diagnostics is the only inspected normal frontend surface that exposes bearer-token entry. This matches the Phase 4B/ADR boundary for local/demo diagnostics, but Phase 5C should treat it carefully and should not infer production auth readiness.

## 8. Current Module / Lead Desk / Foundry Visibility State

The module launcher is a read-only shell region. It can query `/platform/modules` when the API is configured, but no dedicated Foundry operator page, installer UI, marketplace, or lifecycle-management screen is visible in the current frontend route inventory.

Lead Desk routes remain visible and navigable, but Lead Desk is a business module surface. Phase 5C evidence may inspect it for UX consistency, but Phase 5C must not expand business workflows without an approved scope decision.

## 9. Mobile / Responsive Observations

Mobile screenshots confirm that the Mission Control shell, settings, setup, and Lead Desk screens render at `390x844`. Mission Control has bottom navigation and a drawer entry. Lead Desk screens use stacked workspace navigation rather than the Mission Control bottom nav.

The fixed mobile bottom navigation on `/app` occupies the lower viewport and should receive Phase 5C visual QA for overlap, scroll padding, tap targets, and long-content behavior. Current screenshots show readable content, but they are not a replacement for full responsive acceptance testing.

## 10. Accessibility / Noob-Proof Observations

Visible page titles exist on inspected pages. Form fields have labels. Empty, loading, degraded, permission, and error state components are present in the inspected routes. Icon-only shell buttons generally include accessible labels.

Open follow-up areas for Phase 5C planning include keyboard traversal across drawer/palette/notification overlays, focus trap behavior, reduced technical phrasing, root-entry clarity, and verifying that normal users do not see raw tokens or IDs outside Advanced Diagnostics.

## 11. Design-System Observations

The frontend uses shared local components such as `Button`, `SectionCard`, `StatusBadge`, `StateMessage`, `EmptyState`, `LoadingState`, `ErrorState`, `PermissionState`, `SuccessState`, `DrawerPanel`, and `DataTable`. The styling is Tailwind-oriented and broadly follows the ADR-0014 direction.

Some surfaces use standalone inline styles, especially `/setup/organization`. Phase 5C should decide whether setup should be brought into the shared component system or remain a special first-run surface.

## 12. Current Limitations / Blockers

- `/` is still a scaffold and is not an operator-ready entry screen.
- Local screenshots were captured without `NEXT_PUBLIC_API_BASE_URL`; API-backed states are placeholders or session-missing states.
- No production login or production auth flow was inspected or assumed.
- No Foundry installer/operator UI route appears in the current frontend inventory.
- Lead Desk routes exist, but business-workflow improvements are not automatically Phase 5C scope.
- Screenshots are local ignored artifacts and are not committed as binary files in this evidence branch.

## 13. Evidence Paths

- Current-state evidence doc: `docs/process/AKTI_ERP_Phase_5C_Frontend_Current_State_Evidence_v1.md`
- Improvement backlog candidates: `docs/process/AKTI_ERP_Phase_5C_Frontend_Improvement_Backlog_Candidates_v1.md`
- Screenshot directory: `codex-review/phase5c-frontend-current-state/screenshots/`
- Screenshot manifest: `codex-review/phase5c-frontend-current-state/screenshot-manifest.md`

## 14. What Phase 5C Should Consider

- Define the intended first screen and authenticated entry path before UI polish.
- Decide how Phase 5B platform services should appear in frontend navigation, if at all.
- Reconcile Mission Control, Settings, Lead Desk, and setup surfaces into a coherent shell story.
- Plan responsive QA around the fixed mobile bottom navigation, drawer, overlays, forms, and tables.
- Validate keyboard and screen-reader behavior for command palette, notification drawer, settings navigation, and Lead Desk forms.
- Keep API-backed widgets honest: no fake data, no invented sessions, and no production credential assumptions.

## 15. What Phase 5C Must Not Assume Yet

- Do not assume Phase 5C implementation is authorized by this evidence doc.
- Do not assume screenshots prove production auth, production API connectivity, or live tenant data.
- Do not assume Foundry needs a public marketplace or module store UI.
- Do not assume Lead Desk business expansion belongs in Phase 5C.
- Do not assume Advanced Diagnostics is a production login pattern.
- Do not assume frontend code may change without screen contracts and an approved Phase 5C plan.

