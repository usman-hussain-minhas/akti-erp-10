# AKTI ERP Platform Service Contracts Standard v1

Phase 5A service-contract standards for core platform services. These are contracts only and do not implement runtime services.
## P5A-014a - Tenant Configuration API Contract

Status: Accepted Phase 5A governance output.

Ticket: P5A-014a

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service/API contract standard for Tenant Configuration API Contract without drifting into Phase 5B runtime implementation.

### Decision / Policy

Tenant Configuration API contract exposes safe tenant config reads and governed mutations without exposing secrets or raw implementation internals.

### Required Rules

- Contract declares tenant scope, capabilities, read/mutation separation, validation, error codes, audit hooks, and approval behavior.
- Current-user/profile is not this contract.
- Runtime implementation is future work.

### Owner And Enforcement Point

- Policy owner: Platform Architecture.
- Execution owner: the Phase 5B implementer for this surface.
- Enforcement point: Gatekeeper preflight, Foundry lifecycle validation, CI/promotion checks, or service-contract validation as applicable.
- Evidence owner: ticket implementer must produce ticket artifacts and validation summary.

### Gatekeeper Implication

- Gatekeeper must classify changes against this artifact before later runtime implementation.
- Gatekeeper must return ALLOW, DENY, APPROVAL_REQUIRED, or STOP_FOR_REVIEW where this artifact is in scope.
- STOP_FOR_REVIEW remains owned by P5A-003f and immutable below platform architect level.

### Phase 5B Implementation Input

- Implement tenant config API to contract.
- Gatekeeper validates mutation risk.
- Frontend consumes approved shape.

### Validation Expectations

- Exact-file planning before edits.
- Source-of-truth alignment with Prisma, contracts, module manifests, generated registry, ADRs, and the strategic reference.
- Evidence artifact proving the output path, owner, enforcement point, non-scope, stop conditions, and Phase 5B input.

### Non-Scope And Stop Conditions

- This is Phase 5A governance output only.
- It does not implement Foundry runtime, module installer runtime, business modules, production auth, scheduler runtime, notification runtime, reporting engine runtime, runtime AI, marketplace, external adapters, deployment, secrets, destructive migrations, Prisma/schema/migrations, generated registry changes, or package/dependency changes.
- Runtime implementation belongs to later approved phases and must be blocked if attempted from this artifact.

### Locked Decisions Preserved

- Reporting uses event-driven read models.
- Event schema uses an always-required envelope, context-required fields, and compliance-class mandatory fields.
- Gatekeeper is judge and policy enforcement only; Foundry is module installer and lifecycle runtime only.
- Gatekeeper outcomes are ALLOW, DENY, APPROVAL_REQUIRED, and STOP_FOR_REVIEW.
- STOP_FOR_REVIEW is immutable below platform architect level.
- Workflow Engine is a core platform service, not a Foundry module.
- Search baseline is PostgreSQL FTS with a pgvector extension path; Typesense is deferred unless measured targets fail.
- Multi-tenancy uses shared DB plus organization_id by default, with a future enterprise isolation path.
- Configurable labels are module defaults plus tenant overrides and are display-only.
- White-labeling is a core architectural constraint; white-label mode is none, partial, or full.
- Golden Module implementation belongs to Phase 6A, not Phase 5A or Phase 5B.

### Minimum Fields / Contract Requirements

- owner
- version
- tenant_scope
- capability_requirements
- validation_rules
- audit_hooks
- error_behavior
- compatibility
- evidence_requirements
- deprecation_or_rollback_behavior

### Required Validation Shape

- Contract declares tenant scope, capabilities, read/mutation separation, validation, error codes, audit hooks, and approval behavior.
- Current-user/profile is not this contract.
- Runtime implementation is future work.
## P5A-014b - Branding, Domain & Label Resolution API Contract

Status: Accepted Phase 5A governance output.

Ticket: P5A-014b

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service/API contract standard for Branding, Domain & Label Resolution API Contract without drifting into Phase 5B runtime implementation.

### Decision / Policy

Branding, domain, and label resolution contract returns tenant-facing display configuration while preserving canonical keys and internal audit identity.

### Required Rules

- White-label mode is none, partial, or full.
- Label overrides are display-only.
- Domain changes require approval and evidence.

### Owner And Enforcement Point

- Policy owner: Platform Architecture.
- Execution owner: the Phase 5B implementer for this surface.
- Enforcement point: Gatekeeper preflight, Foundry lifecycle validation, CI/promotion checks, or service-contract validation as applicable.
- Evidence owner: ticket implementer must produce ticket artifacts and validation summary.

### Gatekeeper Implication

- Gatekeeper must classify changes against this artifact before later runtime implementation.
- Gatekeeper must return ALLOW, DENY, APPROVAL_REQUIRED, or STOP_FOR_REVIEW where this artifact is in scope.
- STOP_FOR_REVIEW remains owned by P5A-003f and immutable below platform architect level.

### Phase 5B Implementation Input

- Implement resolution endpoint.
- Gatekeeper evaluates branding/domain risk.
- Frontend and modules use resolved display config.

### Validation Expectations

- Exact-file planning before edits.
- Source-of-truth alignment with Prisma, contracts, module manifests, generated registry, ADRs, and the strategic reference.
- Evidence artifact proving the output path, owner, enforcement point, non-scope, stop conditions, and Phase 5B input.

### Non-Scope And Stop Conditions

- This is Phase 5A governance output only.
- It does not implement Foundry runtime, module installer runtime, business modules, production auth, scheduler runtime, notification runtime, reporting engine runtime, runtime AI, marketplace, external adapters, deployment, secrets, destructive migrations, Prisma/schema/migrations, generated registry changes, or package/dependency changes.
- Runtime implementation belongs to later approved phases and must be blocked if attempted from this artifact.

### Locked Decisions Preserved

- Reporting uses event-driven read models.
- Event schema uses an always-required envelope, context-required fields, and compliance-class mandatory fields.
- Gatekeeper is judge and policy enforcement only; Foundry is module installer and lifecycle runtime only.
- Gatekeeper outcomes are ALLOW, DENY, APPROVAL_REQUIRED, and STOP_FOR_REVIEW.
- STOP_FOR_REVIEW is immutable below platform architect level.
- Workflow Engine is a core platform service, not a Foundry module.
- Search baseline is PostgreSQL FTS with a pgvector extension path; Typesense is deferred unless measured targets fail.
- Multi-tenancy uses shared DB plus organization_id by default, with a future enterprise isolation path.
- Configurable labels are module defaults plus tenant overrides and are display-only.
- White-labeling is a core architectural constraint; white-label mode is none, partial, or full.
- Golden Module implementation belongs to Phase 6A, not Phase 5A or Phase 5B.

### Minimum Fields / Contract Requirements

- owner
- version
- tenant_scope
- capability_requirements
- validation_rules
- audit_hooks
- error_behavior
- compatibility
- evidence_requirements
- deprecation_or_rollback_behavior

### Required Validation Shape

- White-label mode is none, partial, or full.
- Label overrides are display-only.
- Domain changes require approval and evidence.
## P5A-014d - Search Service Contract

Status: Accepted Phase 5A governance output.

Ticket: P5A-014d

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service/API contract standard for Search Service Contract without drifting into Phase 5B runtime implementation.

### Decision / Policy

Search service contract defines tenant-scoped, capability-aware query, result, indexing, freshness, and error behavior for PostgreSQL FTS baseline.

### Required Rules

- Results must not expose unauthorized modules/entities.
- Query contracts include tenant context and visibility policy.
- External Typesense path is deferred.

### Owner And Enforcement Point

- Policy owner: Platform Architecture.
- Execution owner: the Phase 5B implementer for this surface.
- Enforcement point: Gatekeeper preflight, Foundry lifecycle validation, CI/promotion checks, or service-contract validation as applicable.
- Evidence owner: ticket implementer must produce ticket artifacts and validation summary.

### Gatekeeper Implication

- Gatekeeper must classify changes against this artifact before later runtime implementation.
- Gatekeeper must return ALLOW, DENY, APPROVAL_REQUIRED, or STOP_FOR_REVIEW where this artifact is in scope.
- STOP_FOR_REVIEW remains owned by P5A-003f and immutable below platform architect level.

### Phase 5B Implementation Input

- Implement search API baseline.
- Gatekeeper checks index exposure.
- Frontend consumes stable search response.

### Validation Expectations

- Exact-file planning before edits.
- Source-of-truth alignment with Prisma, contracts, module manifests, generated registry, ADRs, and the strategic reference.
- Evidence artifact proving the output path, owner, enforcement point, non-scope, stop conditions, and Phase 5B input.

### Non-Scope And Stop Conditions

- This is Phase 5A governance output only.
- It does not implement Foundry runtime, module installer runtime, business modules, production auth, scheduler runtime, notification runtime, reporting engine runtime, runtime AI, marketplace, external adapters, deployment, secrets, destructive migrations, Prisma/schema/migrations, generated registry changes, or package/dependency changes.
- Runtime implementation belongs to later approved phases and must be blocked if attempted from this artifact.

### Locked Decisions Preserved

- Reporting uses event-driven read models.
- Event schema uses an always-required envelope, context-required fields, and compliance-class mandatory fields.
- Gatekeeper is judge and policy enforcement only; Foundry is module installer and lifecycle runtime only.
- Gatekeeper outcomes are ALLOW, DENY, APPROVAL_REQUIRED, and STOP_FOR_REVIEW.
- STOP_FOR_REVIEW is immutable below platform architect level.
- Workflow Engine is a core platform service, not a Foundry module.
- Search baseline is PostgreSQL FTS with a pgvector extension path; Typesense is deferred unless measured targets fail.
- Multi-tenancy uses shared DB plus organization_id by default, with a future enterprise isolation path.
- Configurable labels are module defaults plus tenant overrides and are display-only.
- White-labeling is a core architectural constraint; white-label mode is none, partial, or full.
- Golden Module implementation belongs to Phase 6A, not Phase 5A or Phase 5B.

### Minimum Fields / Contract Requirements

- owner
- version
- tenant_scope
- capability_requirements
- validation_rules
- audit_hooks
- error_behavior
- compatibility
- evidence_requirements
- deprecation_or_rollback_behavior

### Required Validation Shape

- Results must not expose unauthorized modules/entities.
- Query contracts include tenant context and visibility policy.
- External Typesense path is deferred.
