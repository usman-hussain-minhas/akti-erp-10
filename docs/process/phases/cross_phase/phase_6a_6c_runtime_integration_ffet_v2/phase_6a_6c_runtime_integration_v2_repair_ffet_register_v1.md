---
document_id: phase_6a_6c_runtime_integration_v2_repair_ffet_register_v1
title: Phase 6A-6C Runtime Integration v2 Repair FFET Register
status: stage_2_repair_ffet_control_artifact
version: 1.0.0
created: 2026-06-13
updated: 2026-06-14
owner: Usman Hussain
classification: internal_controlled
source_of_truth: false
metadata_standard: esbla_file_metadata_standard_v1
---
# Phase 6A-6C Runtime Integration v2 Repair FFET Register

Status: `STAGE_2_REPAIR_FFET_002_SEATED_FOR_EXECUTION`

This control artifact seats bounded repairs required by the final Stage 2 visual audits. It does not change runtime code.

## Source blockers

### Visual audit v1

- Source audit: `docs/audits/stage2_runtime_visual_audit/stage2_runtime_visual_audit_v1.json`
- Blocker: `VISUAL_AUDIT_BLOCKED_RUNTIME_ENDPOINTS_RETURN_500`
- Blocked status: `PHASE_6A_6C_RUNTIME_INTEGRATION_EXECUTED_BUT_NOT_VISUALLY_VERIFIED`

Observed failures:

| Endpoint | Controller | Failure |
| --- | --- | --- |
| `/health` | `AppController` | `getHealth` dependency was undefined |
| `/platform/phase-6a/runtime/status` | `Phase6AController` | `getRuntimeCapabilityStatus` dependency was undefined |
| `/platform/phase-6b/runtime/status` | `Phase6BController` | `getRuntimeCapabilityStatus` dependency was undefined |
| `/platform/phase-6c/runtime/status` | `Phase6CController` | `getRuntimeCapabilityStatus` dependency was undefined |

### Visual audit v2

- Source audit: `docs/audits/stage2_runtime_visual_audit_v2/stage2_runtime_visual_audit_v2.json`
- Blocker: `VISUAL_AUDIT_RERUN_BLOCKED_FOUNDRY_CONTROLLER_INJECTION_500`
- Blocked status: `PHASE_6A_6C_RUNTIME_INTEGRATION_EXECUTED_BUT_VISUAL_RERUN_BLOCKED_BY_FOUNDRY_CONTROLLER_DI`

Observed failure:

| Endpoint | Controller | Failure |
| --- | --- | --- |
| `/platform/foundry/phase-6a-6c/runtime-activation/preflight` | `FoundryController` | `evaluatePhase6A6CRuntimeActivation` dependency was undefined |

Pattern assessment: `S2-REPAIR-001` fixed four explicit controllers, then the next unpatched implicit controller failed in the same way under the committed `start:dev` path. The second repair therefore hardens the remaining controller constructor DI surface instead of patching only Foundry.

## Approved repair FFETs

### `S2-REPAIR-001`: controller DI repair for v1 blockers

MCR: the committed API start path can serve `/health` and `/platform/phase-6a|6b|6c/runtime/status` without the recorded 500 dependency-injection failures.

### `S2-REPAIR-002`: class-level controller DI hardening

Exact files:

- `apps/api/src/access-core/access-core.controller.ts`
- `apps/api/src/configuration/configuration.controller.ts`
- `apps/api/src/data-controls/data-controls.controller.ts`
- `apps/api/src/engagement-gateway/engagement-gateway.controller.ts`
- `apps/api/src/file-service/file-service.controller.ts`
- `apps/api/src/foundry/foundry.controller.ts`
- `apps/api/src/gatekeeper/gatekeeper.controller.ts`
- `apps/api/src/hierarchy/hierarchy.controller.ts`
- `apps/api/src/lead-desk/lead-desk.controller.ts`
- `apps/api/src/module-registry/module-registry.controller.ts`
- `apps/api/src/notifications/notifications.controller.ts`
- `apps/api/src/organization-setup/organization-setup.controller.ts`
- `apps/api/src/platform-health/platform-health.controller.ts`
- `apps/api/src/reporting/reporting.controller.ts`
- `apps/api/src/search/search.controller.ts`
- `apps/api/src/security/current-user.controller.ts`
- `apps/api/src/workflow/workflow.controller.ts`
- `apps/api/src/phase_6a_6c_runtime/phase_runtime_controller_injection.test.ts`

MCR: the committed API start path can serve `/platform/foundry/phase-6a-6c/runtime-activation/preflight` without the recorded `FoundryController` undefined-service failure, and the direct controller DI test proves all API controllers with service dependencies declare explicit Nest injection tokens.

## Final visual audit rerun

After `S2-REPAIR-002` merges, rerun the final visual audit and write v3 evidence under `docs/audits/stage2_runtime_visual_audit_v3/`. Do not overwrite the blocked v1 or v2 audits.

## Non-authorizations

- dependency additions
- package or lockfile edits
- schema or migration edits
- generated-file edits
- route or response-shape changes
- new frontend screens
- invented permissions, providers, ADLs, APIs, or business rules
- fake screenshots or simulated visual verification

Final target: `PHASE_6A_6C_RUNTIME_INTEGRATION_EXECUTED_AND_VISUALLY_VERIFIED`
