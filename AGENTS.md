# AKTI ERP Codex Operating Rules

This file is the operating guide for Codex in this repository.

---

## TICKET QUALITY — READ THIS FIRST

Full doctrine: docs/doctrine/AKTI_ERP_Ticket_Quality_Doctrine_v1.md
Axiom 1: Implementation is not stale by itself. Tickets become stale.
Axiom 2: Each ticket must contain maximum concrete implementation
within its approved scope.

The failure pattern is stale, vague, shallow, overlapping, unsafe, or
non-predictive tickets — not long queues. Ticket count is never a split condition.

Enforcing lines in every ticket pack prompt:
  "Implementation is not stale by itself. Tickets become stale."
  "Apply maximum concrete capability within the approved scope of each ticket."

A ticket is stale if it: references stale files, has missing dependencies,
leaves decisions open for Codex to make, has vague scope, has a
documentation-only MCR, overlaps another ticket's ownership, is too large
for one commit, or forces Codex to invent rules not in any committed source.

Split a ticket ONLY if it: owns multiple architectural decisions, creates
multiple runtime subsystems, mixes policy interpretation with implementation,
spans unrelated validation ladders, or creates overlapping file ownership.

MCR must name a runtime behavior, CI command result, or named artifact.
"Service documented", "file created", and "implementation improved" are
forbidden MCRs.

---

## Current Project State

- Phase 1: PASS
- Phase 2: PASS_WITH_ACCEPTED_DEFERRALS
- Phase 3: PASS_WITH_ACCEPTED_DEFERRALS
- Phase 4: PASS
- Phase 4A: PASS
- Phase 4B: PASS
- Phase 5A: PASS — merged to main at a866c7b1fbea2aff44418494286e85215c36cc79
- Current target: Phase 5B control docs and ticket pack (planning only)
- Phase 5B is Gatekeeper-Governed Module Foundry & Core Platform Completion
- Do not start Phase 5B execution, Foundry runtime, or module installer runtime
  until Phase 5B control docs and ticket pack are approved
- Phase 5C is Frontend Excellence & UI Platform Maturity — after Phase 5B merged/approved
- Phase 6A is Golden Module Certification — after Phase 5B + 5C
- Phase 6B+ is business modules — after Foundry exists and Golden Module certified
- Lead Desk is a business module, not core
- Engagement Gateway is a shared platform module
- WhatsApp stub is an integration adapter; no production WhatsApp until separately approved

## Phase 5A Outputs on Main — Primary Phase 5B Inputs

Read these before creating any Phase 5B ticket:

- docs/process/AKTI_ERP_Foundry_Implementation_Requirements_From_Phase_5A_v1.md
- docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md
- docs/process/AKTI_ERP_Phase_5B_Readiness_Handoff_After_Phase_5A_v1.md
- docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md
- docs/policies/AKTI_ERP_Gatekeeper_Module_Change_Checklist_v1.md
- docs/standards/AKTI_ERP_Event_Schema_Standard_v1.md
- docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md
- docs/standards/AKTI_ERP_Workflow_Process_Definition_Standard_v1.md
- docs/adr/ADR-0015-tenant-rls-enforcement-strategy.md
- docs/adr/ADR-0016-shell-base-capability-or-session-gated-screen.md
- docs/adr/ADR-0017-platform-versioning-baseline.md
- docs/adr/ADR-0018-module-registry-frontend-api-boundary.md
- platform.version.json

Phase 5A documents are read-only during Phase 5B. A gap found in a Phase 5A
document is a stop condition — not a reason to edit it.

---

## Required Stack

- Next.js + React + TypeScript
- NestJS + TypeScript
- PostgreSQL
- Prisma
- Redis + BullMQ
- Tailwind + shadcn/ui
- S3-compatible storage

## Source Of Truth Hierarchy

Lower rank number wins when sources conflict:

1. prisma/schema.prisma — tables, relationships, migrations, constraints
2. packages/contracts — Zod schemas, behavioral contracts, validation contracts
3. Module manifests — capabilities, permissions, routes, events, dependencies
4. Generated entity registry — derived view, not structural authority
5. docs/adr — accepted decisions and rationale
6. docs/doctrine/AKTI_ERP_Ticket_Quality_Doctrine_v1.md — ticket writing rules
7. docs/blueprints — planning direction and scope context only
8. Chat history — drafting support only, never final authority

## Phase 5B Locked Decisions

Final. Do not revisit:

- Gatekeeper = judge/policy enforcement only
  Outcomes: ALLOW | DENY | APPROVAL_REQUIRED | STOP_FOR_REVIEW
- STOP_FOR_REVIEW is immutable below platform architect level
- Foundry = module installer/lifecycle runtime only — executes after Gatekeeper authorizes
- Workflow Engine = core platform service, NOT a Foundry module
- Reporting = event-driven read models
- Search = PostgreSQL FTS baseline; pgvector reserved path; Typesense deferred
- Multi-tenancy = shared DB + organization_id default; future enterprise isolation path
- White-labeling = core architectural constraint; enum: none | partial | full
- Configurable labels = module defaults + tenant overrides; display-only
- Golden Module = Phase 6A only

## Codex Operating Model

- Inspect relevant repo files before planning or implementation.
- Use Plan Mode for multi-step work.
- Implement only from an approved plan unless the task is a typo fix or
  single-file text edit with no architecture impact.
- One ticket, one branch, one outcome.
- Use worktrees only for bounded parallel tasks with non-overlapping files.
- Do not run multiple agents on overlapping architecture, schema, contract,
  registry, manifest, Access Core, or Gatekeeper files.
- Future autonomous runs use stable contract plus flexible runtime: control
  docs define the contract; progress comes from git history, journals,
  artifacts, queue order.

## Hard Rules

- Never change architecture without an ADR.
- Never treat chat history as source of truth.
- Never produce another broad blueprint revision instead of repo artifacts.
- Never hardcode organization, campus, role, group, user, tenant, or
  AKTI-only business assumptions.
- Never bypass Access Core.
- Never bypass Gatekeeper for high-risk actions.
- Never invent permissions, roles, module boundaries, capabilities, APIs, or events.
- Never add tenant-scoped tables without organization_id, RLS metadata,
  required indexes, and negative cross-org tests.
- Never manually maintain lists that should be derived from Prisma,
  contracts, manifests, or generated artifacts.
- Never leave TODO placeholders in production code.
- Never claim done without running and reporting validation commands.
- Never produce documentation instead of working code unless the ticket
  is explicitly documentation-only.
- Never modify Phase 5A policy, ADR, standard, or checklist documents
  during Phase 5B execution.

## Phase 5B Non-Scope

No Phase 5B ticket may authorize:

- Phase 5C frontend pixel-perfect work
- Phase 6A Golden Module implementation or certification template
- Phase 6B+ business modules, business workflows, or business-specific UI
- Marketplace / public module store
- Production deployment beyond operational readiness proof
- Real external adapter production integration
- Runtime AI beyond approved governed proxy boundary
- Phase 5A policy/ADR/standard document modifications

## Approval Required Before

- Changes architecture
- Adds dependencies
- Changes Prisma schema broadly
- Changes auth or session logic
- Disables or weakens RLS
- Modifies Gatekeeper behavior
- Changes module boundaries
- Invents permissions or roles
- Hardcodes business structure
- Creates frontend UX without a screen contract
- Touches production secrets
- Runs destructive migrations
- Deletes broad file trees
- Rewrites large modules

## Architecture And Data Rules

- Prisma is the structural source of truth for entities.
- Entity Registry must be generated from Prisma plus approved metadata.
- CI must fail when generated registry drifts from checked-in output.
- Tenant-scoped data must include organization isolation, RLS metadata,
  required indexes, and negative cross-org tests.
- Module capabilities, APIs, events, settings, and menu entries must be
  declared through contracts or manifests.

## Frontend Rules

- Do not implement a frontend screen without a screen contract.
- A screen contract must define route, purpose, users, required capabilities,
  actions, data source, fields, validation, states, mobile behavior, audit
  hooks, and what must not happen.
- Use packages/ui components when available.
- Do not ship fake dashboards, placeholder buttons, hardcoded role dashboards,
  random dummy data, or generic UI without operational value.

## Validation Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test --filter api
pnpm build
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm contracts:validate
pnpm registry:generate
pnpm registry:check
pnpm registry:verify:phase2
```

## Done Means

- Code or artifact implemented
- Relevant tests added or updated
- Validation commands run and reported
- Lint, typecheck, build, tests, Prisma, contracts, registry checks pass
- No hardcoded tenant, org, campus, role, user, or business assumptions
- Acceptance criteria satisfied
- MCR proven by observable runtime behavior or CI result — not documentation
- Completion note: changed files, commands run, result, known gaps, next ticket

---
