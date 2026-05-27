# AKTI ERP Codex Operating Rules

This file is the operating guide for Codex in this repository. It summarizes `docs/doctrine/AKTI_ERP_Failure_Prevention_Codex_Operating_Doctrine_v1.json` and must stay compact.

`AGENTS.md` is not the architecture source of truth. If this file conflicts with Prisma, `packages/contracts`, module manifests, the generated registry, or ADRs, the source-of-truth hierarchy below wins.

## Required Stack

- Next.js + React + TypeScript
- NestJS + TypeScript
- PostgreSQL
- Prisma
- Redis + BullMQ
- Tailwind + shadcn/ui
- S3-compatible storage

## Current Project State

- Phase 1 status: PASS.
- Phase 2 status: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 3 status: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 4 status: PASS.
- Phase 4A status: PASS.
- Phase 4B status: PASS.
- Phase 5A status: PASS.
- Current planning target: Phase 5B control docs and ticket pack only.
- Phase 5B is Gatekeeper-governed Foundry / Module Installer implementation after approved Phase 5B control docs and ticket pack exist.
- Do not start Phase 5B execution, Foundry runtime, or module installer runtime from this file.
- Phase 5C is Frontend Excellence & UI Platform Maturity after Phase 5B is merged and approved.
- Phase 6A is Golden Module Certification.
- Phase 6B+ is business modules after Foundry/module installer exists and Golden Module certification is complete.
- Lead Desk is a business module, not core.
- Engagement Gateway is a shared platform module.
- WhatsApp stub is an integration adapter; no production WhatsApp credentials or real outbound WhatsApp are in scope until separately approved.

## Source Of Truth Hierarchy

Lower rank number wins when sources conflict:

1. `prisma/schema.prisma`: tables, relationships, migrations, database constraints
2. `packages/contracts`: Zod schemas, behavioral contracts, validation contracts
3. Module manifests: capabilities, permissions, routes, events, dependencies, settings, menu entries
4. Generated entity registry: derived Prisma and metadata view, not structural authority
5. `docs/adr`: accepted decisions and rationale
6. `docs/blueprints`: planning direction and scope context only
7. Chat history: drafting support only, never final authority

## Codex Operating Model

- Inspect relevant repo files before planning or implementation.
- Use Plan Mode for multi-step work.
- Use Plan Mode for schema, auth, permission, RLS, payment, certification, WhatsApp, frontend screen, and module-boundary tasks.
- Implement only from an approved plan unless the task is a tiny typo fix or single-file text edit with no architecture impact.
- Future autonomous runs use a stable contract plus flexible runtime model: control docs define the contract, while runtime progress comes from git history, journals, artifacts, optional run-state files, and queue order.
- Keep work ticket-sized: one ticket, one branch/worktree, one outcome.
- Use worktrees only for bounded parallel tasks with non-overlapping files.
- Do not run multiple agents on overlapping architecture, schema, contract, registry, manifest, Access Core, or Gatekeeper files.

## Hard Rules

- Never change architecture without an ADR.
- Never treat chat history as source of truth.
- Never produce another broad blueprint revision instead of repo artifacts.
- Never hardcode organization, campus, role, group, user, tenant, or AKTI-only business assumptions.
- Never bypass Access Core.
- Never bypass Gatekeeper for high-risk actions.
- Never invent permissions, roles, module boundaries, capabilities, APIs, or events.
- Never add tenant-scoped tables without `organization_id`, RLS metadata, required indexes, and negative cross-org tests.
- Never manually maintain source-of-truth lists that should be derived from Prisma, contracts, manifests, or generated artifacts.
- Never leave TODO placeholders in production code.
- Never claim done without running and reporting validation commands.
- Never produce documentation instead of working code unless the ticket is explicitly documentation-only.

## Approval Required Before

Codex must get explicit approval before it:

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
- Uses AI-generated content to publish website pages

## Architecture And Data Rules

- Prisma is the structural source of truth for entities.
- Entity Registry must be generated from Prisma plus approved metadata, not manually maintained.
- CI must fail when generated registry output drifts from checked-in generated output once registry tooling exists.
- Tenant-scoped data must include organization isolation, RLS metadata, required indexes, and negative cross-org tests.
- Module capabilities, APIs, events, dependencies, settings, and menu entries must be declared through contracts or manifests.
- Future phases should remain placeholders until phase-specific planning begins.

## Frontend Rules

- Do not implement a frontend screen without a screen contract.
- A screen contract must define route, purpose, users, required capabilities, actions, data source, fields, validation, states, mobile behavior, audit hooks, and what must not happen.
- Use `packages/ui` components when available.
- Do not ship fake dashboards, placeholder buttons, hardcoded role dashboards, hardcoded campus names, random dummy data, or generic UI without operational value.
- Frontend done means working route, permission-aware navigation, real layout, empty/loading/error states, responsive behavior, connected API or explicit mock contract, validation, filters where needed, visible primary action, and passing build.

## Validation Commands

Run the narrow relevant subset after each change:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test --filter access-core
pnpm test --filter lead-desk
pnpm build
npx prisma validate
npx prisma migrate diff
pnpm contracts:validate
pnpm registry:generate
pnpm registry:check
```

If a validation script or scaffold does not exist yet, do not create it as a side effect. Report it as unavailable and recommend the next ticket.

## Done Means

- Code or requested artifact implemented
- Relevant tests added or updated when code changes
- Relevant validation commands run, or unavailable commands reported honestly
- Lint, typecheck, build, tests, Prisma validation, contract validation, and registry checks pass when applicable
- No hardcoded tenant, organization, campus, role, user, or business assumptions
- Acceptance criteria satisfied
- Short completion note provided with changed files, commands, result, known gaps, and next recommended ticket

## What This File Prevents

- Architecture drift by chat memory
- Blueprint revision loops replacing delivery
- Evidence packs and reports being treated as completion
- Manual list drift across entities, RLS, indexes, events, blockers, and manifests
- Tenant isolation mistakes
- Gatekeeper or Access Core bypasses
- Hardcoded AKTI org, campus, user, or role assumptions
- Frontend screens built from imagination
- Fake dashboards and unusable generic UI
- Broad unsafe schema or auth changes without approval
- Parallel agents editing overlapping files
- Premature Phase 5 or Phase 6 over-specification
- WhatsApp and Lead Desk urgency being buried behind foundation work
