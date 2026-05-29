# AKTI ERP Phase 5C Spark Genesis Readiness Audit v1

## Status

PHASE_5C_SPARK_GENESIS_READINESS_AUDIT_COMPLETE

This report is planning/audit evidence only. It does not start Phase 5C implementation, create Phase 5C tickets, authorize frontend code changes, or start Phase 6 work.

## Inputs Inspected

- `AGENTS.md`
- `docs/process/AKTI_ERP_Spark_Genesis_Adoption_v1.md`
- `docs/process/AKTI_ERP_Phase_5B1_Audit_Report_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Readiness_Handoff_After_Phase_5B1_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Visual_Direction_Decision_Memo_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Frontend_Current_State_Evidence_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Frontend_Improvement_Backlog_Candidates_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Screen_Contract_Registry_v1.md`
- `docs/process/AKTI_ERP_Platform_Capability_Namespace_Registry_v1.md`
- `apps/web/app/**`
- `apps/web/components/**`
- `apps/web/lib/**`
- `apps/api/src/configuration/**`
- `apps/api/src/module-registry/**`
- `apps/api/src/notifications/**`
- `apps/api/src/platform-health/**`
- `apps/api/src/data-controls/**`
- `apps/api/src/search/**`
- `packages/contracts/module-manifest.schema.ts`
- `packages/contracts/access-core.module-manifest.contract.ts`
- `packages/contracts/lead-desk-core.module-manifest.contract.ts`
- `/Volumes/UsmanWork/Spark Genesis/skills/spark-genesis/SKILL.md`
- `/Volumes/UsmanWork/Spark Genesis/skills/spark-genesis/references/frontend-phase-checklist.md`
- `/Volumes/UsmanWork/Spark Genesis/skills/spark-genesis/references/failure-patterns.md`

Spark Genesis version verified: `0.2.0`.

## Phase 5C Readiness Verdict

- Ready for visual/screen-contract planning: yes.
- Not ready for tickets: yes. Phase 5C still needs control docs before ticket-pack creation.
- Not ready for implementation: yes. Frontend implementation still requires approved screen contracts, component contracts, and a Component/API Map.

Phase 5B1 closed the substrate needed for honest Phase 5C planning: AKTI Spark naming, CRM visible alias, frontend route metadata, organization profile and effective branding reads, role-aware modules, notification summary, platform status overview, data-controls status, module manifest display metadata, `visibility_state`, `required_capabilities[]`, `ai_data_classification`, and the Phase 5C screen contract registry.

## Required Phase 5C Control Docs

Before Phase 5C ticket creation:

1. Visual Direction
2. Screen Contracts
3. Component/API Map

The current visual direction memo exists, but the next Phase 5C control pass should convert it into implementation-ready screen and component authority. The Component/API Map is not yet present and should be created before any Phase 5C ticket pack.

## Required Screen And Component Contract Surfaces

Route screens requiring Phase 5C-ready contracts:

- `/`
- `/app`
- `/app/settings`
- `/lead-desk/inbox` as CRM visible label only
- `/lead-desk/create` if included in Phase 5C scope
- `/lead-desk/leads/[leadId]` if included in Phase 5C scope
- `/lead-desk/leads/[leadId]/actions` if included in Phase 5C scope
- `/setup/organization` if included in Phase 5C scope
- `/modules` only if a route is separately approved; it is currently blocked in the registry

Non-route component contracts required before implementation:

- command palette
- notification drawer
- workspace status card
- org badge
- module card
- mobile shell

Each non-route component contract should define trigger, scope, data source, capability filter, keyboard behavior, empty state, must-not-show, mobile behavior, and accessibility/focus behavior.

## Risk Table

| Risk | Current audit result | Required control before tickets |
| --- | --- | --- |
| Fake dashboard risk | Watch. Current shell uses honest placeholder/degraded states; Phase 5C must not convert these into fake revenue, tasks, analytics, pipeline, or operational metrics. | Screen contracts must name real data sources and forbidden fake states. |
| Fake module card risk | Watch. `/platform/modules` is role-aware, but `/modules` route is blocked and current launcher must remain honest. | Module card component contract and Component/API Map must bind cards to role-aware module data. |
| CRM technical rename risk | Watch. Current config uses `CRM` as visible label while preserving `lead-desk` routes and contracts. | Contracts must repeat that CRM is a visible alias only. |
| Phase 6 leakage risk | Watch. Current docs defer Admissions, Finance, HR, marketplace, workflow builder, AI runtime, and business modules. | Phase 5C scope docs must keep these out of active surfaces. |
| White-label overreach risk | Watch. Phase 5B1 exposes branding facts only. | Settings/org badge contracts must forbid upload, storage write, cropper, domain branding, and full white-label editor. |
| Settings/diagnostics-as-apps risk | Watch. Visual direction says Settings and Diagnostics are not apps. | Module grid contract must keep apps equal to modules only. |
| Screen contract absence risk | Applies. The registry exists, but Phase 5C implementation-ready screen contracts are still pending. | Create Phase 5C Screen Contracts v1 before tickets. |
| Component contract absence risk | Applies. Non-route component requirements are listed, but component contracts are not yet written. | Create component contracts or include them in the Screen Contracts control set before tickets. |
| Data source mismatch risk | Watch. Substrate APIs exist, but frontend widgets are not yet mapped route-by-route/component-by-component. | Create Component/API Map v1 before tickets. |
| Accessibility/mobile risk | Watch. Current evidence notes keyboard/focus and mobile acceptance gaps. | Add acceptance criteria for overlays, mobile shell, tap targets, focus behavior, and screenshot checks. |

## Spark Genesis Pattern Hits

Pattern hits that apply:

- `FP-013`: Fake dashboard / fake module card risk remains a Phase 5C planning watchpoint.
- `FP-015`: Component contracts must not be mistaken for route screen contracts.
- `FP-014`: Branding and product identity should continue to flow through approved config/read substrate, not ad hoc component literals.

Patterns clear in current repo state:

- `FP-001`: No active Phase 5C schema ticket is present in this audit.
- `FP-002`: This report is explicitly audit-only and does not claim implementation.
- `FP-003`: Phase 5B1 API substrate uses existing service/controller boundaries for inspected endpoints.
- `FP-005`: No Phase 5C implementation or Phase 6 scope is authorized by current control docs.
- `FP-006`: CRM remains a visible alias; `lead-desk` technical routes/contracts are preserved.
- `FP-007`: Dynamic `GET /platform/shell/actions` remains absent and deferred.
- `FP-008`: Search scope remains limited to `WorkflowDefinition` and `WorkflowInstance`.
- `FP-010a`: No Phase 5C ticket dependency graph exists yet.
- `FP-010b`: No Phase 5C gate closure graph exists yet.
- `FP-011`: No Phase 5C ticket pack exists yet.
- `FP-012`: No Phase 5C ticket fields exist yet.
- `FP-024`: Phase 5B1 handoff and audit report are post-gate fresh.

Watchpoints for the next planning step:

- `FP-004`: Future tickets must include validation commands for frontend, contracts, and docs as applicable.
- `FP-009`: Any behavior-changing ticket must include ticket-scoped tests.
- `FP-016`: Contract changes may require sequential contract validation/build before dependent tests.
- `FP-017`: Exact-file plans may need bounded same-scope additions, but not future-phase scope.
- `FP-018`: Tests must follow any new frontend config authority instead of old hardcoded locations.
- `FP-019`: Capability allowlists must stay aligned with approved namespace changes.
- `FP-020`: Contract field changes must backfill existing fixtures without weakening validation.
- `FP-021`: Reuse existing API boundaries before inventing new services.
- `FP-022`: Negative assertions should be narrow enough to avoid flagging approved legacy text.
- `FP-023`: Resume work only after reconstructing branch, HEAD, diff, and ticket state.

## Substrate Evidence Summary

- Organization profile API exists under Configuration: `GET /platform/organization/profile`.
- Effective branding API exists under Configuration: `GET /platform/branding/effective`.
- Role-aware module list exists: `GET /platform/modules`.
- Notification summary API exists: `GET /platform/notifications/summary`.
- Platform status overview exists under platform-health: `GET /platform/status/overview`.
- Data-controls status exists: `GET /platform/data-controls/status`.
- Phase 5C screen contract registry exists as a control document.
- Module manifest schema includes display metadata, `visibility_state`, `required_capabilities[]`, and `ai_data_classification`.
- Search scope remains PostgreSQL FTS over `WorkflowDefinition` and `WorkflowInstance`.

## Recommended Next Step

Create the following Phase 5C planning/control docs before ticket-pack creation:

1. Phase 5C Visual Direction v1
2. Phase 5C Screen Contracts v1
3. Phase 5C Component/API Map v1

Do not create the Phase 5C ticket pack yet.

## Non-Scope

- no Phase 5C implementation
- no Phase 6 modules
- no CRM technical migration
- no `lead-desk` file, route, API, contract, Prisma model, or data-model rename
- no fake dashboards, modules, metrics, notifications, analytics, or CRM pipeline data
- no white-label upload/write UI
- no production auth, deployment, or secrets
- no dynamic `GET /platform/shell/actions`
- no marketplace, workflow builder, AI assistant, runtime AI, real providers, or production WhatsApp
