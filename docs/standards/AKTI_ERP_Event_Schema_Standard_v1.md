# AKTI ERP Event Schema Standard v1

Status: Accepted Phase 5A governance output.

Ticket: P5A-006a

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A standard for Event Schema Standard without drifting into Phase 5B runtime implementation.

### Decision / Policy

Adopt a standard event envelope with always-required envelope fields, context-required fields, and compliance-class mandatory fields.

### Required Rules

- Required envelope: event_id, event_type, producer, occurred_at, schema_version, organization_id, source_module, subject, payload, idempotency_key.
- Context-required fields depend on actor, entity, request, workflow, and integration context.
- Compliance class drives mandatory retention, redaction, privacy, and audit fields.

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

- Implement event validation libraries from this standard.
- Gatekeeper checks module event declarations.
- Read models consume validated event shapes.

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

- Required envelope: event_id, event_type, producer, occurred_at, schema_version, organization_id, source_module, subject, payload, idempotency_key.
- Context-required fields depend on actor, entity, request, workflow, and integration context.
- Compliance class drives mandatory retention, redaction, privacy, and audit fields.

### Event Envelope

Required for every event:

- event_id
- event_type
- schema_version
- producer
- source_module
- organization_id
- occurred_at
- subject
- payload
- idempotency_key

### Context-Required Fields

- actor context when a user or service caused the event
- request/correlation context for traceability
- entity context for changed records
- integration context for external adapter events

### Compliance-Class Mandatory Fields

- privacy_class
- retention_class
- redaction_policy
- audit_required
- replay_allowed
