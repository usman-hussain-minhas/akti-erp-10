-- P5B1-005: Organization short name substrate.
-- Non-destructive additive migration for organization profile display.

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "short_name" TEXT;
