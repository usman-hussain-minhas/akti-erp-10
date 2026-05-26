# AKTI ERP Phase 4B Command Palette Interaction Model v1

**Status:** DECIDED_FOR_PRODUCT_DEFINITION
**Feature:** Core Phase 4B shell feature.

## Interaction Model

- Trigger: Ctrl+K / Cmd+K and visible search/command entry.
- Overlay: centered command overlay.
- Results: grouped by destination/action type.
- Keyboard: full arrow, enter, escape, and tab/focus support.
- Close behavior: escape, outside click, and explicit close button.
- Empty state: plain-English message with safe next step.
- Recent commands: show recent local commands where safe.
- Admin commands: hidden from normal users rather than disabled with technical reason.

## Basic Action Set

- open dashboard
- open Lead Desk
- create lead if route exists
- open settings
- open help

## Module Command Declaration

Future modules should conceptually provide a small command declaration that the shell can understand. This is a contract sketch and future Foundry input, not a Phase 4B runtime implementation.

Minimum declaration shape:

| Field | Required? | Purpose |
| --- | --- | --- |
| `id` | yes | Stable command identity. |
| `label` | yes | Human-readable command text. |
| `description` | optional | Short plain-English help text. |
| `route` | optional | Destination route when the command navigates. |
| `action` | optional | Safe action key when the command performs an approved non-navigation action. |
| `group` | yes | Result grouping such as Navigation, Lead Desk, Settings, or Help. |
| `icon` | optional | Visual hint selected from the approved icon set. |
| `required_capability` | optional | Capability required to see or use the command. |
| `module_id` | optional | Owning module identity for future Foundry/module governance. |
| `keywords` | optional | Search aliases and operator-friendly terms. |
| `visibility condition` | optional | Rule for hidden, visible, admin-only, or context-specific display. |
| `disabled reason` | optional | Plain-English explanation when an authorized admin context sees a disabled command. |

Example declaration sketch:

```json
{
  "id": "lead_desk.open_inbox",
  "label": "Open Lead Desk",
  "description": "Review incoming leads.",
  "route": "/lead-desk/inbox",
  "group": "Lead Desk",
  "required_capability": "lead.inbox.view",
  "module_id": "lead.desk",
  "keywords": ["leads", "inbox", "follow up"]
}
```

Phase 4B command palette may use static/core commands only. Module-driven command registration waits for Phase 5B Foundry. Admin-only commands must be hidden from normal users, or disabled with a plain-English reason for authorized admin contexts.

## Deferred Actions

- macros
- inline parameter commands
- cross-module backend search
- AI command generation
- module installer commands
- production integration actions

## Boundaries

The command palette navigates and opens approved Phase 4B surfaces only. It must not become Foundry, module installation, automation macro runtime, AI runtime, or cross-module search platform.
