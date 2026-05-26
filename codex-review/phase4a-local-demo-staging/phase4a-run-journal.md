
## P4A-000 - Baseline local run inventory

Status: COMPLETE

Recorded local run baseline, command inventory, env inventory, frontend route inventory, and Phase 4 frontend evidence inputs. No runtime implementation was performed.

## P4A-001 - Node/pnpm/Corepack runtime decision

Status: COMPLETE

Decision: recommend Node 22 LTS with Corepack-managed pnpm@10.12.1. Current session observed v23.10.0; package files were not changed.

## P4A-002 - Local environment architecture decision

Status: COMPLETE

Decision: use both modes with hybrid local first: Docker PostgreSQL plus local pnpm API/Web. Full Compose remains required for P4A-003/P4A-011 resolution.

## P4A-003 - Full Docker Compose API/Web/Postgres decision gate

Status: COMPLETE

Decision: full Docker Compose API/Web/Postgres mode is required for P4A-011 resolution. Docker available: Docker version 28.5.1, build e180ab8; Compose available: Docker Compose version v2.40.2-desktop.1.

## P4A-004 - Env template and no-secret policy

Status: COMPLETE

Created .env.local.example and .env.demo.example with local-only non-secret placeholders. Classified redaction scan hits as placeholder text only.

## P4A-005 - Local DB reset and migration proof design

Status: COMPLETE

Decision: use local/demo container volume reset as primary DB reset strategy and prove clean database state with prisma migrate deploy, never db push as final proof.
