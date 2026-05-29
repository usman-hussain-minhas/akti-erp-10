-- P5B-019a: PostgreSQL FTS search schema/index baseline.
-- Non-destructive additive migration for tenant-scoped workflow search targets.

-- AddColumn
ALTER TABLE "WorkflowDefinition"
ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce("workflow_key", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("version", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("owner", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("status", '')), 'C')
) STORED;

-- AddColumn
ALTER TABLE "WorkflowInstance"
ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce("workflow_key", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("version", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("status", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("current_state", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("subject_type", '')), 'C') ||
  setweight(to_tsvector('simple', coalesce("subject_id", '')), 'C') ||
  setweight(to_tsvector('simple', coalesce("correlation_id", '')), 'D')
) STORED;

-- CreateIndex
CREATE INDEX "WorkflowDefinition_search_vector_idx" ON "WorkflowDefinition" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "WorkflowInstance_search_vector_idx" ON "WorkflowInstance" USING GIN ("search_vector");
