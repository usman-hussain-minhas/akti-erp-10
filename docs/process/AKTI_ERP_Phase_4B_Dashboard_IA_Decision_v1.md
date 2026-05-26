# AKTI ERP Phase 4B Dashboard IA Decision v1

**Status:** DECIDED_FOR_PRODUCT_DEFINITION
**Route ownership:** Dashboard v1 is default Mission Control content at `/app`; no separate `/app/dashboard` route is selected in this product definition.

## Layout

- Full-width welcome/next-step region.
- Grid of approved operational cards below.
- Module launcher grid visible in Mission Control.
- New-org empty state explains what is available and what is still future-phase work.

## Data Rule

Dashboard v1 is existing-API-only and no-fake-data.

Unsupported widgets must be placeholders or deferrals. A placeholder is visible, plainly labeled as future-phase work, has no functional controls, and contains no fake operational numbers.

## Widget Dependency Table

| Widget | Data required | Existing API support | Recommendation |
| --- | --- | --- | --- |
| Welcome / next steps | Static/contextual shell state | No backend required | build |
| Module status | Module list/status | `GET /platform/modules` | build read-only |
| Lead Desk quick card | Existing Lead Desk list/count-like data | Lead Desk list API only; no aggregate endpoint | build only if session UX is safe; otherwise placeholder |
| Settings quick card | Portal mode and module list | configuration portal-mode and module list APIs | build limited read-only |
| Recent activity | Audit/event stream | No frontend-safe endpoint confirmed | defer / paired backend ticket |
| Notifications summary | Notification source | No Phase 4B semantics/backend policy | placeholder/defer |
| Health/local demo status | API `/health` and Phase 4A local runtime | health endpoint and scripts | build local/demo-only support if ticket pack approves |

## Operator/Admin Difference

- Operators see available work areas and safe next steps.
- Admin-only cards are hidden from normal users or disabled with plain-English explanation.
- Admin commands must not expose raw permissions, token internals, or API route details.

## New Organization Empty State

The dashboard must explain:

- setup may still be needed;
- modules will appear as they are enabled in future phases;
- Lead Desk is available only when session and permissions are safe;
- no fake records or dummy metrics are shown.

## Deferred Dashboard Work

- full dashboard marketplace
- custom widget ecosystem
- real-time activity stream
- cross-module search
- module installer controls
- AI summaries/recommendations
