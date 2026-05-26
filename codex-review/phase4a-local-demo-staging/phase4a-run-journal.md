
## P4A-000 - Baseline local run inventory

Status: COMPLETE

Recorded local run baseline, command inventory, env inventory, frontend route inventory, and Phase 4 frontend evidence inputs. No runtime implementation was performed.

## P4A-001 - Node/pnpm/Corepack runtime decision

Status: COMPLETE

Decision: recommend Node 22 LTS with Corepack-managed pnpm@10.12.1. Current session observed v23.10.0; package files were not changed.

## P4A-002 - Local environment architecture decision

Status: COMPLETE

Decision: use both modes with hybrid local first: Docker PostgreSQL plus local pnpm API/Web. Full Compose remains required for P4A-003/P4A-011 resolution.
