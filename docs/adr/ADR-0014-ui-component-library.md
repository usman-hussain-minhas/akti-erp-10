# ADR-0014: UI Component Library Direction

**Status:** Accepted for Phase 4B product definition
**Date:** 2026-05-26

## Context

Project doctrine identifies Tailwind CSS + shadcn/ui as the intended frontend stack. Current `apps/web/package.json` does not yet contain Tailwind/shadcn installation/configuration, and Phase 4B product definition must not modify dependencies or package files.

## Decision

Tailwind CSS + shadcn/ui is the selected design-system direction for Phase 4B.

Installation, configuration, dependency changes, generated UI files, and lockfile updates are deferred to explicit Phase 4B ticket-pack approval.

## Constraints For Phase 4B Tickets

- Any dependency/config/lockfile change requires an exact-file plan and approval through the Phase 4B ticket pack.
- Shared shell/layout/components must be established before broad screen polish.
- Future modules must use shared components where the design system contract says “must use.”
- shadcn/ui components may be adapted, but modules must not fork their own shell/navigation system.

## Risk And Rollback

Risk: installing UI tooling casually could create package drift or uncontrolled styling conventions.

Rollback: revert the specific UI dependency/config/component files from the ticket that introduced them; do not alter runtime domain logic, Prisma, contracts, or generated registry to repair UI setup.

## Non-Scope

This ADR does not install Tailwind, shadcn/ui, Radix, icon libraries, or any package. It does not implement frontend screens, Foundry/module installer, AI runtime, production launch, or production integrations.
