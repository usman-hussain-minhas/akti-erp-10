# AKTI ERP Phase 4 Operational Proof Plan v1

**Status:** Planning/control document only
**Phase:** Phase 4 - Operational Proof
**Current baseline:** `78b2fff6ba2fe8154f49e3b6768d5a8d2eeeb6fc`
**Purpose:** Define Phase 4 scope, decisions, gates, evidence, and non-scope before any Phase 4 implementation.

This document does not authorize Phase 4 implementation by itself. The Phase 4 ticket pack governs execution only after it is separately approved.

## Authority

Repo source of truth remains, in order:

1. `prisma/schema.prisma`
2. `packages/contracts`
3. module manifests
4. `generated/entity-registry.generated.json`
5. `docs/adr`
6. tests, validation evidence, and closure packages
7. process/control docs
8. roadmap references

The roadmap is a strategic reference only. If this plan conflicts with Prisma, contracts, manifests, generated registry, ADRs, tests, validation evidence, or closure evidence, the higher-authority repo artifact wins.

## Phase 4 Definition

Phase 4 is Operational Proof.

Phase 4 should prove AKTI ERP can run, bootstrap, be inspected, smoke-tested, browser-tested, visually checked, backed up, restored, rolled back, and operationally supported in a controlled staging/demo environment.

Global invariant:

```text
Phase 4 proves controlled staging/demo readiness.
Phase 4 must not silently become production launch.
```

Maximum concrete capability in Phase 4 means proving the system can run in controlled staging/demo conditions wherever safe. It does not permit production launch, real production credentials, real WhatsApp production behavior, Foundry/module installer implementation, platform AI runtime, or new business modules.

## Phase 4 Scope

Phase 4 includes planning and, after ticket approval, bounded proof for:

- deployment/staging readiness;
- environment readiness;
- production secret provisioning path without accessing real secrets;
- fresh DB/bootstrap proof;
- browser-rendered frontend tests;
- visual QA evidence;
- smoke tests;
- operational runbook;
- backup/restore;
- rollback;
- distributed/infrastructure route limiting decision;
- production auth/session provider provisioning path;
- external audit/closure package.

## Phase 4 Non-Scope

Phase 4 must not include:

- production launch by implication;
- new business modules;
- Foundry/module installer implementation;
- platform AI runtime implementation;
- Phase 5 or Phase 6 work;
- real outbound WhatsApp unless separately approved;
- production credential access;
- destructive migrations;
- unapproved dependencies;
- ungoverned production shortcuts;
- weakening Phase 1/2/3 protections.

## Protections To Preserve

Phase 4 must preserve:

- Access Core actor/capability boundaries;
- Gatekeeper fail-closed behavior;
- tenant/request context trust model;
- route organization mismatch denial;
- Lead Desk scope enforcement;
- Engagement Gateway mediated WhatsApp boundary;
- no direct Lead Desk-to-Meta/WhatsApp coupling;
- audit/outbox evidence;
- cross-org denial behavior;
- runtime route limiting hardening;
- security headers/CORS/env handling;
- no `x-actor-user-id` trusted ingress regression;
- no Prisma/schema drift unless explicitly approved;
- no generated registry drift unless intentionally regenerated and checked.

## Accepted Deferrals Entering Phase 4

| Deferral | Classification | Phase 4 handling |
| --- | --- | --- |
| Production deployment | Phase 4 input and separately approved production decision | Prove controlled staging/demo readiness; do not launch production by implication. |
| Production auth/session provider and credentials | Phase 4 input and separately approved production decision | Decide provider/provisioning path; do not access real credentials. |
| Production WhatsApp credentials | Separately approved production decision | Keep out of Phase 4 unless separately approved. |
| Real outbound WhatsApp | Separately approved production decision | Keep Engagement Gateway stub-only unless separately approved. |
| Fresh empty-database bootstrap proof | Phase 4 input | Prove clean DB bootstrap under approved staging/demo constraints. |
| DB-level RLS / tenant transaction context | Later-phase input unless reopened by evidence | Default is not to reopen in Phase 4 unless staging/bootstrap evidence proves service-level isolation is insufficient for operational proof. |
| Browser-rendered frontend tests | Phase 4 input | Decide and implement approved browser-rendered proof path. |
| Distributed/infrastructure route limiting | Phase 4 input | Decide infra/proxy complement or bounded deferral; preserve app limiter. |

## DB RLS Default Rule

Do not reopen DB-level RLS or Prisma tenant transaction architecture in Phase 4 unless staging/bootstrap evidence proves service-level isolation is insufficient for operational proof. Any DB RLS work requires a separate approved decision before Prisma, migration, runtime transaction, or validation changes.

## Decisions Required Before Implementation

| Decision | Why needed | Blocking what | Artifact | Stop condition |
| --- | --- | --- | --- | --- |
| Staging target/environment | Avoid provider-specific drift and production shortcuts. | Deployment proof, env config, CORS origins. | ADR or Phase 4 control decision. | Target requires production secrets, production rollout, or unapproved dependencies. |
| Deployment method | Defines build/run topology and operational proof path. | Staging proof, rollback, runbook. | ADR or runbook decision. | Method implies production launch or deployment implementation beyond approved scope. |
| DB approach | Fresh DB proof needs approved database target and migration policy. | Bootstrap proof, backup/restore. | ADR or Phase 4 DB decision. | Production DB access or destructive migration is required. |
| Seed/admin bootstrap model | Bootstrap must avoid hardcoded AKTI-only assumptions. | Fresh DB proof, smoke tests. | Bootstrap decision/spec. | New roles, permissions, org rules, or business rules must be invented. |
| Secret provisioning mechanism | Runtime requires secrets but repo must not store them. | Env readiness, auth/session, staging run. | Secrets/runbook decision. | Real secrets or production credentials are required. |
| Production auth provider path vs staging-safe auth path | Phase 3 token is not a production provider. | Auth smoke, browser tests, production-readiness statement. | Auth provider decision. | Provider dependency or real credentials are required without approval. |
| Browser/visual QA tool | Current web tests are source-level, not browser-rendered. | Browser tests and visual QA evidence. | QA tooling decision. | New dependency is required without explicit approval. |
| Backup/restore method | Operational proof needs recovery evidence. | Backup/restore drill, runbook. | Recovery decision. | Production data or destructive operations are required. |
| Rollback method | Staging changes must be reversible. | Rollback drill, closure. | Rollback decision. | Rollback requires production changes or data loss. |
| Distributed/infrastructure route limiting | Phase 3 limiter is in-app, not distributed. | Infra limiting resolution. | Route limiting decision. | App limiter would be removed or unapproved infra dependency is required. |
| Audit package requirements | Closure needs evidence shape before execution. | P4-GATE. | Audit package decision. | Package would include secrets, production data, or unapproved artifacts. |

## Workstreams

| Workstream | Purpose | Dependencies | Expected evidence | Non-scope |
| --- | --- | --- | --- | --- |
| P4-W1 Baseline/readiness audit | Confirm source, Phase 3 closure, Roadmap v2, validation state. | None | Baseline report. | Runtime changes. |
| P4-W2 Environment and secret provisioning plan | Define env model and secret injection path without secrets. | P4-W1 | Decision/runbook and no-secret policy. | Real secrets. |
| P4-W3 Fresh DB/bootstrap proof | Prove clean DB migrations, setup, and registry/capability seed path. | P4-W2 and DB decision | Disposable DB evidence and smoke output. | Production DB or destructive migration. |
| P4-W4 Staging/deployment path | Prove controlled staging/demo run topology. | P4-W2, P4-W3 | Staging build/run evidence. | Production launch. |
| P4-W5 Smoke/health checks | Prove API/web health and core flows. | P4-W3, P4-W4 | Smoke logs and repeatable commands. | New feature behavior. |
| P4-W6 Browser-rendered frontend and visual QA | Prove browser-rendered screens and visual evidence. | P4-W4, P4-W5, tool decision | Browser logs and redacted screenshots. | UX redesign. |
| P4-W7 Backup/restore/rollback | Prove recovery and reversal procedures. | P4-W3, P4-W4 | Drill evidence. | Production data. |
| P4-W8 Operational runbook and support/incident flow | Document operating, support, incident, env, and recovery procedures. | P4-W2 through P4-W7 | Runbook. | Organization-wide SOP invention. |
| P4-W9 Infrastructure/distributed route limiting decision | Decide infra limiter complement or bounded deferral. | P4-W4 | Decision/evidence. | Removing app limiter. |
| P4-W10 Production auth/session provider provisioning path | Decide production provider path or staging-safe boundary. | P4-W2, P4-W4 | ADR/runbook. | Real credentials without approval. |
| P4-W11 Phase 4 validation/audit/closure package | Package final evidence and readiness status. | All workstreams | Audit/closure package. | Phase 5 ticket pack. |

## Runtime Consistency Chains

- env -> runtime config -> staging config -> no-secret validation -> smoke tests
- fresh DB -> migrations -> bootstrap/setup -> seeded capabilities/modules -> smoke tests
- auth provider path -> request context -> frontend session context -> browser tests
- route limiting -> proxy/infra decision -> app limiter fallback -> negative tests
- backup -> restore drill -> rollback runbook -> closure evidence
- frontend route -> browser test -> visual QA evidence
- audit/outbox -> operational runbook -> closure package

## Validation Gate Proposal

Phase 4 must preserve the existing full validation ladder:

```bash
pnpm contracts:validate
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm exec prisma generate --schema prisma/schema.prisma
pnpm registry:generate
git diff --exit-code -- generated/entity-registry.generated.json
pnpm registry:check
pnpm registry:verify:phase2
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff -- prisma/schema.prisma
git diff -- prisma/entity-registry.metadata.json
git diff --check
git status --short --branch
```

Phase 4 ticket planning should add evidence gates for:

- fresh DB migration/bootstrap validation;
- staging build validation;
- smoke test validation;
- browser-rendered frontend test validation;
- visual QA checklist;
- backup/restore drill evidence;
- rollback drill evidence;
- security regression tests;
- env/secrets no-leak checks;
- audit package checksum/source package generation.

## Evidence Redaction Rules

Phase 4 may generate logs, screenshots, staging outputs, env checks, backup/restore evidence, and audit packages. All evidence must obey:

- no secrets in logs;
- no secrets in screenshots;
- no credentials in audit package;
- no production data in backup/restore evidence;
- no real production env files in artifacts;
- no accidental token/session leakage in browser evidence.

## Closure Boundary

P4-GATE may complete the Phase 4 audit report, produce evidence packages, classify remaining deferrals, and state whether Phase 5 planning can begin. It must not create Phase 5 tickets or start Foundry/module installer work unless separately instructed.
