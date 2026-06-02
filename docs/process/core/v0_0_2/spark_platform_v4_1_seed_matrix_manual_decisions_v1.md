# Spark Platform v4.1 Seed Matrix Manual Decisions v1

Status: SPARK_PLATFORM_V4_1_SEED_MATRIX_MANUAL_DECISIONS_ACCEPTED

## E-learning standards decision

1. SCORM 1.2 runtime is a core micro-service of the content/learning standards family.
2. SCORM 2004 runtime is an optional micro-service.
3. xAPI statement handling is an optional micro-service.
4. Learning Record Store is an optional micro-service and required dependency for xAPI statement handling and H5P player where xAPI emission is enabled.
5. H5P player is an optional micro-service and depends on Learning Record Store for xAPI statement emission.
6. This decision affects the execution seed dependency graph and future pricing surface.
7. This decision does not authorize ticket pack generation or execution.

## Catalog entries affected

- subsurface_6d_scorm_1_2_runtime -> core micro-service
- subsurface_6d_scorm_2004_runtime -> optional micro-service
- subsurface_6d_xapi_statement_handling -> optional micro-service
- subsurface_6d_learning_record_store -> optional micro-service
- subsurface_6d_h5p_player -> optional micro-service

## Lifecycle boundary

This manual decision only prepares the execution-seed candidate matrix. It does not create a ticket pack, predictive stop analysis, autonomous readiness, or execution authority.


## PR #43 semantic dependency enrichment decision

Semantic dependency review found the first execution-seed matrix was mostly an ordering chain and lacked core 6A foundation boundaries for tenant/session identity, access Gatekeeper, universal audit evidence, and Foundry runtime authority. This patch adds those catalog/seed entries, changes H5P to a hard dependency on LRS, and enriches the matrix with source-grounded architectural dependency edges. This decision does not authorize ticket pack generation, predictive stop analysis, autonomous readiness, or execution.
