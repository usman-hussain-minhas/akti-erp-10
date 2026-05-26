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
