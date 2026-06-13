# P5B1-011 Summary

Ticket: P5B1-011 — Module manifest `required_capabilities[]`

Status: PASS

## Scope Completed

- Added top-level `required_capabilities[]` to `ModuleManifestSchema`.
- Added schema validation that each required capability references either a local manifest capability or a consumed capability.
- Backfilled existing module manifests with explicit `required_capabilities[]`.
- Marked Lead Desk's CRM-facing module surface as requiring consumed `platform.crm.access`.
- Added a targeted Module Registry/manifest test proving existing manifests parse and invalid unknown required capabilities fail.

## Files Changed

- `packages/contracts/module-manifest.schema.ts`
- `packages/contracts/access-core.module-manifest.contract.ts`
- `packages/contracts/engagement-gateway-lite.module-manifest.contract.ts`
- `packages/contracts/lead-desk-core.module-manifest.contract.ts`
- `packages/contracts/internal-fixture.module-manifest.contract.ts`
- `apps/api/src/module-registry/module-registry.p5b1-011.test.ts`
- `codex-review/phase5b1-platform-experience-substrate/ticket-artifacts/P5B1-011/P5B1-011-summary.md`
- `codex-review/phase5b1-platform-experience-substrate/ticket-artifacts/P5B1-011/P5B1-011-validation-summary.md`

## Source Files Inspected

- `packages/contracts/module-manifest.schema.ts`
- `packages/contracts/access-core.module-manifest.contract.ts`
- `packages/contracts/engagement-gateway-lite.module-manifest.contract.ts`
- `packages/contracts/lead-desk-core.module-manifest.contract.ts`
- `packages/contracts/internal-fixture.module-manifest.contract.ts`
- `apps/api/src/module-registry/module-registry.service.ts`
- `docs/process/AKTI_ERP_Phase_5B1_Ticket_Pack_v1.json`

## Boundary Notes

Screen-level `required_capabilities` remain separate from module-level `required_capabilities[]`.

No Phase 5C screen implementation, Phase 6 business module, dynamic shell action endpoint, runtime AI, production provider, or package/lockfile change was introduced.
