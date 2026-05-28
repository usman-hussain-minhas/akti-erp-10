# P5B-001a Summary - API Response/Error Convention Baseline

## Ticket

- Ticket: P5B-001a
- Title: API response/error convention baseline
- Type: api
- Tier: 1
- Dependencies verified: P5B-000a committed
- Commit scope: evidence artifacts only

## Exact-File Plan

Files created for this ticket:

- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-001a/P5B-001a-summary.md
- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-001a/P5B-001a-validation-summary.md

No runtime API convention code was created in this ticket because `files_expected_to_change` grants evidence artifact authority only. This baseline records the current repo API convention and the required shape for later route-owning tickets.

## Current API Baseline Observed

| Surface | Observed convention | Evidence |
| --- | --- | --- |
| Controller framework | NestJS controllers use decorator routes and return JSON-serializable values directly. | `apps/api/src/app.controller.ts`, `apps/api/src/access-core/access-core.controller.ts`, `apps/api/src/configuration/configuration.controller.ts`, `apps/api/src/module-registry/module-registry.controller.ts` |
| Platform route prefix | Core platform routes use `/platform/*`; Lead Desk business route uses `/api/lead-desk/*`. | `@Controller('platform/access')`, `@Controller('platform/configuration')`, `@Controller('platform/modules')`, `@Controller('api/lead-desk/...')` |
| Positive response shape | Services return explicit DTO-like objects or `{ items }` collections; controllers do not wrap responses in an additional envelope. | `ModuleRegistryService.listModules()` returns `{ items }`; configuration and access services return concrete resource objects. |
| Request validation | Controllers validate path/body inputs through DTO validator helpers and translate validation errors to `BadRequestException`. | `configuration.controller.ts`, `access-core.controller.ts` |
| Tenant context source | Protected routes resolve actor/organization through `resolveTrustedRequestContext(headers, { routeOrganizationId })`. | `apps/api/src/security/request-context.ts`, configuration/access controllers |
| Negative errors | The repo uses Nest exceptions (`BadRequestException`, `ForbiddenException`, `UnauthorizedException`, `NotFoundException`, `ConflictException`, `ServiceUnavailableException`) rather than ad hoc error objects. | `apps/api/src/**` exception scan |
| Gatekeeper/audit behavior | Mutating protected service paths call Gatekeeper and write audit/outbox evidence where current Phase 5A surfaces already require it. | `configuration.service.ts`, `hierarchy.service.ts`, `engagement-gateway.service.ts`, observability services |

## Phase 5B API Ticket Convention

Every later Phase 5B API route ticket must explicitly define and validate:

- HTTP method.
- Route path.
- Request path params, query params, headers, and body shape.
- Positive response shape.
- Negative response/error behavior.
- Required capability.
- Tenant context source.
- Gatekeeper requirement for high-risk or mutating operations.
- Audit and event-outbox behavior where applicable.
- Positive and negative tests.

## Baseline Decision

Phase 5B will keep the current repo convention:

- Return plain JSON-serializable objects/arrays from controllers.
- Use Nest exceptions for error responses.
- Use route-local DTO validation helpers where a DTO contract is not already present.
- Resolve tenant/actor context from signed trusted request context, not caller-supplied body fields.
- Require later API tickets to add controller/module/test ownership before exposing new routes.

## Non-Scope

This ticket does not:

- Add a global response wrapper.
- Add a global exception filter.
- Create a new API route.
- Modify runtime source files.
- Change auth/session behavior.
- Change package dependencies.

## Positive/Negative Proof Baseline

Existing repo tests demonstrate the current pattern:

- Positive controller/service tests return concrete response objects.
- Negative DTO/controller tests assert `BadRequestException` on invalid path/body inputs.
- Trusted request context tests assert `UnauthorizedException`/`ForbiddenException` on invalid bearer or tenant mismatches.
- Gatekeeper-dependent service tests assert denied/degraded outcomes through Nest exceptions.

## Minimum Concrete Requirement

The API response/error convention baseline is defined for Phase 5B execution within the exact evidence files authorized by this ticket, including method/route/request/response/capability/tenant/Gatekeeper/audit requirements for future API tickets and positive/negative proof expectations.
