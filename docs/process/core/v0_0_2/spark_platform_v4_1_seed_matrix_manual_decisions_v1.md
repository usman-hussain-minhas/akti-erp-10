# Spark Platform v4.1 Seed Matrix Manual Decisions v1

Status: SPARK_PLATFORM_V4_1_SEED_MATRIX_MANUAL_DECISIONS_ACCEPTED

## Existing Learning Standards Decision

- SCORM 1.2 runtime remains a core micro-service of the content/learning standards family.
- SCORM 2004 runtime remains an optional micro-service.
- xAPI statement handling remains an optional micro-service.
- Learning Record Store remains an optional micro-service and required dependency for xAPI and H5P statement persistence.
- H5P player remains an optional micro-service and now has a hard dependency on Learning Record Store for xAPI statement persistence.

## Zero-Trust Source Coverage Decision

- Source coverage matrix was created before further seed repair.
- Catalog repairs were driven only by matrix-proven source gaps.
- Dependency extraction matrix was created before further seed dependency repair.
- Seed matrix repair was driven by source-extracted dependency edges.

## Boundary

- This decision does not authorize ticket pack generation.
- This decision does not authorize predictive stop analysis.
- This decision does not authorize autonomous readiness.
- This decision does not authorize execution.
