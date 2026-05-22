# Phase 1 Build Specification

## 1. Phase 1 Objective

Phase 1 builds the minimum AKTI ERP platform foundation needed before business modules begin: monorepo app scaffold, NestJS backend shell, Next.js frontend shell, shared package structure, first real Prisma platform models, Organization Core, Access Core foundation, configurable hierarchy foundation, group/capability/permission foundation, basic audit log, basic event outbox, basic module registry seed/manifest validation, single portal shell, simple/builder mode foundation, and contract/registry validation wiring. Success means the repo can run a clean scaffolded platform with validated contracts, Prisma models, generated entity registry, basic organization/access APIs, screen-contract-first portal work, and no business module leakage.

## 2. Non-goals

Phase 1 must not build Lead Desk, WhatsApp integration, Engagement Gateway Lite, website builder, LMS, student lifecycle, finance, HR, hiring, certification, quality/audit workflows, AI content editor, production deployment, or production-grade auth flows.

## 3. Phase 1 Modules Included

- Single Portal Shell: one authenticated app shell with placeholder My Work area only after screen contracts exist.
- Organization & Hierarchy Core: organization setup, domains, configurable unit types, units, and closure table behavior.
- Access Core: users, groups, capabilities, group-capability assignments, and permission scope foundations.
- AKTI One Registry foundation: module registry seed/read surface and manifest validation boundary.
- Platform Core: minimal audit log and event outbox only.
- Configuration Core: minimal organization settings only if needed by setup or portal mode.
- Simple/Builder Mode foundation: store the mode choice and make it available to the shell; no advanced builder features.

## 4. Phase 1 Data Model Scope

These models are planned for Phase 1 only. They must not be created until the approved Prisma/model ticket. Every implemented model must include matching `prisma/entity-registry.metadata.json` metadata and pass registry generation/check.

| Model | Purpose | owner_module | Tenant / RLS | Key fields | Indexes | Unique constraints | Audit | Entity registry metadata |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Organization` | Tenant root record. It is not tenant-scoped. | `core.organization` | tenant_scoped: no; organization_id_required: no; rls_required: no | `id`, `slug`, `display_name`, `status`, `created_at`, `updated_at` | `status` | `slug` | yes | phase 1, internal, retention permanent, organization events |
| `OrganizationDomain` | Verified domain routing and official email mapping. | `core.organization` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `domain`, `is_primary`, `verified_at` | `organization_id`, `domain` | global `domain`; `organization_id + domain` | yes | confidential, retention while org active, domain events |
| `UnitType` | Configurable hierarchy type definitions. | `core.organization` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `key`, `label`, `sort_order` | `organization_id` | `organization_id + key` | yes | internal, retention while org active |
| `OrganizationUnit` | Actual organization hierarchy nodes. | `core.organization` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `unit_type_id`, `parent_unit_id`, `key`, `name`, `status` | `organization_id`, `parent_unit_id`, `unit_type_id` | `organization_id + key` | yes | internal, retention while org active, unit events |
| `OrganizationUnitClosure` | Ancestor/descendant hierarchy queries. | `core.organization` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `organization_id`, `ancestor_unit_id`, `descendant_unit_id`, `depth` | `organization_id + ancestor_unit_id`, `organization_id + descendant_unit_id` | `organization_id + ancestor_unit_id + descendant_unit_id` | no direct audit; source unit changes audited | internal, derived retention, no direct events |
| `User` | Tenant user/account foundation. | `core.access` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `email`, `display_name`, `status`, `primary_unit_id` | `organization_id`, `primary_unit_id`, `status` | `organization_id + email` | yes | confidential, retention per user policy, user events |
| `Group` | Configurable access group. | `core.access` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `key`, `label`, `status` | `organization_id`, `status` | `organization_id + key` | yes | internal, retention while org active, group events |
| `UserGroup` | User to group membership. | `core.access` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `user_id`, `group_id`, `assigned_at` | `organization_id + user_id`, `organization_id + group_id` | `organization_id + user_id + group_id` | yes | confidential, retention per access policy, membership events |
| `Capability` | Manifest-seeded capability catalog. | `core.access` | tenant_scoped: no; organization_id_required: no; rls_required: no | `key`, `module_key`, `description`, `risk_level`, `gatekeeper_required`, `approval_chain_required` | `module_key`, `risk_level` | `key` | yes for seed changes | internal, retention permanent, capability events |
| `GroupCapability` | Capability assignment to groups with allowed scope. | `core.access` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `group_id`, `capability_key`, `scope_type`, `scope_unit_id` | `organization_id + group_id`, `organization_id + capability_key`, `scope_unit_id` | `organization_id + group_id + capability_key + scope_type + scope_unit_id` | yes | confidential, retention per access policy, assignment events |
| `AuditLog` | Append-only audit trail for platform actions. | `core.platform` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `actor_user_id`, `action_key`, `entity_type`, `entity_id`, `created_at`, `metadata` | `organization_id + created_at`, `actor_user_id`, `entity_type + entity_id` | `id` | self-auditing append-only | restricted, retention policy required, no update events |
| `EventOutbox` | Transactional event outbox. | `core.platform` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `event_type`, `version`, `payload`, `status`, `created_at`, `processed_at` | `organization_id + status + created_at`, `event_type` | `id` | yes | internal/confidential by payload, retention by outbox policy, emitted events |
| `ModuleRegistryEntry` | Installed/available module registry seed and read model. | `core.registry` | tenant_scoped: no; organization_id_required: no; rls_required: no | `module_key`, `display_name`, `version`, `status`, `manifest_hash` | `status` | `module_key` | yes for seed changes | internal, retention permanent, registry events |
| `OrganizationSetting` | Minimal tenant settings and simple/builder mode. | `core.configuration` | tenant_scoped: yes; organization_id_required: yes; rls_required: yes | `id`, `organization_id`, `key`, `value_json`, `updated_at` | `organization_id` | `organization_id + key` | yes | internal/confidential by setting, retention while org active, setting events |

`SystemSetting` is deferred. If a true platform-global setting becomes necessary in Phase 1, it requires an approved subdecision and entity registry metadata before implementation.

## 5. Multi-organization and RLS Rules

- `Organization` is the tenant root and is not itself tenant-scoped.
- All tenant-owned records must reference `organization_id`.
- Every tenant-scoped table must include `organization_id`, `organization_id_required: true`, `rls_required: true`, and an index including `organization_id`.
- Platform-global tables must be explicitly identified and must not silently carry tenant-owned data.
- Cross-organization access is platform-super-admin only and must be audited.
- No table may be added without entity registry metadata.
- `OrganizationDomain.domain` must be globally unique across organizations unless a formal multi-tenant domain-sharing exception is approved.
- AKTI internal users should map `@akti.com.pk` to the AKTI organization.

## 6. API/API Route Scope

Phase 1 plans backend API areas only at a high level:

- Auth/session placeholder only, with no full auth implementation until an auth/session ADR or Phase 1 subdecision is accepted.
- Organization setup and domain registration.
- Hierarchy CRUD for unit types and organization units.
- Users CRUD within organization scope.
- Groups CRUD and user-group membership.
- Capabilities read/seed from approved manifests/contracts.
- Group capability assignment with allowed permission scopes.
- Minimal audit log read.
- Minimal module registry read.
- Basic event outbox write/read for platform events.

All mutating APIs must plan permission checks, Gatekeeper preflight usage where relevant, audit logging, and organization isolation before implementation.

## 7. Frontend Screen Scope

Frontend work is screen-contract-first. P1-008 must create these artifacts before frontend implementation:

| Screen | Route | Purpose | Primary user | Required artifact |
| --- | --- | --- | --- | --- |
| Setup Organization | `/setup/organization` | create first organization and domain setup boundary | platform setup owner | `docs/screen-contracts/phase-1/setup-organization.screen.json` |
| Login/Auth Entry | `/login` | auth entry placeholder or decision screen | any user | `docs/screen-contracts/phase-1/login.screen.json` |
| Portal Shell / My Work | `/app` | single portal shell and empty My Work placeholder | authenticated user | `docs/screen-contracts/phase-1/portal-shell.screen.json` |
| Hierarchy Builder | `/app/hierarchy` | manage unit types and organization units | organization admin | `docs/screen-contracts/phase-1/hierarchy-builder.screen.json` |
| Users | `/app/users` | manage users within organization scope | organization admin | `docs/screen-contracts/phase-1/users.screen.json` |
| Groups & Authorities | `/app/groups` | manage groups and capabilities | organization admin | `docs/screen-contracts/phase-1/groups-authorities.screen.json` |
| Module Registry | `/app/modules` | view module registry status | platform/admin user | `docs/screen-contracts/phase-1/module-registry.screen.json` |
| Settings Minimal | `/app/settings` | manage minimal organization settings | organization admin | `docs/screen-contracts/phase-1/settings-minimal.screen.json` |

No fake dashboards, hardcoded roles, hardcoded units, dummy operational data, or placeholder actions may ship.

## 8. Build Sequence

- `P1-001`: Scaffold apps/packages for NestJS backend, Next.js frontend, shared packages, and validation command placeholders.
- `P1-002`: Add Prisma Phase 1 models plus entity registry metadata.
- `P1-003`: Regenerate and check entity registry with real models.
- `P1-004`: Align Access Core contracts and seeded capabilities.
- `P1-005`: Implement Organization setup API.
- `P1-006`: Implement hierarchy closure table logic and tests.
- `P1-007`: Implement users, groups, capabilities, and group-capability APIs.
- `P1-008`: Create Phase 1 screen-contract JSON artifacts listed above.
- `P1-009`: Implement portal shell from approved screen contract.
- `P1-010`: Implement setup wizard from approved screen contract.
- `P1-011`: Implement minimal audit log and event outbox behavior.
- `P1-012`: Harden Phase 1 validation and CI checks.

Phase 1 cannot begin until the local repo is pushed to GitHub or a formal exception is recorded.

## 9. Validation and CI Expectations

Required from the beginning:

```bash
pnpm contracts:validate
pnpm registry:generate
pnpm registry:check
pnpm exec prisma validate --schema prisma/schema.prisma
```

Required once app scaffold exists:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Phase 1 test coverage must include hierarchy closure logic, permission scope logic, organization isolation behavior, registry metadata checks, and RLS metadata checks. Missing scripts must be reported and added only through approved tickets.

## 10. Release Blockers for Phase 1

- Local repo not pushed to GitHub and no formal exception recorded.
- No backend permission checks.
- No organization isolation.
- No official email domain rule.
- No module registry foundation.
- No basic Gatekeeper preflight contract usage for high-risk actions.
- No basic audit log.
- No entity registry metadata for implemented models.
- No passing registry check.
- No screen contracts for Phase 1 screens.
- No clean build/typecheck once app scaffold exists.
- Full auth attempted without an accepted auth/session ADR or Phase 1 subdecision.

## 11. Codex Workflow for Phase 1

- Use Plan Mode first for every Phase 1 ticket.
- Keep one ticket to one bounded outcome and one clean commit.
- Do not scaffold beyond the approved ticket.
- Do not hardcode AKTI-only organization, role, campus, unit, user, or tenant assumptions.
- Do not leak business modules into Phase 1.
- Do not build frontend screens without approved screen contracts.
- Do not claim done without running and reporting relevant validation commands.

## 12. Open Decisions

- Auth library and session strategy.
- App package names and scaffold boundaries.
- Prisma 7 database configuration approach.
- RLS timing: schema/migration-enforced now or metadata-first.
- Backend-first versus frontend-shell-first implementation order.
- GitHub remote setup timing.
- Official email domain rule details and exception process.
- Whether `ModuleRegistryEntry` needs separate organization enablement in Phase 1 or a later ticket.

## 13. Acceptance Criteria for T00-010

- `docs/specs/phase-1-build-specification.md` exists.
- The specification is compact but actionable.
- The specification defines Phase 1 scope, non-goals, models, screens, ticket sequence, validation expectations, blockers, workflow, and open decisions.
- No Phase 1 code, Prisma models, app scaffold, package edits, dependency changes, contract edits, ADR edits, registry edits, generated output edits, staging, or commit are included.
