# AKTI Core v0.0.2 Internal Filename Migration Report v1

Status: AKTI_UNDERSCORE_INTERNAL_FILENAME_MIGRATION_READY_FOR_REVIEW

## Purpose

PR 33 migrates only approved frontend internal filenames to lower_snake_case. It does not rename directories, public routes, API paths, schema files, generated registry files, package or lockfile files, or historical `codex-review/**` evidence.

## Files Renamed

| Old path | New path |
| --- | --- |
| `apps/web/components/mission-control/command-palette.tsx` | `apps/web/components/mission-control/command_palette.tsx` |
| `apps/web/components/mission-control/dashboard-overview.tsx` | `apps/web/components/mission-control/dashboard_overview.tsx` |
| `apps/web/components/mission-control/mission-control-shell.tsx` | `apps/web/components/mission-control/mission_control_shell.tsx` |
| `apps/web/components/mission-control/module-launcher.tsx` | `apps/web/components/mission-control/module_launcher.tsx` |
| `apps/web/components/mission-control/notification-center.tsx` | `apps/web/components/mission-control/notification_center.tsx` |
| `apps/web/components/phase4b-shadcn-import-proof.tsx` | `apps/web/components/phase4b_shadcn_import_proof.tsx` |
| `apps/web/components/session/advanced-diagnostics-session-panel.tsx` | `apps/web/components/session/advanced_diagnostics_session_panel.tsx` |
| `apps/web/components/session/session-state.ts` | `apps/web/components/session/session_state.ts` |
| `apps/web/components/session/session-status.tsx` | `apps/web/components/session/session_status.tsx` |
| `apps/web/components/settings/settings-control-panel.tsx` | `apps/web/components/settings/settings_control_panel.tsx` |
| `apps/web/components/ui/design-system.tsx` | `apps/web/components/ui/design_system.tsx` |
| `apps/web/lib/crm-alias.config.ts` | `apps/web/lib/crm_alias.config.ts` |
| `apps/web/lib/crm-alias.config.test.mjs` | `apps/web/lib/crm_alias.config.test.mjs` |
| `apps/web/lib/platform-branding.config.ts` | `apps/web/lib/platform_branding.config.ts` |
| `apps/web/lib/platform-branding.config.test.mjs` | `apps/web/lib/platform_branding.config.test.mjs` |
| `apps/web/test/command-palette.test.mjs` | `apps/web/test/command_palette.test.mjs` |
| `apps/web/test/dashboard-overview.test.mjs` | `apps/web/test/dashboard_overview.test.mjs` |
| `apps/web/test/design-system-baseline.test.mjs` | `apps/web/test/design_system_baseline.test.mjs` |
| `apps/web/test/lead-desk-screens.test.mjs` | `apps/web/test/lead_desk_screens.test.mjs` |
| `apps/web/test/mission-control-shell.test.mjs` | `apps/web/test/mission_control_shell.test.mjs` |
| `apps/web/test/module-launcher.test.mjs` | `apps/web/test/module_launcher.test.mjs` |
| `apps/web/test/notification-center.test.mjs` | `apps/web/test/notification_center.test.mjs` |
| `apps/web/test/session-ux.test.mjs` | `apps/web/test/session_ux.test.mjs` |
| `apps/web/test/settings-control-panel.test.mjs` | `apps/web/test/settings_control_panel.test.mjs` |
| `apps/web/test/shadcn-setup.test.mjs` | `apps/web/test/shadcn_setup.test.mjs` |
| `apps/web/test/state-ux-baseline.test.mjs` | `apps/web/test/state_ux_baseline.test.mjs` |

## References Updated

- `apps/web/app/**`
- `apps/web/components/**`
- `apps/web/lib/**`
- `apps/web/test/**`
- `packages/contracts/scripts/validate-screen-contracts.mjs`
- Active Phase 5C component/screen registry references
- Core v0.0.2 path migration inventory JSON and Markdown

Route/hash strings such as `/app#module-launcher`, DOM IDs such as `module-launcher-title`, and public `lead-desk` route strings remain unchanged because PR 33 is not a route/API or UI contract rename.

## Deferred Paths

- `apps/api/**`
- `packages/contracts/**` contract/schema surfaces beyond the validation script reference update above
- `generated/**`
- `prisma/**`
- package and lockfile paths
- route/API directories and public URL paths
- historical `codex-review/**` evidence

## Validation Summary

Required validation for this PR:

- `node scripts/quality/check_lower_snake_case_paths.mjs`
- `pnpm contracts:validate`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- old-reference search for the approved rename set
- import hyphen search across `apps`, `packages`, and `scripts`
- `git diff --check`
- `git status --short --branch`

## Route/API Non-Scope Confirmation

No public route folder, API folder, route contract, API contract, Prisma/schema/migration, generated registry, package file, or lockfile is renamed by PR 33.

Final status: AKTI_UNDERSCORE_INTERNAL_FILENAME_MIGRATION_READY_FOR_REVIEW
