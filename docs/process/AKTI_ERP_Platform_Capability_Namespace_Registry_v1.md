# AKTI ERP Platform Capability Namespace Registry v1

Status: PHASE_5B1_CONTROL_REGISTRY

This registry records human-readable platform capability intent and grant guidance. It is not runtime enforcement by itself. Runtime enforcement remains owned by Access Core, Gatekeeper, contracts, manifests, and ticket validation.

Phase boundary: Phase 5B1 is substrate only. This registry does not authorize Phase 5C UI implementation, Phase 6 business modules, real providers, runtime AI, production auth, deployment, marketplace behavior, or dynamic shell actions.

## Capability Registry

| capability | owner | seeded_phase | status | meaning | grantable_to | notes |
| --- | --- | --- | --- | --- | --- | --- |
| `platform.shell.access` | Access Core | Phase 5B | seeded | Base authenticated platform shell access for non-admin operators. | any authenticated operator with organization membership | Existing shell access substrate; does not grant module-specific actions. |
| `platform.crm.access` | Access Core | Phase 5B1 | seeded | Visible CRM access capability mapped to the existing Lead Desk technical surface. | any authenticated operator approved for CRM visibility | Visible label only; no `lead-desk` route, API, file, contract, or Prisma rename authority. |
| `platform.modules.view` | Access Core / Module Registry | Phase 5B1 | seeded | View the platform module catalog and module cards. | any authenticated operator allowed to see module catalog surfaces | Visibility does not grant import, export, delete, configure, approve, or admin authority. |
| `platform.organization.profile.view` | Configuration | Phase 5B1 | planned | Read current organization profile facts for shell/org badge display. | authenticated operators with organization context | Read-only; no organization mutation or production auth change. |
| `platform.branding.view` | Configuration | Phase 5B1 | planned | Read effective branding facts for display decisions. | authenticated operators with organization context | Backend returns branding facts only, not CSS design tokens. |
| `platform.data.controls.view` | Platform / Data Controls | Phase 5B1 | planned | View honest Data Controls status surfaces. | manager, director, super-admin | View-only substrate; does not grant import/export/backup execution. |
| `platform.import_export.manage` | Import/Export | Future phase | reserved | Manage import/export setup or policy when separately implemented. | director, super-admin only | Reserved; no Phase 5B1 import/export workflow implementation. |
| `platform.export.run` | Import/Export | Future phase | reserved | Run an approved export job when separately implemented. | director, super-admin only | Reserved; no Phase 5B1 export execution. |
| `platform.import.run` | Import/Export | Future phase | reserved | Run an approved import job when separately implemented. | director, super-admin only | Reserved; no Phase 5B1 import execution. |
| `platform.backup_restore.manage` | Backup/Restore | Future phase | reserved | Manage backup or restore behavior when separately implemented. | super-admin only | Reserved; no Phase 5B1 backup/restore workflow implementation. |
| `platform.search.query` | Search | Phase 5B1 | planned | Query the existing PostgreSQL FTS search baseline. | authenticated operators with authorized workflow search scope | Limited to `WorkflowDefinition` and `WorkflowInstance`; no CRM/files/notifications/future-module search expansion. |
| `platform.notifications.summary.view` | Communication / Platform Notifications | Phase 5B1 | planned | Read notification summary count/status for honest shell display. | authenticated operators with organization context | Summary-only; no provider, notification center, email, SMS, or WhatsApp activation. |
| `platform.shell.actions.view` | Shell / Future Actions | Future Phase 6A+ | reserved only | Reserved future capability for dynamic shell action registry. | not grantable in Phase 5B1 | `platform.shell.actions.view` is reserved only; Phase 5B1 must not create `GET /platform/shell/actions`. |

## Guardrails

- Visibility does not equal authority.
- Seeing a module card does not grant import, export, delete, approve, configure, administer, backup, restore, or provider activation permissions.
- CRM is a user-facing label for the existing Lead Desk technical surface only.
- Search scope remains limited to `WorkflowDefinition` and `WorkflowInstance` until a later approved phase expands it.
- `platform.shell.actions.view` is reserved only and does not authorize a dynamic shell action endpoint in Phase 5B1.
