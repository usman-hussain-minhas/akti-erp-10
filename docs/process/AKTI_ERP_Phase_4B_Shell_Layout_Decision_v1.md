# AKTI ERP Phase 4B Shell Layout Decision v1

**Status:** DECIDED_FOR_PRODUCT_DEFINITION
**Decision:** Mission Control shell with collapsible desktop sidebar, compact top utility bar, mobile drawer, and bottom primary navigation.

## Desktop Layout

- Collapsible left sidebar for primary navigation.
- Compact top utility bar for session state, user/org menu, settings, help, and notifications.
- Mission Control/default dashboard content at `/app`.
- Fixed shell frame with only the content region scrolling.
- Comfortable default density.

## Sidebar Behavior

- Expanded sidebar shows labels and icons.
- Collapsed sidebar may show icons only with accessible labels/tooltips.
- Sidebar includes Mission Control, Lead Desk, Settings, and available module entries.
- Future modules must register navigation into the shell rather than creating isolated navigation.

## Top Bar

- Top-right cluster contains user/org menu, settings/help/notification affordances, and session status.
- Session status must show one of:
  - session active
  - session missing
  - session expired/invalid
  - limited diagnostics mode
- “Set up session” links to Advanced Diagnostics when session is missing.

## Layered Visibility Model

Phase 4B accepts a temporary local/demo screen-contract limitation: `mission-control-shell.screen.json` remains schema-valid by requiring `access.policy.manage` because the current `private_portal` contract schema requires at least one required capability. Current Phase 4B local/demo sessions are admin/elevated, so this is acceptable for product-definition review and local/demo proof.

This is not the intended long-term shell model. The target layered visibility model is:

- Shell base visibility is any authenticated/session-valid operator.
- Lead Desk navigation is shown when the operator has `lead.inbox.view` or `lead.intake.create`.
- Settings, Access management, settings mutations, admin regions, and Advanced Diagnostics are gated by `access.policy.manage` or a future equivalent.
- Module regions are capability-gated individually and must not inherit admin access as a blanket shell requirement.

Phase 5A must resolve the base authenticated shell capability or session-gated screen-contract model before Phase 6 non-admin operators/modules. Phase 4B implementation tickets must not treat `access.policy.manage` as the final user-facing shell gate.

## Mobile Layout

- Mobile uses a hybrid drawer plus bottom primary navigation.
- Bottom navigation includes Mission Control, Lead Desk, Settings, and menu/drawer access.
- Secondary/admin destinations live in the drawer to avoid crowding.

## Module Launcher

- Mission Control/default dashboard uses a grid launcher.
- Command palette uses list/search launcher.
- Foundry/module installer behavior is not part of Phase 4B.

## Advanced Diagnostics Placement

- Advanced Diagnostics lives under Settings/Admin.
- Bearer token/session technical details may appear only there.
- Normal operators must not see bearer token textareas, decoded token internals, org IDs, actor IDs, lead IDs, or raw technical session fields.

## Notification Region

- Notification center is a shell drawer/region.
- No separate notification route or screen contract is created in this product definition.
- Notification semantics, retention, delivery, WhatsApp/SMS/email, and module-driven notifications are deferred to Phase 5A policy.

## Accessibility And Layout Expectations

- Navigation must expose current location.
- Keyboard navigation must reach sidebar, top bar, command palette, drawer, and content.
- Mobile drawer and overlays must have clear close behavior.
- Text must remain readable at common desktop/mobile sizes.
- Visual QA is a pass/fail gate for Phase 4B closure.
