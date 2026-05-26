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

## Component Behavior Rules

These rules are usage and constraint rules only. They do not define props, implementation APIs, generated component files, or package configuration.

| Component / state | Minimum behavior rule |
| --- | --- |
| Buttons | Primary button is used for one main action per screen only. Destructive actions use danger styling and require confirmation. |
| Links | Links navigate to another surface or external reference and must not masquerade as form submission. Link labels must describe the destination in plain language. |
| Forms | Forms group related inputs under a visible purpose and must show submit, cancel/back, loading, success, and error states where applicable. Unsupported forms remain placeholders and expose no fake controls. |
| Inputs | Inputs must have visible labels, readable helper text where needed, and clear disabled/read-only states. They must not display raw tokens or IDs to normal users unless inside approved Advanced Diagnostics. |
| Labels | Labels use human-readable copy rather than database or API field names. Required fields must be indicated without relying on color alone. |
| Validation messages | Validation messages must appear near the relevant field or form summary and explain the issue in plain English. They must avoid raw API messages, stack traces, or schema key leakage for normal users. |
| Tables | Tables must support readable row hover/focus states and clear empty/loading/error states. Dense data must remain scannable on desktop and fall back safely on narrow screens. |
| Cards | Cards represent individual repeated items or compact summaries only. Page sections must not become nested cards inside cards. |
| Modals | Modals must trap focus while open, provide an obvious close path, and close with Escape where appropriate. They are reserved for focused decisions, confirmations, or short forms. |
| Drawers | Drawers must be dismissible, keyboard reachable, and sized so content remains readable on mobile and desktop. They are appropriate for navigation, notifications, and contextual detail. |
| Toasts | Toasts use plain-English copy and avoid raw API messages. They must not be the only place where a critical error or required next action appears. |
| Tabs | Tabs separate peer sections within one task area and must show the active section clearly. Tabs must not hide required actions in a way that prevents normal task completion. |
| Badges | Badges show compact status such as session, module, or record state. Badge color must be paired with readable text and must not encode business-critical meaning by color alone. |
| Breadcrumbs | Breadcrumbs show current location inside the ERP shell when hierarchy is deeper than one level. They must use operator-readable page names rather than route IDs. |
| Navigation | Navigation must show the current location, hide unauthorized normal-user destinations, and provide plain-English disabled reasons where disabled admin surfaces remain visible. |
| Empty states | Empty states must include a human-readable message and a next action where possible. They must not use fake rows or dummy operational data. |
| Loading states | Loading states must be visible, stable, and not resize fixed shell regions unexpectedly. They should explain what is loading when the context is not obvious. |
| Error states | Error states must avoid raw codes, stack traces, and API/debug wording for normal users. Recovery guidance should be plain English and tied to a safe next step. |
| Focus states | Focus states must be visible for keyboard users across navigation, buttons, links, inputs, tabs, drawers, and modals. Focus order should follow the visual and task order. |
| Hover states | Hover states may clarify interactivity but must not be the only cue that an element is actionable. They must not shift layout or obscure adjacent content. |
| Disabled states | Disabled controls must visually communicate disabled state and, where helpful, expose a plain-English reason. Disabled placeholders must not imply that unsupported backend behavior is available. |

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
