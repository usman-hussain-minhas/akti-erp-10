# AKTI ERP Phase 5A Planning Proposal — Combined v1

**Mode:** Plan Mode — No Implementation
**Compiled from:** Two independent repo-grounded discovery passes
**Date:** 2026-05-27
**Final recommendation:** `READY_TO_CREATE_PHASE_5A_CONTROL_DOCS`

## Authority and Execution Boundary

This document remains a Phase 5A planning/control document and precursor context for the Phase 5A Platform Policy Pack. `docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md` is the authoritative Phase 5 strategic planning source for Phase 5A ticket-pack replacement and Phase 5A/5B/5C/6A/6B+ sequencing. Where this plan conflicts with that strategic reference, the strategic reference controls; this document does not supersede it. This document does not itself authorize Phase 5A execution, Phase 5B, Foundry, business modules, production auth, production deployment, secrets, or runtime implementation.

GitHub `main` at `f7f637d9546e3e77983811488f8c643e0b0e02d6` is the primary source of truth for this planning basis. Phase 4B is merged, validated, and pushed to `origin/main`; this document does not imply that the Phase 4B PR is still open, and it does not treat Phase 4A or Phase 4B as future phases.

If `AGENTS.md` is later updated during Phase 5A housekeeping, update only stale Current Project State lines. Do not turn `AGENTS.md` into a roadmap document.

## Ticket Quality Lesson From Previous Phases

Autonomous execution was not the root failure pattern. Stale, shallow, under-specified, or non-predictive tickets were the failure pattern.

Implementation is not stale by itself; stale tickets are the risk. Phase 5A tickets must be fresh against current `main`, predictive, scope-complete, dependency-aware, validation-backed, and exact-file-plan-driven.

Phase 5A tickets must express maximum concrete policy capability within current approved scope. They must stop when work becomes Phase 5B, Foundry, runtime policy-engine work, module installer work, business-module implementation, production auth, production deployment, secrets, or runtime implementation.

---

## A. Files Inspected

Both passes inspected the same repo. The primary source is GitHub `main` at HEAD `f7f637d9546e3e77983811488f8c643e0b0e02d6`, where Phase 4B is merged, validated, and pushed to `origin/main`. Supplemental evidence came from the Phase 4B source ZIP at `d4e9ef1` and the Phase 4B audit package. Together they cover:

```
AGENTS.md
PLANS.md
package.json (root)
pnpm-workspace.yaml
docs/process/AKTI_ERP_Master_Roadmap_Reference_v2.md
docs/process/AKTI_ERP_Phase_Roadmap_v2.md
docs/process/AKTI_ERP_Phase_5_Readiness_Handoff_After_Phase_4_v1.md
docs/process/AKTI_ERP_Phase_5A_Readiness_Handoff_After_Phase_4B_v1.md
docs/process/AKTI_ERP_Phase_4B_Audit_Report_v1.md
docs/process/AKTI_ERP_Phase_4B_Frontend_Dependency_Assessment_v1.md
docs/process/AKTI_ERP_Phase_2_Screen_Lifecycle_Policy.md
docs/adr/ADR-0001 through ADR-0014
docs/standards/AKTI_ERP_Design_System_Contract_v1.md
packages/contracts/module-manifest.schema.ts  (900+ lines)
packages/contracts/gatekeeper-contract.ts      (400+ lines)
packages/contracts/screen-contract.schema.ts
packages/contracts/access-core.module-manifest.contract.ts
packages/contracts/lead-desk-core.module-manifest.contract.ts
packages/contracts/access-core-capability-seed.contract.ts
generated/entity-registry.generated.json
prisma/schema.prisma
apps/api/src/**
apps/web/app/**
docs/screen-contracts/phase-1/*.screen.json  (8 contracts)
docs/screen-contracts/phase-2/*.screen.json  (4 contracts)
docs/screen-contracts/phase-4b/*.screen.json (2 contracts)
```

---

## B. Current Accepted Project State

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Governance, Source-of-Truth and Architecture Decisions | Complete |
| Phase 1 | Platform Foundation | Complete |
| Phase 2 | First Module-Layer Proof | Complete with accepted deferrals |
| Phase 3 | Trust Foundation | Complete with accepted deferrals |
| Phase 4 | Operational Proof | Complete and merged |
| Phase 4A | Local Demo / Staging Environment Stabilization | Complete and merged |
| Phase 4B | Frontend Operational Experience & Mission Control Shell | Complete and merged |
| **Phase 5A** | **Platform Policy Pack & Change Governance** | **Next** |
| Phase 5B | Foundry / Module Installer implementation | After Phase 5A |
| Phase 6 | Installable Business Modules | After Phase 5B |

**Stale docs requiring Phase 5A housekeeping update:**

- `PLANS.md` still shows status `post_phase_4_merged` and lists Phase 4A as next — must be updated
- Compact roadmap still shows Phase 4A/4B as future — must be updated
- `AGENTS.md` current-state summary may not reflect Phase 4B completion — update only the stale Current Project State lines if approved; do not turn AGENTS.md into a roadmap document

**Critical sequencing rule:**

Phase 5A is policy/decision work only.
Phase 5B is Foundry implementation.
Phase 5A produces the rules. Phase 5B builds the enforcement machinery.

---

## C. Existing Governance/Policy Artifacts Found

The repo already has substantial governance infrastructure. Phase 5A policies must align with these — not duplicate or contradict them.

| Artifact | Location | What it covers | Phase 5A relevance |
|---|---|---|---|
| `module-manifest.schema.ts` (900+ lines) | `packages/contracts/` | Module key/version, dependencies, capabilities, permissions, events, schemas, migrations, settings, menu entries, dashboard widgets, Gatekeeper hooks, audit hooks, health checks, degraded mode, disable behavior, data ownership | Structural enforcement for Policies 2–10, 13, 14, 17 — policies must align |
| `gatekeeper-contract.ts` (400+ lines) | `packages/contracts/` | Gatekeeper request/response, decision types (allow/deny/approval_required/degraded_block), check results, evidence requirements | Structural enforcement for Policy 8 |
| `screen-contract.schema.ts` | `packages/contracts/` | Screen types (private_portal, public_site, admin_console, embed), status, visibility, capabilities, AI boundaries. Currently rejects private_portal screens with empty required_capabilities — the root cause of P4B-SCHEMA-001 | Policy 6, P4B-SCHEMA-001 |
| `lead-desk-core.module-manifest.contract.ts` | `packages/contracts/` | Proves module pattern works; `migrations`, `settings`, `menu_entries`, `dashboard_widgets` are intentionally empty — exactly why contribution policies are needed before Foundry | Policies 4, 6, 7, 9 |
| `access-core-capability-seed.contract.ts` | `packages/contracts/` | Shows how capabilities are seeded — the same pattern Phase 5A will use for `platform.shell.access` | P4B-SCHEMA-001 Option A |
| `ADR-0006` | `docs/adr/` | Phase 2 migration baseline policy (non-destructive only) | Feeds Policy 9 |
| `ADR-0009` | `docs/adr/` | Service-level tenant isolation; DB RLS explicitly deferred to Phase 5A | Feeds Policy 10, Supplementary #1 — **must close in Phase 5A** |
| `ADR-0013` | `docs/adr/` | Mission Control shell architecture, module registration concept (id, menu, route, capability, visibility, enabled/disabled) | Feeds Policy 6 |
| `ADR-0014` | `docs/adr/` | Tailwind/shadcn as UI stack, must-use/may-extend module constraints | Feeds Policy 19 |
| `AKTI_ERP_Design_System_Contract_v1.md` | `docs/standards/` | Component behavior rules, token contract, accessibility baseline | Policy 19 should reference this, not duplicate it |
| `AKTI_ERP_Phase_2_Screen_Lifecycle_Policy.md` | `docs/process/` | Screen lifecycle states, activation requirements (Lead Desk-scoped) | Feeds Policy 6 — needs generalisation |
| Prisma schema | `prisma/schema.prisma` | Organization, User, Group, Capability, GroupCapability, AuditLog, EventOutbox, ModuleRegistry tables | Grounds Policies 9, 10, 12 |
| Root `package.json` | `/` | Has name, private, packageManager — **no version field** | Platform versioning gap; `min_platform_version: "0.1.0"` already declared in Lead Desk manifest with no baseline to check against |

**Key finding:** `module-manifest.schema.ts` is the machine-enforcement layer that already encodes many of the 20 policies structurally. Phase 5A prose policies must align with this schema. Any policy that contradicts it requires an explicit schema amendment decision — not silent contradiction.

---

## D. Missing Phase 5A Policy Areas

Against the 20-policy target:

| # | Policy | Existing partial coverage | What is missing |
|---|---|---|---|
| 1 | Core Update & Platform Change Policy | ADR-0001 governance, ADR-0002 Codex doctrine | Platform change gate process, version impact classification, breaking change definition |
| 2 | Module Definition & Ownership Policy | Module manifest schema (structural) | Prose policy on who owns a module, what constitutes a valid module, review/approval process |
| 3 | Module Lifecycle Policy | Manifest `disable_behavior`, `degraded_mode_behavior` | No lifecycle state machine (draft → proposed → certified → installed → deprecated → disabled) |
| 4 | Module Installation & Update Policy | Manifest schema covers update fields | No install ceremony, no update gate policy, no rollback trigger conditions |
| 5 | Capability, Permission & Access Policy | Access Core ADRs, manifest `capabilities[]` | No cross-module capability inheritance rules, no capability naming convention policy |
| 6 | Menu, Navigation & Screen Registration Policy | Screen lifecycle policy (Phase 2 Lead Desk only), ADR-0013 concept | No Foundry registration ceremony, no menu ordering/conflict resolution, no generalisation beyond Lead Desk |
| 7 | Settings & Configuration Registration Policy | Manifest `settings[]` field (structural) | No settings namespace policy, no default value governance |
| 8 | Gatekeeper Preflight & Approval Policy | Gatekeeper contract (structural) | No prose policy on what triggers Gatekeeper, no approval chain lifecycle |
| 9 | Migration & Schema Contribution Policy | ADR-0006 (Phase 2 non-destructive only) | No multi-module migration ordering, no schema conflict resolution, no RLS migration governance |
| 10 | Data Ownership, Tenant Boundary & Cross-Module Access Policy | ADR-0009 (service-level enforced, DB RLS deferred) | **DB RLS decision still open — ADR-0009 explicitly deferred it to Phase 5A** |
| 11 | Adapter & External Dependency Policy | ADR-0003 WhatsApp boundary | No general adapter framework contract (credential policy, failure isolation, retry, audit) |
| 12 | Version, Compatibility & Deprecation Policy | Manifest has `min_platform_version`, `version` (semver) | No platform version baseline artifact; Lead Desk declares `min_platform_version: "0.1.0"` with no authoritative baseline to validate against |
| 13 | Disable, Uninstall & Rollback Policy | Manifest `disable_behavior` (structural) | No rollback triggers, no data retention rules during disable |
| 14 | Evidence & Audit Package Policy | Phase 2/3/4 audit reports (process level) | No standard module audit package format for Foundry modules |
| 15 | Risk Classification & Change Gate Policy | Gatekeeper risk levels (low/medium/high/critical in schema) | No change gate process per risk level, no risk classification procedure |
| 16 | Security, Secrets & Configuration Safety Policy | ADR-0010 secrets/env, ADR-0007 security architecture | No module-level secrets policy |
| 17 | Observability, Health & SLO Policy | Manifest `health_checks[]` (structural) | No SLO definition standard, no health aggregation governance |
| 18 | Testing, Certification & Promotion Policy | Phase 2/3/4 quality passes | No formal module certification process, no promotion ceremony |
| 19 | Module UI, Accessibility & Noob-Proof UX Policy | Design System Contract v1, ADR-0014 | Exists as a standard — Phase 5A should elevate to a policy that references the standard, not duplicate it |
| 20 | AI-Ready Module Governance Policy | Roadmap v2 AI-native direction | No AI capability declaration contract, no AI cost budget policy, no prohibited AI behavior list per module |

---

## E. Missing Supplementary Standards/ADRs

| # | Item | Current state | Gap | Priority |
|---|---|---|---|---|
| 1 | DB-level RLS / tenant enforcement ADR (ADR-0015) | ADR-0009 deferred to Phase 5A | Must close. Every Phase 6 module migration depends on this. Choose: service-level only / DB-level RLS / hybrid | **Critical — highest priority** |
| 2 | Base shell capability / P4B-SCHEMA-001 ADR (ADR-0016) | Phase 4B accepted limitation | Must resolve before Phase 6 non-admin rollout | **Critical** |
| 3 | Platform versioning baseline (ADR-0017) | Root package.json has no version. Lead Desk manifest declares `min_platform_version: "0.1.0"` with no baseline | Define `platform_core_version = 1.0.0`, artifact location, breaking change definition | High |
| 4 | Module Registry frontend API decision (ADR-0018) | ADR-0013 mentions concept. `GET /platform/modules` used informally | Formalize the API surface Phase 5B Foundry will write to and Phase 4B shell reads from | High |
| 5 | Event schema standard | `ModuleEventSchema` in manifest covers delivery mode and retry | No platform-wide event envelope: `tenant_id`, `correlation_id`, `causation_id`, `data_classification`, `retention_policy`, `schema_version` | High |
| 6 | Module Service/API contract standard | Manifest has `api_routes[]` (structural) | No API naming convention, no error shape standard, no cross-module service interface policy | High |
| 7 | Notification / Communication policy | Phase 4B shell deferred semantics | No delivery, retention, channel, escalation, or mentions policy | Blocks Phase 6 notification-driven modules |
| 8 | Background Job / Scheduler policy | Not addressed anywhere | No job ownership, retry, idempotency, dead-letter, tenant-scope policy | Blocks Phase 6 async modules |
| 9 | Data Import / Export / Reporting / Read-model policy | P4B-BE-003 activity feed deferred | No export compliance, no cross-module reporting governance | Blocks Phase 6 data-heavy modules |

---

## F. P4B-SCHEMA-001 Remediation Options

| Option | Description | Pros | Cons | Recommendation | Phase impact |
|---|---|---|---|---|---|
| **A. Base shell capability** | Introduce `platform.shell.access` or `platform.authenticated` capability, seeded by Access Core for all valid authenticated users | Fits current `private_portal` schema; consistent with capability model; no schema change; reuses existing `access-core-capability-seed.contract.ts` pattern | Requires capability seeding and Access Core policy; must define who receives it and when | **Recommended.** Architecturally consistent, lowest blast radius, enables Phase 6 non-admin without schema rework | Phase 5A: ADR decision. Phase 5B: Foundry seeds capability. Phase 6: non-admin operators inherit it |
| B. Session-gated screen type | Extend `screen-contract.schema.ts` with `authenticated_shell` or `session_gated` screen type | Expresses shell semantics directly; no capability inflation | Schema change required; re-validation of all existing contracts; sets precedent for schema-as-auth | Keep as fallback / alternatives-considered only | Phase 5A: ADR can document; implementation deferred to Phase 5B |
| C. Keep `access.policy.manage` | Leave shell gated as admin-only for local/demo | No immediate changes | Wrong long-term operator model; Phase 6 non-admin lockout | Only accepted as current Phase 4B limitation — not as Phase 5A target | Must be remediated before Phase 6 non-admin rollout |

**Recommended default:** Option A; ADR-0016 must formally decide. The `access-core-capability-seed.contract.ts` pattern already exists. ADR-0016 should evaluate `platform.shell.access` or `platform.authenticated`, define any approved seeding policy, and record Phase 5B implications.

---

## G. Phase 5A Output Structure Recommendation

**Structure: consolidated policy pack + policy index + individual supplementary standards/ADRs.**

The 20-policy pack stays in one readable document. Standards and ADRs are separate files because they have different update lifecycles and different audiences.

| Output | File path | Purpose | Type | Required before Phase 5B? |
|---|---|---|---|---|
| Phase 5A Plan | `docs/process/AKTI_ERP_Phase_5A_Platform_Policy_Pack_Plan_v1.md` | Scope, non-scope, expected deliverables, workstream map | Process plan | Yes |
| Phase 5A Ticket Pack | `docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json` | Decision/policy-only ticket queue | Control doc | Yes |
| Phase 5A Audit Stub | `docs/process/AKTI_ERP_Phase_5A_Audit_Report_v1.md` | Closure stub — "To be completed at Phase 5A closure" | Audit stub | Yes |
| Policy Index | `docs/policies/AKTI_ERP_Platform_Policy_Index_v1.md` | Indexes all policies, owners, enforcement points, Phase 5B dependencies | Policy index | Yes |
| Consolidated Policy Pack | `docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md` | Human-readable 20-policy pack | Policy doc | Yes |
| Gatekeeper Checklist | `docs/policies/AKTI_ERP_Gatekeeper_Module_Change_Checklist_v1.md` | Preflight checklist Phase 5B must implement | Checklist | Yes |
| Foundry Requirements Note | `docs/process/AKTI_ERP_Foundry_Implementation_Requirements_From_Phase_5A_v1.md` | Converts policies into Phase 5B ticket-pack inputs | Requirements note | Yes |
| Tenant/RLS ADR (ADR-0015) | `docs/adr/ADR-0015-tenant-rls-enforcement-strategy.md` | Closes ADR-0009 deferral. Choose: service-level / DB-level / hybrid | ADR | **Critical — before any Phase 6 migration** |
| Shell Capability ADR (ADR-0016) | `docs/adr/ADR-0016-shell-base-capability-or-session-gated-screen.md` | Resolves P4B-SCHEMA-001. Defines `platform.shell.access` and seeding policy | ADR | **Critical — before Phase 6 non-admin rollout** |
| Platform Versioning ADR (ADR-0017) | `docs/adr/ADR-0017-platform-versioning-baseline.md` | Defines `platform_core_version = 1.0.0`, artifact location, breaking change definition | ADR | Yes — before Phase 5B compatibility enforcement |
| Module Registry Frontend API ADR (ADR-0018) | `docs/adr/ADR-0018-module-registry-frontend-api-boundary.md` | Formalizes `GET /platform/modules` surface; aligns Phase 4B shell reads with Foundry writes | ADR | Yes |
| Event Schema Standard | `docs/standards/AKTI_ERP_Event_Schema_Standard_v1.md` | Platform-wide event envelope: `event_id`, `event_type`, `source_module`, `tenant_id`, `actor_id`, `timestamp`, `payload`, `data_classification`, `correlation_id`, `causation_id`, `retention_policy`, `schema_version` | Standard | Yes — before Phase 5B event registration |
| Module Service/API Contract Standard | `docs/standards/AKTI_ERP_Module_Service_API_Contract_Standard_v1.md` | Route naming, error shape, tenant check requirements, capability enforcement pattern | Standard | Yes |
| Platform version artifact | `platform.version.json` at repo root (or `VERSION` file) | Machine-readable platform version baseline; separates platform version from npm package version | Governance artifact | Yes — ADR-0017 decides exact form |
| Notification / Comms Policy | `docs/policies/AKTI_ERP_Notification_Communication_Policy_v1.md` | Defines delivery, retention, channel, escalation, mentions semantics deferred from Phase 4B | Policy | Before Phase 6 notification-driven modules |
| Background Job / Scheduler Policy | `docs/policies/AKTI_ERP_Background_Job_Scheduler_Policy_v1.md` | Job ownership, retry, idempotency, dead-letter, tenant scope | Policy | Before Phase 6 async modules |
| Data Import / Export / Reporting Policy | `docs/policies/AKTI_ERP_Data_Import_Export_Reporting_Read_Model_Policy_v1.md` | Export compliance, cross-module reporting governance, read-model policy | Policy | Before Phase 6 data-heavy modules |
| Phase 5B Readiness Handoff | `docs/process/AKTI_ERP_Phase_5B_Readiness_Handoff_After_Phase_5A_v1.md` | Boundary artifact only — not a Phase 5B plan | Handoff | Yes |

---

## H. Schemas / Zod Contracts in Phase 5A?

**No new Zod runtime contracts in Phase 5A.**

The `module-manifest.schema.ts` and `gatekeeper-contract.ts` already exist as executable contracts. Changing them in Phase 5A risks drifting into Phase 5B implementation scope.

**The rule:**

```
Phase 5A may define schema shapes in standards documents as prose/JSON examples.
Phase 5A must not modify Zod runtime contracts unless a specific ADR explicitly classifies
the change as a policy source-of-truth artifact and not Foundry implementation.

Any runtime Zod, contract, screen-contract schema, Prisma schema, generated registry, or migration change in Phase 5A requires:
- explicit Phase 5A ticket approval;
- exact-file scope;
- proof that the change is a governance-source artifact, not Phase 5B Foundry implementation.
```

**One narrow exception permitted in Phase 5A:**

1. A repo-readable governance/version artifact such as `platform.version.json` or `VERSION` — governance artifact, not runtime code. ADR-0017 decides the exact form.

Phase 5A must not modify Prisma schema. It should not overload root `package.json` with the platform version unless a later approved ADR explicitly supersedes this recommendation and explains why npm/workspace versioning should equal platform-core versioning.

**What Phase 5B owns (not Phase 5A):**

- Zod schema for the event schema standard
- Any module-manifest schema amendments (e.g. AI capability declaration fields)
- Screen-contract schema amendment if Option B for P4B-SCHEMA-001 is chosen (it won't be — Option A is recommended)

---

## I. Platform Versioning: Repo-Readable Artifact in Phase 5A?

**Yes — required in Phase 5A as a governance artifact.**

Current gap: root `package.json` has `name`, `private`, `packageManager` — no `version`. The Lead Desk module manifest already declares `min_platform_version: "0.1.0"` with no authoritative baseline to validate against. Policy 12 (Version, Compatibility & Deprecation) is unenforceable until this baseline exists.

**Recommended ADR-0017 default:**

```
platform_core_version = 1.0.0
artifact = platform.version.json at repo root
owner = Platform Core
Phase 5B reads it for Foundry compatibility enforcement
```

The exact version value, release date, artifact path, and ownership must be finalized by ADR-0017.

Do not overload root `package.json` with the platform version unless npm package version and platform version are intentionally kept equal — they are likely to diverge.

---

## J. Phase 4B / Phase 5A Interface Risks

Six genuine interface risks:

**1. P4B-SCHEMA-001 (highest priority).**
Mission Control shell requires `access.policy.manage` due to `private_portal` screen-contract schema constraints. Phase 5A must choose Option A (base shell capability) and define the seeding policy before Phase 6 non-admin operators are introduced. If unresolved, Phase 6 non-admin operators are locked out of the shell or incorrectly granted admin capability.

**2. Notification center boundary.**
Phase 4B implemented bell, badge, drawer, toast, static system notice — infrastructure only. Phase 5A notification/communication policy must define the API surface the drawer will eventually consume. The policy must be aware that the drawer currently renders "Local/demo notification shell is ready" — real notification routing requires a backend surface and delivery contract before any Phase 6 module drives it.

**3. Command palette module registration alignment.**
Phase 4B's command palette doc sketched a module command declaration shape (`id`, `label`, `group`, `required_capability`, `module_id`, `keywords`, `visibility`). Phase 5A Policy 6 (Menu, Navigation & Screen Registration) must define the official registration contract to be consistent with this sketch. If Phase 5A defines a different shape, Phase 4B's static implementation will need a Phase 5B migration when Foundry wires module-driven commands.

**4. Current user / profile / auth surface.**
Phase 4B uses Advanced Diagnostics local/demo bearer session only. The shell user/org menu shows "Operator workspace" as a placeholder. Phase 5A must define the production auth policy (as a policy/ADR only — not implementation) before real operator identity UI can be wired in Phase 5B or Phase 6.

**5. Activity / audit feed.**
Phase 4B deferred the dashboard recent activity widget to a "paired backend ticket" because no frontend-safe audit endpoint exists. Phase 5A must define the audit/activity visibility policy so Phase 5B or Phase 6 can implement a safe endpoint with correct tenant scoping and data classification.

**6. Event schema per-module vs. platform-wide.**
Current module event contracts (`events_emitted`, `events_consumed` in manifest) define delivery mode and retry policy per-module but lack a platform-wide envelope (`tenant_id`, `correlation_id`, `causation_id`, `data_classification`, `retention_policy`). The event schema standard in Phase 5A must extend the per-module schema into a platform-wide contract without breaking existing Lead Desk and Engagement Gateway event declarations.

---

## K. Proposed Phase 5A Workstreams

Not tickets — workstream scope and priority ordering.

| Workstream | Focus | Key outputs | Sequencing note |
|---|---|---|---|
| P5A-W1 | Baseline housekeeping, policy inventory, authority mapping, platform versioning, stale doc updates | Phase 5A plan, policy index skeleton, ADR-0017 (versioning), `platform.version.json`, PLANS.md / roadmap / narrow AGENTS current-state update | **Run first** — everything else references the authority model |
| P5A-W2 | Core update, module definition, lifecycle, ownership | Policies 1, 2, 3 | After W1 |
| P5A-W3 | Install/update/disable/rollback, evidence package | Policies 4, 13, 14 | After W2 — Foundry install lifecycle depends on these |
| P5A-W4 | Capability, menu, screen registration, settings, Gatekeeper | Policies 5, 6, 7, 8, ADR-0016 (shell capability) | After W1 — Policy 6 must reference Phase 4B command palette sketch |
| P5A-W5 | Migration, tenant/RLS decision (ADR-0015), cross-module data | Policies 9, 10, ADR-0015 | **Highest implementation risk** — run early, gates every Phase 6 migration |
| P5A-W6 | Adapter, secrets, configuration safety, external dependency | Policies 11, 16 | After W1 |
| P5A-W7 | Versioning policy, event schema standard, observability, SLO, module service/API standard, module registry ADR | Policies 12, 17, ADR-0018, Event schema standard, Service/API standard | After W5 (event schema must know RLS tenant context shape) |
| P5A-W8 | Testing/certification, UI/accessibility policy, AI-ready governance | Policies 18, 19, 20 | After W2/W3 — certification requires lifecycle |
| P5A-W9 | Background jobs, notifications, import/export/reporting | Supplementary policies 7, 8, 9 | After W4/W7 — notification policy must know event schema |
| P5A-W10 | Policy pack finalization, Gatekeeper checklists, Foundry requirements note, Phase 5B readiness handoff | Consolidated policy pack, Gatekeeper checklist, Foundry requirements, Phase 5B handoff | **Run last** — synthesizes everything |

**Recommended priority ordering within first half of Phase 5A:**

```
W1 (baseline/versioning) → W5 (RLS/migration ADR) → W4 (capability/registration/P4B-SCHEMA-001) → W2 (module definition) → W3 (lifecycle/install)
```

W5 first after W1 because ADR-0015 (RLS) is the single highest-risk decision. Every Phase 6 module migration depends on whether it must include RLS policy statements. Getting this wrong after modules are built is the most expensive possible retrofit.

---

## L. Phase 5A Non-Scope

Phase 5A must not implement:

```
Foundry runtime
Module installer
Module enable/disable runtime
Business modules (Admissions, HR, Finance, LMS, etc.)
Marketplace
Platform AI runtime
Real external adapters (payment, email, production WhatsApp)
Production secrets or credentials
Destructive migrations
Parallel module builds
Production auth/login implementation (policy/ADR only — no runtime code)
Runtime notification delivery
Runtime background scheduler
Runtime reporting engine
Any Prisma schema change. No Prisma schema changes in Phase 5A. The only allowed repo-readable artifact under this planning proposal is a governance/version artifact such as platform.version.json or VERSION if ADR-0017 approves it
```

Phase 5A **may** decide policies and ADRs for all of the above — it must not build them.

---

## M. Risks and Stop Conditions

**Architectural risks:**

1. **Module manifest schema contradictions.** The `module-manifest.schema.ts` already enforces many policies structurally. Any Phase 5A policy that contradicts it will create a governance conflict Phase 5B cannot resolve cleanly. Every policy must be validated against the manifest schema before it is finalized.

2. **ADR-0015 (RLS closure) is the highest-impact single decision.** If DB-level RLS is chosen, every Phase 6 module migration must include `CREATE POLICY` and `ENABLE ROW LEVEL SECURITY` statements. If service-level-only is confirmed, modules must not add RLS artifacts. Getting this wrong after modules are built is the most expensive possible retrofit.

**Sequencing risks:**

3. **PLANS.md and roadmap docs are stale.** They say Phase 4A is next. Future Codex or human planning sessions may reason from stale context. Must be corrected in P5A-W1 before any other work.

4. **Policy pack scope creep into Foundry implementation.** If any policy includes implementation detail ("Foundry must create table X" instead of "Foundry must enforce policy Y"), it has drifted into Phase 5B scope.

**Scope-creep risks:**

5. **Zod/schema changes entering Phase 5A.** The event schema standard is tempting to implement as a Zod contract. It must remain a standards document in Phase 5A. The Zod schema arrives in Phase 5B.

6. **Platform versioning artifact triggers dependency changes.** If ADR-0017 decides the platform version lives in `package.json`, it may trigger pnpm workspace version management questions. Using a separate `platform.version.json` avoids this.

**Cost risks:**

7. **31+ documents is a large Phase 5A output.** If Phase 5A attempts all workstreams in a single Codex run, quality will suffer. Workstream-by-workstream ticket structure with gate checks between workstreams is required.

**Future module risks:**

8. **Phase 6 modules may start before P4B-SCHEMA-001 is resolved.** If ADR-0016 is not completed in Phase 5A, Phase 6 non-admin operators may be incorrectly required to hold `access.policy.manage` just to access the shell.

**Governance risks:**

9. **Any policy that cannot name an enforcement point.** Every Phase 5A policy must answer: what enforces this? The answer is Foundry (Phase 5B), Gatekeeper, module manifest validation, Access Core, or ADR-level authority. A policy that cannot name its enforcement point is aspirational prose, not governance.

**Stop conditions:**

```
Any runtime Foundry/module installer implementation appears
Any business module implementation appears
Any production auth/secret/deployment work appears
Any destructive migration appears
Any policy decision cannot name an enforcement point
Any supplementary standard/ADR avoids choosing between specific options
Any platform version policy lacks a repo artifact decision
Any RLS/tenant policy avoids choosing: service-level / DB-level / hybrid / explicit deferral
Any policy contradicts module-manifest.schema.ts without an explicit superseding ADR
```

---

## N. Final Recommendation

**`READY_TO_CREATE_PHASE_5A_CONTROL_DOCS`**

With these pre-conditions before Phase 5A execution begins:

1. **Start from merged Phase 4B main.** Phase 4B is merged, validated, and pushed to `origin/main` at `f7f637d9546e3e77983811488f8c643e0b0e02d6`. Phase 5A planning may proceed from this clean baseline.

2. **P5A-W1 must be the first committed work.** It updates PLANS.md, roadmap summaries, and only the stale `Current Project State` lines in AGENTS.md if approved; do not turn AGENTS.md into a roadmap document. It also creates the Phase 5A plan/ticket-pack/audit-stub. Until stale roadmap references are corrected, all subsequent Codex context is polluted.

3. **ADR-0015 (RLS) must be the first ADR committed.** It gates every migration-related policy. Running P5A-W5 first after W1 is the correct sequencing.

4. **ADR-0016 (shell base capability) must close before Phase 6 begins.** It is not blocking Phase 5B Foundry construction — but it is blocking Phase 6 non-admin operator rollout. Commit it in Phase 5A.

5. **The module-manifest.schema.ts is the ground truth.** All 20 policies must be consistent with it. Read it before writing any policy that touches module capabilities, permissions, events, migrations, settings, or data ownership.

6. **Policy 19 references the Design System Contract — it does not duplicate it.** One sentence: "Policy 19 is enforced by `docs/standards/AKTI_ERP_Design_System_Contract_v1.md`. That document is the implementation standard."

---

*End of Phase 5A Planning Proposal — Combined v1*
