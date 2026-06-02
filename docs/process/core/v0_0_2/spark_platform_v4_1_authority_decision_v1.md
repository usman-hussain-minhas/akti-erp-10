# Spark Platform v4.1 Authority Decision v1

Status: SPARK_PLATFORM_V4_1_AUTHORITY_ACCEPTED_FOR_SUBSURFACE_CATALOG

## Decision

Spark Platform v4.1 docs supersede Spark Platform v2/v3/v4 planning drafts only for sub-surface cataloguing. Spark Platform v4.1 does not override Prisma, contracts, manifests, ADRs, accepted process docs, or current repo source.

The highest authority among imported v4.1 docs is docs/process/core/v0_0_2/spark_platform_v4_1/0_business_logic.md. Phase docs provide candidate component boundaries, not final ticket boundaries. The sub-surface decomposition guide governs how candidate bundles are split.

The derived surface catalog is a Genesis support artifact only. It is not primary authority, ticket authority, execution authority, or an override for v4.1 business logic, phase docs, decomposition guide, Prisma, contracts, manifests, ADRs, or repo source.

Sub-surface cataloguing is mandatory before execution seed matrix or ticket pack generation. PR #39 remains under-decomposition failure evidence. PR #40 remains boilerplate/executability failure evidence. PR #41 remains thin-wrapper/sub-surface failure evidence.

No ticket generation is authorized by this PR. No seed matrix is authorized by this PR. No implementation is authorized by this PR. Genesis v0.5.0 is required before this lifecycle proceeds beyond sub-surface catalog.

## Phase-to-Genesis mapping

| AKTI phase | Genesis train | Genesis level values |
| --- | --- | --- |
| Phase 6A | phase_6a | level_0 through level_5, or level_group_0_5 where source is genuinely cross-level |
| Phase 6B | phase_6b | level_6, level_7, level_8 |
| Phase 6C | phase_6c | level_9, level_10, level_12 |
| Phase 6D | phase_6d | level_11 |
| Phase 6E | phase_6e | level_13, level_14, level_15 |
| Phase 6F | phase_6f | level_16, level_17, level_18 |

## AKTI-local metadata

The catalogs use Spark Genesis v0.5.0 canonical fields at top level. AKTI-only planning metadata is namespaced under `akti_local` and is not a Genesis schema field. Local validation uses `akti_local.phase_id`, `akti_local.catalog_order`, `akti_local.catalog_outcome`, `akti_local.split_axes`, and `akti_local.phase_dependency_rule` to preserve AKTI phase sequencing and candidate outcome traceability.
