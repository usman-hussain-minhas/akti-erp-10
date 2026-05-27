# AKTI ERP Phase 5A Core Platform Service Architecture Decisions v1

Phase 5A architecture decisions for core platform services. These decisions do not implement runtime services.
## P5A-013a - Workflow Engine Core Service Architecture

Status: Accepted Phase 5A governance output.

Ticket: P5A-013a

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service architecture decision for Workflow Engine Core Service Architecture without drifting into Phase 5B runtime implementation.

### Decision / Policy

Workflow Engine is a core platform service for process definitions and workflow state, not a Foundry module.

### Required Rules

- Workflow process definitions require version, owner, tenant scope, states, transitions, approvals, events, audit, and rollback/deprecation behavior.
- Gatekeeper STOP_FOR_REVIEW may be consumed as workflow input but not redefined by this service.
- Phase 5A defines architecture only.

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

- Implement workflow service boundary after policy approval.
- Integrate with Gatekeeper outcomes.
- Expose contract to module workflows.

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
## P5A-013b - Search Architecture Decision

Status: Accepted Phase 5A governance output.

Ticket: P5A-013b

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service architecture decision for Search Architecture Decision without drifting into Phase 5B runtime implementation.

### Decision / Policy

Search architecture starts with PostgreSQL FTS and GIN indexes, keeps pgvector schema-ready as extension path, and defers Typesense unless measured UX/performance targets fail.

### Required Rules

- Search respects tenant isolation and capability visibility.
- Search indexing cannot expose unauthorized module data.
- External search service adoption requires measured failure and new approval.

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

- Implement search service baseline against approved contracts.
- Define measured targets and fallback.
- Gatekeeper checks search exposure risk.

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
## P5A-013c - Reporting / Read-Model Service Architecture

Status: Accepted Phase 5A governance output.

Ticket: P5A-013c

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service architecture decision for Reporting / Read-Model Service Architecture without drifting into Phase 5B runtime implementation.

### Decision / Policy

Reporting/read-model service consumes validated events into rebuildable tenant-scoped read models with freshness and privacy guarantees.

### Required Rules

- Read models are derived and rebuildable.
- Reports query read models, not arbitrary module internals.
- Every read model declares source events, owner, freshness, rebuild command, privacy class, and tenant boundary.

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

- Build read-model service after event standard.
- Gatekeeper validates report/read-model additions.
- Module certification checks reportable event coverage.

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
## P5A-013d - File / Document Service Architecture

Status: Accepted Phase 5A governance output.

Ticket: P5A-013d

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service architecture decision for File / Document Service Architecture without drifting into Phase 5B runtime implementation.

### Decision / Policy

File/document service is a core platform boundary over S3-compatible storage, metadata, tenant scope, access control, virus/security posture, retention, and audit.

### Required Rules

- Modules do not directly own storage credentials.
- Files declare owner, tenant, classification, retention, access, and audit events.
- Phase 5A does not implement storage runtime.

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

- Implement service contract and storage adapter later.
- Gatekeeper validates file/document risk.
- Module APIs reference file service contract.

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
## P5A-013e - AI Proxy / Governed AI Service Boundary

Status: Accepted Phase 5A governance output.

Ticket: P5A-013e

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service architecture decision for AI Proxy / Governed AI Service Boundary without drifting into Phase 5B runtime implementation.

### Decision / Policy

AI proxy is the governed future service boundary for AI calls, policy checks, data minimization, evaluation, cost controls, and audit.

### Required Rules

- AI proxy does not exist as runtime in Phase 5A.
- No module may call external AI directly once governance is enforced.
- AI calls must declare purpose, data classes, capabilities, human review, retention, and evaluation.

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

- Capture AI proxy requirements for later implementation.
- Gatekeeper classifies AI risk.
- Foundry stores AI declarations.

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
## P5A-013f - Data Import / Export Service Architecture

Status: Accepted Phase 5A governance output.

Ticket: P5A-013f

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A service architecture decision for Data Import / Export Service Architecture without drifting into Phase 5B runtime implementation.

### Decision / Policy

Data import/export service architecture centralizes data movement validation, tenant safety, file handling, preview, error reporting, audit, and compensation.

### Required Rules

- Import/export runtime is out of scope for Phase 5A.
- Modules declare import/export needs through policy and service contracts.
- Data movement must preserve ownership and privacy classes.

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

- Implement service boundary after policy approval.
- Gatekeeper checks data movement risk.
- Module certification validates safe import/export behavior.

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
