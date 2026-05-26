# AKTI ERP Design System Contract v1

**Status:** PRODUCT_DEFINITION_CONTRACT
**Selected direction:** Tailwind CSS + shadcn/ui.

Tailwind/shadcn installation and configuration are Phase 4B ticket-pack items, not product-definition tasks. This document does not authorize dependency, package, lockfile, or runtime configuration changes.

## Token Baseline

| Area | Contract | Module constraint |
| --- | --- | --- |
| Colors/theme baseline | Define semantic background, foreground, muted, border, accent, success, warning, danger, and info tokens with readable contrast | must use |
| Typography | Define page title, section heading, body, helper, label, table, and button text styles | must use |
| Spacing | Use consistent spacing scale for shell, forms, cards, tables, drawers, and modals | must use |
| Radius/shadows | Use restrained radius and shadow tokens; cards are not nested inside cards | must use |
| Focus/hover/disabled | Visible focus rings, clear hover states, disabled state with explanation where needed | must use |

## Component Obligations

| Component area | Phase 4B contract | Module constraint |
| --- | --- | --- |
| Shell/layout | Shared Mission Control shell, sidebar, top bar, content region | must use |
| Navigation | Sidebar, mobile drawer, bottom nav, breadcrumbs/current location | must use |
| Buttons/links | Primary, secondary, subtle, danger, icon button, text link | must use |
| Forms | Labels, helper text, errors, validation state, disabled state | must use |
| Tables | Responsive table/card fallback, empty/loading/error states | must use |
| Cards | Individual repeated items only; no nested card page sections | may extend |
| Modals/drawers | Accessible open/close, focus management, escape behavior | must use |
| Toasts | Toast renderer for system/demo messages only in Phase 4B | must use |
| Tabs | Use for settings/control-panel sections where appropriate | may extend |
| Badges | Status/session/module labels | must use |
| Empty states | Plain message plus next action where safe | must use |
| Loading states | Visible and non-jarring | must use |
| Error states | Plain English, no stack traces/raw API terms | must use |

## Accessibility Rules

- Every screen has a visible page title.
- Every form field has a label.
- Keyboard focus must be visible.
- Overlays/drawers must be keyboard reachable and dismissible.
- Destructive actions require confirmation.
- Normal users do not see raw tokens, org IDs, actor IDs, lead IDs, stack traces, or debug output.
- Browser screenshots must pass readability and technical-leakage review.

## Module Extension Rules

- Future modules must use shared shell/layout/components where marked “must use.”
- Modules may extend repeated item cards, domain-specific table columns, and local form field ordering when they preserve shared states and accessibility.
- Modules have free choice only for domain-specific content copy and safe non-structural visual details.
- Foundry/module installer integration is a Phase 5B concern, not part of this contract.
