# P4-000 Public/Protected Route Map

| Route family | Current classification | Evidence |
| --- | --- | --- |
| `/` and `/health` | Public health/root scaffold | `AppController` no auth context. |
| `/platform/setup/organization` | Public initial setup, single-use by service conflict guard | `OrganizationSetupController` and setup service organization-count guard. |
| `/platform/modules` | Public module registry listing in current scaffold | `ModuleRegistryController` no auth context. |
| `/api/lead-desk/organizations/:organization_id/leads` | Protected by trusted request context and Access Core service checks | `LeadDeskController` resolves trusted context against route org. |
| `/platform/engagement-gateway/organizations/:organization_id/requests` | Protected by trusted request context and gateway service checks | `EngagementGatewayController` resolves trusted context against route org. |
