# Spark Platform v4.1 Phase Dependency Map v1

Status: SPARK_PLATFORM_V4_1_PHASE_DEPENDENCY_MAP_READY_FOR_REVIEW

## Phase model

- Phase 6A: Levels 0-5 Foundation
- Phase 6B: Levels 6-8 Commerce Core
- Phase 6C: Levels 9, 10, 12 Operations
- Phase 6D: Level 11 Learning
- Phase 6E: Levels 13-15 Growth Surface
- Phase 6F: Levels 16-18 Intelligence, Advanced Admin, Design Polish

## Dependency rules

- 6B depends on 6A.
- 6C depends on 6A and 6B.
- 6D depends on 6A, 6B, and 6C, but not 6E or 6F.
- 6E depends on 6A through 6D.
- 6F depends on 6A through 6E.
- Anything in N+1 must not develop before N.
- Within a phase, component N+1 must not develop before component N if it depends on it.

## Planning sub-phases

- 6B-A Products
- 6B-B CRM
- 6B-C Finance
- 6C-A HR
- 6C-B Workspace
- 6C-C Events
- 6D-A Student lifecycle
- 6D-B Learning operations
- 6D-C Assessment/content standards
- 6D-D Portals/certificates/university extensions
- 6E-A Campaigns
- 6E-B E-Commerce
- 6E-C Website/App Builder
- 6F-A AI/business intelligence
- 6F-B Advanced admin/support/onboarding
- 6F-C Design polish

This map is catalog sequencing authority only. It does not authorize tickets, seed matrices, predictive stop analysis, autonomous readiness, or execution.
