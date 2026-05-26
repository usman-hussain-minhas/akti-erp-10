# ADR-0014: UI Component Library Direction

## ADR number

ADR-0014

## Title

UI Component Library Direction

## Date

2026-05-26

## Status

Accepted for Phase 4B product definition

## Context

AKTI ERP needs a consistent frontend component direction before Phase 4B implementation begins. The current frontend is proof-capable but visually basic, and future modules will need shared shell, navigation, forms, tables, empty/error/loading states, overlays, and feedback components. Without a common component direction, Phase 4B would either invent one-off CSS or let every future module create a different UI language.

`AGENTS.md` and project direction identify Tailwind CSS + shadcn/ui as the intended frontend stack. Current product-definition work must document that direction without installing packages, changing lockfiles, adding generated component files, or modifying runtime configuration.

## Predecessors / Prior State

The decision builds on:

- Phase 1 and Phase 2 screen-contract-first frontend rules.
- Phase 4 frontend current-state evidence showing proof-like UI and technical leakage.
- Phase 4A browser/screenshot capture support and local demo runbook.
- ADR-0013 Mission Control shell architecture.
- The Phase 4B Design System Contract v1.

Before this ADR, the repo had the intended stack direction but no accepted product-definition-level component contract for Phase 4B or future modules.

## Decision

Tailwind CSS + shadcn/ui is the selected design-system direction for Phase 4B.

Installation, configuration, dependency changes, generated UI files, lockfile updates, Tailwind config, shadcn registry setup, and component scaffolding are not performed in this docs task. They require explicit Phase 4B ticket-pack approval with exact-file plans and validation.

Phase 4B tickets must establish shared shell/layout/components before broad screen polish. Future modules must use shared components wherever the Design System Contract marks a component or behavior as “must use.” Modules may extend domain-specific content areas only where the contract allows “may extend” or “free choice.”

## Sequencing

1. Product definition records Tailwind CSS + shadcn/ui as selected direction.
2. Phase 4B ticket pack must separately approve dependency/config/lockfile changes, if needed.
3. Component library setup must be validated before shell and screen implementation depend on it.
4. Mission Control shell, navigation, buttons, forms, tables, overlays, states, and feedback components must land before broad Lead Desk polish.
5. Visual QA and noob-proof checklist must verify shared behavior before Phase 4B closure.

## Module UI Implications

Future modules must not create private shell chrome, unrelated navigation, incompatible button systems, or bespoke table/form/error patterns. They must use shared AKTI shell, navigation, page layout, state, and feedback components where marked “must use.” This avoids UI fragmentation in Phase 6 by making module screens feel like parts of one ERP rather than independent mini-apps.

Modules may extend domain-specific content such as card body details, table column choice, local form ordering, and business copy, but they must preserve shared accessibility, focus, hover, disabled, empty, loading, error, and no-technical-leakage rules.

## Consequences

- Phase 4B implementation tickets must not casually modify `package.json`, lockfiles, Tailwind config, or generated UI files.
- Any UI dependency/config change requires exact-file planning and ticket-pack approval.
- Design System Contract v1 becomes the product-definition constraint for Phase 4B ticket authoring.
- Tailwind/shadcn direction can guide ticket planning while keeping this branch docs-only.
- Shared components become a governance boundary for future Phase 6 modules.

## Alternatives Considered

| Alternative | Reason rejected or deferred |
| --- | --- |
| Continue custom ad hoc CSS | Would preserve current proof-like UI and make module UX inconsistent. |
| Choose a large component framework without Tailwind/shadcn | Adds dependency and styling assumptions contrary to project direction. |
| Install/configure Tailwind/shadcn in product-definition branch | Violates docs-only boundary and package/lockfile restrictions. |
| Let each future module pick its own UI kit | Causes Phase 6 UI fragmentation and weakens Mission Control consistency. |
| Define prop-level component APIs now | Too implementation-specific for product definition; belongs in Phase 4B implementation tickets. |

## Risks / Mitigations

| Risk | Mitigation |
| --- | --- |
| Dependency or lockfile drift during docs work | This ADR explicitly forbids installation/configuration until ticket-pack approval. |
| shadcn components are copied without AKTI behavior rules | Design System Contract defines must-use behavior and accessibility constraints. |
| Modules fork component patterns in Phase 6 | Require must-use shared components for shell, navigation, forms, tables, overlays, states, and feedback. |
| Product docs become prop-level implementation specs | Keep docs at usage/constraint level; leave props and composition to approved tickets. |
| Visual polish outruns accessibility | Noob-proof checklist and visual QA must gate closure. |

## Non-Scope

This ADR does not install Tailwind, shadcn/ui, Radix, icon libraries, or any package. It does not create Tailwind config, component files, runtime UI code, frontend screens, Foundry/module installer, AI runtime, production launch, production integrations, or Phase 5 work.

## Owner

AKTI / Phase 4B product definition controller.

## Review date

Before Phase 4B ticket-pack creation and again before Phase 4B closure.
